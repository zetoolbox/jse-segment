import Analytics from 'analytics-node';
import { ObjectId } from 'bson';
import { EventName, getEventNameHumanized } from './events';
import { getPropertyNameHumanized } from './payloads';
import { Intercom } from '../intercom/intercom-wrapper';

type SubjectId = string | ObjectId;
type IdentifyScopedProperties = Record<string, any>;

type AllocateProperties<TEventProperties> = {
    identify: {
        toSend: boolean;
        scopedProps: IdentifyScopedProperties[];
    };
    track: {
        toSend: boolean;
        scopedProps: TEventProperties | unknown;
    };
};

let _instanceSegmentClient: Analytics;
function getSegmentClient(apiKey: string): Analytics {
    return (
        _instanceSegmentClient ??
        (_instanceSegmentClient = new Analytics(apiKey))
    );
}

class SegmentSender {
    private _client: Analytics;

    constructor(apiKey: string) {
        this._client = getSegmentClient(apiKey);
    }

    public async send<TEventProperties>({
        eventName,
        jseUserId,
        jseUserEmail,
        jseBpId,
        properties,
        dryRun,
    }: {
        eventName: EventName;
        jseUserId: SubjectId;
        jseUserEmail?: string;
        jseBpId: SubjectId;
        properties: TEventProperties;
        dryRun?: boolean;
    }): Promise<boolean[]> {
        const isCreation: boolean = eventName === EventName.inscription;
        const allocate = this.reallocatePayloads(properties);

        const bulkSend: Promise<boolean>[] = [];
        if (allocate.identify.toSend === true) {
            let index = 0;
            for (const propsChunk of allocate.identify.scopedProps) {
                bulkSend.push(
                    this.identify({
                        jseUserId,
                        jseUserEmail,
                        traits: propsChunk,
                        isCreation: isCreation === true && index === 0,
                        dryRun,
                    })
                );
                ++index;
            }
        }
        if (allocate.track.toSend === true) {
            bulkSend.push(
                this.track({
                    eventName: eventName as EventName,
                    jseUserId,
                    jseUserEmail,
                    jseBpId,
                    properties: allocate.track.scopedProps,
                    isCreation,
                    dryRun,
                })
            );
        }
        const httpResponses: boolean[] = [];
        console.log('Calls to do : ', bulkSend.length);
        let callIdx = 0;
        for (const applyPromise of bulkSend) {
            const called = await applyPromise;
            console.log(
                `* call ${++callIdx}/${bulkSend.length} : `,
                called === true ? 'done' : 'failed'
            );
            httpResponses.push(called);
        }
        return httpResponses;
    }
    private async identify({
        jseUserId,
        jseUserEmail,
        traits,
        isCreation,
        dryRun,
    }: {
        jseUserId: SubjectId;
        jseUserEmail?: string;
        traits: IdentifyScopedProperties;
        isCreation: boolean;
        dryRun?: boolean;
    }): Promise<boolean> {
        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);
        const payload = {
            [isCreation !== true ? 'userId' : 'anonymousId']: (
                jseUserEmail || jseUserId
            ).toString(),
            traits: {
                ...traits,
                'JSE App User Id': jseUserId,
            },
        };
        console.log(`identify(#${jseUserId}) : payload is : `, payload);

        if (dryRun === true) {
            return Promise.resolve(true);
        }
        return new Promise((resolve, reject) => {
            this._client.identify(payload, (error?: Error) =>
                _handleCallback(error)(resolve, reject)
            );
        });
    }
    private async track<TEventProperties>({
        eventName,
        jseUserId,
        jseUserEmail,
        jseBpId,
        properties,
        isCreation,
        dryRun,
    }: {
        eventName: EventName;
        jseUserId: SubjectId;
        jseUserEmail?: string;
        jseBpId: SubjectId | null;
        properties: TEventProperties;
        isCreation: boolean;
        dryRun?: boolean;
    }): Promise<boolean> {
        const humanizedProperties = Object.entries(properties).reduce(
            (humanizedProps, [propName, value]) => {
                humanizedProps[getPropertyNameHumanized(propName)] = value;
                return humanizedProps;
            },
            {} as Record<string, string>
        );
        const payload = {
            [isCreation !== true ? 'userId' : 'anonymousId']:
                jseUserId.toString(),
            event: getEventNameHumanized(eventName.toString()),
            properties: {
                ...humanizedProperties,
                ...(jseBpId ? { jseBpId } : undefined),
                ...(jseUserEmail ? { jseUserEmail } : undefined),
            },
        };
        console.log(
            `track('${eventName}') for #uid:${jseUserId} | #email: ${
                jseUserEmail ?? 'none'
            } | #bpid: ${jseBpId}} : \npayload is : `,
            payload
        );

        if (dryRun === true) {
            return Promise.resolve(true);
        }

        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);

        return new Promise((resolve, reject) => {
            this._client.track(payload, (error?: Error) => {
                console.log('live run');
                return _handleCallback(error)(resolve, reject);
            });
        });
    }

    private reallocatePayloads<TEventProperties>(
        properties: TEventProperties
    ): AllocateProperties<TEventProperties> {
        const split: AllocateProperties<TEventProperties> = {
            identify: {
                toSend: false,
                scopedProps: [],
            },
            track: {
                toSend: false,
                scopedProps: {},
            },
        };

        if (this.hasAnyIdentifyProps(properties)) {
            split.identify.toSend = true;
            split.identify.scopedProps = this.setupIdentifyProps(properties);
        }
        if (this.hasAnyTrackProps(properties)) {
            split.track.toSend = true;
            split.track.scopedProps = this.setupTrackProps(properties);
        }

        return split;
    }

    private setupIdentifyProps<TEventProperties>(
        jseProperties: TEventProperties
    ): Partial<TEventProperties>[] {
        const map = Intercom.getAllFields();

        type JseObjectAsEntry = [keyof TEventProperties, string];
        const segmentIdentifyScopedProps: any = {};

        const isPropValueAcceptable = (value: any) => {
            if (typeof value === 'string') {
                return value.toLowerCase() !== '';
            }
            return value !== null && value !== undefined;
        };

        for (const [jsePropKey, segmentKey] of Object.entries(
            map
        ) as JseObjectAsEntry[]) {
            if (
                jsePropKey in map &&
                isPropValueAcceptable(jseProperties[jsePropKey])
            ) {
                const value = jseProperties[jsePropKey];
                let adaptedValue: TEventProperties[keyof TEventProperties];
                if (value instanceof Date) {
                    adaptedValue = (value as Date)[
                        this.isIntercomProperty(jsePropKey as string)
                            ? 'toDateString'
                            : 'toISOString'
                    ]() as unknown as TEventProperties[keyof TEventProperties];
                } else {
                    adaptedValue = value;
                }
                segmentIdentifyScopedProps[segmentKey] = adaptedValue;
            }
        }
        return Intercom.chunkPayload<TEventProperties>(
            segmentIdentifyScopedProps
        );
    }

    private setupTrackProps<TEventProperties>(
        jseProperties: TEventProperties
    ): IdentifyScopedProperties {
        const scopedProps: Record<string, any> = {};
        type JseObject = [keyof TEventProperties, string];

        const isPropValueAcceptable = (value: any) => {
            if (typeof value === 'string') {
                return value.toLowerCase() !== '';
            }
            return value !== null && value !== undefined;
        };

        for (const [jsePropKey, jsePropValue] of Object.entries(
            jseProperties
        ) as JseObject[]) {
            if (!isPropValueAcceptable(jsePropValue)) {
                continue;
            }

            const value = jseProperties[jsePropKey];
            let adaptedValue: TEventProperties[keyof TEventProperties];
            if (value instanceof Date) {
                adaptedValue = (value as Date)[
                    this.isIntercomProperty(jsePropKey as string)
                        ? 'toDateString'
                        : 'toISOString'
                ]() as unknown as TEventProperties[keyof TEventProperties];
            } else {
                adaptedValue = value;
            }
            scopedProps[jsePropKey as string] = adaptedValue;
        }
        return scopedProps;
    }

    private hasAnyIdentifyProps<TEventProperties>(
        jseProperties: TEventProperties
    ): boolean {
        const traits = Intercom.getAllFieldsKeys();
        return Object.keys(jseProperties).some((propName) =>
            traits.includes(propName.toString())
        );
    }

    private hasAnyTrackProps<TEventProperties>(
        jseProperties: TEventProperties
    ): boolean {
        const traits = Intercom.getIntercomReservedIdentifyProperties();
        return Object.keys(jseProperties).some(
            (propName) =>
                traits.includes(propName.toString().toLowerCase()) === false
        );
    }

    private isIntercomProperty(jsePropName: string) {
        return Intercom.getIntercomReservedIdentifyProperties().includes(
            jsePropName
        );
    }
}

let inst: SegmentSender | null = null;

export function getSegmentSender(apiKey: string): SegmentSender {
    return inst ?? (inst = new SegmentSender(apiKey));
}

import Analytics from 'analytics-node';
import { ObjectId } from 'bson';
import { EventName } from './event-name.enum';

import {
    intercomCommonFields,
    intercomMapCustomFields,
} from './intercom-fields';

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
        isCreation?: boolean;
        dryRun?: boolean;
    }): Promise<boolean[]> {
        const isCreation: boolean = eventName == EventName.inscription;
        const allocate = this.allocatePayloads(properties);

        const bulkSend = [];
        if (allocate.identify.toSend === true) {
            bulkSend.push(
                this.identify({
                    jseUserId,
                    traits: allocate.identify.scopedProps,
                    isCreation: isCreation ?? false,
                    dryRun,
                })
            );
        }
        if (allocate.track.toSend === true) {
            bulkSend.push(
                this.track({
                    eventName: eventName as EventName,
                    jseUserId,
                    jseUserEmail,
                    jseBpId,
                    properties: allocate.track.scopedProps,
                    isCreation: isCreation ?? false,
                    dryRun,
                })
            );
        }
        const httpResponses: boolean[] = [];
        for (const applyPromise of bulkSend) {
            const called = await applyPromise;
            httpResponses.push(called);
        }
        return httpResponses;
    }
    private async identify({
        jseUserId,
        traits,
        isCreation,
        dryRun,
    }: {
        jseUserId: SubjectId;
        traits: IdentifyScopedProperties;
        isCreation: boolean;
        dryRun?: boolean;
    }): Promise<boolean> {
        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);

        const payload = {
            [isCreation !== true ? 'userId' : 'anonymousId']:
                jseUserId.toString(),
            traits,
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
        const payload = {
            [isCreation !== true ? 'userId' : 'anonymousId']:
                jseUserId.toString(),
            event: eventName.toString(),
            properties: {
                ...properties,
                ...(jseBpId ? { jseBpId } : undefined),
                ...(jseUserEmail ? { jseUserEmail } : {}),
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
            this._client.track(payload, (error?: Error) =>
                _handleCallback(error)(resolve, reject)
            );
        });
    }

    private getIntercomReservedIdentifyProperties() {
        return [
            'address',
            'age',
            'avatar',
            'birthday',
            'company',
            'description',
            'email',
            'firstName',
            'gender',
            'id',
            'lastName',
            'name',
            'phone',
            'title',
            'username',
            'website',
        ];
    }

    private allocatePayloads<TEventProperties>(
        properties: TEventProperties
    ): AllocateProperties<TEventProperties> {
        const split: AllocateProperties<TEventProperties> = {
            identify: {
                toSend: false,
                scopedProps: {},
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
    ): IdentifyScopedProperties {
        const map = {
            ...intercomCommonFields,
            ...intercomMapCustomFields,
        };
        let segmentIdentifyScopedProps: Record<string, any> = {};
        type JseObject = [keyof TEventProperties, string];

        const isPropValueAcceptable = (value: any) => {
            if (typeof value === 'string') {
                return value.toLowerCase() !== '';
            }
            return value !== null && value !== undefined;
        };

        for (const [jsePropKey, segmentKey] of Object.entries(
            map
        ) as JseObject[]) {
            if (
                jsePropKey in map &&
                isPropValueAcceptable(jseProperties[jsePropKey])
            ) {
                let value = jseProperties[jsePropKey];
                let adaptedValue = null;
                if (value instanceof Date) {
                    adaptedValue = (value as Date)[
                        this.isIntercomProperty(jsePropKey as string)
                            ? 'toDateString'
                            : 'toISOString'
                    ]();
                } else {
                    adaptedValue = value;
                }
                segmentIdentifyScopedProps[segmentKey] = adaptedValue;
            }
        }
        return Object.entries(segmentIdentifyScopedProps).reduce(
            (partialObj, [k, v], index) => {
                if (index < 5) {
                    partialObj[k] = v;
                }
                return partialObj;
            },
            {} as Record<string, any>
        );
        /*let lotIndex = -1;
        return Object.entries(segmentIdentifyScopedProps).reduce(
            (partialObj, [k, v], index) => {
                if (index === 0 || index % 4 === 0) {
                    ++lotIndex;
                    if (partialObj[lotIndex] === undefined) {
                        partialObj[lotIndex] = {};
                    }
                }
                partialObj[lotIndex][k] = v;
                return partialObj;
            },
            {} as any
        );*/
        /*let truncateObject = {};
        for (const ([k, v] of Object.entries(segmentIdentifyScopedProps)){
            truncateObject
        }
        return segmentIdentifyScopedProps;*/
    }

    private setupTrackProps<TEventProperties>(
        jseProperties: TEventProperties
    ): IdentifyScopedProperties {
        const map: Record<string, string> = intercomCommonFields;

        let scopedProps: Record<string, any> = {};
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
                //continue;
            }

            const value = jseProperties[jsePropKey];
            let adaptedValue = null;
            if (value instanceof Date) {
                adaptedValue = (value as Date)[
                    this.isIntercomProperty(jsePropKey as string)
                        ? 'toDateString'
                        : 'toISOString'
                ]();
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
        const traits = [
            ...this.getIntercomReservedIdentifyProperties(),
            ...Object.keys(intercomMapCustomFields),
        ];
        return Object.keys(jseProperties).some((propName) =>
            traits.includes(propName.toString())
        );
    }

    private hasAnyTrackProps<TEventProperties>(
        jseProperties: TEventProperties
    ): boolean {
        const traits = this.getIntercomReservedIdentifyProperties();
        return Object.keys(jseProperties).some(
            (propName) =>
                traits.includes(propName.toString().toLowerCase()) === false
        );
    }

    private isIntercomProperty(jsePropName: string) {
        return this.getIntercomReservedIdentifyProperties().includes(
            jsePropName
        );
    }
}

let inst: SegmentSender | null = null;

export function getSegmentSender(apiKey: string): SegmentSender {
    return inst ?? (inst = new SegmentSender(apiKey));
}

type SubjectId = string | ObjectId;
type IdentifyScopedProperties = Record<string, any>;

type AllocateProperties<TEventProperties> = {
    identify: {
        toSend: boolean;
        scopedProps: IdentifyScopedProperties;
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

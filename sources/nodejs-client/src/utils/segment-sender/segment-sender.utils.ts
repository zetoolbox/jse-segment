import Analytics from 'analytics-node';
import { ObjectId } from 'bson';
import { EventName } from './event-name.enum';

import { intercomCommonFields, intercomMapCustomFields } from './intercom-fields';

class SegmentSender {
    private _client: Analytics;

    constructor(apiKey: string) {
        this._client = getSegmentClient(apiKey);
    }

    public async send<TEventProperties>({
        eventName,
        jseId,
        properties,
    }: {
        eventName: EventName;
        jseId: SubjectId;
        properties: TEventProperties;
        isCreation?: boolean;
    }): Promise<any> {
        const isCreation: boolean = eventName == EventName.inscription;
        const allocate = this.allocatePayloads(properties);

        console.log(eventName);
        const bulkSend = [];
        if (allocate.identify.toSend === true) {
            bulkSend.push(
                this.identify(
                    jseId,
                    allocate.identify.scopedProps,
                    isCreation ?? false
                )
            );
        }
        if (allocate.track.toSend === true) {
            bulkSend.push(
                this.track(
                    eventName as EventName,
                    jseId,
                    allocate.track.scopedProps,
                    isCreation ?? false
                )
            );
        }
        let responses: any[] = [];
        for (const applyPromise of bulkSend) {
            responses = [...responses, await applyPromise];
        }
        return responses;
    }
    private async identify(
        jseId: SubjectId,
        traits: IdentifyScopedProperties,
        isCreation: boolean
    ): Promise<any> {
        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);

        const payload = {
            [isCreation !== true ? 'userId' : 'anonymousId']: jseId.toString(),
            traits,
        };
        console.log(`identify(#${jseId}) : payload is : `, payload);

        return new Promise((resolve, reject) => {
            this._client.identify(payload, (error?: Error) =>
                _handleCallback(error)(resolve, reject)
            );
        });
    }
    private async track<TEventProperties>(
        eventName: EventName,
        jseId: SubjectId,
        properties: TEventProperties,
        isCreation: boolean
    ): Promise<any> {
        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);

        return new Promise((resolve, reject) => {
            const payload = {
                [isCreation !== true ? 'userId' : 'anonymousId']:
                    jseId.toString(),
                event: eventName.toString(),
                properties,
            };
            console.log(
                `track('${eventName}') for #${jseId} : payload is : `,
                payload
            );
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
            ...intercomMapCustomFields
        };

        let segmentIdentifyScopedProps: Record<string, any> = {};
        type JseObject = [keyof TEventProperties, string];

        const isPropValueAcceptable = (value: any) => {
            if (typeof value === 'string') {
                return value.toLowerCase() !== '';
            }
            return value !== null && value !== undefined;
        };

        for (const [jsePropKey, segmentKey] of Object.entries(map) as JseObject[]) {
            if (jsePropKey in map && isPropValueAcceptable(jseProperties[jsePropKey])) {
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
        return segmentIdentifyScopedProps;
    }

    private setupTrackProps<TEventProperties>(
        jseProperties: TEventProperties
    ): IdentifyScopedProperties {
        const map: Record<string, string> = {
            nom: 'lastName',
            prenom: 'firstName',
            email: 'email',
            dateNaissance: 'birthday',
            adresse: 'address',
            telephone: 'phone',
            fonction: 'role',
            siteWeb: 'website',
        };

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
                continue;
            }
            // which key to use  : this of Segment identify-reserved key or JSE's
            const whichKeytoUse = (
                jsePropKey in map ? map[jsePropKey as string] : jsePropKey
            ) as string;

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
            scopedProps[whichKeytoUse] = adaptedValue;
        }
        return scopedProps;
    }

    private hasAnyIdentifyProps<TEventProperties>(
        jseProperties: TEventProperties
    ): boolean {
        const traits = this.getIntercomReservedIdentifyProperties();
        return Object.keys(jseProperties).some((propName) =>
            traits.includes(propName.toString().toLowerCase())
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
        return jsePropName in intercomMapCustomFields;
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

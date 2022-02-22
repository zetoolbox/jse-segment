import Analytics from 'analytics-node';
import { ObjectId } from 'bson';
import { EventName } from './event-name.enum';

class SegmentSender {
    private _client: Analytics;

    constructor(apiKey: string) {
        this._client = getSegmentClient(apiKey);
    }

    public async send<TEventProperties>({
        eventName,
        subjectId,
        properties,
    }: {
        eventName: EventName;
        subjectId: SubjectId;
        properties: TEventProperties;
    }): Promise<any> {
        const allocate = this.allocatePayloads(properties);

        console.log(eventName);
        const bulkSend = [];
        if (allocate.identify.toSend === true) {
            bulkSend.push(
                this.identify(subjectId, allocate.identify.scopedProps)
            );
        }
        if (allocate.track.toSend === true) {
            bulkSend.push(
                this.track(
                    eventName as EventName,
                    subjectId,
                    allocate.track.scopedProps
                )
            );
        }
        return Promise.all(bulkSend);
    }
    private async identify(
        userId: SubjectId,
        traits: IdentifyScopedProperties
    ): Promise<any> {
        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);

        const payload = {
            userId: userId.toString(),
            traits,
        };
        console.log(`identify(#${userId}) : payload is : `, payload);

        return new Promise((resolve, reject) => {
            this._client.identify(payload, (error?: Error) =>
                _handleCallback(error)(resolve, reject)
            );
        });
    }
    private async track<TEventProperties>(
        eventName: EventName,
        subjectId: SubjectId,
        properties: TEventProperties
    ): Promise<any> {
        const _handleCallback =
            (error?: Error) => (resolve: any, reject: any) =>
                error ? reject(error) : resolve(true);

        return new Promise((resolve, reject) => {
            const payload = {
                userId: subjectId.toString(),
                event: eventName.toString(),
                properties,
            };
            console.log(
                `track('${eventName}') for #${subjectId} : payload is : `,
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
            split.identify.scopedProps =
                this.propsToIdentifyTypeProps(properties);
        }
        if (this.hasAnyTrackProps(properties)) {
            split.track.toSend = true;
            split.track.scopedProps = properties;
        }

        return split;
    }

    private propsToIdentifyTypeProps<TEventProperties>(
        jseProperties: TEventProperties
    ): IdentifyScopedProperties {
        const map = {
            nom: 'lastName',
            prenom: 'firstName',
            email: 'email',
            dateNaissance: 'birthday',
            adresse: 'address',
            telephone: 'phone',
            fonction: 'role',
            siteWeb: 'website',
        };

        let segmentIdentifyScopedProps: Record<string, any> = {};
        type JseObject = [keyof TEventProperties, string];

        const isPropValueAcceptable = (value: any) => {
            if (typeof value === 'string') {
                return value.toLowerCase() !== '';
            }
            return value !== null && value !== undefined;
        };

        for (const [jseKey, segmentKey] of Object.entries(map) as JseObject[]) {
            if (
                jseKey in jseProperties &&
                isPropValueAcceptable(jseProperties[jseKey])
            ) {
                segmentIdentifyScopedProps;
                segmentIdentifyScopedProps[segmentKey] = jseProperties[jseKey];
            }
        }
        return segmentIdentifyScopedProps;
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
}

let inst: SegmentSender | null = null;

export function getSegmentSender(apiKey: string): SegmentSender {
    console.log('KEU : ', apiKey);
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

export * from './payloads';
export * from './event-name.enum';

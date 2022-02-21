import Analytics from 'analytics-node';
import { ObjectId } from 'bson';
import { EventName } from './event-name.enum';

type SegmentAnalytics = Analytics;
//const Analytics = require('analytics-node');

type SubjectId = string | ObjectId;

const handleCallback = (error?: Error) => (resolve: any, reject: any) =>
    error ? reject(error) : resolve(true);

class SegmentSender {
    private _client: SegmentAnalytics;
    constructor({ apiKey }: { apiKey: string }) {
        this._client = new Analytics(apiKey);
    }

    async send<TEventProperties>({
        type,
        eventName,
        subjectId,
        properties,
    }: {
        type: 'event' | 'user';
        eventName: EventName;
        subjectId: SubjectId;
        properties: TEventProperties;
    }): Promise<any> {
        const segmentVerb = type !== 'user' ? 'track' : 'identify';
        if (segmentVerb === 'identify') {
            return this.identify(subjectId, properties);
        }
        return this.track<TEventProperties>(eventName as EventName, subjectId, properties);
    }
    private async identify<TEventProperties>(
        subjectId: SubjectId,
        traits: TEventProperties
    ): Promise<any> {
        const payload = {
            userId: subjectId.toString(),
            traits,
        };
        console.log('identify() : payload to be sent : ', payload);
        return new Promise((resolve, reject) => {
            this._client.identify(payload, (error?: Error) =>
                handleCallback(error)(resolve, reject)
            );
        });
    }
    private async track<TEventProperties>(
        eventName: EventName,
        subjectId: SubjectId,
        properties: TEventProperties
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const payload = {
                userId: subjectId.toString(),
                event: eventName.toString(),
                properties,
            };
            console.log('track() : payload to be sent : ', payload);
            this._client.track(payload, (error?: Error) => handleCallback(error)(resolve, reject));
        });
    }
}

let inst: SegmentSender | null = null;

export const getSegmentSender = (apiKey: string): SegmentSender => {
    return (
        inst ??
        (inst = new SegmentSender({
            apiKey,
        }))
    );
};

export * from './payloads';
export * from './event-name.enum';

import {
    intercomCommonFields,
    intercomMapCustomFields,
} from './intercom-fields';

export const Intercom = {
    getIntercomReservedIdentifyProperties(): string[] {
        return Object.values(intercomCommonFields);
    },

    getIntercomCommonFields(): Record<string, string> {
        return intercomCommonFields;
    },

    getIntercomCustomFields(): Record<string, string> {
        return intercomMapCustomFields;
    },

    getAllFields(): Record<string, string> {
        return {
            ...intercomCommonFields,
            ...intercomMapCustomFields,
        };
    },

    getAllFieldsKeys(): string[] {
        return [
            ...Intercom.getIntercomReservedIdentifyProperties(),
            ...Object.keys(Intercom.getIntercomCustomFields()),
        ];
    },

    chunkPayload<TEventProperties>(
        segmentIdentifyScopedProps: TEventProperties
    ): Partial<TEventProperties>[] {
        const chunkTreshold = 5; // intercom takes up to 5 props per call., Must chunk'em up
        const noChunkingRequired =
            Object.keys(segmentIdentifyScopedProps).length <= chunkTreshold;

        // if no chunking required
        if (noChunkingRequired === true) {
            return [segmentIdentifyScopedProps];
        }

        const propsAsArray = Object.entries(segmentIdentifyScopedProps);
        const payloadChunks: Partial<TEventProperties>[] = [];
        let propAsRow: [string, any] | undefined = undefined;
        let chunk: Partial<TEventProperties> = {};

        while (propsAsArray.length > 0) {
            propAsRow = propsAsArray.shift();
            if (propAsRow === undefined) {
                continue;
            }
            const [key, value] = propAsRow;

            chunk[key] = value;
            const isTresholdReached =
                Object.keys(chunk).length === chunkTreshold;
            const isChunksRest =
                Object.keys(chunk).length < chunkTreshold &&
                propsAsArray.length === 0;

            if (isTresholdReached || isChunksRest) {
                payloadChunks.push(chunk);
                chunk = {};
            }
        }
        return payloadChunks;
    },
};

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
        const chunkTreshold = 5; // intercom takes up to 5 props per call., Must chunk'em when above
        const noChunkingRequired =
            Object.keys(segmentIdentifyScopedProps).length <= chunkTreshold;

        // if no chunking required
        if (noChunkingRequired === true) {
            return [segmentIdentifyScopedProps];
        }

        let chunk: Partial<TEventProperties> = {};
        const payloadChunks = Object.entries(segmentIdentifyScopedProps).reduce(
            (chunks, [key, value], index) => {
                chunk[key as keyof TEventProperties] = value;
                if (index > 0 && (index + 1) % chunkTreshold === 0) {
                    chunks.push(chunk);
                    chunk = {};
                }
                return chunks;
            },
            [] as Partial<TEventProperties>[]
        );
        return payloadChunks;
    },
};

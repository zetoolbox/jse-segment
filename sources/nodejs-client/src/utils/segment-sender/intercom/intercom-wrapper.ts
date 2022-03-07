import {
    intercomCommonFields,
    intercomMapCustomFields,
} from './intercom-fields';

export const Intercom = {
    getIntercomReservedIdentifyProperties() {
        return Object.values(intercomCommonFields);
    },

    getIntercomCommonFields() {
        return intercomCommonFields;
    },

    getIntercomCustomFields() {
        return this.getIntercomCustomFields;
    },

    getAllFields() {
        return {
            ...intercomCommonFields,
            ...intercomMapCustomFields,
        };
    },

    getAllFieldsKeys() {
        return [
            ...this.getIntercomReservedIdentifyProperties(),
            ...Object.keys(this.getIntercomCustomFields()),
        ];
    },

    chunkPayload<TEventProperties>(
        segmentIdentifyScopedProps: TEventProperties
    ): Partial<TEventProperties>[] {
        const chunkTreshold = 5; // intercom takes up to 5 props per call., Must chunk'em when above

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

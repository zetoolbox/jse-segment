import 'dotenv/config';

import {
    getSegmentSender,
    EventName,
    EventType,
} from './utils/segment-sender/segment-sender.utils';

const SUBJECT_ID_TEST = '9876389478394' as const;

(async () => {
    const sender = getSegmentSender((process.env as any).SEGMENT_KEY);
    /*sender.send<EventType[EventName.connexionApp]>({
        type: 'event',
        subjectId: SUBJECT_ID_TEST,
        eventName: EventName.connexionApp,
        properties: {
            dateDerniereConnexionOuUpdate: new Date().toISOString(),
            nombreConnexions: 2,
        },
    });
    */
    await sender.send<EventType[EventName.inscription]>({
        type: 'user',
        eventName: EventName.inscription,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            email: 'joris@zetoolbox2.fr',
        },
    });
})();

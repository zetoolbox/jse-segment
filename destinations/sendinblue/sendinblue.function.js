// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

const api = {};

api.API_TOKEN = "";

api.fetch = async ({ method, endpoint, querystring, payload }) => {
    const requestOptions = {
        method,
        headers: {
            "Content-Type": "application/json",
            "api-key": api.API_TOKEN,
        },
        body:
            typeof payload === "string" || payload === undefined || payload === null
                ? payload
                : JSON.stringify(payload),
    };

    const url = `https://api.sendinblue.com/v3/${endpoint}${querystring ? "?" + querystring : ""}`;

    try {
        const httpResponse = await fetch(url, requestOptions);
        if (Number(httpResponse.status) !== 204) {
            return httpResponse.json();
        }
        return httpResponse;
    } catch (error) {
        console.log("ERROR : ", error.message);
        throw new RetryError(error.message);
    }
};

api.contact = {
    async getAttributes() {
        return api.fetch({
            method: "GET",
            endpoint: "contacts/attributes",
        });
    },

    async find(jseEmailAsId) {
        try {
            const contactFound = await api.fetch({
                method: "GET",
                endpoint: `contacts/${encodeURIComponent(jseEmailAsId)}`,
            });
            if (contactFound.code === "document_not_found") {
                return null;
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },

    mapJsePropertiesToSibAttributes: {
        lastName: (value) => ({
            LASTNAME: value,
        }),
        firstName: (value) => ({
            FIRSTNAME: value,
        }),
    },

    async upsert(jseEmailAsId, jseProperties) {
        const contactFound = await api.contact.find(jseEmailAsId);

        let sibPayload = {};
        for (const [jsePropName, jsePropValue] of Object.entries(jseProperties)) {
            if (!(jsePropName in api.contact.mapJsePropertiesToSibAttributes)) {
                continue;
            }
            const sibValueFormatter = api.contact.mapJsePropertiesToSibAttributes[jsePropName];
            sibPayload = {
                ...sibPayload,
                ...sibValueFormatter(jsePropValue),
            };
        }

        if (contactFound === null) {
            const contactCreated = await api.fetch({
                method: "POST",
                endpoint: "contacts",
                payload: {
                    email: jseProperties.email,
                    attributes: sibPayload,
                },
            });
            return contactCreated;
        } else {
            const contactUpdated = await api.fetch({
                method: "PUT",
                endpoint: `contacts/${encodeURIComponent(jseEmailAsId)}`,
                payload: {
                    attributes: sibPayload,
                },
            });
            return contactUpdated;
        }
    },
};

const inscription = async (jseEmailAsId, properties) => {
    await api.contact.upsert(jseEmailAsId, properties);
};

const mapAllowedEventsToActions = {
    identify: {
        inscription,
    },
    track: {
        inscription,
    },
};

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
    const { event: eventName, properties } = event;
    const jseEmailAsId = event.properties.email;
    api.API_TOKEN = settings.apiKey || settings.API_KEY;
    console.log("TRACK");

    if (eventName in mapAllowedEventsToActions.track && jseEmailAsId !== undefined) {
        api.API_TOKEN = settings.apiToken || settings.API_TOKEN;
        console.log(`${eventName} is a track event`);
        await mapAllowedEventsToActions.track[eventName](jseEmailAsId, properties, event.type);
    }
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
    console.log("IDENTIFY");
    api.API_TOKEN = settings.apiKey || settings.API_KEY;
    const jseEmailAsId = event.traits.email;
    if (jseEmailAsId !== undefined) {
        await mapAllowedEventsToActions.identify.inscription(
            jseEmailAsId,
            event.traits,
            event.type
        );
    }

    //throw new EventNotSupported("identify is not supported");
}

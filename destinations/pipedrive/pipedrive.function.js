// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

const utils = {};

utils.API_TOKEN = "";

utils.fetch = async ({ method, endpoint, querystring, payload }) => {
    const requestOptions = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body:
            typeof payload === "string" || payload === undefined || payload === null
                ? payload
                : JSON.stringify(payload),
    };

    console.log("FETCH");
    console.log("endpoint : ", endpoint);
    const url = `https://api.pipedrive.com/v1/${endpoint}?api_token=${utils.API_TOKEN}${
        querystring ? "&" + querystring : ""
    }`;
    console.log("url to fetch ", url);
    console.log("payload : ", JSON.stringify(requestOptions.body));
    try {
        const httpResponse = await fetch(url, requestOptions);
        return httpResponse.json();
    } catch (error) {
        console.log("ERROR : ", error.message);
        throw new RetryError(error.message);
    }
};

utils.findPersonCustomFieldFromName = async (customFieldName) => {
    const { data } = await utils.fetch({
        method: "GET",
        endpoint: "personFields",
        querystring: "start=0&limit=0",
    });
    const field = data.find((item) => item.name === customFieldName);
    return field ? field.id : null;
};

utils.findPersonCustomFields = async () => {
    return utils.fetch({
        method: "GET",
        endpoint: "personFields",
        querystring: "start=0&limit=0",
    });
};

utils.findPerson = async (jseUserId) => {
    const json = await utils.fetch({
        method: "GET",
        endpoint: "persons/search",
        querystring: `term=${jseUserId}&fields=custom_fields&exact_match=true`,
    });
    if (json.success === true && json.data.items.length > 0) {
        return json.data.items[0].item;
    }
    return null;
};

utils.updatePerson = async (jseUserId, properties) => {
    let { nom: last_name, prenom: first_name, phone, email } = properties;

    const person = await utils.findPerson(jseUserId);

    if (person !== null) {
        const payload = JSON.stringify({
            ...(first_name ? { first_name } : undefined),
            ...(last_name ? { last_name } : undefined),
            ...(email !== undefined
                ? {
                      email: [
                          {
                              value: email,
                              primary: true,
                          },
                      ],
                  }
                : undefined),
            ...(phone !== undefined
                ? {
                      phone: [
                          {
                              value: phone,
                              primary: true,
                          },
                      ],
                  }
                : undefined),
        });

        return utils.fetch({
            method: "PUT",
            endpoint: `persons/${person.id}`,
            payload,
        });
    }
};

utils.createPerson = async (jseId, properties) => {
    const mapJseFieldToCustomFieldValueFormatter = {
        firstName: (value) => ({ name: `${value} ${properties.lastName}` }),
        lastName: (value) => ({ name: `${properties.firstName} ${value}` }),
        email: (value) => ({
            email: [
                {
                    value,
                    primary: true,
                },
            ],
        }),
        telephone: (value) => ({
            phone: [
                {
                    value,
                    primary: true,
                },
            ],
        }),
        codePostal: (value) => ({ "7d54a3b2ec672b67400a1b1cbee5f8f431c08157": value }),
        dateNaissance: (value) => ({ "29f5b0acf1447abcb533318922f8a9ba197fb1ca": value }),
    };

    const pipedrivePayload = {
        ...Object.entries(properties).reduce((payload, [jsePropName, jsePropValue]) => {
            console.log("current item : ", [jsePropName, jsePropValue]);
            if (jsePropName in mapJseFieldToCustomFieldValueFormatter) {
                const pipedriveCFValueFormatter =
                    mapJseFieldToCustomFieldValueFormatter[jsePropName];
                payload = {
                    ...payload,
                    ...pipedriveCFValueFormatter(jsePropValue),
                };
            }
            return payload;
        }, {}),
        ["f0444c82088536ac96c3b17c057af9cb32a9fc06"]: jseId,
    };

    return utils.fetch({
        method: "POST",
        endpoint: "persons",
        payload: JSON.stringify(pipedrivePayload),
    });
};

const actions = {};

const inscription = async (jseId, properties) => {
    const newPerson = await utils.createPerson(jseId, properties);
    console.log("newPerson : ", JSON.stringify(newPerson));
};

const mapAllowedEventsToActions = {
    identify: inscription,
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
    const jseId = event.anonymousId ?? event.userId;
    console.log("TRACK");
    if (eventName in mapAllowedEventsToActions.track) {
        utils.API_TOKEN = settings.apiToken || settings.API_TOKEN;
        console.log(`${eventName} is a track event`);
        await mapAllowedEventsToActions.track[eventName](jseId, properties);
    }
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
    // Learn more at https://segment.com/docs/connections/spec/identify/
    //throw new EventNotSupported("identify is not supported");
    const { event: eventName } = event;
    console.log("IDENTIFY");
    //if (eventName in mapAllowedEventsToActions.identify) {
    utils.API_TOKEN = settings.apiToken || settings.API_TOKEN;
    await mapAllowedEventsToActions.identify(event.anonymousId, event.properties);
    //}
}

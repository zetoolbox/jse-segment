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
    console.log("url to fetch ", url, " / ", method);
    console.log("payload : ", JSON.stringify(requestOptions.body));
    try {
        const httpResponse = await fetch(url, requestOptions);
        return httpResponse.json();
    } catch (error) {
        console.log("ERROR : ", error.message);
        throw new RetryError(error.message);
    }
};

utils.person = {
    find: async (jseUserId) => {
        const json = await utils.fetch({
            method: "GET",
            endpoint: "persons/search",
            querystring: `term=${jseUserId}&fields=custom_fields&exact_match=true&start=0&limit=2`,
        });

        if (json.success === true && json.data.items.length > 0) {
            return json.data.items[0].item;
        }
        return null;
    },

    upsert: async (jseUserId, properties) => {
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

        let payload = {};

        for (const [jsePropName, jsePropValue] of Object.entries(properties)) {
            const pipedriveValueFormatter = mapJseFieldToCustomFieldValueFormatter[jsePropName];
            payload = {
                ...payload,
                ...(await pipedriveValueFormatter(jsePropValue ?? undefined)),
            };
        }

        const personRelations = {
            ["f0444c82088536ac96c3b17c057af9cb32a9fc06"]: jseUserId,
        };

        const pipedrivePayload = {
            ...payload,
            ...personRelations,
        };

        const personFound = await utils.person.find(jseUserId);

        const httpMethod = personFound !== null ? "PUT" : "POST";
        const httpEndpoint = personFound !== null ? `persons/${personFound.id}` : "persons";

        const upsertedPerson = await utils.fetch({
            method: httpMethod,
            endpoint: httpEndpoint,
            payload: JSON.stringify(pipedrivePayload),
        });
        return upsertedPerson;
    },
};

utils.businessPlan = {
    customFields: [],
    getCustomFields: async () => {
        if (utils.businessPlan.customFields.length === 0) {
            const { data } = await utils.fetch({
                method: "GET",
                endpoint: "dealFields",
                querystring: "start=0&limit=0",
            });
            utils.businessPlan.customFields = data;
        }
        return utils.businessPlan.customFields;
    },
    getCustomFieldByKey: async (customFieldKey) => {
        const field = (await utils.businessPlan.getCustomFields()).find(
            (item) => item.key === customFieldKey
        );
        return field ?? null;
    },
    getOptionIdForCustomField: async (customFieldKey, optionValue) => {
        if (optionValue === undefined || optionValue === null || optionValue.trim() === "") {
            return optionValue;
        }
        const customField = await utils.businessPlan.getCustomFieldByKey(customFieldKey);

        //console.log("custom field found : ", JSON.stringify(customField));
        if (Array.isArray(customField?.options) && customField?.options.length > 0) {
            console.log(" CF check : option : ", optionValue.toLowerCase());
            const found = customField.options.find(
                (option) => option.label.toLowerCase() === optionValue.toLowerCase()
            );
            console.log("fond option ", JSON.stringify(found));
            return found.id;
        }
        return optionValue;
    },

    find: async (jseBusinessPlanId) => {
        const json = await utils.fetch({
            method: "GET",
            endpoint: "deals/search",
            querystring: `term=${jseBusinessPlanId}&fields=custom_fields&exact_match=true&start=0&limit=2`,
        });
        console.log("BP res : ", JSON.stringify(json));
        if (json.success === true && json.data.items.length > 0) {
            return json.data.items[0].item;
        }
        return null;
    },

    upsert: async (jseBusinessPlanId, jseUserId, properties) => {
        const businessPlanFound = await utils.businessPlan.find(jseBusinessPlanId);
        const personFound = await utils.person.find(jseUserId);

        const mapJseFieldToCustomFieldValueFormatter = {
            title: async () => ({
                title: properties.title || `Affaire de ${personFound?.name}`,
            }),
            codeNAF: async (value) => ({ "5dcef7d2fd85a0d865f966ddc81efe34b9797c87": value }),
            dateCreationCompte: async (value = null) => ({
                add_time: value ?? new Date().toISOString(),
            }),
            dateSouscriptionFormuleChoisie: async (value) => ({
                ["df57592f0c3de982721ad43c7c490fdee93d2642"]: value,
            }),

            formuleChoisie: async (option) => ({
                "054c51771bfa8ce75fe569a61ae46afe4a4c4c3e":
                    await utils.businessPlan.getOptionIdForCustomField(
                        "054c51771bfa8ce75fe569a61ae46afe4a4c4c3e",
                        option
                    ),
            }),
            lienBPCompteAdmin: async (value) => ({
                "03f188a0dcee93c38834a2116cbe7a03f9bd3fd0": value,
            }),
            lienSnashopDernierBP: async (value) => ({
                ["acd7fd0540cb26407f3b3f96b084325533fd9ae2"]: value,
            }),
            secteurActivite: async (value) => ({
                "160cde1325cbb009ea8367c335fde417f0875573": value,
            }),
            statutJuridique: async (option) => ({
                "5216fa2fe2ae23cd1b5c2d90099fa15ef601b75c":
                    await utils.businessPlan.getOptionIdForCustomField(
                        "5216fa2fe2ae23cd1b5c2d90099fa15ef601b75c",
                        option
                    ),
            }),
            tailleEntreprise: async (value) => ({
                ["fccdf490f36294cda568f3fa1853ea429cef0354"]: value,
            }),
            businessPlanId: async (value) =>
                businessPlanFound
                    ? undefined
                    : {
                          "3ade93c4c1fc0a1bc4108cbf41c48752680aa171": value,
                      },
        };

        let payload = {};

        for (const [jsePropName, jsePropValue] of Object.entries(properties)) {
            if (!(jsePropName in mapJseFieldToCustomFieldValueFormatter)) {
                continue;
            }
            const pipedriveValueFormatter = mapJseFieldToCustomFieldValueFormatter[jsePropName];
            payload = {
                ...payload,
                ...(await pipedriveValueFormatter(jsePropValue ?? undefined)),
            };
        }

        const businessPlanRelations = {
            ...(businessPlanFound ? undefined : { person_id: personFound?.id }),
        };

        const businessPlanPayload = {
            ...payload,
            ...(await mapJseFieldToCustomFieldValueFormatter.title()),
            ...businessPlanRelations,
        };

        const httpMethod = businessPlanFound !== null ? "PUT" : "POST";
        const httpEndpoint = businessPlanFound !== null ? `deals/${businessPlanFound.id}` : "deals";
        const businessPlanUpserted = await utils.fetch({
            method: httpMethod,
            endpoint: httpEndpoint,
            payload: businessPlanPayload,
        });
        return businessPlanUpserted;
    },
};

const inscription = async (jseUserId, properties, eventType) => {
    switch (eventType) {
        case "identify":
            const personUpserted = await utils.person.upsert(jseUserId, properties);
            console.log("personUpserted : ", JSON.stringify(personUpserted));

            break;
        case "track":
            const businessPlanUpserted = await utils.businessPlan.upsert(
                properties.businessPlanId,
                jseUserId,
                properties
            );
            //console.log("businessPlanUpserted : ", JSON.stringify(businessPlanUpserted));
            break;
    }
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
    const jseBusinessPlanId = event.anonymousId ?? event.userId;
    console.log("TRACK");
    if (eventName in mapAllowedEventsToActions.track) {
        utils.API_TOKEN = settings.apiToken || settings.API_TOKEN;
        console.log(`${eventName} is a track event`);
        await mapAllowedEventsToActions.track[eventName](jseBusinessPlanId, properties, event.type);
    }
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
    console.log("IDENTIFY");
    utils.API_TOKEN = settings.apiToken || settings.API_TOKEN;
    await mapAllowedEventsToActions.identify(
        event.anonymousId || event.userId,
        event.traits,
        event.type
    );

    //throw new EventNotSupported("identify is not supported");
}

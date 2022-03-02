// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

const api = {};

api.API_KEY = "";

api.fetch = async ({ method, endpoint, querystring, payload }) => {
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

    const url = `https://api.pipedrive.com/v1/${endpoint}?API_KEY=${api.API_KEY}${
        querystring ? "&" + querystring : ""
    }`;
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

api.person = {
    find: async (jseUserId) => {
        const json = await api.fetch({
            method: "GET",
            endpoint: "persons/search",
            querystring: `term=${jseUserId}&fields=custom_fields&exact_match=true&start=0&limit=1`,
        });

        if (json.success === true && json.data.items.length > 0) {
            return json.data.items[0].item;
        }
        return null;
    },

    customFields: [],

    getCustomFields: async () => {
        if (api.person.customFields.length === 0) {
            const { data } = await api.fetch({
                method: "GET",
                endpoint: "personFields",
                querystring: "start=0&limit=0",
            });
            api.person.customFields = data;
        }
        return api.person.customFields;
    },

    getCustomFieldByKey: async (customFieldKey) => {
        const field = (await api.person.getCustomFields()).find(
            (item) => item.key === customFieldKey
        );
        return field ?? null;
    },

    getKVForCustomField: async (customFieldKey, value) => {
        if (optionValue === undefined || optionValue === null || optionValue.trim() === "") {
            return value;
        }
        const customField = await api.person.getCustomFieldByKey(customFieldKey);

        if (
            customField.field_type !== "enum" ||
            (["enum", "set"].includes(customField.field_type) && !(options in customField))
        ) {
            return { customFieldKey: value };
        }

        if (Array.isArray(customField?.options) && customField?.options.length > 0) {
            const foundOption = customField.options.find(
                (option) => option.label.toLowerCase() === value.toLowerCase()
            );
            return { customFieldKey: foundOption.id };
        }
        return null;
    },

    getMapJseFieldToCustomFieldValueFormatter(properties) {
        return {
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
            codePostal: (value) =>
                api.person.getKVForCustomField("7d54a3b2ec672b67400a1b1cbee5f8f431c08157", value),
            dateNaissance: (value) =>
                api.person.getKVForCustomField("29f5b0acf1447abcb533318922f8a9ba197fb1ca", value),
            dateValidationCompte: (value) =>
                api.person.getKVForCustomField("cc213a198f029314025658553f1c2af96497ded2", value),
            compteValide: (value) =>
                api.person.getKVForCustomField("d10fee2baa9f5a1705f414f005af58abc4a7f3a8", value),
            dateCreationCompte: async (value = null) => ({
                ...api.person.getKVForCustomField(
                    "00cfde349230f704ddff0a081a5aa9a824cace19",
                    value
                ),
                add_time: value ?? new Date().toISOString(),
            }),
            dateDernierCoachingRealise: (value) =>
                api.person.getKVForCustomField("0db59344588c09a70dd3433314183c1a5918567d", value),
        };
    },

    upsert: async (jseUserId, properties) => {
        let payload = {};
        const mapJseFieldToCustomFieldValueFormatter =
            api.person.getMapJseFieldToCustomFieldValueFormatter(jseProperties);
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

        const personRelations = {
            ["f0444c82088536ac96c3b17c057af9cb32a9fc06"]: jseUserId,
        };

        const pipedrivePayload = {
            ...payload,
            ...personRelations,
        };

        const personFound = await api.person.find(jseUserId);

        const httpMethod = personFound !== null ? "PUT" : "POST";
        const httpEndpoint = personFound !== null ? `persons/${personFound.id}` : "persons";

        const upsertedPerson = await api.fetch({
            method: httpMethod,
            endpoint: httpEndpoint,
            payload: JSON.stringify(pipedrivePayload),
        });
        return upsertedPerson;
    },
};

api.businessPlan = {
    customFields: [],
    getCustomFields: async () => {
        if (api.businessPlan.customFields.length === 0) {
            const { data } = await api.fetch({
                method: "GET",
                endpoint: "dealFields",
                querystring: "start=0&limit=0",
            });
            api.businessPlan.customFields = data;
        }
        return api.businessPlan.customFields;
    },
    getCustomFieldByKey: async (customFieldKey) => {
        const field = (await api.businessPlan.getCustomFields()).find(
            (item) => item.key === customFieldKey
        );
        return field ?? null;
    },
    getKVForCustomField: async (customFieldKey, value) => {
        if (optionValue === undefined || optionValue === null || optionValue.trim() === "") {
            return value;
        }
        const customField = await api.businessPlan.getCustomFieldByKey(customFieldKey);

        if (
            customField.field_type !== "enum" ||
            (["enum", "set"].includes(customField.field_type) && !(options in customField))
        ) {
            return { customFieldKey: value };
        }

        if (Array.isArray(customField?.options) && customField?.options.length > 0) {
            const foundOption = customField.options.find(
                (option) => option.label.toLowerCase() === value.toLowerCase()
            );
            return { customFieldKey: foundOption.id };
        }
        return null;
    },

    find: async (jseBusinessPlanId) => {
        const json = await api.fetch({
            method: "GET",
            endpoint: "deals/search",
            querystring: `term=${jseBusinessPlanId}&fields=custom_fields&exact_match=true&start=0&limit=1`,
        });
        if (json.success === true && json.data.items.length > 0) {
            return json.data.items[0].item;
        }
        return null;
    },

    getMapJsePropsToCustomFields: ({ properties, personFound, businessPlanFound }) => {
        return {
            title: () => ({
                title:
                    properties?.title ||
                    properties?.titre ||
                    properties?.titreNomProjet ||
                    `Affaire de ${personFound?.name}`,
            }),
            codeNAF: (value) =>
                api.businessPlan.getKVForCustomField(
                    "5dcef7d2fd85a0d865f966ddc81efe34b9797c87",
                    value
                ),
            dateSouscriptionFormuleChoisie: (value) =>
                api.businessPlan.getKVForCustomField(
                    "df57592f0c3de982721ad43c7c490fdee93d2642",
                    value
                ),

            formuleChoisie: (option) =>
                api.businessPlan.getKVForCustomField(
                    "054c51771bfa8ce75fe569a61ae46afe4a4c4c3e",
                    option
                ),
            lienBPCompteAdmin: (value) =>
                api.businessPlan.getKVForCustomField(
                    "03f188a0dcee93c38834a2116cbe7a03f9bd3fd0",
                    value
                ),
            lienSnashopDernierBP: (value) =>
                api.businessPlan.getKVForCustomField(
                    "acd7fd0540cb26407f3b3f96b084325533fd9ae2",
                    value
                ),
            secteurActivite: (value) =>
                api.businessPlan.getKVForCustomField(
                    "160cde1325cbb009ea8367c335fde417f0875573",
                    value
                ),
            statutJuridique: (value) =>
                api.businessPlan.getKVForCustomField(
                    "5216fa2fe2ae23cd1b5c2d90099fa15ef601b75c",
                    value
                ),
            tailleEntreprise: (value) =>
                api.businessPlan.getKVForCustomField(
                    "fccdf490f36294cda568f3fa1853ea429cef0354",
                    value
                ),
            businessPlanId: (value) =>
                businessPlanFound
                    ? undefined
                    : api.businessPlan.getKVForCustomField(
                          "3ade93c4c1fc0a1bc4108cbf41c48752680aa171",
                          value
                      ),
            dateDerniereConnexionOuUpdate: (value) =>
                api.businessPlan.getKVForCustomField(
                    "2cb19d40d7d649b6eace9ec31fb79ba58358ecdb",
                    value
                ),
            nombreConnexions: (value) =>
                api.businessPlan.getKVForCustomField(
                    "dc4872ea2ac612b27265728c3b8d72d18dc9ba41",
                    value
                ),
            codePromoUtilise: (value) =>
                api.businessPlan.getKVForCustomField(
                    ["c835b2acaacccce3ec9ced6fcbbbbceca79269a4"],
                    value
                ),
            dateProchainCoaching: (value) =>
                api.businessPlan.getKVForCustomField(
                    "bcbe57f90fca2b397a39ae1278a778df9fb57cb2",
                    value
                ),
            statutCoaching: (value) =>
                api.businessPlan.getKVForCustomField(
                    "b30c7d048d23524a1d947b39d080f685bb1719eb",
                    value
                ),
            descriptionCourteProjet: (value) =>
                api.businessPlan.getKVForCustomField(
                    "cdda2c21ab754ef5add6f1c6991818f802eed8d7",
                    value
                ),
            apportPersonnel: (value) =>
                api.businessPlan.getKVForCustomField(
                    "9af344b92a914cc264ef44287a00f8244830c2a3",
                    value
                ),
            dateDernierPDFTelecharge: (value) =>
                api.businessPlan.getKVForCustomField(
                    "250fc0b12aa7add12b7abc343a8947a332a941fb",
                    value
                ),
            lienSnapshotDernierBPTelecharge: (value) =>
                api.businessPlan.getKVForCustomField(
                    "acd7fd0540cb26407f3b3f96b084325533fd9ae2",
                    value
                ),
            statutLeadsEnvoyeAuCA: (value) =>
                api.businessPlan.getKVForCustomField(
                    "8c7a0f4bdd6a09f2240b144c82f8afb8da477343",
                    value
                ),
            raisonRejetStatutLead: (value) =>
                api.businessPlan.getKVForCustomField(
                    "b26aed070db23ee8d8a5debdab562ca53275a144",
                    value
                ),
            statutLeadsTelechargementBP: (value) =>
                api.businessPlan.getKVForCustomField(
                    "ec9239b4bd8146ba81f764271577bdb016168790",
                    value
                ),
            tauxCompletionBP: (value) =>
                api.businessPlan.getKVForCustomField(
                    "1dc966c562dbbecffbed24d772577b94804dcb5a",
                    value
                ),
            scoringJSE: (value) =>
                api.businessPlan.getKVForCustomField(
                    "e677c6eef5ba2ce39d6f199a75b2472d81795f51",
                    value
                ),
            titreNomProjet: (value) =>
                api.businessPlan.getKVForCustomField(
                    "5783b66d2d0fe0d9ac67d54b9ea7474d4ef1b3db",
                    value
                ),
            dateLancementActivite: (value) =>
                api.businessPlan.getKVForCustomField(
                    "b4f7c393a23f91ad55ad562bccb315df8f6eb95e",
                    value
                ),
            chiffreAffairesAnnee1: (value) =>
                api.businessPlan.getKVForCustomField(
                    "a5c39b77acee3316561b1582cbcba80fb964edc6",
                    value
                ),
        };
    },

    upsert: async (jseBusinessPlanId, jseUserId, properties) => {
        const businessPlanFound = await api.businessPlan.find(jseBusinessPlanId);
        const personFound = await api.person.find(jseUserId);

        const mapJsePropsToCustomFields = api.businessPlan.getMapJsePropsToCustomFields({
            properties,
            businessPlanFound,
            personFound,
        });

        let payload = {};

        for (const [jsePropName, jsePropValue] of Object.entries(properties)) {
            if (!(jsePropName in mapJsePropsToCustomFields)) {
                continue;
            }
            const pipedriveValueFormatter = mapJsePropsToCustomFields[jsePropName];
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
            ...(await mapJsePropsToCustomFields.title()),
            ...businessPlanRelations,
        };

        const httpMethod = businessPlanFound !== null ? "PUT" : "POST";
        const httpEndpoint = businessPlanFound !== null ? `deals/${businessPlanFound.id}` : "deals";
        const businessPlanUpserted = await api.fetch({
            method: httpMethod,
            endpoint: httpEndpoint,
            payload: businessPlanPayload,
        });
        return businessPlanUpserted;
    },
};

api.events = {};

api.events.inscription = async (jseUserId, properties, eventType) => {
    switch (eventType) {
        case "identify":
            const personUpserted = await api.person.upsert(jseUserId, properties);
            console.log("personUpserted : ", JSON.stringify(personUpserted));

            break;
        case "track":
            const businessPlanUpserted = await api.businessPlan.upsert(
                properties.businessPlanId,
                jseUserId,
                properties
            );
            console.log("businessPlanUpserted : ", JSON.stringify(businessPlanUpserted));
            break;
    }
};

api.events.connexionApp = async (jseUserId, jseProperties) => {
    const { dateDerniereConnexionOuUpdate, nombreConnexions } = jseProperties;
    const personUpserted = await api.person.upsert(jseUserId, {
        dateDerniereConnexionOuUpdate,
        nombreConnexions,
    });
    return personUpserted;
};

api.events.coachingPlanifie = async (jseUserId, jseProperties) => {
    const { codePromoUtilise, dateDernierCoachingRealise, dateProchainCoaching, statutCoaching } =
        jseProperties;
    const personUpserted = await api.businessPlan.upsert(jseUserId, {
        codePromoUtilise,
        dateProchainCoaching,
        statutCoaching,
    });
    return personUpserted;
};

api.events.paiementEffectue = async (jseUserId, jseProperties) => {
    const { codePromoUtilise } = jseProperties;
    const businssPlanUpserted = await api.businessPlan.upsert(jseUserId, {
        codePromoUtilise,
    });
    return businssPlanUpserted;
};

const mapAllowedEventsToActions = {
    identify: {
        inscription: api.events.inscription,
    },
    track: {
        inscription: api.events.inscription,
        connexionApp: api.connexionApp,
        coachingPlanifie: api.coachingPlanifie,
        paiementEffectue: api.paiementEffectue,
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
        api.API_KEY = settings.apiKey || settings.API_KEY;
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
    api.API_KEY = settings.apiKey || settings.API_KEY;
    await mapAllowedEventsToActions.identify.inscription(
        event.anonymousId || event.userId,
        event.traits,
        event.type
    );

    //throw new EventNotSupported("identify is not supported");
}

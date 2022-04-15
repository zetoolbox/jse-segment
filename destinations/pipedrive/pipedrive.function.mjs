// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

const api = {};

api.API_KEY = "";

api.fetch = async ({ method, endpoint, querystring, payload }) => {
    if (typeof payload === "object" && Object.keys(payload).length === 0) {
        return Promise.resolve(true);
    }
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

    const url = `https://api.pipedrive.com/v1/${endpoint}?api_token=${api.API_KEY}${
        querystring ? "&" + querystring : ""
    }`;

    console.log("fetch url :", method, " : ", url);
    console.log("payload : ", JSON.stringify(payload));

    try {
        const httpResponse = await fetch(url, requestOptions);
        console.log("http response status: ", httpResponse.status);
        console.log("HTTP response : ", JSON.stringify(httpResponse));

        if (Number(httpResponse.status) === 400) {
            console.log("HTTP response : ", JSON.stringify(httpResponse));
        }
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

    fetchCustomFields: async () => {
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
        const field = api.person.customFields.find((item) => item.key === customFieldKey);
        return field ?? null;
    },

    getKVForCustomField: async (customFieldKey, value) => {
        if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim()) === ""
        ) {
            return value;
        }
        const customField = await api.person.getCustomFieldByKey(customFieldKey);
        if (customField === null || customField === undefined) {
            return undefined;
        }

        if (customField?.options === undefined) {
            return { [customFieldKey]: value };
        }

        if (Array.isArray(customField?.options) && customField?.options.length > 0) {
            const foundOption = customField.options.find((option) => {
                switch (typeof value) {
                    case "string":
                        return option.label.toLowerCase() === value.toLowerCase();
                    case "boolean":
                        return (
                            (value === true && option.label.toLowerCase() === "oui") ||
                            (value === false && option.label.toLowerCase() === "non")
                        );
                }
            });
            return { [customFieldKey]: foundOption?.id };
        }
        return null;
    },

    getMapJseFieldToCustomFieldValueFormatter: (properties) => ({
        nom: () => ({
            last_name: properties.nom,
            name: `${properties.prenom} ${properties.nom}`,
        }),
        prenom: () => ({
            first_name: properties.prenom,
            name: `${properties.prenom} ${properties.nom}`,
        }),
        email: (value) => ({
            email: [
                {
                    value,
                    primary: true,
                },
            ],
        }),
        [humanizedPropOf("telephone")]: (value) => ({
            phone: [
                {
                    value,
                    primary: true,
                },
            ],
        }),
        [humanizedPropOf("codePostal")]: (value) =>
            api.person.getKVForCustomField("7d54a3b2ec672b67400a1b1cbee5f8f431c08157", value),
        [humanizedPropOf("dateNaissance")]: (value) =>
            api.person.getKVForCustomField("29f5b0acf1447abcb533318922f8a9ba197fb1ca", value),
        [humanizedPropOf("dateValidationCompte")]: (value) =>
            api.person.getKVForCustomField("cc213a198f029314025658553f1c2af96497ded2", value),
        [humanizedPropOf("compteValide")]: (value) =>
            api.person.getKVForCustomField("d10fee2baa9f5a1705f414f005af58abc4a7f3a8", value),
        [humanizedPropOf("dateDernierCoachingRealise")]: (value) =>
            api.person.getKVForCustomField("0db59344588c09a70dd3433314183c1a5918567d", value),
    }),

    upsert: async ({ jseUserId, properties }) => {
        await api.person.fetchCustomFields();
        let payload = {};
        const mapJseFieldToCustomFieldValueFormatter =
            api.person.getMapJseFieldToCustomFieldValueFormatter(properties);

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

        const personRelations = jseUserId
            ? { f0444c82088536ac96c3b17c057af9cb32a9fc06: jseUserId }
            : undefined;

        const pipedrivePayload = {
            ...payload,
            ...personRelations,
        };

        const personFound = await api.person.find(jseUserId);
        const httpMethod = personFound !== null ? "PUT" : "POST";
        const httpEndpoint = personFound !== null ? `persons/${personFound?.id}` : "persons";

        const { data: upsertedPerson } = await api.fetch({
            method: httpMethod,
            endpoint: httpEndpoint,
            payload: JSON.stringify(pipedrivePayload),
        });
        return upsertedPerson;
    },
};

api.businessPlan = {
    customFields: [],
    fetchCustomFields: async () => {
        if (api.businessPlan.customFields.length === 0) {
            console.log("first fetch");
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
        const field = api.businessPlan.customFields.find((item) => item.key === customFieldKey);
        return field ?? null;
    },
    getKVForCustomField: async (customFieldKey, value, options = { allowEmptyValue: false }) => {
        console.log("getKVForCustomField");
        console.log("customFieldKey : ", customFieldKey);
        if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "" && options.allowEmptyValue !== true)
        ) {
            return value;
        }

        const customField = await api.businessPlan.getCustomFieldByKey(customFieldKey);

        console.log("customField : ", customField);
        console.log("customField.options : ", customField.options);

        if (customField === null || customField === undefined) {
            return undefined;
        }

        if (customField?.options === undefined) {
            return { [customFieldKey]: value };
        }

        if (Array.isArray(customField?.options) && customField?.options.length > 0) {
            const foundOption = customField?.options.find((option) => {
                switch (typeof value) {
                    case "string":
                        return option.label.toLowerCase() === value.toLowerCase();
                    case "number":
                        return option.label === String(value);
                    case "boolean":
                        return (
                            (value === true && option.label.toLowerCase() === "oui") ||
                            (value === false && option.label.toLowerCase() === "non")
                        );
                }
            });
            return { [customFieldKey]: foundOption?.id };
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
                    properties[humanizedPropOf("nomProjet")] ||
                    `Affaire de ${personFound?.name ?? ""}`,
            }),
            [humanizedPropOf("codeNAF")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "5dcef7d2fd85a0d865f966ddc81efe34b9797c87",
                    value
                ),
            [humanizedPropOf("dateSouscriptionFormuleChoisie")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "df57592f0c3de982721ad43c7c490fdee93d2642",
                    value
                ),

            [humanizedPropOf("formuleChoisie")]: (option) =>
                api.businessPlan.getKVForCustomField(
                    "054c51771bfa8ce75fe569a61ae46afe4a4c4c3e",
                    option
                ),
            [humanizedPropOf("lienBPCompteAdmin")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "03f188a0dcee93c38834a2116cbe7a03f9bd3fd0",
                    value
                ),
            [humanizedPropOf("lienSnashopDernierBP")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "acd7fd0540cb26407f3b3f96b084325533fd9ae2",
                    value
                ),
            [humanizedPropOf("secteurActivite")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "160cde1325cbb009ea8367c335fde417f0875573",
                    value
                ),
            [humanizedPropOf("statutJuridique")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "5216fa2fe2ae23cd1b5c2d90099fa15ef601b75c",
                    value
                ),
            [humanizedPropOf("tailleEntreprise")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "fccdf490f36294cda568f3fa1853ea429cef0354",
                    value
                ),
            jseBpId: (value) =>
                businessPlanFound
                    ? undefined
                    : api.businessPlan.getKVForCustomField(
                          "3ade93c4c1fc0a1bc4108cbf41c48752680aa171",
                          value
                      ),
            [humanizedPropOf("dateDerniereConnexionOuUpdate")]: async (value) =>
                api.businessPlan.getKVForCustomField(
                    "2cb19d40d7d649b6eace9ec31fb79ba58358ecdb",
                    value
                ),
            [humanizedPropOf("nombreConnexions")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "dc4872ea2ac612b27265728c3b8d72d18dc9ba41",
                    value
                ),
            [humanizedPropOf("codePromoUtilise")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "c835b2acaacccce3ec9ced6fcbbbbceca79269a4",
                    value
                ),
            [humanizedPropOf("dateProchainCoaching")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "bcbe57f90fca2b397a39ae1278a778df9fb57cb2",
                    value
                ),
            [humanizedPropOf("statutCoaching")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "b30c7d048d23524a1d947b39d080f685bb1719eb",
                    value
                ),
            [humanizedPropOf("descriptionCourteProjet")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "cdda2c21ab754ef5add6f1c6991818f802eed8d7",
                    value
                ),
            [humanizedPropOf("apportPersonnel")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "9af344b92a914cc264ef44287a00f8244830c2a3",
                    value
                ),
            [humanizedPropOf("dateDernierPDFTelecharge")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "250fc0b12aa7add12b7abc343a8947a332a941fb",
                    value
                ),
            [humanizedPropOf("lienSnapshotDernierBP")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "acd7fd0540cb26407f3b3f96b084325533fd9ae2",
                    value
                ),
            [humanizedPropOf("statutLeadEnvoyeAuCA")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "8c7a0f4bdd6a09f2240b144c82f8afb8da477343",
                    value
                ),
            [humanizedPropOf("raisonRejetStatutLead")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "b26aed070db23ee8d8a5debdab562ca53275a144",
                    value
                ),
            [humanizedPropOf("statutLeadsTelechargementBP")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "ec9239b4bd8146ba81f764271577bdb016168790",
                    value
                ),
            [humanizedPropOf("tauxCompletionBP")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "1dc966c562dbbecffbed24d772577b94804dcb5a",
                    value
                ),
            [humanizedPropOf("scoringJSE")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "e677c6eef5ba2ce39d6f199a75b2472d81795f51",
                    value
                ),
            [humanizedPropOf("nomProjet")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "5783b66d2d0fe0d9ac67d54b9ea7474d4ef1b3db",
                    value
                ),
            [humanizedPropOf("dateLancementActivite")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "b4f7c393a23f91ad55ad562bccb315df8f6eb95e",
                    value
                ),
            [humanizedPropOf("chiffreAffairesAnnee1")]: (value) =>
                api.businessPlan.getKVForCustomField(
                    "a5c39b77acee3316561b1582cbcba80fb964edc6",
                    value
                ),
            [humanizedPropOf("coachingGratuitOffert")]: async (value) =>
                api.businessPlan.getKVForCustomField(
                    "6d64321bd1d6a61ddce43abbf009dc3db13ebc87",
                    value === true ? "Offert" : "", { allowEmptyValue: true }
                ),
        };
    },

    upsert: async ({ jseBpId, jseUserId, properties, contactUpserted }) => {
        await api.businessPlan.fetchCustomFields();
        const businessPlanFound = await api.businessPlan.find(jseBpId);
        const personFound = contactUpserted ? contactUpserted : await api.person.find(jseUserId);

        const mapJsePropsToCustomFields = api.businessPlan.getMapJsePropsToCustomFields({
            properties,
            businessPlanFound,
            personFound,
        });

        let payload = {};
        const mapKeys = Object.keys(mapJsePropsToCustomFields);

        for (const [jsePropName, jsePropValue] of Object.entries(properties)) {
            if (!mapKeys.includes(jsePropName)) {
                continue;
            }
            const pipedriveValueFormatter = mapJsePropsToCustomFields[jsePropName];
            if (typeof pipedriveValueFormatter === "function") {
                payload = {
                    ...payload,
                    ...(await pipedriveValueFormatter(jsePropValue)),
                };
            }
        }

        const businessPlanRelations = {
            ...(businessPlanFound ? undefined : { person_id: personFound?.id }),
        };

        const businessPlanPayload = {
            ...payload,
            ...(!businessPlanFound ? await mapJsePropsToCustomFields.title() : {}),
            ...businessPlanRelations,
        };

        const httpMethod = businessPlanFound !== null ? "PUT" : "POST";
        const httpEndpoint =
            businessPlanFound !== null ? `deals/${businessPlanFound?.id}` : "deals";
        const { data: businessPlanUpserted } = await api.fetch({
            method: httpMethod,
            endpoint: httpEndpoint,
            payload: businessPlanPayload,
        });
        return businessPlanUpserted;
    },
};

api.events = {};

api.events.handleTrack = async ({ jseUserId, jseBpId, jseProperties }) => {
    let contactUpserted = null;
    if (jseUserId !== undefined) {
        contactUpserted = await api.person.upsert({
            jseUserId,
            properties: jseProperties,
        });
    }

    let bpUpserted = null;
    if (jseBpId !== undefined) {
        bpUpserted = await api.businessPlan.upsert({
            jseBpId,
            jseUserId,
            properties: jseProperties,
            contactUpserted,
        });
    }

    return { bpUpserted, contactUpserted };
};

var humanizedPropOf = ((listEventPropertiesHumanized) => (propertyName) => {
    return propertyName in listEventPropertiesHumanized
        ? listEventPropertiesHumanized[propertyName]
        : propertyName;
})({
    // inscription:
    nom: "nom",
    prenom: "prenom",
    email: "email",
    formuleChoisie: "Formule Choisie",
    dateSouscriptionFormuleChoisie: "Date souscription à la formule choisie",
    tailleEntreprise: "Taille entreprise",
    statutJuridique: "Statut juridique",
    codeNAF: "Code NAF",
    codePostal: "Code postal",
    lienBPCompteAdmin: "Lien vers le business plan (admin)",
    lienSnapshotDernierBP: "Lien snapshot dernier BP",
    secteurActivite: "Secteur activite",

    // connexionApp
    dateDerniereConnexionOuUpdate: "Date derniere connexion ou update",
    nombreConnexions: "Nombre de connexions",

    // coachingPlanifie
    statutCoaching: "Statut coaching",
    dateDernierCoachingRealise: "Date dernier coaching réalisé",
    dateProchainCoaching: "Date prochain coaching",
    coachingGratuitOffert: "Coaching gratuit offert",
    // paiementEffectue
    codePromoUtilise: "Code promo utilisé",

    // telechargementBusinessPlanDownload
    dateDernierPDFTelecharge: "Date dernier BP téléchargé",

    //telechargementBusinessPlanPreview
    statutLeadsTelechargementBP: "Téléchargement BP",

    // clickedBoutonDemandePourEnvoyerDossierCA
    statutLeadEnvoyeAuCA: "Statut lead envoyé au CA",
    raisonRejetStatutLead: "Raison rejet statut lead",

    //statutCompteUpdatedEnValideDansBackendApp
    dateValidationCompte: "Date validation compte",
    compteValide: "Compte valide",

    // pourcentageCompletionBPUpdatedDansBackendApp
    tauxCompletionBP: "Taux complétion BP",

    // scoringLeadUpdatedDansBackendApp
    scoringJSE: "Scoring JSE",

    // champPageGardeUpdated
    nomProjet: "Nom du projet",

    // champPageProjetUpdated
    descriptionCourteProjet: "Description courte projet",
    dateLancementActivite: "Date lancement activité",

    // champPageSocieteUpdated
    dateNaissance: "Date naissance",

    //champPagePrevisionnelUpdated
    chiffreAffairesAnnee1: "Chiffre affaires année 1",
    apportPersonnel: "Apport personnel",
    telephone: "Téléphone"
});

const allowedEvents = [
    "Account Created",
    "Login",
    "Password forgotten",
    "Account deleted",
    "Account confirmed",
    "Coaching Statut Update",
    "Coaching Offered",
    "Payment Accepted",
    "Demand CA Sent",    
    "Business Plan Downloaded",
    "clickedBoutonDemandePourEnvoyerDossierCA",
    "Upsell Paid BP",
    "clickedBoutonSuivantDansFunnelOnboarding",
    "clickedBoutonRenvoyerEmailConfirmation",
    "Account Confirmed",
    "Account Updated",
    "BP - Pourcentage Completion Update",
    "Scoring Lead Update",
    "BP - Page de Garde Update",
    "BP - Projet Update",
    "BP - Société Update",
    "BP - Prévisionnel Update",    
    "BP - Prévisionnel Completed",
    "BP - Projet Completed",
    "BP - Société Completed",
    "BP - Marché Completed",
    "BP - Page de Garde Completed",
];

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
    const { event: eventName, properties } = event;
    let { jseUserEmail, ...jseProperties } = properties;
    const jseUserId = event.anonymousId ?? event.userId;
    const jseBpId = properties.jseBpId;

    console.log("TRACK");
    if (allowedEvents.includes(eventName)) {
        api.API_KEY = settings.apiKey || settings.API_KEY;
        console.log(`${eventName} is a track event`);
        await api.events.handleTrack({
            jseUserId,
            jseBpId,
            jseUserEmail,
            jseProperties,
        });
    }
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 *
async function onIdentify(event, settings) {
    console.log("IDENTIFY");
    throw new EventNotSupported("identify is not handled : Intercom only");
}
*/

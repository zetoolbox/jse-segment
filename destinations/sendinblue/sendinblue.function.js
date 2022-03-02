// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

const api = {};

api.API_KEY = "";

api.fetch = async ({ method, endpoint, querystring, payload }) => {
    const requestOptions = {
        method,
        headers: {
            "Content-Type": "application/json",
            "api-key": api.API_KEY,
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
        dateDernierCoachingRealise: (value) => ({
            DATE_DERNIER_COACHING_REALISE: value,
        }),
        dateDerniereConnexionOuUpdate: (value) => ({
            DATE_DERNIERE_CONNECTION: value,
        }),
        formuleChoisie: (value) => ({
            FORMULE_CHOISIE: value,
        }),
        dateSouscriptionFormuleChoisie: (value) => ({
            DATE_SOUSCRIPTION: value,
        }),
        dateDerniereConnexionOuUpdate: (value) => ({
            DATE_DERNIERE_CONNECTION: value,
        }),
        /*nombreConnexions: (value) => ({
            NB_CONNEXIONS: value,
        }),
        dateValidationCompte: (value) => ({
            DATE_VALIDATION_COMPTE: value
        })*/
        compteValide: (value) => ({
            COMPTE_VALIDE: value,
        }),
        dateCreationCompte: (value) => ({
            DATE_CREATION_COMPTE: value,
        }),
        statutJuridique: (value) => ({
            STATUT_JURIDIQUE: value,
        }),
        tauxCompletionBP: (value) => ({
            TAUX_COMPLETION_BP: value,
        }),
        codeNAF: (value) => ({
            CODE_NAF: value,
        }),
        secteurActivite: (value) => ({
            SECTEUR_ACTIVITE: value,
        }),
        scoringJSE: (value) => ({
            SCORING_JSE: value,
        }),
        titreNomProjet: (value) => ({
            TITRE_NOM_PROJET: value,
        }),
        codePostal: (value) => ({
            CODE_POSTAL: value,
        }),
        dateLancementActivite: (value) => ({
            DATE_LANCEMENT_ACTIVITE: value,
        }),
        chiffreAffairesAnnee1: (value) => ({
            CHIFFRE_AFFAIRES_ANNEE1: value,
        }),
        apportPersonnel: (value) => ({
            APPORT_PERSONNEL: value,
        }),
        codePromoUtilise: (value) => ({
            CODE_PROMO_UTILISE: value,
        }),
        dateDernierCoachingRealise: (value) => ({
            DATE_DERNIER_COACHING_REALISE: value,
        }),
        demandeEnvoiProjetCA: (value) => ({
            DEMANDE_ENVOI_PROJET_CA: value,
        }),
        accepteEmailMarketing: (value) =>({
            ACCEPTE_MARKETING: value
        }),
        BPGlobal: (value) => ({
            BP_GLOBAL: value
        })
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

api.events.inscription = async (jseEmailAsId, properties) => {
    await api.contact.upsert(jseEmailAsId, properties);
};

api.events.connexionApp = async (jseUserId, jseProperties) => {
    const { dateDerniereConnexionOuUpdate, nombreConnexions } = jseProperties;
    const personUpserted = await api.person.upsert(jseUserId, {
        dateDerniereConnexionOuUpdate,
    });
    return personUpserted;
};

const mapAllowedEventsToActions = {
    identify: {
        inscription: api.events.inscription,
    },
    track: {
        inscription: api.events.inscription,
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
    api.API_KEY = settings.apiKey || settings.API_KEY;
    console.log("TRACK");

    if (eventName in mapAllowedEventsToActions.track && jseEmailAsId !== undefined) {
        api.API_KEY = settings.apiToken || settings.API_KEY;
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
    api.API_KEY = settings.apiKey || settings.API_KEY;
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

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
            "api-key": api.API_KEY,
        },
        body:
            typeof payload === "string" || payload === undefined || payload === null
                ? payload
                : JSON.stringify(payload),
    };

    const url = `https://api.sendinblue.com/v3/${endpoint}${querystring ? "?" + querystring : ""}`;
    console.log("fetch url :", url);
    console.log("payload : ", JSON.stringify(payload));

    try {
        const httpResponse = await fetch(url, requestOptions);
        console.log("HTTP response status: ", httpResponse.status);
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
        accepteEmailMarketing: (value) => ({
            ACCEPTE_MARKETING: value,
        }),
        BPGlobal: (value) => ({
            BP_GLOBAL: value,
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

/*api.events.inscription = async (jseEmailAsId, properties) => {
    await api.contact.upsert(jseEmailAsId, properties);
};*/
/*
api.events.connexionApp = async (jseUserId, jseProperties) => {
    const { dateDerniereConnexionOuUpdate, nombreConnexions } = jseProperties;
    const personUpserted = await api.person.upsert(jseUserId, {
        dateDerniereConnexionOuUpdate,
    });
    return personUpserted;
};

api.events.coachingPlanifie = async (jseUserId, jseProperties) => {
    const { codePromoUtilise, dateDernierCoachingRealise, dateProchainCoaching, statutCoaching } =
        jseProperties;
    const personUpserted = await api.businessPlan.upsert(jseUserId, jseProperties);

    const bpUpserted = await api.businessPlan.upsert(
        { jseBpId, jseUserId },
        {
            dateDerniereConnexionOuUpdate,
            nombreConnexions,
        }
    );
    return personUpserted;
};
*/
/*
const mapAllowedEventsToActions = {
    identify: {
        inscription: api.events.inscription,
        coachingPlanifie: coachingPlanifie,
    },
    track: {
        inscription: api.events.inscription,
        coachingPlanifie: coachingPlanifie,
    },
};
*/

const allowedEvents = [
    "inscription",
    "connexionApp",
    "motDePasseOublie",
    "coachingPlanifie",
    "paiementEffectue",
    "telechargementBusinessPlanDownload",
    "telechargementBusinessPlanPreview",
    "cliqueSurBoutonDemandePourEnvoyerDossierCA",
    "upsellSonOffreEnPayant",
    "clickedBoutonSuivantDansFunnelOnboarding",
    "clickedBoutonRenvoyerEmailConfirmation",
    "statutCompteUpdatedEnValideDansBackendApp",
    "pourcentageCompletionBPUpdatedDansBackendApp",
    "scoringLeadUpdatedDansBackendApp",
    "champPageGardeUpdated",
    "champPageProjetUpdated",
    "champPageSocieteUpdated",
    "champPagePrevisionnelUpdated",
    "optInCommuniationOnboarding",
    "pagePrevisionnelComplete100pcent",
    "pageProjetComplete100pcent",
    "pageSocieteComplete100pcent",
    "pageEtudeMarcheComplete100pcent",
    "pageGardeComplete100pcent",
];

api.events = {};

api.events.handleTrack = async (jseEmailAsId, jseProperties) => {
    await api.contact.upsert(jseEmailAsId, jseProperties);
};
/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
    const { event: eventName, properties } = event;
    let { jseUserId, jseBpId, jseUserEmail, ...jseProperties } = properties;
    const jseEmailAsId = jseUserEmail;
    api.API_KEY = settings.apiKey || settings.API_KEY;
    console.log("TRACK");

    if (allowedEvents.includes(eventName) && jseEmailAsId !== undefined) {
        api.API_KEY = settings.apiKey || settings.API_KEY;
        console.log(`${eventName} is a track event`);
        await api.events.handleTrack(jseEmailAsId, jseProperties);
    }
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
    console.log("IDENTIFY");
    throw new EventNotSupported("identify is not handled.");
    /*
    api.API_KEY = settings.apiKey || settings.API_KEY;
    const jseEmailAsId = event.traits.email;
    if (jseEmailAsId !== undefined) {
        await mapAllowedEventsToActions.identify.inscription(
            jseEmailAsId,
            event.traits,
            event.type
        );
    }
    */
}

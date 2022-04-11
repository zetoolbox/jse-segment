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

    getMapJsePropertiesToSibAttributes: () => ({
        [humanizedPropOf("nom")]: (value) => ({
            LASTNAME: value,
        }),
        [humanizedPropOf("prenom")]: (value) => ({
            FIRSTNAME: value,
        }),
        [humanizedPropOf("dateDernierCoachingRealise")]: (value) => ({
            DATE_DERNIER_COACHING_REALISE: value,
        }),
        [humanizedPropOf("dateDerniereConnexionOuUpdate")]: (value) => ({
            DATE_DERNIERE_CONNECTION: value,
        }),
        [humanizedPropOf("formuleChoisie")]: (value) => ({
            FORMULE_CHOISIE: value,
        }),
        [humanizedPropOf("dateSouscriptionFormuleChoisie")]: (value) => ({
            DATE_SOUSCRIPTION: value,
        }),
        [humanizedPropOf("dateDerniereConnexionOuUpdate")]: (value) => ({
            DATE_DERNIERE_CONNECTION: value,
        }),
        [humanizedPropOf("compteValide")]: (value) => ({
            COMPTE_VALIDE: value,
        }),
        [humanizedPropOf("dateCreationCompte")]: (value) => ({
            DATE_CREATION_COMPTE: value,
        }),
        [humanizedPropOf("statutJuridique")]: (value) => ({
            STATUT_JURIDIQUE: value,
        }),
        [humanizedPropOf("tauxCompletionBP")]: (value) => ({
            TAUX_COMPLETION_BP: value,
        }),
        [humanizedPropOf("codeNAF")]: (value) => ({
            CODE_NAF: value,
        }),
        [humanizedPropOf("secteurActivite")]: (value) => ({
            SECTEUR_ACTIVITE: value,
        }),
        [humanizedPropOf("scoringJSE")]: (value) => ({
            SCORING_JSE: value,
        }),
        [humanizedPropOf("nomProjet")]: (value) => ({
            TITRE_NOM_PROJET: value,
        }),
        [humanizedPropOf("codePostal")]: (value) => ({
            CODE_POSTAL: value,
        }),
        [humanizedPropOf("dateLancementActivite")]: (value) => ({
            DATE_LANCEMENT_ACTIVITE: value,
        }),
        [humanizedPropOf("chiffreAffairesAnnee1")]: (value) => ({
            CHIFFRE_AFFAIRES_ANNEE1: value,
        }),
        [humanizedPropOf("apportPersonnel")]: (value) => ({
            APPORT_PERSONNEL: value,
        }),
        [humanizedPropOf("codePromoUtilise")]: (value) => ({
            CODE_PROMO_UTILISE: value,
        }),
        [humanizedPropOf("dateDernierCoachingRealise")]: (value) => ({
            DATE_DERNIER_COACHING_REALISE: value,
        }),
        [humanizedPropOf("demandeEnvoiProjetCA")]: (value) => ({
            DEMANDE_ENVOI_PROJET_CA: value,
        }),
        [humanizedPropOf("accepteEmailMarketing")]: (value) => ({
            ACCEPTE_MARKETING: value,
        }),
        [humanizedPropOf("BPGlobal")]: (value) => ({
            BP_GLOBAL: value,
        }),
        [humanizedPropOf("nombreConnexions")]: (value) => ({
            NB_CONNEXIONS: value,
        }),
    }),

    async upsert({ jseEmailAsId, jseUserId, jseProperties }) {
        const contactFound = await api.contact.find(jseEmailAsId);

        let sibPayload = {
            JSE_APP_USER_ID: jseUserId,
        };
        const mapJsePropertiesToSibAttributes = api.contact.getMapJsePropertiesToSibAttributes();
        for (const [jsePropName, jsePropValue] of Object.entries(jseProperties)) {
            const sibValueFormatter = mapJsePropertiesToSibAttributes[jsePropName];
            if (typeof sibValueFormatter !== "function") {
                continue;
            }
            sibPayload = {
                ...sibPayload,
                ...sibValueFormatter(jsePropValue),
            };
        }

        if (contactFound === null) {
            const fetchStatement = {
                method: "POST",
                endpoint: "contacts",
                payload: {
                    email: jseProperties.email,
                    attributes: sibPayload,
                },
            };
            const contactCreated = await api.fetch(fetchStatement);
            return contactCreated;
        } else {
            const fetchStatement = {
                method: "PUT",
                endpoint: `contacts/${encodeURIComponent(jseEmailAsId)}`,
                payload: {
                    attributes: sibPayload,
                },
            };
            const contactUpdated = await api.fetch(fetchStatement);
            return contactUpdated;
        }
    },
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

    // motDePasseOublie
    urlMotDePasseOublie: "Lien pour mot de passe oublié",

    //suppressionCompte
    supprime: "Compte supprimé",

    // confirmationCompte
    confirme: "Compte confirmé",
    urlValidationCompte: "Lien de validation de compte",

    // coachingPlanifie
    statutCoaching: "Statut coaching",
    dateDernierCoachingRealise: "Date dernier coaching réalisé",
    dateProchainCoaching: "Date prochain coaching",

    // paiementEffectue
    codePromoUtilise: "Code promo utilisé",

    // telechargementBusinessPlanDownload
    dateDernierPDFTelecharge: "Date dernier BP téléchargé",

    //telechargementBusinessPlanPreview
    statutLeadsTelechargementBP: "Téléchargement BP",

    // clickedBoutonDemandePourEnvoyerDossierCA
    demandeEnvoiProjetCA: "Demande envoi projet au CA",
    statutLeadEnvoyeAuCA: "Statut lead envoyé au CA", //ok interfcom
    raisonRejetStatutLead: "Raison rejet statut lead",

    //clickedBoutonSuivantDansFunnelOnboarding
    boutonFunnelOnboarding: "Bouton suivant funnel onboard",

    //clickedBoutonRenvoyerEmailConfirmation
    boutonEmailConfirmation: "Renvoi email confirmation cliqué",

    //statutCompteUpdatedEnValideDansBackendApp
    dateValidationCompte: "Date validation compte",
    compteValide: "Compte valide",

    // pourcentageCompletionBPUpdatedDansBackendApp
    tauxCompletionBP: "Taux complétion BP",
    BPGlobal: "BP global",

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

    //optInCommunicationOnboarding
    accepteEmailMarketing: "Accepte email marketing",

    //pagePrevisionnelComplete100pcent
    previsionnel: "Prévisionnel",

    //pageProjetComplete100pcent
    projet: "Projet",

    //pageSocieteComplete100pcent
    societe: "Société",

    // pageEtudeMarcheComplete100pcent
    etudeMarche: "Etude de marché",

    // pageGardeComplete100pcent
    pageGarde: "Page de garde",
});

const allowedEvents = [
    "Account Created",
    "Login",
    "Password forgotten",
    "Account deleted",
    "Account confirmed",
    "Coaching Statut Update",
    "Payment Accepted",
    "Demand CA Sent",
    "Business Plan Preview",
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
    "Opt-in Marketing",
    "BP - Prévisionnel Completed",
    "BP - Projet Completed",
    "BP - Société Completed",
    "BP - Marché Completed",
    "BP - Page de Garde Completed",
];

api.events = {};

api.events.handleTrack = async ({ jseEmailAsId, jseUserId, jseProperties }) => {
    await api.contact.upsert({ jseEmailAsId, jseUserId, jseProperties });
};
/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
    const { event: eventName, properties } = event;
    let { jseBpId, jseUserEmail, ...jseProperties } = properties;
    const jseUserId = event.anonymousId ?? event.userId;
    const jseEmailAsId = jseUserEmail;
    api.API_KEY = settings.apiKey || settings.API_KEY;
    console.log("TRACK");

    if (allowedEvents.includes(eventName) && jseEmailAsId !== undefined) {
        api.API_KEY = settings.apiKey || settings.API_KEY;
        console.log(`${eventName} is a track event`);
        await api.events.handleTrack({ jseEmailAsId, jseUserId, jseProperties });
    }
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 *
async function onIdentify(event, settings) {
    console.log("IDENTIFY");
    throw new EventNotSupported("identify is not handled.");
}
*/

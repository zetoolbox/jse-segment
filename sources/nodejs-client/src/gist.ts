import 'dotenv/config';
import {
    getSegmentSender,
    EventName,
    EventProperties,
} from './services/segment-sender';

interface ProcessEnv {
    [key: string]: string;
    SEGMENT_KEY: string;
}

const JSE_USER_ID = 'jse-uid-1993';
const JSE_BP_ID = 'jse-bpid-1993';
const JSE_USER_EMAIL = 'jorisE@zetoolbox.fr';
//const DATE_TEST = new Date('2022-04-08');
//const LIEN_CONN = 'https://jse.fr/conn';
//const LIEN_BP = 'https://jse.fr/bp';
const IDENTIFIERS = {
    jseUserId: JSE_USER_ID,
    jseBpId: JSE_BP_ID,
    jseUserEmail: JSE_USER_EMAIL,
};

(async () => {
    const sender = getSegmentSender((process.env as ProcessEnv).SEGMENT_KEY);

    // VERIFIED
    /*
    await sender.send<EventProperties[EventName.inscription]>({
        eventName: EventName.inscription,
        ...IDENTIFIERS,
        properties: {
            formuleChoisie: 'Payant',
            codeNAF: '98797979',
            codePostal: '34000',
            dateSouscriptionFormuleChoisie: new Date(),
            lienBPCompteAdmin: 'https://...',
            nom: 'GrouilletE',
            prenom: 'JorisE',
            email: JSE_USER_EMAIL,
            lienSnapshotDernierBP: 'https://...',
            secteurActivite: 'Industrie',
            statutJuridique: 'SARL',
            tailleEntreprise: 'Moyen',
            nomProjet: 'projet JorisE',
            lienVersPageBP: "http://",
            lienVersPageConnexion: "https://"
        },
        dryRun: true,
    });
    

    await sender.send<EventProperties[EventName.updateInscription]>({
        eventName: EventName.updateInscription,
        ...IDENTIFIERS,
        properties: {
            lienVersPageBP: 'https://bp.com',
            lienVersPageConnexion: 'https://page.com',
            lienSnapshotDernierBP: 'https://snapshot.com',
        },
        //dryRun: true,
    });

    // VERIFIED
    /*
    await sender.send<EventProperties[EventName.connexionApp]>({
        eventName: EventName.connexionApp,
        jseUserId: JSE_USER_ID,
        jseBpId: JSE_BP_ID,
        properties: {
            dateDerniereConnexionOuUpdate: new Date('2022-04-04'),
            nombreConnexions: 42,
        },
        //dryRun: true,
    });

    // VERIFIED
    
    await sender.send<EventProperties[EventName.coachingPlanifie]>({
        eventName: EventName.coachingPlanifie,
        ...IDENTIFIERS,
        properties: {
            dateDernierCoachingRealise: DATE_TEST, // V
            dateProchainCoaching: DATE_TEST, //V
            statutCoaching: 'RDV manqué', //V
        },
        //dryRun: true
    });
    
    /*

    // VERIFIED
    /*
    await sender.send<EventProperties[EventName.paiementEffectue]>({
        eventName: EventName.paiementEffectue,
        jseUserId: JSE_USER_ID,
        jseUserEmail: JSE_USER_EMAIL,
        jseBpId: JSE_BP_ID,
        properties: {
            codePromoUtilise: 'MY-CODE-PROMO',
        },
    });
    

    // VERIFIED

    await sender.send<
        EventProperties[EventName.telechargementBusinessPlanDownload]
    >({
        eventName: EventName.telechargementBusinessPlanDownload,
        ...IDENTIFIERS,
        properties: {
            lienVersPageBP: LIEN_BP,
            lienVersPageConnexion: LIEN_CONN,
            dateDernierPDFTelecharge: new Date(),
        },
    });

    // VERIFIED
    /*
    await sender.send<
        EventProperties[EventName.telechargementBusinessPlanPreview]
    >({
        eventName: EventName.telechargementBusinessPlanPreview,
        jseUserId: JSE_USER_ID,
        jseBpId: JSE_BP_ID,
        properties: {
            statutLeadsTelechargementBP: 'En attente de relecture',
        },
    });
    */

    // VERIFIED
    /*
    await sender.send<
        EventProperties[EventName.clickedBoutonDemandePourEnvoyerDossierCA]
    >({
        eventName: EventName.clickedBoutonDemandePourEnvoyerDossierCA,
        jseUserId: JSE_USER_ID,
        jseBpId: JSE_BP_ID,
        jseUserEmail: JSE_USER_EMAIL,
        properties: {
            demandeEnvoiProjetCA: 'demande envoi projet CA',
            raisonRejetStatutLead: 'Page de garde',
            statutLeadEnvoyeAuCA: 'Rejeté',
            lienVersPageBP: LIEN_BP,
            lienVersPageConnexion: LIEN_CONN,
        },
    });

    /*
    // VERIFIED
    await sender.send<EventProperties[EventName.upsellSonOffreEnPayant]>({
        eventName: EventName.upsellSonOffreEnPayant,
        ...IDENTIFIERS,
        properties: {
            formuleChoisie: 'Gratuit avec Business case',
        },
    });
    */

    // NOT YET SPECIFIED IN NOTION
    /*
    await sender.send<
        EventProperties[EventName.clickedBoutonSuivantDansFunnelOnboarding]
    >({
        eventName: EventName.clickedBoutonSuivantDansFunnelOnboarding,
        ...IDENTIFIERS,
        properties: {
            boutonFunnelOnboarding: 'domaine-activite',
        },
    });
    */

    // NOT YET SPECIFIED IN NOTION
    /*
    await sender.send<
        EventProperties[EventName.clickedBoutonRenvoyerEmailConfirmation]
    >({
        eventName: EventName.clickedBoutonRenvoyerEmailConfirmation,
        ...IDENTIFIERS,
        properties: {
            boutonEmailConfirmation: true,
        },
    });
    /

    // VERIFIED
    
    await sender.send<
        EventProperties[EventName.statutCompteUpdatedEnValideDansBackendApp]
    >({
        eventName: EventName.statutCompteUpdatedEnValideDansBackendApp,
        ...IDENTIFIERS,
        properties: {
            compteValide: true,
            dateValidationCompte: DATE_TEST,
        },
    });
    

    // VERIFIED
    /*
    await sender.send<
        EventProperties[EventName.pourcentageCompletionBPUpdatedDansBackendApp]
    >({
        eventName: EventName.pourcentageCompletionBPUpdatedDansBackendApp,
        ...IDENTIFIERS,
        properties: {
            BPGlobal: 'pending',
            tauxCompletionBP: 50,
            lienVersPageBP: LIEN_BP,
            lienVersPageConnexion: LIEN_CONN,
        },
    });
    

    // VERIFIED

    await sender.send<
        EventProperties[EventName.scoringLeadUpdatedDansBackendApp]
    >({
        eventName: EventName.scoringLeadUpdatedDansBackendApp,
        ...IDENTIFIERS,
        properties: {
            scoringJSE: 350,
        },
    });

    // VERIFIED

    await sender.send<EventProperties[EventName.champPageGardeUpdated]>({
        eventName: EventName.champPageGardeUpdated,
        ...IDENTIFIERS,
        properties: {
            nomProjet: 'nom de mon projet',
        },
    });
    /*
    // VERIFIED
    
    await sender.send<EventProperties[EventName.champPageProjetUpdated]>({
        eventName: EventName.champPageProjetUpdated,
        ...IDENTIFIERS,
        properties: {
            descriptionCourteProjet: 'blabla',
            dateLancementActivite: DATE_TEST,
        },
    });


    await sender.send<EventProperties[EventName.confirmationCompte]>({
        eventName: EventName.confirmationCompte,
        ...IDENTIFIERS,
        properties: {
            confirme: true,
            urlValidationCompte: 'https://jse.fr/urlconfirmcompte',
        },
    });

    */

    await sender.send<EventProperties[EventName.suppressionCompte]>({
        eventName: EventName.suppressionCompte,
        ...IDENTIFIERS,
        properties: {
            supprime: true,
        },
    });

    /*

    // VERIFIED
    /*
    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        ...IDENTIFIERS,
        properties: {
            dateNaissance: DATE_TEST,
            statutJuridique: 'SAS',
        },
    });
    */

    /*
    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        ...IDENTIFIERS,
        properties: {
            dateNaissance: DATE_TEST,
            statutJuridique: 'SAS',
        },
    });

    // VERIFIED
    await sender.send<EventProperties[EventName.champPagePrevisionnelUpdated]>({
        eventName: EventName.champPagePrevisionnelUpdated,
        ...IDENTIFIERS,
        properties: {
            apportPersonnel: 42_000,
            chiffreAffairesAnnee1: 1_000_000,
        },
    });

    // VERIFIED
    await sender.send<EventProperties[EventName.optInCommunicationOnboarding]>({
        eventName: EventName.optInCommunicationOnboarding,
        ...IDENTIFIERS,
        properties: {
            accepteEmailMarketing: true,
        },
    });

    // VERIFIED
    await sender.send<
        EventProperties[EventName.pagePrevisionnelComplete100pcent]
    >({
        eventName: EventName.pagePrevisionnelComplete100pcent,
        ...IDENTIFIERS,
        properties: {
            previsionnel: 'completed',
        },
    });

    // VERIFIED
    await sender.send<EventProperties[EventName.pageProjetComplete100pcent]>({
        eventName: EventName.pageProjetComplete100pcent,
        ...IDENTIFIERS,
        properties: {
            projet: 'pending',
        },
    });

    // VERIFIED
    await sender.send<EventProperties[EventName.pageSocieteComplete100pcent]>({
        eventName: EventName.pageSocieteComplete100pcent,
        ...IDENTIFIERS,
        properties: {
            societe: 'completed',
        },
    });

    // VERIFIED
    await sender.send<
        EventProperties[EventName.pageEtudeMarcheComplete100pcent]
    >({
        eventName: EventName.pageEtudeMarcheComplete100pcent,
        ...IDENTIFIERS,
        properties: {
            etudeMarche: 'completed',
        },
    });

    // VERIFIED
    await sender.send<EventProperties[EventName.pageGardeComplete100pcent]>({
        eventName: EventName.pageGardeComplete100pcent,
        ...IDENTIFIERS,
        properties: {
            pageGarde: 'pending',
        },
    });



    await sender.send<EventProperties[EventName.motDePasseOublie]>({
        eventName: EventName.motDePasseOublie,
        ...IDENTIFIERS,
        properties: {
            urlMotDePasseOublie: 'https://jse.fr/motdepasseoublie',
        },
    });
    */
})();

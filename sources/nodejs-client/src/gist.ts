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

const JSE_USER_ID = 'jse-uid-1985';
const JSE_BP_ID = 'jse-bpid-1985';
const JSE_USER_EMAIL = 'jorisK@zetoolbox.fr';
const DATE_TEST = new Date('2022-04-08');
const LIEN_CONN = 'https://conn2.com';
const LIEN_BP = 'https://bp2.fr';
const IDENTIFIERS = {
    jseUserId: JSE_USER_ID,
    jseBpId: JSE_BP_ID,
    jseUserEmail: JSE_USER_EMAIL,
};

(async () => {
    const sender = getSegmentSender((process.env as ProcessEnv).SEGMENT_KEY);
    /*
    // VERIFIED
    await sender.send<EventProperties[EventName.inscription]>({
        eventName: EventName.inscription,
        ...IDENTIFIERS,
        properties: {
            formuleChoisie: 'Payant', // v
            codeNAF: '98797979', //v
            codePostal: '34000', //v
            dateSouscriptionFormuleChoisie: new Date(), //v
            lienBPCompteAdmin: 'https://bpadmin.com', // v
            nom: 'GrouilletK', // v
            prenom: 'JorisK', // v
            email: JSE_USER_EMAIL, // v
            lienSnapshotDernierBP: 'https://...', // v
            secteurActivite: 'Industrie', // v
            statutJuridique: 'SAS', //v
            tailleEntreprise: 'Moyen',
            nomProjet: 'projet JorisK', // v
            lienVersPageBP: 'http://bp.com', // v
            lienVersPageConnexion: 'https://conn.com', //v
        },
    });

    
   // VERIFIED
    await sender.send<EventProperties[EventName.updateInscription]>({
        eventName: EventName.updateInscription,
        ...IDENTIFIERS,
        properties: {
            lienVersPageBP: 'https://bp2.com',
            lienVersPageConnexion: 'https://page2.com',
            lienSnapshotDernierBP: 'https://snap2.com',
            dateNaissance: DATE_TEST,
            statutJuridique: 'SAS',
        },
        //dryRun: true,
    });

    */

    // VERIFIED
    await sender.send<EventProperties[EventName.connexionApp]>({
        eventName: EventName.connexionApp,
        ...IDENTIFIERS,
        properties: {
            dateDerniereConnexionOuUpdate: new Date('2022-04-04'), // v
            nombreConnexions: 42, //v
        },
        //dryRun: true,
    });

    /*
    // VERIFIED
    await sender.send<EventProperties[EventName.coachingPlanifie]>({
        eventName: EventName.coachingPlanifie,
        ...IDENTIFIERS,
        properties: {
            dateDernierCoachingRealise: DATE_TEST, // v
            dateProchainCoaching: DATE_TEST, // v
            statutCoaching: 'RDV effectué',
        },
        //dryRun: true
    });

    
    // VERIFIED
    await sender.send<EventProperties[EventName.paiementEffectue]>({
        eventName: EventName.paiementEffectue,
        jseUserId: JSE_USER_ID,
        jseUserEmail: JSE_USER_EMAIL,
        jseBpId: JSE_BP_ID,
        properties: {
            codePromoUtilise: 'MY-CODE-PROMO', /// v
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
            dateDernierPDFTelecharge: DATE_TEST,
        },
    });

    
    // VERIFIED
    await sender.send<
        EventProperties[EventName.telechargementBusinessPlanPreview]
    >({
        eventName: EventName.telechargementBusinessPlanPreview,
        ...IDENTIFIERS,
        properties: {
            statutLeadsTelechargementBP: true,
        },
    });

    
    // VERIFIED
    await sender.send<
        EventProperties[EventName.clickedBoutonDemandePourEnvoyerDossierCA]
    >({
        eventName: EventName.clickedBoutonDemandePourEnvoyerDossierCA,
        ...IDENTIFIERS,
        properties: {
            demandeEnvoiProjetCA: 'demande envoi projet CA', //v
            raisonRejetStatutLead: 'Page de garde', // v
            statutLeadEnvoyeAuCA: 'Rejeté', // v
            lienVersPageBP: LIEN_BP,
            lienVersPageConnexion: LIEN_CONN,
        },
    });



    // VERIFIED
    await sender.send<EventProperties[EventName.upsellSonOffreEnPayant]>({
        eventName: EventName.upsellSonOffreEnPayant,
        ...IDENTIFIERS,
        properties: {
            formuleChoisie: "Gratuit sans Business case",
        },
    });


    // VERIFIED

    await sender.send<
        EventProperties[EventName.clickedBoutonSuivantDansFunnelOnboarding]
    >({
        eventName: EventName.clickedBoutonSuivantDansFunnelOnboarding,
        ...IDENTIFIERS,
        properties: {
            boutonFunnelOnboarding: true,
        },
    });


    
    // VERIFIED
    await sender.send<
        EventProperties[EventName.clickedBoutonRenvoyerEmailConfirmation]
    >({
        eventName: EventName.clickedBoutonRenvoyerEmailConfirmation,
        ...IDENTIFIERS,
        properties: {
            boutonEmailConfirmation: true,
        },
    });


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
    
    

    await sender.send<
        EventProperties[EventName.pourcentageCompletionBPUpdatedDansBackendApp]
    >({
        eventName: EventName.pourcentageCompletionBPUpdatedDansBackendApp,
        ...IDENTIFIERS,
        properties: {
            BPGlobal: 'completed',
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
            scoringJSE: 380,
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

    
    // VERIFIED
    await sender.send<EventProperties[EventName.champPageProjetUpdated]>({
        eventName: EventName.champPageProjetUpdated,
        ...IDENTIFIERS,
        properties: {
            descriptionCourteProjet: 'blabla',
            dateLancementActivite: DATE_TEST,
        },
    });
    
    // VERIFIED
    await sender.send<EventProperties[EventName.confirmationCompte]>({
        eventName: EventName.confirmationCompte,
        ...IDENTIFIERS,
        properties: {
            confirme: true,
            urlValidationCompte: 'https://jse.fr/urlconfirmcompte',
        },
    });

    
    // VERIFIED
    await sender.send<EventProperties[EventName.suppressionCompte]>({
        eventName: EventName.suppressionCompte,
        ...IDENTIFIERS,
        properties: {
            supprime: true,
        },
    });

    
    // VERIFIED
    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        ...IDENTIFIERS,
        properties: {
            dateNaissance: DATE_TEST,
            statutJuridique: 'SARL',            
        },
    });
    
    
    // VERIFIED
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
            previsionnel: 'pending',
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

    
    // VERIFIED
    await sender.send<EventProperties[EventName.motDePasseOublie]>({
        eventName: EventName.motDePasseOublie,
        ...IDENTIFIERS,
        properties: {
            urlMotDePasseOublie: 'https://jse.fr/motdepasseoublie',
        },
    });
    */
})();

import 'dotenv/config';
import {
    getSegmentSender,
    EventName,
    EventProperties,
} from './utils/segment-sender';

interface ProcessEnv {
    [key: string]: string;
    SEGMENT_KEY: string;
}

//const KNOWN_SUBJECT_ID_TEST = '9876389478394' as const;
const JSE_USER_ID = 'jse-uid-11223344';

const JSE_BP_ID = 'jse-bpid-11223344';

(async () => {
    const sender = getSegmentSender((process.env as ProcessEnv).SEGMENT_KEY);

    await sender.send<EventProperties[EventName.inscription]>({
        eventName: EventName.inscription,
        jseId: JSE_USER_ID,
        properties: {
            ///caissesRegionalesAssociees: [''],
            formuleChoisie : "Payant",
            businessPlanId: JSE_BP_ID,
            codeNAF: '98797979',
            codePostal: '34000',
            dateCreationCompte: new Date().toISOString(),
            dateSouscriptionFormuleChoisie: new Date().toISOString(),            
            lienBPCompteAdmin: 'https://...',
            nom: 'Grouillet',
            prenom: 'Joris',
            email: 'joris@zetoolbox.fr',
            lienSnapshotDernierBP: 'https://...',
            secteurActivite: 'Industrie',
            statutJuridique: 'SAS',
            tailleEntreprise: 2,
        },
    });

    /*
    await sender.send<EventProperties[EventName.connexionApp]>({
        eventName: EventName.connexionApp,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            dateDerniereConnexionOuUpdate: new Date().toISOString(),
            nombreConnexions: 22,
        },
    });

    await sender.send<EventProperties[EventName.coachingPlanifie]>({
        eventName: EventName.coachingPlanifie,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            codePromoUtilise: '',
            dateDernierCoachingRealise: new Date().toISOString(),
            dateProchainCoaching: new Date().toISOString(),
            statutCoaching: 'rdv-pris',
        },
    });

    await sender.send<EventProperties[EventName.telechargementBusinessPlanDownload]>({
        eventName: EventName.telechargementBusinessPlanDownload,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            dateDernierPDFTelecharge: new Date().toISOString(),
        },
    });

    await sender.send<EventProperties[EventName.telechargementBusinessPlanPreview]>({
        eventName: EventName.telechargementBusinessPlanPreview,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            statutLeadsTelechargementBP: 'en-attente-relecture',
        },
    });

    await sender.send<
        EventProperties[EventName.cliqueSurBoutonDemandePourEnvoyerDossierCA]
    >({
        eventName: EventName.cliqueSurBoutonDemandePourEnvoyerDossierCA,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            raisonRejetStatutLead: '',
            statutLeads: 'rejete',
        },
    });

    await sender.send<EventProperties[EventName.upsellSonOffreEnPayant]>({
        eventName: EventName.upsellSonOffreEnPayant,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            formuleChoisie: undefined,
        },
    });

    await sender.send<
        EventProperties[EventName.clickedBoutonSuivantDansFunnelOnboarding]
    >({
        eventName: EventName.clickedBoutonSuivantDansFunnelOnboarding,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            bouton: 'domaine-activite',
        },
    });

    await sender.send<
        EventProperties[EventName.clickedBoutonRenvoyerEmailConfirmation]
    >({
        eventName: EventName.clickedBoutonRenvoyerEmailConfirmation,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            clicked: true,
        },
    });

    await sender.send<
        EventProperties[EventName.statutCompteUpdatedEnValideDansBackendApp]
    >({
        eventName: EventName.statutCompteUpdatedEnValideDansBackendApp,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            compteOuEmailValide: false,
            dateValidationCompteOuEmail: new Date().toISOString(),
        },
    });

    await sender.send<
        EventProperties[EventName.statutCompteUpdatedEnValideDansBackendApp]
    >({
        eventName: EventName.statutCompteUpdatedEnValideDansBackendApp,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            compteOuEmailValide: false,
            dateValidationCompteOuEmail: new Date().toISOString(),
        },
    });

    await sender.send<
        EventProperties[EventName.pourcentageCompletionBPUpdatedDansBackendApp]
    >({
        eventName: EventName.pourcentageCompletionBPUpdatedDansBackendApp,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            statutBPGlobal: 'pending',
            tauxCompletionBP: 50,
        },
    });

    await sender.send<EventProperties[EventName.scoringLeadUpdatedDansBackendApp]>({
        eventName: EventName.scoringLeadUpdatedDansBackendApp,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            scoringJSE: 42,
        },
    });

    await sender.send<EventProperties[EventName.champPageGardeUpdated]>({
        eventName: EventName.champPageGardeUpdated,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            titreNomProjet: '',
        },
    });

    await sender.send<EventProperties[EventName.champPageProjetUpdated]>({
        eventName: EventName.champPageProjetUpdated,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            descriptionCourteProjet: '',
        },
    });

    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            dateNaissance: new Date().toISOString(),
            statutJuridique: undefined,
        },
    });

    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            dateNaissance: new Date().toISOString(),
            statutJuridique: undefined,
        },
    });

    await sender.send<EventProperties[EventName.champPagePrevisionnelUpdated]>({
        eventName: EventName.champPagePrevisionnelUpdated,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            apportPersonnel: 42_000,
            chiffreAffairesAnnee1: 1_000_000,
        },
    });

    await sender.send<EventProperties[EventName.optInCommuniationOnboarding]>({
        eventName: EventName.optInCommuniationOnboarding,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            accepteEmailMarketing: true,
        },
    });

    await sender.send<EventProperties[EventName.pagePrevisionnelComplete100pcent]>({
        eventName: EventName.pagePrevisionnelComplete100pcent,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            previsionnel: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageProjetComplete100pcent]>({
        eventName: EventName.pageProjetComplete100pcent,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            projet: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageSocieteComplete100pcent]>({
        eventName: EventName.pageSocieteComplete100pcent,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            societe: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageEtudeMarcheComplete100pcent]>({
        eventName: EventName.pageEtudeMarcheComplete100pcent,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            etudeMarche: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageGardeComplete100pcent]>({
        eventName: EventName.pageGardeComplete100pcent,
        subjectId: SUBJECT_ID_TEST,
        properties: {
            pageGarde: 'pending',
        },
    });
    */
})();

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

//const KNOWN_JSE_USER_ID = '9876389478394' as const;
const JSE_USER_ID = 'jse-uid-11223344';

const JSE_BP_ID = 'jse-bpid-11223344';

(async () => {
    const sender = getSegmentSender((process.env as ProcessEnv).SEGMENT_KEY);

    await sender.send<EventProperties[EventName.inscription]>({
        eventName: EventName.inscription,
        jseId: JSE_USER_ID,
        properties: {
            ///caissesRegionalesAssociees: [''],
            businessPlanId: JSE_BP_ID,
            formuleChoisie: 'Payant',
            codeNAF: '98797979',
            codePostal: '34000',
            dateCreationCompte: new Date(),
            dateSouscriptionFormuleChoisie: new Date(),
            lienBPCompteAdmin: 'https://...',
            nom: 'Grouilletti',
            prenom: 'Jorizzi',
            email: 'joris@zetoolbox.fr',
            lienSnapshotDernierBP: 'https://...',
            secteurActivite: 'Industrie',
            statutJuridique: 'SAS',
            tailleEntreprise: 2,
        },
    });

    await sender.send<EventProperties[EventName.connexionApp]>({
        eventName: EventName.connexionApp,
        jseId: JSE_USER_ID,
        properties: {
            dateDerniereConnexionOuUpdate: new Date(),
            nombreConnexions: 22,
        },
    });

    await sender.send<EventProperties[EventName.coachingPlanifie]>({
        eventName: EventName.coachingPlanifie,
        jseId: JSE_USER_ID,
        properties: {
            dateDernierCoachingRealise: new Date(),
            dateProchainCoaching: new Date(),
            statutCoaching: 'rdv-pris',
        },
    });

    await sender.send<EventProperties[EventName.paiementEffectue]>({
        eventName: EventName.paiementEffectue,
        jseId: JSE_USER_ID,
        properties: {
            codePromoUtilise: 'SOME-CODE-PROMO',
        },
    });
    /*
    await sender.send<EventProperties[EventName.telechargementBusinessPlanDownload]>({
        eventName: EventName.telechargementBusinessPlanDownload,
        subjectId: JSE_USER_ID,
        properties: {
            dateDernierPDFTelecharge: new Date(),
        },
    });

    await sender.send<EventProperties[EventName.telechargementBusinessPlanPreview]>({
        eventName: EventName.telechargementBusinessPlanPreview,
        subjectId: JSE_USER_ID,
        properties: {
            statutLeadsTelechargementBP: 'en-attente-relecture',
        },
    });
v
    await sender.send<
        EventProperties[EventName.cliqueSurBoutonDemandePourEnvoyerDossierCA]
    >({
        eventName: EventName.cliqueSurBoutonDemandePourEnvoyerDossierCA,
        subjectId: JSE_USER_ID,
        properties: {
            demandeEnvoiProjetCA: '',
            raisonRejetStatutLead: '',
            statutLeadsEnvoyeAuCA: 'rejete',
        },
    });

    await sender.send<EventProperties[EventName.upsellSonOffreEnPayant]>({
        eventName: EventName.upsellSonOffreEnPayant,
        subjectId: JSE_USER_ID,
        properties: {
            formuleChoisie: undefined,
        },
    });

    await sender.send<
        EventProperties[EventName.clickedBoutonSuivantDansFunnelOnboarding]
    >({
        eventName: EventName.clickedBoutonSuivantDansFunnelOnboarding,
        subjectId: JSE_USER_ID,
        properties: {
            bouton: 'domaine-activite',
        },
    });

    await sender.send<
        EventProperties[EventName.clickedBoutonRenvoyerEmailConfirmation]
    >({
        eventName: EventName.clickedBoutonRenvoyerEmailConfirmation,
        subjectId: JSE_USER_ID,
        properties: {
            clicked: true,
        },
    });

    await sender.send<
        EventProperties[EventName.statutCompteUpdatedEnValideDansBackendApp]
    >({
        eventName: EventName.statutCompteUpdatedEnValideDansBackendApp,
        subjectId: JSE_USER_ID,
        properties: {
            compteValide: false,
            dateValidationCompte: new Date(),
        },
    });

    await sender.send<
        EventProperties[EventName.pourcentageCompletionBPUpdatedDansBackendApp]
    >({
        eventName: EventName.pourcentageCompletionBPUpdatedDansBackendApp,
        subjectId: JSE_USER_ID,
        properties: {
            BPGlobal: 'pending',
            tauxCompletionBP: 50,
        },
    });

    await sender.send<EventProperties[EventName.scoringLeadUpdatedDansBackendApp]>({
        eventName: EventName.scoringLeadUpdatedDansBackendApp,
        subjectId: JSE_USER_ID,
        properties: {
            scoringJSE: 42,
        },
    });

    await sender.send<EventProperties[EventName.champPageGardeUpdated]>({
        eventName: EventName.champPageGardeUpdated,
        subjectId: JSE_USER_ID,
        properties: {
            titreNomProjet: '',
        },
    });

    await sender.send<EventProperties[EventName.champPageProjetUpdated]>({
        eventName: EventName.champPageProjetUpdated,
        subjectId: JSE_USER_ID,
        properties: {
            descriptionCourteProjet: '',
            dateLancementActivite: new Date()
        },
    });

    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        subjectId: JSE_USER_ID,
        properties: {
            dateNaissance: new Date(),
            statutJuridique: undefined,
        },
    });

    await sender.send<EventProperties[EventName.champPageSocieteUpdated]>({
        eventName: EventName.champPageSocieteUpdated,
        subjectId: JSE_USER_ID,
        properties: {
            dateNaissance: new Date(),
            statutJuridique: undefined,
        },
    });

    await sender.send<EventProperties[EventName.champPagePrevisionnelUpdated]>({
        eventName: EventName.champPagePrevisionnelUpdated,
        subjectId: JSE_USER_ID,
        properties: {
            apportPersonnel: 42_000,
            chiffreAffairesAnnee1: 1_000_000,
        },
    });

    await sender.send<EventProperties[EventName.optInCommuniationOnboarding]>({
        eventName: EventName.optInCommuniationOnboarding,
        subjectId: JSE_USER_ID,
        properties: {
            accepteEmailMarketing: true,
        },
    });

    await sender.send<EventProperties[EventName.pagePrevisionnelComplete100pcent]>({
        eventName: EventName.pagePrevisionnelComplete100pcent,
        subjectId: JSE_USER_ID,
        properties: {
            previsionnel: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageProjetComplete100pcent]>({
        eventName: EventName.pageProjetComplete100pcent,
        subjectId: JSE_USER_ID,
        properties: {
            projet: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageSocieteComplete100pcent]>({
        eventName: EventName.pageSocieteComplete100pcent,
        subjectId: JSE_USER_ID,
        properties: {
            societe: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageEtudeMarcheComplete100pcent]>({
        eventName: EventName.pageEtudeMarcheComplete100pcent,
        subjectId: JSE_USER_ID,
        properties: {
            etudeMarche: 'completed',
        },
    });

    await sender.send<EventProperties[EventName.pageGardeComplete100pcent]>({
        eventName: EventName.pageGardeComplete100pcent,
        subjectId: JSE_USER_ID,
        properties: {
            pageGarde: 'pending',
        },
    });
    */
})();

import { ObjectId } from 'bson';
import {
    BusinessPlanModel,
    BusinessPlanOffer,
    BusinessPlanProjectLocation,
    UserModel,
} from '../../models';

type ElementStatus = null | 'pending' | 'completed';
type RaisonRejetStatutLead = '';
type StatutLeads = 'en-attente-relecture' | 'valide' | 'rejete';
type SubjectId = string | ObjectId;

interface EventTypePayload {
    inscription: {
        businessPlanId: SubjectId;
        nom: UserModel['lastName'];
        prenom: UserModel['firstName'];
        email: UserModel['email'];
        formuleChoisie: BusinessPlanOffer['offerType'] | "Payant"; // ?
        dateSouscriptionFormuleChoisie: Date | string;
        dateCreationCompte: Date | string;
        tailleEntreprise: number;
        statutJuridique: BusinessPlanModel['legalStatus'] | 'SAS';
        codeNAF: string | BusinessPlanProjectLocation['irisCode']; // ?
        codePostal: BusinessPlanProjectLocation['postCode'];
        lienBPCompteAdmin: string;
        //caissesRegionalesAssociees: string[];
        lienSnapshotDernierBP: string;
        secteurActivite: BusinessPlanModel['industryType'] | 'Industrie';
    };
    inscription_test: {
        email: UserModel['email'];
    };
    connexionApp: {
        dateDerniereConnexionOuUpdate: Date | string;
        nombreConnexions: number;
    };

    coachingPlanifie: {
        statutCoaching: 'rdv-pris' | 'rdv-effectue' | 'rdv-manque'; //?
        dateDernierCoachingRealise: Date | string;
        dateProchainCoaching: Date | string;
    };
    paiementEffectue: {
        codePromoUtilise: string;
    };
    telechargementBusinessPlanDownload: {
        dateDernierPDFTelecharge: Date | string;
    };
    telechargementBusinessPlanPreview: {
        statutLeadsTelechargementBP: StatutLeads;
    };
    cliqueSurBoutonDemandePourEnvoyerDossierCA: {
        statutLeads: StatutLeads;
        raisonRejetStatutLead: string | RaisonRejetStatutLead;
    };

    upsellSonOffreEnPayant: {
        formuleChoisie: BusinessPlanOffer['offerType'];
    };
    clickedBoutonSuivantDansFunnelOnboarding: {
        bouton:
            | 'domaine-activite'
            | 'secteur-activite'
            | 'lieu-implantation'
            | 'taille-entreprise'
            | 'offre';
    };
    clickedBoutonRenvoyerEmailConfirmation: {
        clicked: true; //?
    };

    statutCompteUpdatedEnValideDansBackendApp: {
        dateValidationCompteOuEmail: Date | string;
        compteOuEmailValide: boolean;
    };
    pourcentageCompletionBPUpdatedDansBackendApp: {
        tauxCompletionBP: number;
        statutBPGlobal: ElementStatus;
    };
    scoringLeadUpdatedDansBackendApp: {
        scoringJSE: number;
    };
    champPageGardeUpdated: {
        titreNomProjet: string;
    };
    champPageProjetUpdated: {
        descriptionCourteProjet: string;
    };
    champPageSocieteUpdated: {
        statutJuridique: BusinessPlanModel['legalStatus'];
        dateNaissance: Date | string;
    };

    champPagePrevisionnelUpdated: {
        chiffreAffairesAnnee1: number;
        apportPersonnel: number;
    };
    optInCommuniationOnboarding: {
        accepteEmailMarketing: boolean;
    };
    pagePrevisionnelComplete100pcent: {
        previsionnel: ElementStatus;
    };
    pageProjetComplete100pcent: {
        projet: ElementStatus;
    };
    pageSocieteComplete100pcent: {
        societe: ElementStatus;
    };
    pageEtudeMarcheComplete100pcent: {
        etudeMarche: ElementStatus;
    };
    pageGardeComplete100pcent: {
        pageGarde: ElementStatus;
    };
}

export interface EventProperties extends EventTypePayload {}

/*interface triggersSansDestination {
    motPasseOublie: {};
    entreeTunnelInscription: {};
    utiliseCodePromo: {};
    clickedBoutonOffre: {};
    adresseEmailValidee: {};
    interagiViaBulleAide: {};
    clickedBoutonMonCompte: {};
    clickedBoutonPartenaires: {};
    clickedBoutonTableauxFinanciers: {};
    changeSonImplantation: {};
    scoreUtilisateurChange: {};
    champPageEtudeMarcheUpdated: {};
}
*/

import { ObjectId } from 'bson';
import {
    BusinessPlanModel,
    BusinessPlanOffer,
    BusinessPlanProjectLocation,
    UserModel,
} from '../../models';

type ElementStatus = null | 'pending' | 'completed';
type RaisonRejetStatutLead =
    | 'Page de garde'
    | 'Projet'
    | 'Société'
    | 'Etude de marché'
    | 'Prévisionnel';
type StatutLeadsTelechargementBP =
    | 'En attente de relecture'
    | 'Validé'
    | 'Rejeté';
type StatutLeadsEnvoyeCA = 'En attente de relecture' | 'Validé' | 'Rejeté';
type SubjectId = string | ObjectId;
type StatutCoaching = null | 'rdv pris' | 'rdv effectue' | 'rdv manqué';

interface EventTypePayload {
    inscription: {
        businessPlanId: SubjectId;
        nom: UserModel['lastName'];
        prenom: UserModel['firstName'];
        email: UserModel['email'];
        formuleChoisie:
            | BusinessPlanOffer['offerType']
            | null
            | 'Payant'
            | 'Gratuit sans Business case'
            | 'Gratuit avec Business case'
            | 'Payant'; // ?
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
        statutCoaching: StatutCoaching; //?
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
        statutLeadsTelechargementBP: StatutLeadsTelechargementBP;
    };
    cliqueSurBoutonDemandePourEnvoyerDossierCA: {
        demandeEnvoiProjetCA: string;
        statutLeadsEnvoyeAuCA: StatutLeadsEnvoyeCA;
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
        compteValide: boolean;
    };
    pourcentageCompletionBPUpdatedDansBackendApp: {
        tauxCompletionBP: number;
        BPGlobal: ElementStatus;
    };
    scoringLeadUpdatedDansBackendApp: {
        scoringJSE: number;
    };
    champPageGardeUpdated: {
        titreNomProjet: string;
    };
    champPageProjetUpdated: {
        descriptionCourteProjet: string;
        dateLancementActivite: Date | string;
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

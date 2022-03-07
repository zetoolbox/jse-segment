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
type FormuleChoisie =
    | BusinessPlanOffer['offerType']
    | null
    | 'Payant'
    | 'Gratuit sans Business case'
    | 'Gratuit avec Business case'    
type TailleEntreprise = 'Petit' | 'Moyen' | 'Grand' | 'Très grand';

export interface EventProperties {
    inscription: {
        businessPlanId: SubjectId;
        nom: UserModel['lastName'];
        prenom: UserModel['firstName'];
        email: UserModel['email'];
        formuleChoisie: FormuleChoisie;
        dateSouscriptionFormuleChoisie: Date | string;
        dateCreationCompte: Date | string;
        tailleEntreprise: TailleEntreprise;
        statutJuridique: BusinessPlanModel['legalStatus'] | 'SAS' | 'SARL';
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
        statutLeadEnvoyeAuCA: StatutLeadsEnvoyeCA;
        raisonRejetStatutLead?: RaisonRejetStatutLead;
    };

    upsellSonOffreEnPayant: {
        formuleChoisie: BusinessPlanOffer['offerType'] | FormuleChoisie;
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
        dateValidationCompte: Date | string;
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
        statutJuridique: BusinessPlanModel['legalStatus'] | 'SAS' | 'SARL';
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

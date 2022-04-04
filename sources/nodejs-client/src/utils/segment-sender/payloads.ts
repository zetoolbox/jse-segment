import { ObjectId } from 'bson';
import {
    BusinessPlanModel,
    BusinessPlanOffer,
    BusinessPlanProjectLocation,
    UserModel,
} from '../../models';

type LiensDirigentVersPages = {
    lienVersPageConnexion: string;
    lienVersPageBP: string;
};

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
    | 'Gratuit avec Business case';
type TailleEntreprise = 'Petit' | 'Moyen' | 'Grand' | 'Très grand';

export interface EventProperties {
    inscription: {
        nom: UserModel['lastName'];
        prenom: UserModel['firstName'];
        email: UserModel['email'];
        formuleChoisie: FormuleChoisie;
        nomProjet?: string;
        dateSouscriptionFormuleChoisie: Date | string;
        tailleEntreprise: TailleEntreprise;
        statutJuridique: BusinessPlanModel['legalStatus'] | 'SAS' | 'SARL';
        codeNAF: string | BusinessPlanProjectLocation['irisCode']; // ?
        codePostal: BusinessPlanProjectLocation['postCode'];
        lienBPCompteAdmin: string;
        lienSnapshotDernierBP: string;
        secteurActivite: BusinessPlanModel['industryType'] | 'Industrie';
    } & LiensDirigentVersPages;

    updateInscription: Partial<EventProperties['inscription']>;
    connexionApp: {
        dateDerniereConnexionOuUpdate: Date | string;
        nombreConnexions: number;
        lienPageConnexionBP: string;
    };

    motDePasseOublie: {
        urlMotDePasseOublie: string;
    };

    suppressionCompte: {
        supprime: true;
    };

    confirmationCompte: {
        confirme?: boolean;
        urlValidationCompte?: string;
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
        lienVersPageConnexion: string;
        lienVersPageBP: string;
    };
    telechargementBusinessPlanPreview: {
        statutLeadsTelechargementBP: StatutLeadsTelechargementBP;
    };
    cliqueSurBoutonDemandePourEnvoyerDossierCA: {
        demandeEnvoiProjetCA: string;
        statutLeadEnvoyeAuCA: StatutLeadsEnvoyeCA;
        raisonRejetStatutLead?: RaisonRejetStatutLead;
    } & LiensDirigentVersPages;

    upsellSonOffreEnPayant: {
        formuleChoisie: BusinessPlanOffer['offerType'] | FormuleChoisie;
    };
    clickedBoutonSuivantDansFunnelOnboarding: {
        boutonFunnelOnboarding:
            | 'domaine-activite'
            | 'secteur-activite'
            | 'lieu-implantation'
            | 'taille-entreprise'
            | 'offre';
    };
    clickedBoutonRenvoyerEmailConfirmation: {
        boutonEmailConfirmation: true; //?
    };

    statutCompteUpdatedEnValideDansBackendApp: {
        dateValidationCompte: Date | string;
        compteValide: boolean;
    };
    pourcentageCompletionBPUpdatedDansBackendApp: {
        tauxCompletionBP: number;
        BPGlobal: ElementStatus;
    } & LiensDirigentVersPages;

    scoringLeadUpdatedDansBackendApp: {
        scoringJSE: number;
    };
    champPageGardeUpdated: {
        nomProjet: string;
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

import { EventPropertiesHumanized } from './humanize/property-name-humanized.data';

export function getPropertyNameHumanized(
    propertypName: keyof typeof EventPropertiesHumanized | string
): string {
    const _propertyName =
        propertypName as keyof typeof EventPropertiesHumanized;

    return _propertyName in EventPropertiesHumanized
        ? EventPropertiesHumanized[_propertyName]
        : _propertyName;
}

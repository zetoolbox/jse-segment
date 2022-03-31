export const enum EventName {
    'inscription' = 'inscription',
    'connexionApp' = 'connexionApp',
    'motDePasseOublie' = 'motDePasseOublie',
    'suppressionCompte' = 'Account deleted',
    'confirmationCompte' = 'Account confirmed',
    'coachingPlanifie' = 'coachingPlanifie',
    'paiementEffectue' = 'paiementEffectue',
    'telechargementBusinessPlanDownload' = 'telechargementBusinessPlanDownload',
    'telechargementBusinessPlanPreview' = 'telechargementBusinessPlanPreview',
    'cliqueSurBoutonDemandePourEnvoyerDossierCA' = 'cliqueSurBoutonDemandePourEnvoyerDossierCA',
    'upsellSonOffreEnPayant' = 'upsellSonOffreEnPayant',
    'clickedBoutonSuivantDansFunnelOnboarding' = 'clickedBoutonSuivantDansFunnelOnboarding',
    'clickedBoutonRenvoyerEmailConfirmation' = 'clickedBoutonRenvoyerEmailConfirmation',
    'statutCompteUpdatedEnValideDansBackendApp' = 'statutCompteUpdatedEnValideDansBackendApp',
    'pourcentageCompletionBPUpdatedDansBackendApp' = 'pourcentageCompletionBPUpdatedDansBackendApp',
    'scoringLeadUpdatedDansBackendApp' = 'scoringLeadUpdatedDansBackendApp',
    'champPageGardeUpdated' = 'champPageGardeUpdated',
    'champPageProjetUpdated' = 'champPageProjetUpdated',
    'champPageSocieteUpdated' = 'champPageSocieteUpdated',
    'champPagePrevisionnelUpdated' = 'champPagePrevisionnelUpdated',
    'optInCommuniationOnboarding' = 'optInCommuniationOnboarding',
    'pagePrevisionnelComplete100pcent' = 'pagePrevisionnelComplete100pcent',
    'pageProjetComplete100pcent' = 'pageProjetComplete100pcent',
    'pageSocieteComplete100pcent' = 'pageSocieteComplete100pcent',
    'pageEtudeMarcheComplete100pcent' = 'pageEtudeMarcheComplete100pcent',
    'pageGardeComplete100pcent' = 'pageGardeComplete100pcent',
}

const EventNamesHumanized: Record<keyof typeof EventName, string> = {
    inscription: 'Account Created',
    connexionApp: 'Login',
    motDePasseOublie: 'Password forgotten',
    suppressionCompte: 'Account deleted',
    confirmationCompte: 'Account confirmed',
    coachingPlanifie: 'Coaching Statut Update',
    paiementEffectue: 'Payment Accepted',
    telechargementBusinessPlanDownload: 'Business Plan Preview',
    telechargementBusinessPlanPreview: 'Business Plan Downloaded',
    cliqueSurBoutonDemandePourEnvoyerDossierCA:
        'cliqueDemand CA SentSurBoutonDemandePourEnvoyerDossierCA',
    upsellSonOffreEnPayant: 'Upsell Paid BP',
    clickedBoutonSuivantDansFunnelOnboarding:
        'clickedBoutonSuivantDansFunnelOnboarding',
    clickedBoutonRenvoyerEmailConfirmation:
        'clickedBoutonRenvoyerEmailConfirmation',
    statutCompteUpdatedEnValideDansBackendApp: 'Account Confirmed',
    pourcentageCompletionBPUpdatedDansBackendApp:
        'BP - Pourcentage Completion Update',
    scoringLeadUpdatedDansBackendApp: 'Scoring Lead Update',
    champPageGardeUpdated: 'BP - Page de Garde Update',
    champPageProjetUpdated: 'BP - Projet Update',
    champPageSocieteUpdated: 'BP - Société Update',
    champPagePrevisionnelUpdated: 'BP - Prévisionnel Update',
    optInCommuniationOnboarding: 'Opt-in Marketing',
    pagePrevisionnelComplete100pcent: 'BP - Prévisionnel Completed',
    pageProjetComplete100pcent: 'BP - Projet Completed',
    pageSocieteComplete100pcent: 'BP - Société Completed',
    pageEtudeMarcheComplete100pcent: 'BP - Marché Completed',
    pageGardeComplete100pcent: 'BP - Page de Garde Completed',
};

export function getEventNameHumanized(
    eventName: keyof typeof EventName | string
): string {
    const _eventName = eventName as keyof typeof EventName;
    return EventNamesHumanized[_eventName];
}

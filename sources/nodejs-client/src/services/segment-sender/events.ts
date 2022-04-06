export const enum EventName {
    'inscription' = 'inscription',
    'updateInscription' = 'updateInscription',
    'connexionApp' = 'connexionApp',
    'motDePasseOublie' = 'motDePasseOublie',
    'suppressionCompte' = 'Account deleted',
    'confirmationCompte' = 'Account confirmed',
    'coachingPlanifie' = 'coachingPlanifie',
    'paiementEffectue' = 'paiementEffectue',
    'telechargementBusinessPlanDownload' = 'telechargementBusinessPlanDownload', // OUI
    'telechargementBusinessPlanPreview' = 'telechargementBusinessPlanPreview',
    'clickedBoutonDemandePourEnvoyerDossierCA' = 'clickedBoutonDemandePourEnvoyerDossierCA', // OUI
    'upsellSonOffreEnPayant' = 'upsellSonOffreEnPayant',
    'clickedBoutonSuivantDansFunnelOnboarding' = 'clickedBoutonSuivantDansFunnelOnboarding',
    'clickedBoutonRenvoyerEmailConfirmation' = 'clickedBoutonRenvoyerEmailConfirmation',
    'statutCompteUpdatedEnValideDansBackendApp' = 'statutCompteUpdatedEnValideDansBackendApp',
    'pourcentageCompletionBPUpdatedDansBackendApp' = 'pourcentageCompletionBPUpdatedDansBackendApp', /// OUI
    'scoringLeadUpdatedDansBackendApp' = 'scoringLeadUpdatedDansBackendApp',
    'champPageGardeUpdated' = 'champPageGardeUpdated',
    'champPageProjetUpdated' = 'champPageProjetUpdated',
    'champPageSocieteUpdated' = 'champPageSocieteUpdated',
    'champPagePrevisionnelUpdated' = 'champPagePrevisionnelUpdated',
    'optInCommunicationOnboarding' = 'optInCommunicationOnboarding',
    'pagePrevisionnelComplete100pcent' = 'pagePrevisionnelComplete100pcent',
    'pageProjetComplete100pcent' = 'pageProjetComplete100pcent',
    'pageSocieteComplete100pcent' = 'pageSocieteComplete100pcent',
    'pageEtudeMarcheComplete100pcent' = 'pageEtudeMarcheComplete100pcent',
    'pageGardeComplete100pcent' = 'pageGardeComplete100pcent',
}

import { EventNamesHumanized } from '../../humanize/event-name.humanized';

export function getEventNameHumanized(
    eventName: keyof typeof EventName | string
): string {
    const _eventName = eventName as keyof typeof EventName;
    return _eventName in EventNamesHumanized
        ? EventNamesHumanized[_eventName]
        : _eventName;
}

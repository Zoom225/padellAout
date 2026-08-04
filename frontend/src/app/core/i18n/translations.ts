export type Locale = 'fr' | 'en';

export type TranslationKey =
  | 'nav.home'
  | 'nav.admin'
  | 'nav.member'
  | 'nav.profile'
  | 'nav.matches'
  | 'nav.reservations'
  | 'nav.payments'
  | 'nav.create'
  | 'nav.public'
  | 'nav.private'
  | 'nav.logout'
  | 'nav.memberArea'
  | 'nav.adminLogin'
  | 'nav.dashboard'
  | 'nav.members'
  | 'nav.sites'
  | 'nav.courts'
  | 'nav.closures'
  | 'common.back'
  | 'common.save'
  | 'common.create'
  | 'common.edit'
  | 'common.delete'
  | 'common.reset'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.loading'
  | 'common.none'
  | 'common.matchPlanned'
  | 'common.matchFull'
  | 'common.matchCanceled'
  | 'common.reservationPending'
  | 'common.reservationConfirmed'
  | 'common.reservationCanceled'
  | 'common.paymentPending'
  | 'common.paymentPaid'
  | 'common.paymentRefunded'
  | 'common.paymentCanceled'
  | 'common.allSites'
  | 'common.profile'
  | 'common.refresh'
  | 'switcher.label'
  | 'switcher.fr'
  | 'switcher.en'
  | 'landing.eyebrow'
  | 'landing.title'
  | 'landing.lead'
  | 'landing.memberCta'
  | 'landing.memberCtaConnected'
  | 'landing.adminCta'
  | 'landing.testApi'
  | 'landing.loadingApi'
  | 'landing.apiSuccess'
  | 'landing.apiError'
  | 'landing.feature1.title'
  | 'landing.feature1.body'
  | 'landing.feature2.title'
  | 'landing.feature2.body'
  | 'landing.feature3.title'
  | 'landing.feature3.body'
  | 'landing.feature4.title'
  | 'landing.feature4.body'
  | 'landing.matchPublic'
  | 'landing.matchAvailable'
  | 'landing.reservation'
  | 'landing.reservationBody'
  | 'landing.simpleReservation'
  | 'landing.matchPreviewLabel'
  | 'admin.login.heroTitle'
  | 'admin.login.heroSubtitle'
  | 'admin.login.formTitle'
  | 'admin.login.formSubtitle'
  | 'admin.login.email'
  | 'admin.login.password'
  | 'admin.login.submit'
  | 'admin.login.back'
  | 'admin.login.error'
  | 'admin.home.eyebrow'
  | 'admin.home.title'
  | 'admin.home.subtitle'
  | 'admin.home.loading'
  | 'admin.home.matches'
  | 'admin.home.reservations'
  | 'admin.home.members'
  | 'admin.home.revenue'
  | 'admin.home.occupancy'
  | 'admin.home.occupancySub'
  | 'admin.home.resources'
  | 'admin.home.resourcesSub'
  | 'admin.home.empty'
  | 'admin.home.waiting'
  | 'admin.home.visible'
  | 'admin.home.validPayments'
  | 'admin.home.reservationsLoadError'
  | 'admin.home.dashboardLoadError'
  | 'admin.matches.title'
  | 'admin.matches.subtitle'
  | 'admin.members.title'
  | 'admin.members.subtitle'
  | 'admin.members.matricule'
  | 'admin.members.matriculeHint'
  | 'admin.members.type'
  | 'admin.members.typeGlobal'
  | 'admin.members.typeSite'
  | 'admin.members.typeLibre'
  | 'admin.members.nom'
  | 'admin.members.prenom'
  | 'admin.members.email'
  | 'admin.members.site'
  | 'admin.members.siteNone'
  | 'admin.members.searchPlaceholder'
  | 'admin.members.filterAll'
  | 'admin.members.filterGlobal'
  | 'admin.members.filterSite'
  | 'admin.members.filterLibre'
  | 'admin.members.empty'
  | 'admin.members.emptySub'
  | 'admin.members.penalty'
  | 'admin.members.emailMissing'
  | 'admin.members.siteAll'
  | 'admin.members.balance'
  | 'admin.members.edit'
  | 'admin.members.delete'
  | 'admin.members.count'
  | 'admin.sites.title'
  | 'admin.sites.subtitle'
  | 'admin.terrains.title'
  | 'admin.terrains.subtitle'
  | 'admin.closures.title'
  | 'admin.closures.subtitle'
  | 'member.home.title'
  | 'member.home.subtitle'
  | 'member.home.identification'
  | 'member.home.loginHint'
  | 'member.home.password'
  | 'member.home.cta'
  | 'member.home.invalid'
  | 'member.home.global'
  | 'member.home.site'
  | 'member.home.livre'
  | 'member.home.tousSites'
  | 'member.create.title'
  | 'member.create.subtitle'
  | 'member.create.rappel'
  | 'member.create.public'
  | 'member.create.private'
  | 'member.create.back'
  | 'member.create.submit'
  | 'member.create.mode'
  | 'member.create.site'
  | 'member.create.terrain'
  | 'member.create.date'
  | 'member.create.dateHint'
  | 'member.create.time'
  | 'member.create.matchType'
  | 'member.create.privatePlayers'
  | 'member.create.player2'
  | 'member.create.player3'
  | 'member.create.player4'
  | 'member.create.noSite'
  | 'member.create.noTerrain'
  | 'member.create.selectedSite'
  | 'member.create.bookingLimit'
  | 'member.create.bookingLimitProfileError'
  | 'member.create.ruleGlobal'
  | 'member.create.ruleSite'
  | 'member.create.ruleLibre'
  | 'member.create.noSiteLoaded'
  | 'member.create.noTerrainLoaded'
  | 'member.create.success'
  | 'member.create.successPrivate'
  | 'member.create.partialSuccess'
  | 'member.public.title'
  | 'member.public.subtitle'
  | 'member.public.filter'
  | 'member.public.search'
  | 'member.public.create'
  | 'member.public.join'
  | 'member.public.modify'
  | 'member.public.delete'
  | 'member.public.myProfile'
  | 'member.public.myMatch'
  | 'member.public.available'
  | 'member.public.completion'
  | 'member.public.none'
  | 'member.public.organizer'
  | 'member.public.status'
  | 'member.public.type'
  | 'member.public.players'
  | 'member.public.price'
  | 'member.public.registering'
  | 'member.public.editTitle'
  | 'member.public.editHint'
  | 'member.public.noMatches'
  | 'member.public.searchPlaceholder'
  | 'member.public.noMatchPrompt'
  | 'member.public.createBody'
  | 'member.public.date'
  | 'member.public.time'
  | 'member.public.typeLabel'
  | 'member.reservations.title'
  | 'member.reservations.subtitle'
  | 'member.reservations.createPublic'
  | 'member.reservations.createPrivate'
  | 'member.reservations.matches'
  | 'member.reservations.select'
  | 'member.reservations.addPlayer'
  | 'member.reservations.noOrganized'
  | 'member.reservations.edit'
  | 'member.reservations.confirmation'
  | 'member.reservations.players'
  | 'member.reservations.empty'
  | 'member.reservations.player'
  | 'member.reservations.match'
  | 'member.reservations.reservation'
  | 'member.reservations.payment'
  | 'member.reservations.amount'
  | 'member.reservations.pay'
  | 'member.reservations.cancel'
  | 'member.reservations.organizedTitle'
  | 'member.reservations.organizedSub'
  | 'member.reservations.chooseMatch'
  | 'member.reservations.inviteMatricule'
  | 'member.reservations.noPlayer'
  | 'member.reservations.reservationLabel'
  | 'member.reservations.paymentLabel'
  | 'member.reservations.removePlayer'
  | 'member.reservations.emptyBody'
  | 'member.payments.title'
  | 'member.payments.subtitle'
  | 'member.payments.reservations'
  | 'member.payments.total'
  | 'member.payments.paid'
  | 'member.payments.pending'
  | 'member.payments.refunded'
  | 'member.payments.none'
  | 'member.payments.notSet'
  | 'member.profile.title'
  | 'member.profile.subtitle'
  | 'member.profile.createQuick'
  | 'member.profile.publicMatch'
  | 'member.profile.privateMatch'
  | 'member.profile.quickPublic'
  | 'member.profile.quickPrivate'
  | 'member.profile.quickPublicBody'
  | 'member.profile.quickPrivateBody'
  | 'member.profile.explore'
  | 'member.profile.followup'
  | 'member.profile.finance'
  | 'member.profile.refresh'
  | 'member.profile.logout'
  | 'member.profile.nom'
  | 'member.profile.prenom'
  | 'member.profile.email'
  | 'member.profile.matricule'
  | 'member.profile.type'
  | 'member.profile.site'
  | 'member.profile.solde'
  | 'member.profile.penaltyActive'
  | 'member.profile.balancePending'
  | 'member.profile.yes'
  | 'member.profile.no'
  | 'member.profile.exploreBody'
  | 'member.profile.followupBody'
  | 'member.profile.financeBody'
  | 'member.payments.payment'
  | 'member.payments.loading'
  | 'member.payments.error'
  | 'member.payments.noMember'
  | 'member.payments.idLabel'
  | 'member.payments.noPayments'
  | 'member.payments.loadingState'
  | 'member.payments.errorState'
  | 'member.payments.noMemberState'
  | 'admin.matches.organizer'
  | 'admin.matches.status'
  | 'admin.matches.players'
  | 'admin.matches.reservations'
  | 'admin.matches.noReservations'
  | 'admin.matches.hideDetails'
  | 'admin.matches.showDetails'
  | 'admin.matches.convert'
  | 'admin.matches.convertSuccess'
  | 'admin.matches.loadError'
  | 'admin.matches.reservationsError'
  | 'admin.matches.convertError'
  | 'admin.matches.empty'
  | 'admin.closures.date'
  | 'admin.closures.reason'
  | 'admin.closures.site'
  | 'admin.closures.noneGlobal'
  | 'admin.closures.global'
  | 'admin.closures.add'
  | 'admin.closures.reset'
  | 'admin.closures.reasonEmpty'
  | 'admin.closures.empty'
  | 'common.notProvided'
  | 'admin.home.allStatuses'
  | 'admin.home.matchCount'
  | 'admin.home.sitesVisible'
  | 'admin.home.terrainsVisible'
  | 'admin.home.completeMatches'
  | 'admin.home.pendingReservations'
  | 'admin.login.globalBadge'
  | 'admin.login.siteBadge'
  | 'admin.login.showPassword'
  | 'admin.login.hidePassword'
  | 'admin.members.searchNoResult'
  | 'admin.members.loadError'
  | 'admin.members.saveError'
  | 'admin.members.deleteError'
  | 'admin.members.updateSuccess'
  | 'admin.members.createSuccess'
  | 'admin.members.deleteSuccess'
  | 'admin.members.deleteConfirm'
  | 'admin.sites.name'
  | 'admin.sites.address'
  | 'admin.sites.opening'
  | 'admin.sites.closing'
  | 'admin.sites.matchDuration'
  | 'admin.sites.breakDuration'
  | 'admin.sites.civilYear'
  | 'admin.sites.hours'
  | 'admin.sites.duration'
  | 'admin.sites.break'
  | 'admin.sites.year'
  | 'admin.sites.empty'
  | 'admin.sites.siteAdminEditBlocked'
  | 'admin.sites.siteAdminDeleteBlocked'
  | 'admin.sites.loadError'
  | 'admin.sites.saveError'
  | 'admin.sites.deleteError'
  | 'admin.sites.deleteConfirm'
  | 'admin.sites.updateSuccess'
  | 'admin.sites.createSuccess'
  | 'admin.sites.deleteSuccess'
  | 'admin.terrains.name'
  | 'admin.terrains.site'
  | 'admin.terrains.empty'
  | 'admin.terrains.loadError'
  | 'admin.terrains.saveError'
  | 'admin.terrains.deleteError'
  | 'admin.terrains.deleteConfirm'
  | 'admin.terrains.updateSuccess'
  | 'admin.terrains.createSuccess'
  | 'admin.terrains.deleteSuccess'
  | 'admin.closures.loadError'
  | 'admin.closures.addSuccess'
  | 'admin.closures.addError'
  | 'admin.closures.deleteSuccess'
  | 'admin.closures.deleteError'
  | 'member.home.matricule'
  | 'member.home.matriculePlaceholder'
  | 'member.home.showPassword'
  | 'member.home.hidePassword'
  | 'member.home.globalHint'
  | 'member.home.siteHint'
  | 'member.home.livreHint'
  | 'member.home.allSites'
  | 'member.profile.loadError'
  | 'member.create.bookingLimitError'
  | 'member.create.invalidType'
  | 'member.create.createError'
  | 'member.create.outstandingBalance'
  | 'member.create.activePenalty'
  | 'member.create.slotTaken'
  | 'member.create.siteClosed'
  | 'member.create.outOfHours'
  | 'member.create.siteOnly'
  | 'member.create.internalError'
  | 'member.create.addPlayersError'
  | 'member.public.loadError'
  | 'member.public.noMember'
  | 'member.public.joinBlocked'
  | 'member.public.joinSuccess'
  | 'member.public.joinError'
  | 'member.public.modifyTooLate'
  | 'member.public.updateSuccess'
  | 'member.public.updateError'
  | 'member.public.deleteConfirm'
  | 'member.public.deleteSuccess'
  | 'member.public.deleteError'
  | 'member.reservations.reservationTitle'
  | 'member.reservations.noMember'
  | 'member.reservations.loadError'
  | 'member.reservations.privateOnly'
  | 'member.reservations.playersLoadError'
  | 'member.reservations.updateSuccess'
  | 'member.reservations.updateError'
  | 'member.reservations.deleteSuccess'
  | 'member.reservations.deleteError'
  | 'member.reservations.playerAdded'
  | 'member.reservations.playerAddError'
  | 'member.reservations.playerRemoved'
  | 'member.reservations.playerRemoveError'
  | 'member.reservations.paymentSuccess'
  | 'member.reservations.paymentError'
  | 'member.reservations.reservationCanceled'
  | 'member.reservations.reservationCancelError';

export type TranslationParams = Record<string, string | number>;

export const TRANSLATIONS: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.admin': 'Admin',
    'nav.member': 'Espace membre',
    'nav.profile': 'Profil',
    'nav.matches': 'Matchs',
    'nav.reservations': 'Reservations',
    'nav.payments': 'Paiements',
    'nav.create': 'Creer',
    'nav.public': 'Public',
    'nav.private': 'Prive',
    'nav.logout': 'Deconnexion',
    'nav.memberArea': 'Espace membre',
    'nav.adminLogin': 'Connexion admin',
    'nav.dashboard': 'Dashboard',
    'nav.members': 'Membres',
    'nav.sites': 'Sites',
    'nav.courts': 'Terrains',
    'nav.closures': 'Fermetures',
    'common.back': 'Retour',
    'common.save': 'Enregistrer',
    'common.create': 'Creer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.reset': 'Reinitialiser',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.loading': 'Chargement...',
    'common.none': 'Aucun',
    'common.matchPlanned': 'Planifie',
    'common.matchFull': 'Complet',
    'common.matchCanceled': 'Annule',
    'common.reservationPending': 'En attente',
    'common.reservationConfirmed': 'Confirmee',
    'common.reservationCanceled': 'Annulee',
    'common.paymentPending': 'En attente',
    'common.paymentPaid': 'Paye',
    'common.paymentRefunded': 'Rembourse',
    'common.paymentCanceled': 'Annule',
    'common.allSites': 'Tous les sites',
    'common.profile': 'Profil',
    'common.refresh': 'Rafraichir',
    'switcher.label': 'Choix de langue',
    'switcher.fr': 'Francais',
    'switcher.en': 'English',
    'landing.eyebrow': 'Gestion de club de padel',
    'landing.title': 'PadelPlay',
    'landing.lead':
      'Une interface claire pour reserver, rejoindre un match, suivre les paiements et piloter les sites depuis un tableau de bord admin.',
    'landing.memberCta': 'Entrer avec un matricule',
    'landing.memberCtaConnected': 'Ouvrir mon espace',
    'landing.adminCta': 'Connexion admin',
    'landing.testApi': "Tester l'API",
    'landing.loadingApi': 'Verification de /api/matches/public...',
    'landing.apiSuccess': 'Proxy OK - {count} match(s) public(s) recupere(s)',
    'landing.apiError': "Echec de l'appel API. Verifiez que le backend tourne sur le port 8080.",
    'landing.feature1.title': 'Reservations',
    'landing.feature1.body': 'Choix du terrain, controle des disponibilites et suivi du statut.',
    'landing.feature2.title': 'Matchs publics et prives',
    'landing.feature2.body': 'Creation rapide avec des regles claires pour les participants.',
    'landing.feature3.title': 'Paiements',
    'landing.feature3.body': 'Vue propre des paiements, penalites et confirmations.',
    'landing.feature4.title': 'Administration',
    'landing.feature4.body': 'Indicateurs, membres, sites, terrains et fermetures au meme endroit.',
    'landing.matchPublic': 'Match public',
    'landing.matchAvailable': 'match(s) disponible(s)',
    'landing.reservation': 'Reservation',
    'landing.reservationBody': 'membre, terrain, paiement',
    'landing.simpleReservation': 'Simple',
    'landing.matchPreviewLabel': 'Apercu des matchs',
    'admin.login.heroTitle': 'PadelPlay Admin',
    'admin.login.heroSubtitle': 'Espace reserve aux administrateurs de sites et superviseurs globaux',
    'admin.login.formTitle': 'Connexion',
    'admin.login.formSubtitle': 'Acces reserve aux administrateurs',
    'admin.login.email': 'Email',
    'admin.login.password': 'Mot de passe',
    'admin.login.submit': 'Se connecter',
    'admin.login.back': 'Retour',
    'admin.login.error': "Echec de connexion. Verifiez l'e-mail et le mot de passe.",
    'admin.home.eyebrow': 'Tableau de bord',
    'admin.home.title': 'Administration PadelPlay',
    'admin.home.subtitle': 'Vue {scope} des matchs, reservations, membres et ressources du club.',
    'admin.home.loading': 'Chargement du tableau de bord...',
    'admin.home.matches': 'Matchs',
    'admin.home.reservations': 'Reservations',
    'admin.home.members': 'Membres',
    'admin.home.revenue': "Chiffre d'affaires",
    'admin.home.occupancy': 'Occupation par site',
    'admin.home.occupancySub': 'Nombre de matchs rattaches a chaque site visible',
    'admin.home.resources': 'Ressources',
    'admin.home.resourcesSub': "Controle rapide des elements geres par l'administration",
    'admin.home.empty': 'Aucune donnee.',
    'admin.home.waiting': 'en attente',
    'admin.home.visible': 'visibles',
    'admin.home.validPayments': 'paiements valides',
    'admin.home.reservationsLoadError': 'Impossible de charger les reservations administrateur.',
    'admin.home.dashboardLoadError': 'Impossible de charger le tableau de bord administrateur.',
    'admin.matches.title': 'Gestion des matchs',
    'admin.matches.subtitle': 'Consultation, details et conversion en public',
    'admin.members.title': 'Gestion des membres',
    'admin.members.subtitle': 'Creation, modification et suppression des membres du club',
    'admin.members.matricule': 'Matricule',
    'admin.members.matriculeHint': 'GLOBAL: G+4ch · SITE: S+5ch · LIBRE: L+5ch',
    'admin.members.type': 'Type de membre',
    'admin.members.typeGlobal': 'Global - Tous les sites',
    'admin.members.typeSite': 'Site - Site dédié',
    'admin.members.typeLibre': 'Libre - Accès libre',
    'admin.members.nom': 'Nom',
    'admin.members.prenom': 'Prenom',
    'admin.members.email': 'Email',
    'admin.members.site': 'Site',
    'admin.members.siteNone': 'Aucun site (GLOBAL / LIBRE)',
    'admin.members.searchPlaceholder': 'Rechercher par matricule, nom ou prenom...',
    'admin.members.filterAll': 'Tous',
    'admin.members.filterGlobal': 'Global',
    'admin.members.filterSite': 'Site',
    'admin.members.filterLibre': 'Libre',
    'admin.members.empty': 'Aucun membre trouve',
    'admin.members.emptySub': 'Creer votre premier membre avec le formulaire ci-dessus.',
    'admin.members.penalty': 'Pénalité active',
    'admin.members.emailMissing': 'Non renseigne',
    'admin.members.siteAll': 'Tous les sites',
    'admin.members.balance': 'Solde',
    'admin.members.edit': 'Modifier',
    'admin.members.delete': 'Supprimer',
    'admin.members.count': 'membre(s)',
    'admin.sites.title': 'Gestion des sites',
    'admin.sites.subtitle': 'Creation, edition et suppression des sites',
    'admin.terrains.title': 'Gestion des terrains',
    'admin.terrains.subtitle': 'Creation et gestion des terrains par site',
    'admin.closures.title': 'Jours de fermeture',
    'admin.closures.subtitle': 'Gestion des fermetures globales et par site',
    'member.home.title': 'Espace Membre Padel',
    'member.home.subtitle': 'Entrez votre matricule pour acceder a votre espace de jeu',
    'member.home.identification': 'Identification',
    'member.home.loginHint': 'Saisissez votre matricule et mot de passe pour rejoindre le court',
    'member.home.password': 'Mot de passe',
    'member.home.cta': 'Acceder a mon espace',
    'member.home.invalid': 'Identifiants invalides. Verifiez le matricule et le mot de passe.',
    'member.home.global': 'Global',
    'member.home.site': 'Site dédié',
    'member.home.livre': 'Libre',
    'member.home.tousSites': 'Tous les sites',
    'member.create.title': 'Creer un match',
    'member.create.subtitle': 'Public ou prive, selon les regles du backend.',
    'member.create.rappel': 'Rappel',
    'member.create.public': 'PUBLIC',
    'member.create.private': 'PRIVE',
    'member.create.back': 'Retour profil',
    'member.create.submit': 'Creer le match',
    'member.create.mode': 'Mode creation',
    'member.create.site': 'Site',
    'member.create.terrain': 'Terrain',
    'member.create.date': 'Date',
    'member.create.dateHint': 'Entre',
    'member.create.time': 'Heure debut',
    'member.create.matchType': 'Type de match',
    'member.create.privatePlayers': 'Joueurs a inviter maintenant (optionnel)',
    'member.create.player2': 'Matricule joueur 2',
    'member.create.player3': 'Matricule joueur 3',
    'member.create.player4': 'Matricule joueur 4',
    'member.create.noSite': 'Aucun site disponible pour creer un match.',
    'member.create.noTerrain': 'Aucun terrain disponible pour le site selectionne.',
    'member.create.selectedSite': 'Site selectionne',
    'member.create.bookingLimit': 'Derniere date autorisee selon votre profil :',
    'member.create.ruleGlobal': 'GLOBAL : jusqu\'a 3 semaines a l\'avance',
    'member.create.ruleSite': 'SITE : jusqu\'a 2 semaines a l\'avance sur son site',
    'member.create.ruleLibre': 'LIBRE : jusqu\'a 5 jours a l\'avance',
    'member.create.noSiteLoaded': 'Aucun site charge.',
    'member.create.noTerrainLoaded': 'Aucun terrain charge.',
    'member.create.success': 'Match cree. Votre place sera confirmee apres paiement depuis vos reservations.',
    'member.create.successPrivate': 'Match privé créé. Les invitations sont en attente de paiement des joueurs.',
    'member.create.partialSuccess': "Match cree, mais certains joueurs n'ont pas pu etre ajoutes.",
    'member.public.title': 'Matchs publics',
    'member.public.subtitle': 'Rejoins un match public disponible. Premier paye = premier servi.',
    'member.public.filter': 'Filtrer par site',
    'member.public.search': 'Recherche',
    'member.public.create': 'Creer un match',
    'member.public.join': 'Rejoindre',
    'member.public.modify': 'Modifier',
    'member.public.delete': 'Supprimer',
    'member.public.myProfile': 'Mon profil',
    'member.public.myMatch': 'Mon match',
    'member.public.available': 'Disponible',
    'member.public.completion': 'Complet',
    'member.public.none': 'Non rejoignable',
    'member.public.organizer': 'Organisateur',
    'member.public.status': 'Statut',
    'member.public.type': 'Type',
    'member.public.players': 'Joueurs',
    'member.public.price': 'Prix par joueur',
    'member.public.registering': 'Reservation...',
    'member.public.editTitle': 'Modifier le match',
    'member.public.editHint': 'Modification indisponible : un match ne peut plus etre modifie a moins de 24 h du debut.',
    'member.public.noMatches': 'Aucun match public ne correspond aux filtres.',
    'member.public.searchPlaceholder': 'Terrain, site, organisateur',
    'member.public.noMatchPrompt': 'Tu ne trouves pas de match ?',
    'member.public.createBody': 'En public ou en prive, avec choix du site et du terrain.',
    'member.public.date': 'Date',
    'member.public.time': 'Heure debut',
    'member.public.typeLabel': 'Type',
    'member.reservations.title': 'Mes reservations',
    'member.reservations.subtitle': 'Paiement et annulation de vos inscriptions.',
    'member.reservations.createPublic': 'Creer un match PUBLIC',
    'member.reservations.createPrivate': 'Creer un match PRIVE',
    'member.reservations.matches': 'Matchs publics',
    'member.reservations.select': 'Selectionner un match organise',
    'member.reservations.addPlayer': 'Ajouter joueur',
    'member.reservations.noOrganized': 'Aucun match organise pour l\'instant. Creez un match PUBLIC ou PRIVE via les boutons ci-dessus.',
    'member.reservations.edit': 'Modifier le match',
    'member.reservations.confirmation': 'Confirmation requise',
    'member.reservations.players': 'Joueurs inscrits :',
    'member.reservations.empty': 'Aucune reservation trouvee.',
    'member.reservations.player': 'Joueur',
    'member.reservations.match': 'Match',
    'member.reservations.reservation': 'Reservation',
    'member.reservations.payment': 'Paiement',
    'member.reservations.amount': 'Montant',
    'member.reservations.pay': 'Payer',
    'member.reservations.cancel': 'Annuler',
    'member.reservations.organizedTitle': 'Mes matchs organises',
    'member.reservations.organizedSub': 'Modifier, supprimer ou gerer les joueurs de vos matchs.',
    'member.reservations.chooseMatch': '-- Choisir un match --',
    'member.reservations.inviteMatricule': 'Matricule joueur a ajouter',
    'member.reservations.noPlayer': 'Aucun joueur inscrit sur ce match.',
    'member.reservations.reservationLabel': 'Reservation',
    'member.reservations.paymentLabel': 'Paiement',
    'member.reservations.removePlayer': 'Retirer',
    'member.reservations.emptyBody': 'Creez un match ou rejoignez un match public pour voir vos reservations ici.',
    'member.payments.title': 'Mes paiements',
    'member.payments.subtitle': 'Historique des paiements et remboursements',
    'member.payments.reservations': 'Mes reservations',
    'member.payments.total': 'Total paiements',
    'member.payments.paid': 'Total paye',
    'member.payments.pending': 'En attente',
    'member.payments.refunded': 'Rembourses',
    'member.payments.none': 'Aucun paiement trouve',
    'member.payments.notSet': 'Pas encore regle',
    'member.payments.idLabel': 'Paiement',
    'member.payments.noPayments': 'Aucun paiement trouve',
    'member.payments.loadingState': 'Chargement des paiements...',
    'member.payments.errorState': 'Impossible de charger les paiements.',
    'member.payments.noMemberState': 'Aucun membre connecte.',
    'member.profile.title': 'Mon profil membre',
    'member.profile.subtitle': 'Informations rechargees depuis le backend',
    'member.profile.createQuick': 'Creer un match rapidement',
    'member.profile.publicMatch': 'Match ouvert',
    'member.profile.privateMatch': 'Match sur invitation',
    'member.profile.quickPublic': 'Creer un match PUBLIC',
    'member.profile.quickPrivate': 'Creer un match PRIVE',
    'member.profile.quickPublicBody': "N'importe quel membre peut rejoindre · 15 EUR/joueur · 4 joueurs requis",
    'member.profile.quickPrivateBody': 'Tu invites 3 joueurs par matricule · Converti en public si incomplet la veille',
    'member.profile.explore': 'Explorer',
    'member.profile.followup': 'Suivi',
    'member.profile.finance': 'Finances',
    'member.profile.refresh': 'Rafraichir',
    'member.profile.logout': 'Deconnexion membre',
    'member.profile.nom': 'Nom',
    'member.profile.prenom': 'Prenom',
    'member.profile.email': 'Email',
    'member.profile.matricule': 'Matricule',
    'member.profile.type': 'Type',
    'member.profile.site': 'Site',
    'member.profile.solde': 'Solde',
    'member.profile.penaltyActive': 'Penalite active',
    'member.profile.balancePending': 'Solde en attente',
    'member.profile.yes': 'Oui',
    'member.profile.no': 'Non',
    'member.profile.exploreBody': 'Rejoins rapidement une partie disponible.',
    'member.profile.followupBody': 'Paie, annule ou suis tes inscriptions.',
    'member.profile.financeBody': 'Historique de tes paiements.',
    'member.payments.payment': 'Paiement',
    'member.payments.loading': 'Chargement des paiements...',
    'member.payments.error': 'Impossible de charger les paiements.',
    'member.payments.noMember': 'Aucun membre connecte.',
    'admin.matches.organizer': 'Organisateur',
    'admin.matches.status': 'Statut',
    'admin.matches.players': 'Joueurs',
    'admin.matches.reservations': 'Reservations du match',
    'admin.matches.noReservations': 'Aucune reservation.',
    'admin.matches.hideDetails': 'Masquer',
    'admin.matches.showDetails': 'Voir details',
    'admin.matches.convert': 'Convertir en public',
    'admin.matches.convertSuccess': 'Match converti en public.',
    'admin.matches.loadError': 'Impossible de charger les matchs admin.',
    'admin.matches.reservationsError': 'Impossible de charger les reservations du match.',
    'admin.matches.convertError': 'Conversion impossible.',
    'admin.matches.empty': 'Aucun match disponible',
    'admin.closures.date': 'Date',
    'admin.closures.reason': 'Raison (optionnel)',
    'admin.closures.site': 'Site concerne',
    'admin.closures.noneGlobal': 'Aucun (global)',
    'admin.closures.global': 'Fermeture globale (tous les sites)',
    'admin.closures.add': 'Ajouter la fermeture',
    'admin.closures.reset': 'Reinitialiser',
    'admin.closures.reasonEmpty': 'Raison non precisee',
    'admin.closures.empty': 'Aucun jour de fermeture configure',
    'common.notProvided': 'Non renseigne',
    'admin.home.allStatuses': 'tous statuts',
    'admin.home.matchCount': 'match(s)',
    'admin.home.sitesVisible': 'Sites visibles',
    'admin.home.terrainsVisible': 'Terrains visibles',
    'admin.home.completeMatches': 'Matchs complets',
    'admin.home.pendingReservations': 'Reservations en attente',
    'admin.login.globalBadge': '🌐 Admin global',
    'admin.login.siteBadge': '🏟️ Admin site',
    'admin.login.showPassword': 'Afficher le mot de passe admin',
    'admin.login.hidePassword': 'Masquer le mot de passe admin',
    'admin.members.searchNoResult': 'Aucun resultat pour "{query}"',
    'admin.members.loadError': 'Impossible de charger les membres.',
    'admin.members.saveError': 'Sauvegarde du membre impossible.',
    'admin.members.deleteError': 'Suppression impossible.',
    'admin.members.updateSuccess': 'Membre mis à jour.',
    'admin.members.createSuccess': 'Membre cree avec succes.',
    'admin.members.deleteSuccess': 'Membre supprimé.',
    'admin.members.deleteConfirm': 'Confirmer la suppression de ce membre ?',
    'admin.sites.name': 'Nom',
    'admin.sites.address': 'Adresse',
    'admin.sites.opening': 'Ouverture',
    'admin.sites.closing': 'Fermeture',
    'admin.sites.matchDuration': 'Duree match (min)',
    'admin.sites.breakDuration': 'Pause entre matchs (min)',
    'admin.sites.civilYear': 'Annee civile',
    'admin.sites.hours': 'Horaires',
    'admin.sites.duration': 'Duree match',
    'admin.sites.break': 'Pause',
    'admin.sites.year': 'Annee',
    'admin.sites.empty': 'Aucun site configure',
    'admin.sites.siteAdminEditBlocked': 'Un admin SITE ne peut pas modifier les sites.',
    'admin.sites.siteAdminDeleteBlocked': 'Un admin SITE ne peut pas supprimer de site.',
    'admin.sites.loadError': 'Impossible de charger les sites.',
    'admin.sites.saveError': 'Sauvegarde du site impossible.',
    'admin.sites.deleteError': 'Suppression du site impossible.',
    'admin.sites.deleteConfirm': 'Confirmer la suppression de ce site ?',
    'admin.sites.updateSuccess': 'Site mis a jour.',
    'admin.sites.createSuccess': 'Site cree.',
    'admin.sites.deleteSuccess': 'Site supprime.',
    'admin.terrains.name': 'Nom du terrain',
    'admin.terrains.site': 'Site',
    'admin.terrains.empty': 'Aucun terrain configure',
    'admin.terrains.loadError': 'Impossible de charger les terrains.',
    'admin.terrains.saveError': 'Sauvegarde du terrain impossible.',
    'admin.terrains.deleteError': 'Suppression du terrain impossible.',
    'admin.terrains.deleteConfirm': 'Confirmer la suppression de ce terrain ?',
    'admin.terrains.updateSuccess': 'Terrain mis a jour.',
    'admin.terrains.createSuccess': 'Terrain cree.',
    'admin.terrains.deleteSuccess': 'Terrain supprime.',
    'admin.closures.loadError': 'Impossible de charger les jours de fermeture.',
    'admin.closures.addSuccess': 'Jour de fermeture ajoute.',
    'admin.closures.addError': 'Ajout impossible.',
    'admin.closures.deleteSuccess': 'Jour de fermeture supprime.',
    'admin.closures.deleteError': 'Suppression impossible.',
    'member.home.matricule': 'Matricule',
    'member.home.matriculePlaceholder': 'Ex: G1234, S12345, L12345',
    'member.home.showPassword': 'Afficher le mot de passe membre',
    'member.home.hidePassword': 'Masquer le mot de passe membre',
    'member.home.globalHint': 'G + 4 chiffres · Tous les sites',
    'member.home.siteHint': 'S + 5 chiffres · Site dédié',
    'member.home.livreHint': 'L + 5 chiffres · Accès libre',
    'member.home.allSites': 'Tous les sites',
    'member.profile.loadError': 'Impossible de charger le profil membre.',
    'member.create.bookingLimitError': 'Dernière date autorisée : {date}.',
    'member.create.bookingLimitProfileError': 'Le profil {type} ne peut pas réserver plus de {days} jours à l\'avance. Date limite : {date}.',
    'member.create.invalidType': 'Type de match invalide.',
    'member.create.createError': 'Creation du match impossible.',
    'member.create.outstandingBalance': 'Vous avez un solde impaye. Reglez vos dettes avant de creer un match.',
    'member.create.activePenalty': 'Vous avez une penalite active. Attendez avant de creer un match.',
    'member.create.slotTaken': 'Ce creneau est deja reserve. Choisissez un autre horaire.',
    'member.create.siteClosed': 'Le site est ferme a cette date.',
    'member.create.outOfHours': "Cet horaire est en dehors des heures d'ouverture du site.",
    'member.create.siteOnly': 'Un membre SITE ne peut creer un match que sur son propre site.',
    'member.create.internalError': 'Une erreur interne du serveur est survenue lors de la creation du match.',
    'member.create.addPlayersError': "Impossible d'ajouter tous les joueurs.",
    'member.public.loadError': 'Impossible de charger les matchs publics.',
    'member.public.noMember': 'Aucun membre connecte.',
    'member.public.joinBlocked': 'Ce match ne peut pas etre rejoint (complet, annule ou non autorise).',
    'member.public.joinSuccess': "Demande créée. Votre place ne sera confirmée qu'après paiement.",
    'member.public.joinError': 'Impossible de reserver ce match.',
    'member.public.modifyTooLate': 'Modification impossible a moins de 24 h du debut du match.',
    'member.public.updateSuccess': 'Match modifie avec succes.',
    'member.public.updateError': 'Modification du match impossible.',
    'member.public.deleteConfirm': 'Confirmer la suppression (annulation) du match #{id} ?',
    'member.public.deleteSuccess': 'Match annule avec succes.',
    'member.public.deleteError': 'Suppression du match impossible.',
    'member.reservations.reservationTitle': 'Reservation',
    'member.reservations.noMember': 'Aucun membre connecte.',
    'member.reservations.loadError': 'Impossible de charger les reservations.',
    'member.reservations.privateOnly': 'La gestion des joueurs est réservée aux matchs PRIVÉS.',
    'member.reservations.playersLoadError': 'Impossible de charger les joueurs du match.',
    'member.reservations.updateSuccess': 'Match mis à jour avec succès.',
    'member.reservations.updateError': 'Modification du match impossible.',
    'member.reservations.deleteSuccess': 'Match annule avec succes.',
    'member.reservations.deleteError': 'Suppression du match impossible.',
    'member.reservations.playerAdded': 'Joueur ajoute avec succes.',
    'member.reservations.playerAddError': "Ajout du joueur impossible.",
    'member.reservations.playerRemoved': 'Joueur retire du match.',
    'member.reservations.playerRemoveError': 'Suppression du joueur impossible.',
    'member.reservations.paymentSuccess': 'Paiement effectue avec succes.',
    'member.reservations.paymentError': 'Paiement impossible.',
    'member.reservations.reservationCanceled': 'Reservation annulee.',
    'member.reservations.reservationCancelError': 'Annulation impossible.'
  },
  en: {
    'common.back': 'Back',
    'common.save': 'Save',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.reset': 'Reset',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.none': 'None',
    'common.matchPlanned': 'Planned',
    'common.matchFull': 'Full',
    'common.matchCanceled': 'Canceled',
    'common.reservationPending': 'Pending',
    'common.reservationConfirmed': 'Confirmed',
    'common.reservationCanceled': 'Canceled',
    'common.paymentPending': 'Pending',
    'common.paymentPaid': 'Paid',
    'common.paymentRefunded': 'Refunded',
    'common.paymentCanceled': 'Canceled',
    'common.allSites': 'All sites',
    'common.profile': 'Profile',
    'common.refresh': 'Refresh',
    'nav.home': 'Home',
    'nav.admin': 'Admin',
    'nav.member': 'Member area',
    'nav.profile': 'Profile',
    'nav.matches': 'Matches',
    'nav.reservations': 'Reservations',
    'nav.payments': 'Payments',
    'nav.create': 'Create',
    'nav.public': 'Public',
    'nav.private': 'Private',
    'nav.logout': 'Logout',
    'nav.memberArea': 'Member area',
    'nav.adminLogin': 'Admin login',
    'nav.dashboard': 'Dashboard',
    'nav.members': 'Members',
    'nav.sites': 'Sites',
    'nav.courts': 'Padel courts',
    'nav.closures': 'Closures',
    'switcher.label': 'Language switch',
    'switcher.fr': 'French',
    'switcher.en': 'English',
    'landing.eyebrow': 'Padel club management',
    'landing.title': 'PadelPlay',
    'landing.lead':
      'A clear interface to book, join a match, track payments, and run the club from an admin dashboard.',
    'landing.memberCta': 'Enter with a member ID',
    'landing.memberCtaConnected': 'Open my area',
    'landing.adminCta': 'Admin login',
    'landing.testApi': 'Test the API',
    'landing.loadingApi': 'Checking /api/matches/public...',
    'landing.apiSuccess': 'Proxy OK - {count} public match(es) fetched',
    'landing.apiError': 'API call failed. Check that the backend is running on port 8080.',
    'landing.feature1.title': 'Reservations',
    'landing.feature1.body': 'Padel court selection, availability checks, and status tracking.',
    'landing.feature2.title': 'Public and private matches',
    'landing.feature2.body': 'Fast creation with clear rules for participants.',
    'landing.feature3.title': 'Payments',
    'landing.feature3.body': 'Clean view of payments, penalties, and confirmations.',
    'landing.feature4.title': 'Administration',
    'landing.feature4.body': 'Metrics, members, sites, courts, and closures in one place.',
    'landing.matchPublic': 'Public match',
    'landing.matchAvailable': 'match(es) available',
    'landing.reservation': 'Reservation',
    'landing.reservationBody': 'member, padel court, payment',
    'landing.simpleReservation': 'Simple',
    'landing.matchPreviewLabel': 'Match preview',
    'admin.login.heroTitle': 'PadelPlay Admin',
    'admin.login.heroSubtitle': 'Area reserved for site administrators and global supervisors',
    'admin.login.formTitle': 'Login',
    'admin.login.formSubtitle': 'Access reserved for administrators',
    'admin.login.email': 'Email',
    'admin.login.password': 'Password',
    'admin.login.submit': 'Sign in',
    'admin.login.back': 'Back',
    'admin.login.error': 'Login failed. Check the email and password.',
    'admin.home.eyebrow': 'Dashboard',
    'admin.home.title': 'PadelPlay administration',
    'admin.home.subtitle': '{scope} view of club matches, reservations, members, and resources.',
    'admin.home.loading': 'Loading dashboard...',
    'admin.home.matches': 'Matches',
    'admin.home.reservations': 'Reservations',
    'admin.home.members': 'Members',
    'admin.home.revenue': 'Revenue',
    'admin.home.occupancy': 'Occupancy by site',
    'admin.home.occupancySub': 'Number of matches linked to each visible site',
    'admin.home.resources': 'Resources',
    'admin.home.resourcesSub': 'Quick control of elements managed by the administration',
    'admin.home.empty': 'No data.',
    'admin.home.waiting': 'waiting',
    'admin.home.visible': 'visible',
    'admin.home.validPayments': 'valid payments',
    'admin.home.reservationsLoadError': 'Unable to load admin reservations.',
    'admin.home.dashboardLoadError': 'Unable to load the admin dashboard.',
    'admin.matches.title': 'Match management',
    'admin.matches.subtitle': 'Review, details, and conversion to public',
    'admin.members.title': 'Member management',
    'admin.members.subtitle': 'Create, edit, and delete club members',
    'admin.members.matricule': 'Member ID',
    'admin.members.matriculeHint': 'GLOBAL: G+4 chars · SITE: S+5 chars · LIBRE: L+5 chars',
    'admin.members.type': 'Member type',
    'admin.members.typeGlobal': 'Global - All sites',
    'admin.members.typeSite': 'Site - Dedicated site',
    'admin.members.typeLibre': 'Libre - Free access',
    'admin.members.nom': 'Last name',
    'admin.members.prenom': 'First name',
    'admin.members.email': 'Email',
    'admin.members.site': 'Site',
    'admin.members.siteNone': 'No site (GLOBAL / LIBRE)',
    'admin.members.searchPlaceholder': 'Search by member ID, last name, or first name...',
    'admin.members.filterAll': 'All',
    'admin.members.filterGlobal': 'Global',
    'admin.members.filterSite': 'Site',
    'admin.members.filterLibre': 'Free access',
    'admin.members.empty': 'No member found',
    'admin.members.emptySub': 'Create your first member with the form above.',
    'admin.members.penalty': 'Active penalty',
    'admin.members.emailMissing': 'Not set',
    'admin.members.siteAll': 'All sites',
    'admin.members.balance': 'Balance',
    'admin.members.edit': 'Edit',
    'admin.members.delete': 'Delete',
    'admin.members.count': 'member(s)',
    'admin.sites.title': 'Site management',
    'admin.sites.subtitle': 'Create, edit, and delete sites',
    'admin.terrains.title': 'Padel court management',
    'admin.terrains.subtitle': 'Create and manage courts by site',
    'admin.closures.title': 'Closure days',
    'admin.closures.subtitle': 'Global and site-based closure management',
    'member.home.title': 'Padel member area',
    'member.home.subtitle': 'Enter your member ID to access your play area',
    'member.home.identification': 'Identification',
    'member.home.loginHint': 'Enter your member ID and password to access the padel court area',
    'member.home.password': 'Password',
    'member.home.cta': 'Open my area',
    'member.home.invalid': 'Invalid credentials. Check the member ID and password.',
    'member.home.global': 'Global',
    'member.home.site': 'Dedicated site',
    'member.home.livre': 'Free access',
    'member.home.tousSites': 'All sites',
    'member.create.title': 'Create a match',
    'member.create.subtitle': 'Public or private, according to backend rules.',
    'member.create.rappel': 'Reminder',
    'member.create.public': 'PUBLIC',
    'member.create.private': 'PRIVATE',
    'member.create.back': 'Back to profile',
    'member.create.submit': 'Create match',
    'member.create.mode': 'Creation mode',
    'member.create.site': 'Site',
    'member.create.terrain': 'Padel court',
    'member.create.date': 'Date',
    'member.create.dateHint': 'Between',
    'member.create.time': 'Start time',
    'member.create.matchType': 'Match type',
    'member.create.privatePlayers': 'Players to invite now (optional)',
    'member.create.player2': 'Player ID 2',
    'member.create.player3': 'Player ID 3',
    'member.create.player4': 'Player ID 4',
    'member.create.noSite': 'No site available to create a match.',
    'member.create.noTerrain': 'No padel court available for the selected site.',
    'member.create.selectedSite': 'Selected site',
    'member.create.bookingLimit': 'Latest allowed date according to your profile:',
    'member.create.ruleGlobal': 'GLOBAL: up to 3 weeks ahead',
    'member.create.ruleSite': 'SITE: up to 2 weeks ahead on your site',
    'member.create.ruleLibre': 'LIBRE: up to 5 days ahead',
    'member.create.noSiteLoaded': 'No site loaded.',
    'member.create.noTerrainLoaded': 'No padel court loaded.',
    'member.create.success': 'Match created. Your place will be confirmed after payment from your reservations.',
    'member.create.successPrivate': 'Private match created. Invitations are pending player payments.',
    'member.create.partialSuccess': 'Match created, but some players could not be added.',
    'member.public.title': 'Public matches',
    'member.public.subtitle': 'Join an available public match. First paid, first served.',
    'member.public.filter': 'Filter by site',
    'member.public.search': 'Search',
    'member.public.create': 'Create a match',
    'member.public.join': 'Join',
    'member.public.modify': 'Edit',
    'member.public.delete': 'Delete',
    'member.public.myProfile': 'My profile',
    'member.public.myMatch': 'My match',
    'member.public.available': 'Available',
    'member.public.completion': 'Full',
    'member.public.none': 'Not joinable',
    'member.public.organizer': 'Organizer',
    'member.public.status': 'Status',
    'member.public.type': 'Type',
    'member.public.players': 'Players',
    'member.public.price': 'Price per player',
    'member.public.registering': 'Booking...',
    'member.public.editTitle': 'Edit match',
    'member.public.editHint': 'Editing unavailable: a match cannot be edited less than 24 hours before start.',
    'member.public.noMatches': 'No public match matches the filters.',
    'member.public.searchPlaceholder': 'Padel court, site, organizer',
    'member.public.noMatchPrompt': 'Can\'t find a match?',
    'member.public.createBody': 'Public or private, with site and padel court choice.',
    'member.public.date': 'Date',
    'member.public.time': 'Start time',
    'member.public.typeLabel': 'Type',
    'member.reservations.title': 'My reservations',
    'member.reservations.subtitle': 'Payment and cancellation of your registrations.',
    'member.reservations.createPublic': 'Create PUBLIC match',
    'member.reservations.createPrivate': 'Create PRIVATE match',
    'member.reservations.matches': 'Public matches',
    'member.reservations.select': 'Select an organized match',
    'member.reservations.addPlayer': 'Add player',
    'member.reservations.noOrganized': 'No organized match yet. Create a PUBLIC or PRIVATE match using the buttons above.',
    'member.reservations.edit': 'Edit match',
    'member.reservations.confirmation': 'Confirmation required',
    'member.reservations.players': 'Registered players:',
    'member.reservations.empty': 'No reservation found.',
    'member.reservations.player': 'Player',
    'member.reservations.match': 'Match',
    'member.reservations.reservation': 'Reservation',
    'member.reservations.payment': 'Payment',
    'member.reservations.amount': 'Amount',
    'member.reservations.pay': 'Pay',
    'member.reservations.cancel': 'Cancel',
    'member.reservations.organizedTitle': 'My organized matches',
    'member.reservations.organizedSub': 'Edit, delete, or manage players for your matches.',
    'member.reservations.chooseMatch': '-- Choose a match --',
    'member.reservations.inviteMatricule': 'Player member ID to add',
    'member.reservations.noPlayer': 'No player registered for this match.',
    'member.reservations.reservationLabel': 'Reservation',
    'member.reservations.paymentLabel': 'Payment',
    'member.reservations.removePlayer': 'Remove',
    'member.reservations.emptyBody': 'Create a match or join a public match to see your reservations here.',
    'member.payments.title': 'My payments',
    'member.payments.subtitle': 'Payment and refund history',
    'member.payments.reservations': 'My reservations',
    'member.payments.total': 'Total payments',
    'member.payments.paid': 'Total paid',
    'member.payments.pending': 'Pending',
    'member.payments.refunded': 'Refunded',
    'member.payments.none': 'No payment found',
    'member.payments.notSet': 'Not set yet',
    'member.payments.idLabel': 'Payment',
    'member.payments.noPayments': 'No payment found',
    'member.payments.loadingState': 'Loading payments...',
    'member.payments.errorState': 'Unable to load payments.',
    'member.payments.noMemberState': 'No member logged in.',
    'member.profile.title': 'My member profile',
    'member.profile.subtitle': 'Information loaded from the backend',
    'member.profile.createQuick': 'Create a match quickly',
    'member.profile.publicMatch': 'Open match',
    'member.profile.privateMatch': 'Invitation match',
    'member.profile.quickPublic': 'Create a PUBLIC match',
    'member.profile.quickPrivate': 'Create a PRIVATE match',
    'member.profile.quickPublicBody': 'Any member can join · 15 EUR/player · 4 players required',
    'member.profile.quickPrivateBody': 'Invite 3 players by member ID · Converts to public if incomplete the day before',
    'member.profile.explore': 'Explore',
    'member.profile.followup': 'Follow-up',
    'member.profile.finance': 'Finance',
    'member.profile.refresh': 'Refresh',
    'member.profile.logout': 'Logout member',
    'member.profile.nom': 'Last name',
    'member.profile.prenom': 'First name',
    'member.profile.email': 'Email',
    'member.profile.matricule': 'Member ID',
    'member.profile.type': 'Type',
    'member.profile.site': 'Site',
    'member.profile.solde': 'Balance',
    'member.profile.penaltyActive': 'Active penalty',
    'member.profile.balancePending': 'Pending balance',
    'member.profile.yes': 'Yes',
    'member.profile.no': 'No',
    'member.profile.exploreBody': 'Join an available match quickly.',
    'member.profile.followupBody': 'Pay, cancel, or track your registrations.',
    'member.profile.financeBody': 'Payment history.',
    'member.payments.payment': 'Payment',
    'member.payments.loading': 'Loading payments...',
    'member.payments.error': 'Unable to load payments.',
    'member.payments.noMember': 'No member logged in.',
    'admin.matches.organizer': 'Organizer',
    'admin.matches.status': 'Status',
    'admin.matches.players': 'Players',
    'admin.matches.reservations': 'Match reservations',
    'admin.matches.noReservations': 'No reservations.',
    'admin.matches.hideDetails': 'Hide',
    'admin.matches.showDetails': 'View details',
    'admin.matches.convert': 'Convert to public',
    'admin.matches.convertSuccess': 'Match converted to public.',
    'admin.matches.loadError': 'Unable to load admin matches.',
    'admin.matches.reservationsError': 'Unable to load match reservations.',
    'admin.matches.convertError': 'Unable to convert match.',
    'admin.matches.empty': 'No match available',
    'admin.closures.date': 'Date',
    'admin.closures.reason': 'Reason (optional)',
    'admin.closures.site': 'Site concerned',
    'admin.closures.noneGlobal': 'None (global)',
    'admin.closures.global': 'Global closure (all sites)',
    'admin.closures.add': 'Add closure',
    'admin.closures.reset': 'Reset',
    'admin.closures.reasonEmpty': 'No reason specified',
    'admin.closures.empty': 'No closure day configured',
    'common.notProvided': 'Not provided',
    'admin.home.allStatuses': 'all statuses',
    'admin.home.matchCount': 'match(es)',
    'admin.home.sitesVisible': 'Visible sites',
    'admin.home.terrainsVisible': 'Visible padel courts',
    'admin.home.completeMatches': 'Complete matches',
    'admin.home.pendingReservations': 'Pending reservations',
    'admin.login.globalBadge': '🌐 Global admin',
    'admin.login.siteBadge': '🏟️ Site admin',
    'admin.login.showPassword': 'Show admin password',
    'admin.login.hidePassword': 'Hide admin password',
    'admin.members.searchNoResult': 'No result for "{query}"',
    'admin.members.loadError': 'Unable to load members.',
    'admin.members.saveError': 'Unable to save member.',
    'admin.members.deleteError': 'Unable to delete.',
    'admin.members.updateSuccess': 'Member updated.',
    'admin.members.createSuccess': 'Member created successfully.',
    'admin.members.deleteSuccess': 'Member deleted.',
    'admin.members.deleteConfirm': 'Confirm deletion of this member?',
    'admin.sites.name': 'Name',
    'admin.sites.address': 'Address',
    'admin.sites.opening': 'Opening',
    'admin.sites.closing': 'Closing',
    'admin.sites.matchDuration': 'Match duration (min)',
    'admin.sites.breakDuration': 'Break between matches (min)',
    'admin.sites.civilYear': 'Calendar year',
    'admin.sites.hours': 'Hours',
    'admin.sites.duration': 'Match duration',
    'admin.sites.break': 'Break',
    'admin.sites.year': 'Year',
    'admin.sites.empty': 'No site configured',
    'admin.sites.siteAdminEditBlocked': 'A SITE admin cannot modify sites.',
    'admin.sites.siteAdminDeleteBlocked': 'A SITE admin cannot delete sites.',
    'admin.sites.loadError': 'Unable to load sites.',
    'admin.sites.saveError': 'Unable to save site.',
    'admin.sites.deleteError': 'Unable to delete site.',
    'admin.sites.deleteConfirm': 'Confirm deletion of this site?',
    'admin.sites.updateSuccess': 'Site updated.',
    'admin.sites.createSuccess': 'Site created.',
    'admin.sites.deleteSuccess': 'Site deleted.',
    'admin.terrains.name': 'Padel court name',
    'admin.terrains.site': 'Site',
    'admin.terrains.empty': 'No padel court configured',
    'admin.terrains.loadError': 'Unable to load padel courts.',
    'admin.terrains.saveError': 'Unable to save padel court.',
    'admin.terrains.deleteError': 'Unable to delete padel court.',
    'admin.terrains.deleteConfirm': 'Confirm deletion of this padel court?',
    'admin.terrains.updateSuccess': 'Padel court updated.',
    'admin.terrains.createSuccess': 'Padel court created.',
    'admin.terrains.deleteSuccess': 'Padel court deleted.',
    'admin.closures.loadError': 'Unable to load closure days.',
    'admin.closures.addSuccess': 'Closure day added.',
    'admin.closures.addError': 'Unable to add closure day.',
    'admin.closures.deleteSuccess': 'Closure day deleted.',
    'admin.closures.deleteError': 'Unable to delete closure day.',
    'member.home.matricule': 'Member ID',
    'member.home.matriculePlaceholder': 'Ex: G1234, S12345, L12345',
    'member.home.showPassword': 'Show member password',
    'member.home.hidePassword': 'Hide member password',
    'member.home.globalHint': 'G + 4 digits · All sites',
    'member.home.siteHint': 'S + 5 digits · Dedicated site',
    'member.home.livreHint': 'L + 5 digits · Open access',
    'member.home.allSites': 'All sites',
    'member.profile.loadError': 'Unable to load member profile.',
    'member.create.bookingLimitError': 'Latest allowed date: {date}.',
    'member.create.bookingLimitProfileError': 'The {type} profile cannot book more than {days} days ahead. Deadline: {date}.',
    'member.create.invalidType': 'Invalid match type.',
    'member.create.createError': 'Unable to create match.',
    'member.create.outstandingBalance': 'You have an outstanding balance. Settle your debts before creating a match.',
    'member.create.activePenalty': 'You have an active penalty. Wait before creating a match.',
    'member.create.slotTaken': 'This slot is already booked. Pick another time.',
    'member.create.siteClosed': 'The site is closed on this date.',
    'member.create.outOfHours': "This time is outside the site's opening hours.",
    'member.create.siteOnly': 'A SITE member can only create a match on their own site.',
    'member.create.internalError': 'An internal server error occurred while creating the match.',
    'member.create.addPlayersError': 'Unable to add all players.',
    'member.public.loadError': 'Unable to load public matches.',
    'member.public.noMember': 'No member logged in.',
    'member.public.joinBlocked': 'This match cannot be joined (full, canceled, or not allowed).',
    'member.public.joinSuccess': 'Request created. Your spot will be confirmed after payment.',
    'member.public.joinError': 'Unable to reserve this match.',
    'member.public.modifyTooLate': 'Modification unavailable less than 24 hours before match start.',
    'member.public.updateSuccess': 'Match updated successfully.',
    'member.public.updateError': 'Unable to update match.',
    'member.public.deleteConfirm': 'Confirm deletion (cancellation) of match #{id}?',
    'member.public.deleteSuccess': 'Match canceled successfully.',
    'member.public.deleteError': 'Unable to delete match.',
    'member.reservations.reservationTitle': 'Reservation',
    'member.reservations.noMember': 'No member logged in.',
    'member.reservations.loadError': 'Unable to load reservations.',
    'member.reservations.privateOnly': 'Player management is reserved for PRIVATE matches.',
    'member.reservations.playersLoadError': 'Unable to load match players.',
    'member.reservations.updateSuccess': 'Match updated successfully.',
    'member.reservations.updateError': 'Unable to update match.',
    'member.reservations.deleteSuccess': 'Match canceled successfully.',
    'member.reservations.deleteError': 'Unable to delete match.',
    'member.reservations.playerAdded': 'Player added successfully.',
    'member.reservations.playerAddError': 'Unable to add player.',
    'member.reservations.playerRemoved': 'Player removed from match.',
    'member.reservations.playerRemoveError': 'Unable to remove player.',
    'member.reservations.paymentSuccess': 'Payment completed successfully.',
    'member.reservations.paymentError': 'Unable to process payment.',
    'member.reservations.reservationCanceled': 'Reservation canceled.',
    'member.reservations.reservationCancelError': 'Unable to cancel reservation.'
  }
};

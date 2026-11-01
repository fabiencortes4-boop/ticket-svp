/* Ticket SVP ! — données du jeu : villes, règles, passagers spéciaux, boutique */
'use strict';

G.CITIES = [
  {
    id: 'bus',
    name: 'Bus de campagne',
    line: 'Ligne 1 · Trou-sur-Marne',
    company: 'CAR RURAL',
    lineColor: '#4CAF50',
    theme: { sky: '#8fd8ff', wall: '#f1f7e4', wall2: '#dcebc4', seat: '#5ea95e', seat2: '#3f8a45', floor: '#cbb98d', pole: '#f2c14e', window: '#bfe9ff' },
    ticket: { bg: '#fff3c4', ink: '#2d5a27', band: '#5ea95e' },
    timeMod: 1.15,
    music: 'game',
    boss: { name: 'Les Jumeaux Fraudeurs', desc: 'Deux frères qui échangent leurs papiers. Compare chaque photo de près.', bias: { photo: 4 } },
  },
  {
    id: 'paris',
    name: 'Paris',
    line: 'Ligne 4 · Porte de Clignancourt',
    company: 'MÉTROPOLITAIN',
    lineColor: '#B0428F',
    theme: { sky: '#2b2f4a', wall: '#f4efe6', wall2: '#e3d8c4', seat: '#3d7a5c', seat2: '#2a5a43', floor: '#8c7b68', pole: '#c9ced6', window: '#1f2238' },
    ticket: { bg: '#f7f1d7', ink: '#3b2a5c', band: '#B0428F' },
    timeMod: 1,
    music: 'game',
    boss: { name: 'Le Gang des Moustaches', desc: 'Toute la bande porte la moustache. Certaines sont fausses : vérifie les photos.', bias: { photo: 3, date: 1 }, look: { facial: 'mustache' } },
  },
  {
    id: 'london',
    name: 'Londres',
    line: 'Central Line · Oxford Circus',
    company: 'CROWN RAIL',
    lineColor: '#DC241F',
    theme: { sky: '#26262e', wall: '#eef0f3', wall2: '#cfd6df', seat: '#2b4c9b', seat2: '#1d3573', floor: '#6f6a66', pole: '#f2c14e', window: '#191a22' },
    ticket: { bg: '#fdf6e3', ink: '#1d3573', band: '#DC241F' },
    timeMod: 0.92,
    music: 'game',
    boss: { name: 'Le Faussaire', desc: 'Il imite les tampons à la perfection. Ou presque. Sors ta lampe UV.', bias: { stamp: 4, name: 2 } },
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    line: 'Ligne Yamanote · heure de pointe',
    company: 'SAKURA METRO',
    lineColor: '#9ACD32',
    theme: { sky: '#1a1030', wall: '#f3f1fa', wall2: '#d9d3ee', seat: '#d6457a', seat2: '#a8305c', floor: '#7b7590', pole: '#ff9de2', window: '#140c26' },
    ticket: { bg: '#eefaf2', ink: '#24425a', band: '#3fae6a' },
    timeMod: 0.8,
    music: 'game',
    boss: { name: "L'Heure de Pointe Infernale", desc: 'La foule déferle : contrôle-en un maximum avant la fin du chrono.', bias: {} },
  },
  {
    id: 'moscou',
    name: 'Moscou',
    line: 'Ligne rouge · Komsomolskaïa',
    company: 'RAIL ÉTOILE ROUGE',
    lineColor: '#d62828',
    theme: { sky: '#2b2233', wall: '#f6ecd2', wall2: '#e2cf9f', seat: '#8c2f39', seat2: '#6a222b', floor: '#7a6650', pole: '#e0b35a', window: '#1c1622' },
    ticket: { bg: '#fbf3df', ink: '#7a1f28', band: '#c0392b' },
    timeMod: 0.92,
    music: 'moscow',
    boss: { name: 'Les Poupées gigognes', desc: "Cinq sœurs identiques qui s'échangent leurs cartes. Vérifie les photos et les dates de validité.", bias: { photo: 3, expiry: 3 } },
  },
  {
    id: 'nuit',
    name: 'Train de nuit',
    line: 'Paris → Venise · voiture-couchettes',
    company: 'TRAIN DE NUIT',
    lineColor: '#5b6ee1',
    window: 'night',
    theme: { sky: '#0e1430', wall: '#d9dcf2', wall2: '#b9bfe3', seat: '#4a3a7a', seat2: '#382c5e', floor: '#4a4560', pole: '#c9a46a', window: '#0b1028' },
    ticket: { bg: '#eef0ff', ink: '#2b2f6b', band: '#5b6ee1' },
    timeMod: 0.9,
    music: 'night',
    boss: { name: 'Le Somnambule', desc: 'Il passe et repasse en dormant, avec un ticket différent à chaque fois. Dates et tampons : reste bien éveillé !', bias: { date: 3, stamp: 3 } },
  },
  {
    id: 'express',
    name: 'Le Grand Express',
    line: 'Paris → Istanbul · voiture-salon',
    company: 'GRAND EXPRESS',
    lineColor: '#b8862e',
    window: 'dusk',
    theme: { sky: '#3b2240', wall: '#e9d2b0', wall2: '#c99d6e', seat: '#8c1c2c', seat2: '#6a1420', floor: '#5e3a24', pole: '#e0b35a', window: '#2a1830' },
    ticket: { bg: '#fdf3dc', ink: '#5e3820', band: '#b8862e' },
    timeMod: 0.88,
    music: 'orient',
    boss: { name: 'Le Crime du Grand Express', desc: 'Tout le wagon est suspect : fausses classes, faux noms, fausses photos. Mène l\'enquête !', bias: { class: 3, name: 2, photo: 2 } },
  },
  {
    id: 'ny',
    name: 'New York',
    line: 'Ligne 7 · Times Square express',
    company: 'BIG APPLE SUBWAY',
    lineColor: '#b933ad',
    window: 'nyc',
    theme: { sky: '#ffb36b', wall: '#eef2f4', wall2: '#c9d3d9', seat: '#f2a93b', seat2: '#c98420', floor: '#6d6f73', pole: '#c9ced6', window: '#2a2f45' },
    ticket: { bg: '#fff9db', ink: '#1f3b70', band: '#f2c14e' },
    timeMod: 0.86,
    music: 'nyc',
    boss: { name: 'Le Gang des tickets volés', desc: 'Une liasse de tickets a été volée. Ils ont l\'air parfaitement valables… sauf leur numéro.', bias: { name: 2, date: 1 } },
  },
  {
    id: 'berlin',
    name: 'Berlin',
    line: 'U-Bahn U2 · Alexanderplatz',
    company: 'SPREE BAHN',
    lineColor: '#f0d722',
    window: 'berlin',
    theme: { sky: '#3a3f4a', wall: '#f2efe2', wall2: '#ded6b8', seat: '#2f5f9e', seat2: '#234a7c', floor: '#5c5a55', pole: '#f0d722', window: '#20232b' },
    ticket: { bg: '#fffbe8', ink: '#2a2a2a', band: '#f0d722' },
    timeMod: 0.85,
    music: 'berlin',
    boss: { name: 'Les Sauteurs de portillons', desc: 'Trois resquilleurs ont sauté le portillon sous l\'œil des caméras. Ils se sont procuré de vrais tickets depuis… mais pas un nouveau visage.', bias: { photo: 2, expiry: 2 } },
  },
  {
    id: 'venise',
    name: 'Venise',
    line: 'Vaporetto ligne 1 · Grand Canal',
    company: 'LAGUNA BUS',
    lineColor: '#1f9bb5',
    window: 'venise',
    theme: { sky: '#8fd8ff', wall: '#f6ead8', wall2: '#e3c9a6', seat: '#a8432f', seat2: '#7f3122', floor: '#8b6b4a', pole: '#e0b35a', window: '#bfe9ff' },
    ticket: { bg: '#f3fbff', ink: '#13506b', band: '#1f9bb5' },
    timeMod: 0.84,
    music: 'venise',
    boss: { name: 'La Tempête sur la lagune', desc: 'Le vaporetto tangue dans tous les sens. Les documents bougent, les embruns brouillent la vue. Tiens bon la barre !', bias: { stamp: 2, date: 2, zone: 1 } },
  },
  {
    id: 'mars',
    name: 'Colonie de Mars',
    line: 'Monorail Olympus · Dôme 3',
    company: 'MARS TRANSIT',
    lineColor: '#e4572e',
    window: 'mars',
    theme: { sky: '#1a0f1f', wall: '#eceaf2', wall2: '#cfcbe0', seat: '#5b4bcf', seat2: '#4436a8', floor: '#5a5068', pole: '#9ad7ff', window: '#2a1620' },
    ticket: { bg: '#f1f4ff', ink: '#3a2a8c', band: '#e4572e' },
    timeMod: 0.84,
    music: 'mars',
    boss: { name: "La Panne d'oxygène", desc: "Le dôme fuit ! L'oxygène baisse sans arrêt. Chaque bonne décision en rajoute, chaque erreur en fait perdre. Va jusqu'au bout de la file avant d'étouffer.", bias: { class: 2, name: 2, group: 1 } },
  },
];
G.LEVELS_PER_CITY = 10;
G.TOTAL_LEVELS = G.CITIES.length * G.LEVELS_PER_CITY;

/* Règles de contrôle, introduites progressivement (index global de niveau, base 0). */
G.RULES = [
  { id: 'date', from: 0, icon: 'calendar', title: 'Date du ticket', short: 'Daté du jour',
    desc: "Un ticket n'est valable que le jour où il est daté. Compare avec la date d'aujourd'hui, en haut de l'écran." },
  { id: 'zone', from: 2, icon: 'zone', title: 'Zones', short: 'Zones couvertes',
    desc: 'La ligne va jusqu\'à une certaine zone (affichée en haut). Le ticket doit couvrir au moins jusqu\'à cette zone.' },
  { id: 'photo', from: 5, icon: 'photo', title: "Photo d'identité", short: 'Photo identique',
    desc: 'La photo de la carte doit montrer le même visage : coiffure, couleur des cheveux, lunettes, moustache, chapeau.' },
  { id: 'reduit', from: 10, icon: 'percent', title: 'Tarif réduit', short: 'Âge du tarif réduit',
    desc: "Étudiant : moins de 26 ans. Senior : 65 ans ou plus. Calcule l'âge avec l'année de naissance de la carte." },
  { id: 'stamp', from: 13, icon: 'stamp', title: 'Compostage', short: 'Composté, vrai tampon',
    desc: "Un ticket doit porter le tampon du composteur. Pas de tampon, ou un tampon dessiné à la main : amende ! La lampe UV fait briller les vrais tampons." },
  { id: 'name', from: 20, icon: 'card', title: 'Abonnement nominatif', short: 'Nom identique',
    desc: "L'abonnement mensuel porte un nom. Il doit être exactement celui de la carte d'identité. Et il n'est valable que le mois indiqué." },
  { id: 'day', from: 24, icon: 'megaphone', title: 'Règle du jour', short: 'Règle du jour',
    desc: 'Chaque service peut avoir une consigne spéciale de la direction. Lis-la bien avant de commencer !' },
  { id: 'expiry', from: 40, icon: 'card', title: 'Validité de la carte', short: 'Carte valide',
    desc: "La carte d'identité porte une date de fin de validité. Si elle est dépassée, la carte ne vaut plus rien : amende !" },
  { id: 'group', from: 45, icon: 'hand', title: 'Groupes', short: 'Compter les têtes',
    desc: 'Certains passagers voyagent en groupe avec un seul ticket. Le nombre de voyageurs indiqué doit couvrir tout le monde. Compte les têtes !' },
  { id: 'class', from: 60, icon: 'star', title: '1re classe', short: 'Bonne classe',
    desc: 'Dans une voiture de 1re classe (indiquée en haut de l\'écran), il faut un billet de 1re classe. En 2e classe, tout billet est accepté.' },
];

G.DAY_RULES = [
  { id: 'nosingle', title: 'Travaux sur la ligne', desc: 'Les tickets à l\'unité et réduits sont refusés. Seuls les abonnements passent.' },
  { id: 'noreduit', title: 'Grève des réductions', desc: 'Aujourd\'hui, les tickets à tarif réduit ne sont pas acceptés.' },
  { id: 'mustache', title: 'Journée de la moustache', desc: 'Les moustachus voyagent gratuitement, même sans ticket. Les autres paient !' },
  { id: 'glassesfree', title: 'Journée des lunettes', desc: 'Les porteurs de lunettes voyagent gratuitement, même sans ticket.' },
  { id: 'hatfree', title: 'Fête du chapeau', desc: 'Chapeau sur la tête ? Voyage gratuit, même sans ticket !' },
  { id: 'seniorfree', title: 'Journée des aînés', desc: 'Les 65 ans et plus voyagent gratuitement, même sans ticket. Vérifie leur âge sur la carte.' },
  { id: 'nopass', title: 'Panne des lecteurs', desc: "Les abonnements ne passent pas aujourd'hui. Seuls les tickets sont acceptés." },
];
/* Consignes « gratuit pour… » : le trait qui fait voyager gratis */
G.FREE_DAY = {
  mustache: { test: (p) => G.hasMustache(p.look), reason: 'Journée de la moustache : il voyage gratuitement !' },
  glassesfree: { test: (p) => p.look.glasses && p.look.glasses !== 'none', reason: 'Journée des lunettes : voyage gratuit !' },
  hatfree: { test: (p) => p.look.hat && p.look.hat !== 'none', reason: 'Fête du chapeau : voyage gratuit !' },
  seniorfree: { test: (p, ctx) => ctx.today.getFullYear() - p.birthYear >= 65, reason: 'Journée des aînés : plus de 65 ans, voyage gratuit !' },
};

/* Noms un peu loufoques */
G.FIRST_NAMES = ['Gérard', 'Josiane', 'Bernard', 'Ginette', 'Kevin', 'Sabrina', 'Jean-Mi', 'Huguette', 'Marcel', 'Nadine', 'Patrick', 'Brigitte', 'Thierry', 'Raymonde', 'Lucien', 'Mireille', 'Didier', 'Paulette', 'Yvon', 'Odette', 'Jordan', 'Cindy', 'René', 'Simone', 'Gilbert', 'Monique', 'Rémi', 'Chantal', 'Fabrice', 'Lucette', 'Hector', 'Germaine'];
G.NAME_TWINS = { Gérard: 'Gérald', Josiane: 'Josiana', Bernard: 'Bertrand', Ginette: 'Georgette', Kevin: 'Kelvin', Sabrina: 'Sabine', Huguette: 'Hugette', Marcel: 'Marceau', Nadine: 'Nadia', Patrick: 'Patrice', Brigitte: 'Brigitta', Thierry: 'Thibault', Raymonde: 'Raymond', Lucien: 'Lucienne', Mireille: 'Mirella', Didier: 'Dieter', Paulette: 'Paulina', Yvon: 'Yvan', Odette: 'Odile', Jordan: 'Jordy', Cindy: 'Sandy', René: 'Renée', Simone: 'Simon', Gilbert: 'Gisbert', Monique: 'Monica', Rémi: 'Rémy', Chantal: 'Chantale', Fabrice: 'Fabien', Lucette: 'Lucie', Hector: 'Victor', Germaine: 'Germain' };
G.LAST_NAMES = ['Baguette', 'Dupneu', 'Fromageot', 'Croissard', 'Lapince', 'Tartiflette', 'Moulinex', 'Bonnevie', 'Patapouf', 'Ducoin', 'Grosbisou', 'Saucisson', 'Pignouf', 'Lebrun', 'Cornichon', 'Vachequirit', 'Toutvabien', 'Ronchon', 'Pommier', 'Labrioche', 'Kouign', 'Chaussette', 'Bigoudi', 'Escargot', 'Camembert', 'Rillette'];

G.LINES = {
  greet: ['Bonjour chef !', 'Belle journée pour un contrôle !', "J'ai composté avec amour.", 'Vous voulez un bonbon ?', 'Ça fait combien de temps que vous faites ça ?', 'Bon courage, chef !', 'Il y a du monde, hein ?', 'Je vais être en retard au boulot…', 'Vous travaillez même le dimanche ?', 'Mon chat vous passe le bonjour.', 'Bonne journée !', 'Voilà, voilà…', 'Il fait chaud ici, non ?', 'Je suis pressé !', 'Salut !', 'Tenez, chef.', 'Encore un contrôle ?', 'Vous avez une belle casquette.', 'Je descends au prochain !'],
  nervous: ['Euh… bonjour ?', 'Pourquoi vous me regardez comme ça ?', "J'ai rien fait, hein !", "C'est… c'est quoi votre nom, déjà ?", 'Il est sympa, votre uniforme. Très sympa.', 'Vous avez l\'air fatigué, vous devriez rentrer.', 'Tout est normal, hein.', 'Je… je suis un passager normal.', 'Il fait très chaud, non ?', 'Vous contrôlez souvent ?', 'Hé hé… bonjour.'],
  noticket: ["J'ai oublié mon ticket dans mon autre pantalon !", 'Un pigeon me l\'a volé !', "Je l'ai mangé. J'avais faim.", "Je suis invisible, vous ne me voyez pas.", "C'est mon jumeau qui l'a.", "Je pensais que c'était un bus gratuit.", 'Le chien a mangé mon ticket.', "Je croyais que c'était gratuit le mardi.", 'Mon ticket ? Il est… en vacances.', "C'est mon premier jour sur Terre.", 'Je vous paie en bisous ?'],
  caught: ['Zut, démasqué !', 'Bien joué, chef…', "Ma mère va m'entendre…", 'Je paie en tickets-resto ?', 'Pfff, la loose.', "C'était pour un ami…", 'Je ferai appel !', 'Vous êtes trop fort.', 'Rhooo…', 'Je ne recommencerai plus. Promis.'],
  wronged: ['Quoi ?! Je porte plainte !', "J'appelle mon avocat !", 'Vous avez des lunettes, au moins ?', 'Une étoile sur l\'appli !', 'Mais il est valable !', 'Scandale !', 'Je veux voir votre chef !', 'Inadmissible !'],
  escaped: ['Hé hé, merci chef !', 'Ni vu ni connu !', 'Le crime paie !', 'Trop facile.', 'Bonne journée, pigeon !', 'Hihihi…'],
  thanks: ['Merci, bonne journée !', 'Bon service !', 'Vous êtes très professionnel.', 'Merci, et bon courage !', 'Merci chef !', 'À la prochaine !', 'Super, merci !'],
};

/* Répliques propres à chaque ville */
G.CITY_LINES = {
  bus: ['La ferme est encore loin ?', 'Vous connaissez ma tante Josiane ?', "Ça sent la vache, non ? C'est moi."],
  paris: ["C'est la grève demain ?", "Pardon, j'ai un croissant qui refroidit.", 'Oh là là, quelle foule !'],
  london: ['Cheerio !', "Lovely weather, isn't it ?", 'Mind the gap !'],
  tokyo: ['Konnichiwa !', 'Sumimasen…', 'Arigato, chef !'],
  moscou: ['Zdravstvouïte !', "Il fait -20 dehors, ici c'est le printemps.", 'Spassiba, camarade contrôleur.'],
  nuit: ['*bâille* Bonsoir…', 'Je cherche ma couchette.', 'Chut, les autres dorment.'],
  express: ['Bonsoir, très cher.', 'Le dîner est servi à quelle heure ?', 'Charmant, ce wagon.'],
  ny: ['Hey, how you doin\' ?', 'Je suis en retard pour Broadway !', 'Un bagel, chef ?'],
  berlin: ['Guten Tag !', 'Le club ouvre à 6 h du matin.', 'Ach so…'],
  venise: ['Buongiorno !', "Attention, ça tangue !", 'Je vais à la place Saint-Marc.'],
  mars: ['Bonjour, Terrien !', "Il fait -60 dehors, gardez votre casque.", "La gravité ici, c'est le pied !"],
};

/* Passagers spéciaux : ils alimentent l'album et les moments à partager. */
G.SPECIALS = [
  { id: 'mime', name: 'Le Mime', city: 0, fraud: true, bio: 'Prétend avoir un ticket invisible. Très convaincant.', quote: '« … »', reason: 'Un ticket invisible reste un ticket absent.', say: '(tend un ticket invisible)', caught: '(mime une crise de larmes)', escaped: '(mime une danse de joie)' },
  { id: 'dogs', name: 'Trois chiens en imperméable', city: 0, fraud: true, bio: 'Un « monsieur » très grand, très poilu et qui sent le chien mouillé.', quote: '« Wouaf. Je veux dire : bonjour. »', reason: 'La photo est un dessin au feutre. Et ce sont des chiens.', say: 'Bonjour. Je suis un humain.', caught: 'Wouaf wouaf !', escaped: 'Wouaf !' },
  { id: 'ghost', name: 'Le Fantôme', city: 0, fraud: false, bio: 'Il hante la ligne depuis 1903. Il a toujours payé son ticket.', quote: '« Bouuuh… bonjour. »', reason: "Ticket en règle. Un fantôme n'apparaît pas sur les photos, c'est normal.", say: 'Bouuuh… mon ticket.', caught: 'Je vais vous hanter !', escaped: 'Merci… bouuuh.' },
  { id: 'tourist', name: 'Le Touriste perdu', city: 0, fraud: false, bio: "Il cherche la tour Eiffel. Il est dans un bus de campagne.", quote: '« Excuse me, Eiffel Tower ? »', reason: 'Ticket en règle. Il est juste perdu.', say: 'Excuse me… Eiffel Tower ?', caught: 'Why ?!', escaped: 'Thank you !' },
  { id: 'timetraveler', name: 'Le Voyageur du temps', city: 1, fraud: true, bio: 'Vient de 2087. Ses tickets aussi.', quote: '« En 2087, ce ticket est valable ! »', reason: "Le ticket est daté de 2087. Valable dans 61 ans, pas aujourd'hui.", say: 'Quelle année sommes-nous ?', caught: 'Je reviendrai… hier !', escaped: 'À plus tard. Ou à plus tôt.' },
  { id: 'grandma', name: 'Mamie Ninja', city: 1, fraud: true, bio: "Carte senior, bandeau noir et souplesse suspecte.", quote: '« Je suis une petite vieille, hiii-ya ! »', reason: 'Tarif senior, mais elle est née il y a 25 ans.', say: 'Bonjour mon petit…', caught: 'Hiii-ya ! Disparition !', escaped: 'Hé hé, ninja.' },
  { id: 'pirate', name: 'Le Pirate', city: 1, fraud: true, bio: "A abordé la rame à l'heure de pointe.", quote: '« Mon ticket ? Une carte au trésor, moussaillon ! »', reason: "Une carte au trésor n'est pas un titre de transport.", say: 'Arrr ! Voilà mon ticket !', caught: 'Mille sabords !', escaped: 'Yo-ho-ho !' },
  { id: 'baby', name: 'Bébé Costaud', city: 1, fraud: false, bio: "Deux ans et demi, déjà 40 kilos de muscles.", quote: '« Areuh. »', reason: 'Les enfants de moins de 4 ans voyagent gratuitement.', say: 'Areuh !', caught: 'OUINNNN !', escaped: 'Areuh areuh !' },
  { id: 'influencer', name: "L'Influenceuse", city: 1, fraud: 'docs', bio: 'Filme tout. Surtout tes erreurs.', quote: '« Coucou la commu, je me fais contrôler ! »', reason: '', say: 'Coucou la commu !', caught: 'Unfollow !', escaped: 'Merci, abonnez-vous !', double: true },
  { id: 'vampire', name: 'Le Vampire', city: 2, fraud: true, bio: 'Voyage de nuit, évite les rames ensoleillées.', quote: '« Je viens pour… votre ticket. »', reason: 'Ticket daté de 1897. Il a un peu de retard.', say: 'Bonsoir…', caught: 'Argh ! La lumière !', escaped: 'Mwahaha !' },
  { id: 'robot', name: 'Le Robot', city: 2, fraud: false, bio: 'Modèle BIP-3000. Paie toujours avec la monnaie exacte.', quote: '« TICKET. VALIDE. BIP. »', reason: 'Ticket en règle, compostage électronique.', say: 'BONJOUR. HUMAIN.', caught: 'ERREUR. ERREUR.', escaped: 'MERCI. BIP.' },
  { id: 'king', name: 'Le Roi', city: 2, fraud: true, bio: 'Souverain d\'un royaume dont personne n\'a entendu parler.', quote: '« Un roi ne paie pas ! »', reason: 'Pas de ticket. Même les rois paient.', say: 'Place au roi !', caught: 'Qu\'on lui coupe… la casquette !', escaped: 'Merci, manant.' },
  { id: 'alien', name: "L'Extraterrestre", city: 2, fraud: false, bio: 'Touriste intergalactique, abonnement toutes zones.', quote: '« Zone 1 à l\'infini, bip bip. »', reason: 'Un pass zones 1 à ∞ couvre toutes les zones.', say: 'Bip bip, Terrien.', caught: 'Je reviendrai en soucoupe !', escaped: 'Bip ! Merci !' },
  { id: 'inspector', name: "L'Inspecteur infiltré", city: 3, fraud: true, bio: 'Teste la vigilance des contrôleurs. Ticket volontairement périmé.', quote: '« Je vérifie que vous vérifiez. »', reason: "Ticket périmé : c'était un test, et tu l'as réussi !", say: 'Bonjour… collègue.', caught: 'Bravo, test réussi ! +500', escaped: 'Hmm… je note.', bonus: 500 },
  { id: 'astronaut', name: "L'Astronaute", city: 3, fraud: false, bio: 'De retour de mission, il rentre chez lui en métro.', quote: '« Un petit pas pour l\'homme… »', reason: 'Ticket en règle. Le casque est aussi sur la photo.', say: 'Houston, mon ticket.', caught: 'Houston, on a un problème !', escaped: 'Merci, Terre !' },
  { id: 'magician', name: 'Le Magicien', city: 3, fraud: true, bio: 'Il fait disparaître les tickets. Surtout le sien.', quote: '« Choisissez une carte ! »', reason: 'Son « ticket » est un as de pique.', say: 'Votre ticket… est-ce celui-ci ?', caught: 'Abracadabr… zut.', escaped: 'Tadaaa !' },
  { id: 'diva', name: "La Diva de l'Opéra", city: 3, fraud: false, bio: 'Répète ses vocalises entre deux stations.', quote: '« Laaa-la-laaa ! »', reason: 'Ticket en règle, et quelle voix.', say: 'Laaa-la-laaaa !', caught: 'Quelle fausse note !', escaped: 'Bravo, bravissimo !' },
  { id: 'bee', name: "L'Abeille", city: 0, fraud: false, bio: 'Butine de station en station. Toujours pressée, toujours en règle.', quote: '« Bzzz… bonjour ! »', reason: 'Ticket en règle. Elle fait juste du bruit.', say: 'Bzzz ! Mon ticket !', caught: 'Bzzzz ! Scandale !', escaped: 'Bzzz, merci !' },
  { id: 'gardener', name: 'Le Jardinier', city: 0, fraud: false, bio: 'Emporte ses plants de tomates au marché chaque matin.', quote: '« Elles sont bio, mes tomates. »', reason: 'Ticket en règle, et la plante aussi.', say: 'Attention à mes plants !', caught: 'Mes tomates…', escaped: 'Bonne journée, chef !' },
  { id: 'chef', name: 'Le Chef cuisinier', city: 1, fraud: false, bio: 'Trois étoiles au guide, zéro amende au compteur.', quote: '« Un ticket ? Avec plaisir, chef ! »', reason: 'Ticket en règle. Et ça sent bon le beurre.', say: 'Bonjour chef ! Entre chefs…', caught: 'Sacrebleu, ma sauce !', escaped: 'Merci chef !' },
  { id: 'accordion', name: "L'Accordéoniste", city: 1, fraud: false, bio: 'Joue la même valse depuis 1987, entre chaque station.', quote: '« Une petite valse, chef ? »', reason: 'Ticket en règle. La musique ne se verbalise pas.', say: '♪ Tagada tsoin tsoin ♪', caught: '♪ Fausse note ♪', escaped: '♪ Merciii ♪' },
  { id: 'pizza', name: 'Le Livreur de pizza', city: 1, fraud: true, bio: "Livre en 30 minutes ou c'est gratuit. Son ticket aussi, apparemment.", quote: '« Elle est encore chaude ! »', reason: 'Le « tampon » est une tache de sauce tomate.', say: 'Livraison express !', caught: 'La pizza va refroidir !', escaped: 'Une part pour vous ?' },
  { id: 'detective', name: 'La Détective', city: 2, fraud: false, bio: 'Enquête sur la disparition des tickets. Elle a toujours le sien.', quote: '« Élémentaire, cher contrôleur. »', reason: "Ticket en règle. Elle mène l'enquête.", say: 'Je vous observe…', caught: 'Erreur judiciaire !', escaped: 'Affaire classée.' },
  { id: 'rocker', name: 'Le Rockeur', city: 2, fraud: true, bio: "En tournée mondiale avec l'abonnement de son batteur.", quote: "« Yeaaah ! Rock'n'roll ! »", reason: 'Abonnement au nom de son batteur.', say: 'Yeaaah !', caught: 'No future…', escaped: "Rock'n'roll, baby !" },
  { id: 'queen', name: 'La Reine', city: 2, fraud: false, bio: 'Voyage incognito. Enfin, presque.', quote: '« Nous sommes ravie. »', reason: 'Abonnement à son nom : Sa Majesté a payé.', say: 'Bonjour, mon brave.', caught: 'Qu\'on le jette au cachot !', escaped: 'Merci, mon brave.' },
  { id: 'dj', name: 'La DJ', city: 3, fraud: false, bio: 'Mixe dans le métro, paie ses tickets.', quote: '« Boum, boum, ticket ! »', reason: 'Ticket en règle. Le son est fort, mais légal.', say: 'Ça groove, chef ?', caught: 'Le son est coupé…', escaped: 'Drop !' },
  { id: 'unicorn', name: 'La Licorne', city: 3, fraud: false, bio: 'Une adulte en pyjama licorne. Elle assume.', quote: '« Les licornes existent. Et elles paient. »', reason: "Ticket en règle. Le pyjama n'est pas interdit.", say: 'Bonjour, je suis magique.', caught: 'Les licornes pleurent !', escaped: 'Paillettes pour tout le monde !' },
  { id: 'hero', name: 'Le Super-héros', city: 3, fraud: true, bio: 'Sauve le monde, mais pas son budget transport.', quote: '« Normalement, je vole. »', reason: 'Pas de ticket. Même les héros paient.', say: 'Pas le temps, je sauve le monde !', caught: 'Mon identité secrète !', escaped: 'Au revoir, citoyen !' },
  { id: 'knight', name: 'Le Chevalier', city: 4, fraud: true, bio: 'A raté sa correspondance en 1347.', quote: '« Holà, gentil contrôleur ! »', reason: 'Ticket daté de 1347. Un peu périmé.', say: 'Holà, manant !', caught: 'Par ma barbe !', escaped: 'Hardi !' },
  { id: 'santa', name: 'Le Père Noël', city: 4, fraud: true, bio: "Ne travaille qu'un jour par an. Son ticket aussi.", quote: '« Ho ho ho ! »', reason: 'Ticket daté du 24 décembre dernier.', say: 'Ho ho ho ! Joyeux… mardi !', caught: 'Pas de cadeau pour toi !', escaped: 'Ho ho ho !' },
  { id: 'zombie', name: 'Le Zombie', city: 4, fraud: true, bio: 'Mort en 1998, toujours dans le métro.', quote: '« Grrraaah… ticket… »', reason: 'Ticket daté de 1998.', say: 'Grrraah…', caught: 'GRRAAAH !', escaped: 'Grrr… merci.' },
  { id: 'cowboy', name: 'Le Cowboy', city: 4, fraud: false, bio: 'A laissé son cheval au parking relais.', quote: '« Howdy, shérif ! »', reason: 'Ticket en règle, et le chapeau aussi.', say: 'Howdy !', caught: 'Au saloon, vite !', escaped: 'Yee-haw !' },
  { id: 'mummy', name: 'La Momie', city: 5, fraud: false, bio: 'Née en 1320 avant notre ère. Ticket acheté ce matin.', quote: '« Mmmh… mmmh. »', reason: 'Ticket en règle. Vieille, mais honnête.', say: 'Mmmmh…', caught: 'MMMH !', escaped: 'Mmh mmh !' },
  { id: 'diver', name: 'Le Plongeur', city: 5, fraud: true, bio: 'Arrive directement de la mer. Son ticket aussi.', quote: '« Blub blub. »', reason: 'Ticket détrempé et illisible.', say: 'Blub ! Mon ticket !', caught: 'Blub blub…', escaped: 'Blub !' },
  { id: 'elf', name: 'Le Lutin', city: 5, fraud: true, bio: "S'est échappé de l'atelier du Père Noël.", quote: '« Je suis petit, ça ne compte pas ! »', reason: 'Pas de ticket. Les lutins paient aussi.', say: 'Je suis tout petit !', caught: 'Je le dirai au Père Noël !', escaped: 'Hihihi !' },
  { id: 'fairy', name: 'La Fée', city: 5, fraud: true, bio: 'Transforme les feuilles en tickets. Ça ne marche pas.', quote: '« Poudre de fée… et hop, un ticket ! »', reason: 'Son « ticket » est une feuille de chêne.', say: 'Voici mon ticket magique !', caught: 'Ma baguette est en panne…', escaped: 'Pouf !' },
  { id: 'mermaid', name: 'La Sirène', city: 6, fraud: false, bio: 'A pris le train pour visiter la mer Noire.', quote: '« Je viens en paix… et en écailles. »', reason: 'Ticket en règle. Les écailles sont autorisées.', say: 'Bonsoir ! Ça glisse un peu.', caught: 'Je retourne à la mer !', escaped: 'Merci, mon capitaine !' },
  { id: 'clown', name: 'Le Clown', city: 6, fraud: true, bio: 'Son ticket fait pouet.', quote: '« Pouet pouet ! »', reason: 'Son « ticket » est un chien en ballon.', say: 'Pouet ! Mon ticket !', caught: 'Pouet… snif.', escaped: 'Pouet pouet !' },
  { id: 'viking', name: 'Le Viking', city: 6, fraud: true, bio: 'A pillé le composteur. Et le ticket de son voisin.', quote: '« Par Odin ! »', reason: "Pas de ticket. Il l'a « échangé » contre un cri de guerre.", say: 'Par Odin ! Je monte !', caught: 'Valhalla !', escaped: 'Skål !' },
  { id: 'bride', name: 'La Mariée', city: 6, fraud: false, bio: 'En retard à son propre mariage.', quote: '« Vite, vite, je me marie ! »', reason: 'Ticket en règle. Félicitations !', say: 'Vite, je me marie dans 10 minutes !', caught: 'Le plus beau jour de ma vie…', escaped: 'Merci ! Venez au bal !' },
  { id: 'broker', name: 'Le Trader', city: 7, fraud: true, bio: "Achète, vend, crie au téléphone. Son abonnement appartient à son patron.", quote: '« Achetez ! Vendez ! Compostez ! »', reason: "Abonnement au nom de son patron, M. BONUS.", say: 'Je rachète votre métro, combien ?', caught: 'Krach boursier !', escaped: 'Jackpot !' },
  { id: 'liberty', name: 'La Statue de la Liberté', city: 7, fraud: false, bio: 'Une artiste de rue peinte en vert. Elle ne bouge pas, sauf pour composter.', quote: '« … » (immobile)', reason: 'Ticket en règle. Immobile, mais honnête.', say: '(ne bouge pas d\'un millimètre)', caught: '(une larme verte coule)', escaped: '(cligne de l\'œil)' },
  { id: 'hotdog', name: 'Le Vendeur de hot-dogs', city: 7, fraud: true, bio: 'Vend des hot-dogs dans la rame. Et des tickets tachés de moutarde.', quote: '« Moutarde ou ketchup ? »', reason: 'Le « tampon » est une trace de moutarde.', say: 'Hot-dog ! Hot-dog chaud !', caught: 'Ma moutarde !', escaped: 'Un hot-dog offert !' },
  { id: 'breakdancer', name: 'Le Breakdancer', city: 7, fraud: false, bio: 'Tourne sur la tête entre deux stations. Ticket bien rangé dans sa casquette.', quote: '« Showtime ! »', reason: 'Ticket en règle. Et quel style !', say: "It's showtime, folks !", caught: 'Mon moonwalk…', escaped: 'Yeah !' },
  { id: 'taxi', name: 'Le Chauffeur de taxi', city: 7, fraud: true, bio: "D'habitude, ce sont les autres qui paient.", quote: '« Le compteur tourne ! »', reason: "Pas de ticket. Il pensait que c'était le métro qui le payait.", say: 'Je prends jamais le métro, moi.', caught: 'Embouteillage !', escaped: 'Gardez la monnaie !' },
  { id: 'gaston', name: 'Gaston, le rival', city: 7, fraud: true, bio: "Ton rival de la brigade concurrente. Il te suit de ville en ville, déguisé en passager.", quote: '« Tu ne me reconnais pas, hein ? »', reason: "C'est Gaston, sans ticket, pour tester ta vigilance. Raté pour lui !", say: 'Bonjour… simple passager…', caught: 'Grrr ! La prochaine fois !', escaped: 'Ha ! Je le dirai au chef !' },
  { id: 'techno', name: 'Le Fêtard techno', city: 8, fraud: true, bio: 'Sort de boîte à 9 h du matin. Son ticket date d\'hier soir.', quote: '« Boum… boum… boum… »', reason: "Ticket d'hier soir. La fête a duré un peu trop longtemps.", say: 'Quelle heure il est ?', caught: 'Le son s\'arrête…', escaped: 'After party !' },
  { id: 'philosopher', name: 'Le Philosophe', city: 8, fraud: false, bio: 'Se demande si les tickets existent vraiment. Il en a quand même acheté un.', quote: '« Je composte, donc je suis. »', reason: 'Ticket en règle. Existentiellement valable.', say: 'Le ticket est-il une illusion ?', caught: 'Absurde !', escaped: 'Tout est relatif.' },
  { id: 'spy', name: "L'Espion", city: 8, fraud: true, bio: 'Lunettes noires, journal troué, faux nom.', quote: '« Le pigeon vole à minuit. »', reason: "Abonnement au nom d'« Agent X » : ce n'est pas le nom de sa carte.", say: 'Je ne suis pas là.', caught: 'Ma couverture !', escaped: 'Mission accomplie.' },
  { id: 'cyclist', name: 'La Cycliste', city: 8, fraud: true, bio: 'Pédale partout, même dans le métro. Tarif étudiant à 41 ans.', quote: '« Dring dring ! »', reason: 'Tarif étudiant, mais elle a 41 ans.', say: 'Je suis encore étudiante… dans l\'âme.', caught: 'Crevaison !', escaped: 'Dring !' },
  { id: 'currywurst', name: 'Le Roi de la currywurst', city: 8, fraud: false, bio: 'Tient le meilleur stand de la ville. Toujours en règle, toujours sauce curry.', quote: '« Mit Pommes ? »', reason: 'Ticket en règle. Ça sent bon le curry.', say: 'Une saucisse, chef ?', caught: 'Ma saucisse !', escaped: 'Danke !' },
  { id: 'gondolier', name: 'Le Gondolier', city: 9, fraud: false, bio: 'Chante O sole mio à chaque arrêt. Abonnement annuel.', quote: '« O sole mioooo ! »', reason: 'Ticket en règle, et quelle voix.', say: '♪ O sole mio ♪', caught: '♪ Mamma mia ♪', escaped: 'Grazie mille !' },
  { id: 'carnival', name: 'Le Masque du carnaval', city: 9, fraud: true, bio: 'Personne ne connaît son visage. Ni son ticket.', quote: '« Au carnaval, tout est permis ! »', reason: 'Pas de ticket. Même au carnaval, on paie.', say: 'Devinez qui je suis !', caught: 'Démasqué !', escaped: 'Arrivederci !' },
  { id: 'pigeon', name: 'Le Pigeon de Saint-Marc', city: 9, fraud: true, bio: "Un pigeon. Enfin, quelqu'un en costume de pigeon. On n'est pas sûrs.", quote: '« Rrrou rrrou. »', reason: 'Son « ticket » est une miette de pain.', say: 'Rrrou ?', caught: 'RRROU !', escaped: 'Rrrou rrrou !' },
  { id: 'painter', name: 'La Peintre', city: 9, fraud: false, bio: 'Peint le Grand Canal à chaque traversée. Ses tickets sont des œuvres d\'art.', quote: '« Ne bougez plus, je vous peins ! »', reason: 'Ticket en règle. Un peu de peinture dessus, rien de grave.', say: 'Quelle belle lumière !', caught: 'Mon chef-d\'œuvre…', escaped: 'Bellissimo !' },
  { id: 'casanova', name: 'Casanova', city: 9, fraud: true, bio: 'Séducteur professionnel. Voyage avec l\'abonnement de sa douzième fiancée.', quote: '« Enchanté, mon cher. »', reason: 'Abonnement au nom de « Bella ROSSI », sa fiancée du moment.', say: 'Quel charmant contrôleur…', caught: 'Mon cœur est brisé !', escaped: 'Ciao, bello !' },
  { id: 'martian', name: 'Le Martien', city: 10, fraud: false, bio: 'Né sur Mars, abonné à vie au monorail.', quote: '« Gloubi glouba, bonjour. »', reason: 'Pass toutes zones martiennes : valable partout.', say: 'Gloubi ! Mon pass !', caught: 'Incident diplomatique !', escaped: 'Glouba !' },
  { id: 'colonist', name: 'La Colon de Mars', city: 10, fraud: true, bio: 'Arrivée par la dernière fusée. Son billet est daté du jour du départ… en 2150.', quote: '« Le voyage a duré six mois ! »', reason: "Billet daté de 2150 : il n'est pas encore valable.", say: 'Quel voyage !', caught: 'Retour sur Terre !', escaped: 'Vive Mars !' },
  { id: 'rover', name: 'Le Rover', city: 10, fraud: true, bio: 'Robot d\'exploration en balade. Il pensait que les robots roulaient gratis.', quote: '« BIP. EXPLORATION. BIP. »', reason: 'Pas de ticket. Les robots paient aussi sur Mars.', say: 'BIP. ÉCHANTILLON ?', caught: 'BATTERIE FAIBLE…', escaped: 'BIP BIP !' },
  { id: 'astrocat', name: 'Le Chat astronaute', city: 10, fraud: false, bio: 'Mascotte de la colonie. Il a son propre abonnement, avec sa photo.', quote: '« Miaou. »', reason: "Ticket en règle. C'est bien lui sur la photo.", say: 'Miaou ?', caught: 'Fffffft !', escaped: 'Ronron…' },
  { id: 'emperor', name: "L'Empereur galactique", city: 10, fraud: true, bio: "Règne sur trois lunes et un astéroïde. Refuse de payer.", quote: '« À genoux, contrôleur ! »', reason: "Pas de ticket. Même les empereurs paient.", say: "L'Empereur ne paie pas !", caught: 'Je déclare la guerre !', escaped: 'Hahaha !' },
  { id: 'twin', name: 'Ton Sosie', city: 3, fraud: false, bio: "Même casquette, même moustache. Troublant.", quote: '« On se connaît, non ? »', reason: "Ticket en règle. C'est juste ton sosie.", say: 'Tiens… c\'est moi ?', caught: 'Je me verbalise moi-même ?!', escaped: 'Merci, moi !' },
];

/* Économie : pièces gagnées (les pièces doivent rester désirables : boutique, consommables, outils) */
G.ECO = {
  fine: 4, // par fraudeur verbalisé
  star: 6, // par étoile
  boss: 50, // boss vaincu
  daily: 25, // défi du jour réussi
  station: 2, // Ligne infinie : par station, pendant la partie
  endlessStation: 4, // Ligne infinie : par station, à la fin
  mystery: 40, // coupable du Grand Express démasqué
};

G.TOOLS = [
  { id: 'watch', name: 'Montre de gousset', icon: 'clock', max: 5, costs: [80, 160, 300, 500, 800], desc: (l) => `+${(l * 0.7).toFixed(1).replace('.', ',')} s par passager` },
  { id: 'uv', name: 'Lampe UV', icon: 'uv', max: 5, costs: [120, 220, 380, 600, 950], desc: (l) => (l === 0 ? 'Fait briller les vrais tampons' : `${G.uvUses(l) >= 99 ? 'Illimitée' : G.uvUses(l) + ' utilisations'} par service`) },
  { id: 'whistle', name: 'Sifflet', icon: 'whistle', max: 3, costs: [150, 350, 700], desc: (l) => (l === 0 ? 'Fige le chrono 5 secondes' : `${l} coup${l > 1 ? 's' : ''} par service, fige le chrono 5 s`) },
  { id: 'badge', name: 'Badge de réputation', icon: 'shield', max: 2, costs: [400, 1200], desc: (l) => (l === 0 ? '+1 erreur autorisée' : `+${l} erreur${l > 1 ? 's' : ''} autorisée${l > 1 ? 's' : ''}`) },
];
G.uvUses = (l) => [0, 2, 3, 4, 6, 99][l] || 0;

G.UNIFORMS = [
  { id: 'classic', name: 'Classique', cost: 0, coat: '#26407a', trim: '#f2c14e', hat: 'kepi', hatColor: '#26407a' },
  { id: 'retro', name: 'Rétro 1950', cost: 10, coat: '#7a5230', trim: '#e9d7a8', hat: 'kepi', hatColor: '#5b3a1f' },
  { id: 'pirate', name: 'Pirate du rail', cost: 15, coat: '#2a2a2a', trim: '#d94b3c', hat: 'tricorn', hatColor: '#1c1c1c' },
  { id: 'steampunk', name: 'Steampunk', cost: 20, coat: '#9a5b2e', trim: '#e0b35a', hat: 'tophat', hatColor: '#3b2a1e' },
  { id: 'disco', name: 'Disco', cost: 25, coat: '#e0479e', trim: '#ffe14d', hat: 'kepi', hatColor: '#9b2fd6' },
  { id: 'royal', name: 'Contrôleur royal', cost: 35, coat: '#5a2a9b', trim: '#ffd23f', hat: 'crown', hatColor: '#ffd23f' },
  { id: 'chefcook', name: 'Chef étoilé', cost: 20, coat: '#ffffff', trim: '#1e2a4a', hat: 'toque', hatColor: '#ffffff' },
  { id: 'cowboy', name: 'Shérif du rail', cost: 25, coat: '#7a5230', trim: '#e8c25a', hat: 'cowboy', hatColor: '#9c5a2c' },
  { id: 'nightshift', name: 'Équipe de nuit', cost: 30, coat: '#2b2f6b', trim: '#c9a46a', hat: 'kepi', hatColor: '#1b1b25' },
  { id: 'santa', name: 'Père Contrôleur', cost: 30, coat: '#d62828', trim: '#ffffff', hat: 'santa', hatColor: '#d62828' },
  { id: 'knight', name: 'Chevalier du rail', cost: 40, coat: '#b8c2cc', trim: '#d62828', hat: 'knight', hatColor: '#b8c2cc' },
  { id: 'unicorn', name: 'Licorne de service', cost: 45, coat: '#ffb3d9', trim: '#b388ff', hat: 'unicorn', hatColor: '#ffb3d9' },
];

G.RANKS = [
  { xp: 0, name: 'Stagiaire' },
  { xp: 400, name: 'Contrôleur' },
  { xp: 1500, name: 'Chef de brigade' },
  { xp: 4000, name: 'Inspecteur' },
  { xp: 8000, name: 'Inspecteur divisionnaire' },
  { xp: 15000, name: 'Légende du rail' },
];
G.rankOf = (xp) => {
  let i = 0;
  while (i + 1 < G.RANKS.length && xp >= G.RANKS[i + 1].xp) i++;
  const cur = G.RANKS[i];
  const next = G.RANKS[i + 1];
  return { index: i, name: cur.name, from: cur.xp, to: next ? next.xp : cur.xp, next: next ? next.name : null };
};

G.AD_CREATIVES = [
  { brand: 'Composteur 3000', line: 'Il composte même les chaussettes.', color: '#ff6b35' },
  { brand: 'Croissants Turbo', line: 'Croustillants en 0,3 seconde.', color: '#f2a93b' },
  { brand: 'Assurance Anti-Pigeon', line: 'Parce que ça n\'arrive pas qu\'aux autres.', color: '#3aa0ff' },
  { brand: 'Moustache Express', line: 'Une moustache livrée en 24 h.', color: '#8b5cf6' },
  { brand: 'Parapluie Turbo', line: "S'ouvre avant même qu'il pleuve.", color: '#2ec4b6' },
  { brand: 'Fromage du Mois', line: 'Un fromage par mois. Votre nez va adorer.', color: '#e0a800' },
  { brand: 'Chaussettes Connectées', line: 'Elles vous préviennent quand elles sont sales.', color: '#ff6b9a' },
  { brand: 'École de Mime', line: 'Inscriptions : …', color: '#5c677d' },
];

/* Configuration d'un niveau à partir de son index global (base 0).
   Courbe d'apprentissage : une seule règle nouvelle à la fois, avec plus de temps, moins de
   passagers et moins de fraudeurs dans le service qui l'introduit ; chaque règle active ajoute
   un peu de temps de lecture. */
G.levelConfig = (g) => {
  const cityIndex = Math.floor(g / G.LEVELS_PER_CITY);
  const city = G.CITIES[cityIndex];
  const i = g % G.LEVELS_PER_CITY;
  const boss = i === G.LEVELS_PER_CITY - 1;
  const r = G.rng(9173 + g * 131);
  const allRules = G.RULES.filter((ru) => ru.from <= g).map((ru) => ru.id);
  const rules = allRules.filter((x) => x !== 'day');
  const newRule = G.RULES.find((ru) => ru.from === g) || null;
  let count = 6 + Math.min(8, Math.floor(g / 3)) + (boss ? 4 : 0);
  let time = G.clamp(11.5 - g * 0.09, 6.4, 11.5) * city.timeMod + Math.max(0, rules.length - 4) * 0.3;
  let fraudRate = Math.min(0.56, 0.36 + g * 0.005 + (boss ? 0.06 : 0));
  if (newRule) {
    time += 1.5;
    fraudRate -= 0.08;
    count = Math.min(count, 9);
  }
  const mech = boss && G.BOSS_MECH[city.id] ? G.BOSS_MECH[city.id].id : null;
  if (mech === 'rush') count = 40;
  if (mech === 'dark') time += 2;
  if (mech === 'mustache' || mech === 'uvfake' || mech === 'memory') time += 1;
  if (mech === 'sway') time += 1.5;
  if (mech === 'oxygen') count = 22;
  const dayRule = allRules.includes('day') && !boss && (g === 24 || r.chance(0.6)) ? r.pick(G.DAY_RULES).id : null;
  return {
    g,
    cityIndex,
    city,
    i,
    boss,
    count,
    time,
    fraudRate,
    rules,
    newRule,
    dayRule,
    bossMech: mech,
    timeAttack: mech === 'rush' ? 75 : mech === 'oxygen' ? 45 : 0,
    o2: mech === 'oxygen',
    sway: mech === 'sway',
    rushTarget: mech === 'rush' ? 18 : 0,
    perfectFakes: mech === 'uvfake',
    dark: mech === 'dark',
    groupRate: mech === 'groups' ? 0.6 : rules.includes('group') ? 0.16 : 0,
    zoneReq: rules.includes('zone') ? r.int(2, 4) : 1,
    firstClass: rules.includes('class') ? boss || r.chance(0.75) : false,
    specialRate: g >= 3 ? (boss ? 0.05 : 0.11) : 0,
    bias: boss ? city.boss.bias : {},
    bossLook: boss ? city.boss.look || null : null,
    label: boss ? `${city.name} · Boss` : `${city.name} · Service ${i + 1}`,
  };
};

G.dailyConfig = () => {
  const key = Number(G.dayKey());
  const r = G.rng(key);
  return {
    g: 15,
    daily: true,
    cityIndex: key % G.CITIES.length,
    city: G.CITIES[key % G.CITIES.length],
    i: 0,
    boss: false,
    count: 10,
    time: 8,
    fraudRate: 0.45,
    rules: ['date', 'zone', 'photo', 'reduit', 'stamp'],
    newRule: null,
    dayRule: null,
    zoneReq: r.int(2, 4),
    specialRate: 0.1,
    bias: {},
    bossLook: null,
    seed: key,
    label: `Contrôle du jour #${G.dailyNumber()}`,
  };
};

G.isLevelUnlocked = (g) => {
  if (g === 0 || G.save.tester) return true;
  if (G.needsFull && G.needsFull(g)) return false; // ville du jeu complet
  return (G.save.levels[g - 1] || 0) > 0;
};
G.cityStars = (ci) => {
  let s = 0;
  for (let i = 0; i < G.LEVELS_PER_CITY; i++) s += G.save.levels[ci * G.LEVELS_PER_CITY + i] || 0;
  return s;
};

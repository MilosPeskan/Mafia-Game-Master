export const CONFIG = {
  MAX_PLAYERS: 20,
  MIN_PLAYERS: 4,
  MIN_NAME_LENGHT: 2,
  MAX_NAME_LENGTH: 20,
  VISITOR_NUMBER_OF_PLAYERS_MARKED: 3,
  VISITOR_EVENT_NIGHTS: 3
}

export const ROLE_IDS = {
  DETEKTIV: 1,
  DOKTOR: 2,
  SELJAK: 3,
  MAFIJAS: 4,
  KUM: 5,
  SAVETNIK: 6,
  PRATILAC: 7,
  SERIJSKI_UBICA: 8,
  LUDAK: 9,
  DZELAT: 10,
  VESTICA: 11,
  PIROMAN: 12,
  TELOHRANITELJ: 13,
  SERIF: 14,
  SPIJUN: 15,
  TRAGAC: 16,
  REDAKTOR: 17,
  ESKORT: 18,
  POGREBNIK: 19,
  AMNEZICAR: 20,
  TROVAC: 21,
  UCENJIVAC: 22,
  FALSIFIKATOR: 23,
  TUZILAC: 24,
  SNAJPERISTA: 25,
  REPORTER: 26,
  OSVETNIK: 27,
  SUDIJA: 28,
  POSETILAC: 29,
  TAMNICAR: 30,
  GRADONACELNIK: 31,
  PARAZIT:32
}

export const MESSAGES = {
  EMPTY_NAME: "Molimo unesite ime igrača!",
  NAME_EXISTS: (name) => `Igrač ${name} je već dodat u igru. Koristite drugo ime!`,
  NAME_TOO_LONG: (max) => `Ime ne može biti duže od ${max} karaktera!`,
  MAX_PLAYERS_REACHED: (max) => `Dostignut maksimum od ${max} igrača!`,
  BACK_CONFIRM: `Da li sigurno želite da se vratite? Progres će biti izgubljen.`,
  MISSING_ROLES: (number) => `Potrebno je dodati još ${number} uloga!`,
  NO_CURRENT_STEP: `Nema trenutnog koraka!`,
  MIN_PLAYERS_REQUIRED: `Igra mora da ima minimum ${CONFIG.MIN_PLAYERS} igrača!`
};

export const LYNCH_MESSAGE = {
  NO_VOTES: "Niko nije glasao, glasanje se preskače.",
  BASE: (name, votes) => `Sa ukupno ${votes} ${VOTES_PLURAL_INSTRUMENTAL(votes)}, izlasan je igrač ${name}.`,
  PROTECTED: (name, votes) => `<p>${LYNCH_MESSAGE.BASE(name, votes)} \n Sudija je zaštitio igrača ${name} </p><p> Igrač ${name} je preživeo! </p>`,
  LYNCHED: (name, votes) => `<p>${LYNCH_MESSAGE.BASE(name, votes)} \n Igrač ${name} je pogubljen! </p>`,
  TIE: (votes, names, last) => `<p>Niko nije izglasan, ukupno ${votes} ${VOTES_PLURAL_ACUSATIVE(votes)} imaju ${names} i ${last}.</p>`,
  JESTER: (votes, name) => `<p>${LYNCH_MESSAGE.LYNCHED(name, votes)} \n Igrač ${name} je bio ludak. \n Ludak je pobedio!</p>`,
  EXECUTIONER: (votes, name, executioner) => `<p>${LYNCH_MESSAGE.LYNCHED(name, votes)} Igrač ${name} je bio meta dželata ${executioner} \n Dželat je pobedio!</p>`,
  VISITOR: (votes, name) => `<p>${LYNCH_MESSAGE.LYNCHED(name, votes)} \n Igrač ${name} je bio posetilac. \n Pretnja je prestala!`
}

function VOTES_PLURAL_ACUSATIVE(votes) {
  if(votes == 1) return "glas"
  else if (votes > 1 && votes < 5) return "glasa"
  else return "glasova"
}

function VOTES_PLURAL_INSTRUMENTAL(votes) {
  if(votes == 1) return "glasom";
  else if (votes > 1 && votes < 5) return "glasa";
  else return "glasova";
}

export const WIN_MESSAGE = {
  TOWN_WIN: `Pobedio je grad!`,
  MAFIA_WIN: `Mafija je pobedila!`
}

export const ROLE_MESSAGE = {
  MAFIA_VISIT: (players) => `Mafija je posetila: ${players}`,
  VISITED: (player, visited) => `Igrač ${player} je posetio ${visited}`,
  VISITOR_EVENT: `Posetilac je posetio ${CONFIG.VISITOR_NUMBER_OF_PLAYERS_MARKED} igrača. Ako nakon ${CONFIG.VISITOR_EVENT_NIGHTS} noći posetilac i dalje bude živ, posetilac pobeđuje!`,
  VISITOR_STOPPED: `Posetilac je ubijen. Pretnja je nestala!`
}

export const UI_TEXT = {
  NARRATOR: "Narator",
  REVEAL_INSTRUCTION: "Zapamtite svoju ulogu i kliknite dugme da je sakrijete",
  HIDE_INSTRUCTION: "Predajte uređaj igraču",
  HIDE_INSTRUCTION_LAST: "Predajte uređaj naratoru"
};

export const IMAGES = [
  'paper1.png',
  'paper2.png',
  'paper3.png',
  'paper4.png',
  'paper5.png',
  'paper6.png',
  'paper7.png',
  'paper8.png',
  'paper9.png',
  'paper10.png',
  'paper11.png'
];

export const IMAGE_PATH = 'resourses/plates/'

export const GAME_PHASE = {
  INPUT_PLAYERS: "input players",
  SELECT_ROLES: "select roles",
  REVEAL_ROLES: "reveal roles",
  GAME_STARTED: "game started"
}

export const COLOR = {
  DEAD: "#4B4B4B",
  MAFIA: "#8f3636ff",
  NEUTRAL: "#944fa0ff",
  TOWN: "#4CAF50",
  CARD: "#f9f9f9",
  NON_SELECTABLE: "#000000ff",
  DOUSED: "#636819ff",
  BEWITCHED: "#f1327bff"
}

export const ROLE_REVEAL_TIMER = 500; //2.5 sekundi
export const DISCUSSION_TIMER = 300; // 5 minuta

export const PLAYER_ICONS = [
  "silueta1.png",
  "silueta2.png",
  "silueta3.png",
  "silueta4.png",
  "silueta5.png",
  "silueta6.png",
  "silueta7.png",
  "silueta8.png",
  "silueta9.png",
  "silueta10.png",
  "silueta11.png",
  "silueta12.png",
  "silueta13.png",
  "silueta14.png",
  "silueta15.png",
  "silueta16.png",
  "silueta17.png",
  "silueta18.png",
  "silueta19.png",
  "silueta20.png"
]

export const ALIGNMENT = {
  MAFIA:"Mafija",
  TOWN:"Selo",
  NEUTRAL_KILLING:"",
  NEUTRAL:"Neutralno"
}

export const ICON_PATH = "resourses/silluetes/";
export const DEAD_ICON_PATH = "resourses/silluetes/dead.png";

export const ORDER_OF_ROLES = [32, 20, 11, 18, 7, 30, 21, 23, 17, 1, 6, 19, 26, 28, 2, 13, 4, 15, 8, 12, 22, 29, 16];

export const STATUS = {
  INVESTIGATED:"istražen",
  PROTECTED:"zaštićen",
  ATTACK:"napadnut",
  BLOCKED:"blokiran",
  BEWITCHED:"omađijan",
  BEWITCHED_TARGET:"meta omađijanog",
  DOUSED:"poliven benzinom",
  IGNITED: "zapaljen",
  BODYGUARDED: (player) => `zaštićen telohraniteljem ${player}`,
  TRACKED:"praćen",
  CENSORED:"cenzurisan",
  DUG_UP:"iskopan",
  AMESIAC_TARGET:"meta amnezičara",
  CONFUSED:"zbunjen",
  SILENCED:"ućutkan",
  FALSIFIED:"falsifikovan",
  RECORDED:"snimljen",
  JUDGED:"suđen",
  MARKED_BY_VISITOR:"označen od posetioca",
  LOCKED_UP:"zatvoren",
  PARASITE_TARGET:"parazitovan"
}
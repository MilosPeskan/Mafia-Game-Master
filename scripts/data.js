export const ROLES = {
  1: { 
    role: "Detektiv", 
    alignment: "Selo", 
    category: "Istraživačka", 
    description: "Tokom noći može izabrati jednog igrača i saznati njegovu tačnu ulogu." 
  },
  2: { 
    role: "Doktor", 
    alignment: "Selo", 
    category: "Zaštitna", 
    description: "Tokom noći može izabrati jednog igrača i zaštititi ga od ubistva te noći." 
  },
  3: { 
    role: "Seljak", 
    alignment: "Selo", 
    category: "Obična", 
    description: "Nema posebnu sposobnost. Učestvuje samo u diskusiji i glasanju." 
  },
  4: { 
    role: "Mafijaš", 
    alignment: "Mafija", 
    category: "Ubilačka", 
    description: "Tokom noći, zajedno sa mafijom, bira metu za ubistvo." 
  },
  5: { 
    role: "Kum", 
    alignment: "Mafija", 
    category: "Ubilačka", 
    description: "Vođa mafije koji bira konačnu metu za ubistvo. Pri istraživanju može izgledati kao član Sela.",
    hasMaximum: 1
  },
  6: { 
    role: "Savetnik", 
    alignment: "Mafija", 
    category: "Istraživačka", 
    description: "Tokom noći može izabrati jednog igrača i saznati njegovu tačnu ulogu." 
  },
  7: { 
    role: "Pratilac", 
    alignment: "Mafija", 
    category: "Kontrolna", 
    description: "Tokom noći može izabrati jednog igrača i blokirati njegovu noćnu sposobnost." 
  },
  8: { 
    role: "Serijski ubica", 
    alignment: "Neutralna", 
    category: "Ubilačka", 
    description: "Tokom noći samostalno bira jednog igrača za ubistvo. Pobeđuje ako ostane poslednji živ." 
  },
  9: { 
    role: "Ludak", 
    alignment: "Neutralna", 
    category: "Haotična", 
    description: "Pobeđuje ako bude izglasan i pogubljen tokom dana." 
  },
  10: { 
    role: "Dželat", 
    alignment: "Neutralna", 
    category: "Haotična", 
    description: "Na početku igre dobija metu. Pobeđuje ako ta meta bude pogubljena glasanjem." 
  },
  11: { 
    role: "Veštica", 
    alignment: "Neutralna", 
    category: "Kontrolna", 
    description: "Tokom noći može preusmeriti sposobnost jednog igrača na drugu metu.",
    toBeAdded: 1
  },
  12: { 
    role: "Piroman", 
    alignment: "Neutralna", 
    category: "Ubilačka", 
    description: "Tokom noći može polivati igrača benzinom ili zapaliti sve polivene mete.",
    hasMaximum: 1
  },
  13: { 
    role: "Telohranitelj", 
    alignment: "Selo", 
    category: "Zaštitna", 
    description: "Tokom noći može čuvati jednog igrača. Ako je meta napadnuta, telohranitelj umire umesto nje." 
  },
  14: { 
    role: "Šerif", 
    alignment: "Selo", 
    category: "Ubilačka", 
    description: "Jednom tokom igre, tokom dana, može izabrati jednog igrača i odmah ga ubiti.",
    toBeAdded: 1
  },
  15: { 
    role: "Špijun", 
    alignment: "Selo", 
    category: "Istraživačka", 
    description: "Tokom noći vidi sve igrače koje je mafija posetila." 
  },
  16: { 
    role: "Tragač", 
    alignment: "Selo", 
    category: "Istraživačka", 
    description: "Tokom noći može izabrati jednog igrača i saznati koga je posetio." 
  },
  17: { 
    role: "Redaktor", 
    alignment: "Mafija", 
    category: "Kontrolna", 
    description: "Tokom noći bira jednog igrača. Sve informacije o tom igraču postaju cenzurisane." 
  },
  18: { 
    role: "Eskort", 
    alignment: "Selo", 
    category: "Kontrolna", 
    description: "Tokom noći može blokirati sposobnost jednog igrača." 
  },
  19: { 
    role: "Pogrebnik", 
    alignment: "Selo", 
    category: "Istraživačka", 
    description: "Tokom noći bira jednog mrtvog igrača i saznaje njegovu stranu." 
  },
  20: { 
    role: "Amnezičar", 
    alignment: "Neutralna", 
    category: "Fleksibilna", 
    description: "Tokom noći može preuzeti ulogu jednog mrtvog igrača.",
    hasMaximum: 1 
  },
  21: {
    role: "Trovač",
    alignment: "Mafija",
    category: "Obmanjujuća",
    description: "Tokom noći može izabrati jednog igrača. Istraživačke uloge dobijaju lažne informacije o toj meti."
  },
  22: {
    role: "Ucenjivač",
    alignment: "Mafija",
    category: "Kontrolna",
    description: "Tokom noći može izabrati igrača koji sledeći dan ne može govoriti."
  },
  23: {
    role: "Falsifikator",
    alignment: "Mafija",
    category: "Obmanjujuća",
    description: "Tokom noći označi igrača koji pri istraživanju izgleda kao član Mafije."
  },
  24: {
    role: "Tužilac",
    alignment: "Selo",
    category: "Kontrolna",
    description: "Može pokrenuti specijalno suđenje gde samo on glasa o pogubljenju mete. Samo jednom može da pogubi.",
    hasMaximum: 1,
    toBeAdded: 1
  },
  25: {
    role: "Snajperista",
    alignment: "Mafija",
    category: "Ubilačka",
    description: "Tokom dana može pokušati atentat. Ako tačno pogodi ulogu mete, ona umire.",
    hasMaximum: 1,
    toBeAdded: 1
  },
  26: {
    role: "Reporter",
    alignment: "Selo",
    category: "Istraživačka",
    description: "Tokom noći bira igrača. Ako ta meta umre, otkriva se njen ubica."
  },
  27: {
    role: "Osvetnik",
    alignment: "Selo",
    category: "Haotična",
    description: "Kada umre, može izabrati jednog igrača koji će takođe biti ubijen.",
    toBeAdded: 1
  },
  28: {
    role: "Sudija",
    alignment: "Selo",
    category: "Zaštitna",
    description: "Tokom noći može zaštititi jednog igrača od pogubljenja sledećeg dana.",
    hasMaximum: 1
  },
  29: {
    role: "Posetilac",
    alignment: "Neutralna",
    category: "Haotična",
    description: "Tokom noći označava igrače. Ukoliko postoje tri žive označene mete, počinje odbrojavanje nakon kog automatski pobeđuje."
  },
  30: {
    role: "Tamničar",
    alignment: "Selo",
    category: "Kontrolna",
    description: "Tokom noći može zatvoriti jednog igrača. Taj igrač ne može da koristi sposobnosti i ne može biti ubijen te noći."
  },
  31: {
    role: "Gradonačelnik",
    alignment: "Selo",
    category: "Pomoćna",
    description: "Jednom tokom igre može učiniti da njegov glas vredi kao tri glasa.",
    hasMaximum: 1,
    toBeAdded: 1
  },
  32: {
    role: "Parazit",
    alignment: "Neutralna",
    category: "Haotična",
    description: "Tokom noći bira jednog igrača, ako taj igrač umre, preuzima ulogu tog igrača.",
    hasMaximum: 1
  }
};

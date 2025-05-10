import { configDotenv } from "dotenv";

const config = {
  prefix: "?",
  guild_id: "1125008815272759408",
  channels: {
    intros: "1125014789450641458",
    tickets: "1125813015485370538",
    roles: "1125076347417538681",
    announcements: "1125854117408026655",
    sfw_selfies: "1125087513615290409",
    did_session: "1139509140050415616",
    session_counter: "1136035878414864494",
    hypno_oc: "1125080833842229338",
    hypno_rc: "1125081114923507735",
    files: "1125089010822434866",
    nsfw_selfies: "1125095139212263516",
    strikes: "1125847005609082900",
    looking_for_tist: "1125024527932456960",
    looking_for_sub: "1125080015210557492",
    system_log: "1125070879525715978",
    ticket_log: "1125812635141669005",
    info_centre: "1158521239174918195",
  },
  roles: {
    mod: "1125012454699704373",
    member: "1125484694134341744",
    accepted: "1125830822801457306",
    announcements: "1194055463889797140",
    hoc: "1198646662160195695",
    gaming: "1194055463889797140",
    minecraft: "1284887182900985947",
    now_announce: {
      hypnotist: "1156298225523896321",
      switch: "1156298728475476018",
      subject: "1156298677695025172",
      undecided: "1156298728475476018",
    },
    primary: {
      hypnotist: "1125010023534305321",
      switch: "1125071348394365038",
      subject: "1125010083173105674",
      undecided: "1125071834065404027",
    },
    dms: {
      open: "1126195216567783454",
      ask: "1126195136292995143",
    },
    session: {
      open: "1125492372436959363",
      maybe: "1143277273743638660",
      closed: "1125492444264403045",
      text: "1155586410556960888",
      voice: "1155586432992284743",
      video: "1155586463027703850",
      in_person: "1155586478697615380",
      covert: "1158508017940168844",
    },
    continent: [
      {
        desc: "Western Canada",
        role: "1284885668853714975",
      },
      {
        desc: "Central Canada",
        role: "1284885997175312497",
      },
      {
        desc: "Eastern Canada",
        role: "1284886035406520320",
      },
      {
        desc: "West US",
        role: "1284886065848647731",
      },
      {
        desc: "South US",
        role: "1284886117912543353",
      },
      {
        desc: "Midwest US",
        role: "1284886218018127895",
      },
      {
        desc: "Northeast US",
        role: "1284886259038290085",
      },
      {
        desc: "Central Continental America",
        role: "1284886395382534214",
      },
      {
        desc: "Caribbean",
        role: "1284886444263080009",
      },
      {
        desc: "Latin South America",
        role: "1284886484922400778",
      },
      {
        desc: "Brazil",
        role: "1284886569777369258",
      },
      {
        desc: "Scandinavia",
        role: "1284886608981786665",
      },
      {
        desc: "Western Europe",
        role: "1284886676065488908",
      },
      {
        desc: "Eastern Europe",
        role: "1284886703214952553",
      },
      {
        desc: "North Africa",
        role: "1284886729748123730",
      },
      {
        desc: "Sub-Saharan Africa",
        role: "1284886759863226463",
      },
      {
        desc: "Middle East",
        role: "1284886804771897344",
      },
      {
        desc: "South Asia",
        role: "1284886857519333417",
      },
      {
        desc: "East Asia",
        role: "1284886895150501939",
      },
      {
        desc: "Southeast Asia",
        role: "1284886923151675443",
      },
      {
        desc: "Oceania",
        role: "1284886950461050901",
      },
    ],
  },
  categories: {
    issues: "1128239530022015108",
    applications: "1128239441459286058",
    misc: "1184172707424764013",
    overflow: "1128239504050896999",
  },
};

const configDev = {
  prefix: "??",
  guild_id: "1311679215279804506",
  channels: {
    intros: "1311679215829127182",
    tickets: "1311679215829127179",
    roles: "1311679215829127180",
    announcements: "1325116493339562066",
    sfw_selfies: "1325121281208746116",
    did_session: "1311679217036951586",
    session_counter: "1311679217036951585",
    hypno_oc: "1311679217502781460",
    hypno_rc: "1311679217502781461",
    files: "1311679217502781462",
    nsfw_selfies: "1311679217502781466",
    strikes: "1311679218438111308",
    looking_for_tist: "1311679217036951588",
    looking_for_sub: "1311679217036951589",
    system_log: "1311679218438111310",
    ticket_log: "1311679218438111309",
    info_centre: "1311679216907194377",
  },
  roles: {
    mod: "1311679215371944016",
    member: "1311679215325941851",
    accepted: "1311679215325941852",
    announcements: "1311679215313227833",
    hoc: "1311679215313227834",
    gaming: "1311679215313227835",
    minecraft: "1311679215279804507",
    now_announce: {
      hypnotist: "1311679215313227832",
      switch: "1311679215313227830",
      subject: "1311679215313227831",
      undecided: "1311679215313227830",
    },
    primary: {
      hypnotist: "1311679215371944015",
      switch: "1311679215371944014",
      subject: "1311679215371944013",
      undecided: "1311679215371944012",
    },
    dms: {
      open: "1311679215371944011",
      ask: "1311679215371944010",
    },
    session: {
      open: "1311679215371944009",
      maybe: "1311679215371944008",
      closed: "1311679215371944007",
      text: "1311679215363686479",
      voice: "1311679215363686478",
      video: "1311679215363686477",
      in_person: "1311679215363686476",
      covert: "1311679215363686475",
    },
    continent: [
      {
        desc: "Western Canada",
        role: "1311679215313227828",
      },
      {
        desc: "Central Canada",
        role: "1311679215313227827",
      },
      {
        desc: "Eastern Canada",
        role: "1311679215313227826",
      },
      {
        desc: "West US",
        role: "1311679215300513891",
      },
      {
        desc: "South US",
        role: "1311679215300513890",
      },
      {
        desc: "Midwest US",
        role: "1311679215300513889",
      },
      {
        desc: "Northeast US",
        role: "1311679215300513888",
      },
      {
        desc: "Central Continental America",
        role: "1311679215300513887",
      },
      {
        desc: "Caribbean",
        role: "1311679215300513886",
      },
      {
        desc: "Latin South America",
        role: "1311679215300513885",
      },
      {
        desc: "Brazil",
        role: "1311679215300513884",
      },
      {
        desc: "Scandinavia",
        role: "1311679215300513883",
      },
      {
        desc: "Western Europe",
        role: "1311679215300513882",
      },
      {
        desc: "Eastern Europe",
        role: "1311679215279804515",
      },
      {
        desc: "North Africa",
        role: "1311679215279804514",
      },
      {
        desc: "Sub-Saharan Africa",
        role: "1311679215279804513",
      },
      {
        desc: "Middle East",
        role: "1311679215279804512",
      },
      {
        desc: "South Asia",
        role: "1311679215279804511",
      },
      {
        desc: "East Asia",
        role: "1311679215279804510",
      },
      {
        desc: "Southeast Asia",
        role: "1311679215279804509",
      },
      {
        desc: "Oceania",
        role: "1311679215279804508",
      },
    ],
  },
  categories: {
    issues: "1311679218647695502",
    applications: "1311679218647695497",
    misc: "1311679218647695498",
    overflow: "1311679218647695506",
  },
};

const configNames = {
  prefix: "?",
  channels: {
    intros: "intros",
    tickets: "tickets",
    roles: "roles",
    announcements: "announcements",
    sfw_selfies: "sfw-selfies",
    did_session: "i-did-a-session",
    session_counter: "session-counter",
    hypno_oc: "hypno-original-content",
    hypno_rc: "hypno-related-content",
    files: "files-scripts-spirals-videos",
    nsfw_selfies: "nsfw-selfies",
    strikes: "strikes",
    looking_for_tist: "looking-for-tist",
    looking_for_sub: "looking-for-sub",
    system_log: "system-log",
    ticket_log: "ticket-log",
    info_centre: "info-centre",
  },
  roles: {
    mod: "mod",
    member: "member",
    accepted: "accepted",
    announcements: "announcements",
    hoc: "hoc",
    gaming: "gaming",
    minecraft: "minecraft",
    now_announce: {
      hypnotist: "ht-now",
      switch: "sw-now",
      subject: "sb-now",
      undecided: "sw-now",
    },
    primary: {
      hypnotist: "hypnotist",
      switch: "switch",
      subject: "subject",
      undecided: "undecided",
    },
    dms: {
      open: "Open to DMs",
      ask: "Ask to DM",
    },
    session: {
      open: "open for session",
      maybe: "may be open for session",
      closed: "not open for session",
      text: "text",
      voice: "voice",
      video: "video",
      in_person: "in-person",
      covert: "covert",
    },
    continents: {
      wc: "Western Canada",
      cc: "Central Canada",
      ec: "Eastern Canada",
      wu: "West US",
      su: "South US",
      mw: "Midwest US",
      ne: "Northeast US",
      cca: "Central Continental America",
      car: "Caribbean",
      lsa: "Latin South America",
      br: "Brazil",
      sca: "Scandinavia",
      we: "Western Europe",
      ee: "Eastern Europe",
      na: "North Africa",
      ssa: "Sub-Saharan Africa",
      me: "Middle East",
      sa: "South Asia",
      ea: "East Asia",
      sea: "Southeast Asia",
      oc: "Oceania",
    },
  },
  categories: {
    issues: "issues",
    applications: "applications",
    misc: "misc",
    overflow: "overflow",
  },
};

function getConfig() {
  configDotenv();
  if (process.env.EXEC_ENV === "development") {
    console.log("Running in development mode");
    return configDev
  } else {
    console.log("Running in production mode");
    return config
  }
}

export default getConfig();

function getNameConfigFunc() {
  configDotenv();
  return configNames;
}

export const getNameConfig = getNameConfigFunc();

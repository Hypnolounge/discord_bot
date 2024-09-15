import { configDotenv } from "dotenv";

const config = {
  prefix: "?",
  channels: {
    intros: "1125014789450641458",
    tickets: "1125813015485370538",
    roles: "1125076347417538681",
    announcements: "1125854117408026655",
    sfw_selfies: "1125087513615290409",
    stats: "1136947478801944637",
    did_session: "1139509140050415616",
    hypno_oc: "1125080833842229338",
    hypno_rc: "1125081114923507735",
    files: "1125089010822434866",
    nsfw_selfies: "1125095139212263516",
    strikes: "1125847005609082900",
    looking_for_tist: "1125024527932456960",
    looking_for_sub: "1125080015210557492",
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
    issues: "123456789012345678",
    applications: "123456789012345678",
    misc: "123456789012345678",
    overflow: "1128239504050896999",
  },
};

function getConfig() {
  configDotenv();
  if (process.env.NODE_ENV === "development") {
    console.log("Running in development mode");
    config.prefix = "??";
    config.channels = {
      intros: "1248249254569443399",
      tickets: "1248249254569443399",
      roles: "1248249254569443399",
      announcements: "1248249254569443399",
      sfw_selfies: "1248249254569443399",
      stats: "1248249254569443399",
      did_session: "1248249254569443399",
      hypno_oc: "1248249254569443399",
      hypno_rc: "1248249254569443399",
      files: "1248249254569443399",
      nsfw_selfies: "1248249254569443399",
      strikes: "1248249254569443399",
      looking_for_tist: "1248249254569443399",
      looking_for_sub: "1248249254569443399",
    };
  } else {
    console.log("Running in production mode");
  }
  return config;
}

export default getConfig();

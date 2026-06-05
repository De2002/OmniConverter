// Server-side rendered Length converter routes for Omni Converter.
// Generated from the complete length unit list supplied for the /length subfolder.

const SITE = 'https://omniconverter.cyou';

const UNITS = [
  {
    "name": "kilometer",
    "symbol": "km",
    "meter": 1000,
    "slug": "kilometer"
  },
  {
    "name": "meter",
    "symbol": "m",
    "meter": 1,
    "slug": "meter"
  },
  {
    "name": "decimeter",
    "symbol": "dm",
    "meter": 0.1,
    "slug": "decimeter"
  },
  {
    "name": "centimeter",
    "symbol": "cm",
    "meter": 0.01,
    "slug": "centimeter"
  },
  {
    "name": "millimeter",
    "symbol": "mm",
    "meter": 0.001,
    "slug": "millimeter"
  },
  {
    "name": "micrometer",
    "symbol": "µm",
    "meter": 0.000001,
    "slug": "micrometer"
  },
  {
    "name": "nanometer",
    "symbol": "nm",
    "meter": 1e-9,
    "slug": "nanometer"
  },
  {
    "name": "mile",
    "symbol": "mi, mi(Int)",
    "meter": 1609.344,
    "slug": "mile"
  },
  {
    "name": "yard",
    "symbol": "yd",
    "meter": 0.9144,
    "slug": "yard"
  },
  {
    "name": "foot",
    "symbol": "ft",
    "meter": 0.3048,
    "slug": "foot"
  },
  {
    "name": "inch",
    "symbol": "in",
    "meter": 0.0254,
    "slug": "inch"
  },
  {
    "name": "light year",
    "symbol": "ly",
    "meter": 9460730472580000,
    "slug": "light-year"
  },
  {
    "name": "exameter",
    "symbol": "Em",
    "meter": 1000000000000000000,
    "slug": "exameter"
  },
  {
    "name": "petameter",
    "symbol": "Pm",
    "meter": 1000000000000000,
    "slug": "petameter"
  },
  {
    "name": "terameter",
    "symbol": "Tm",
    "meter": 1000000000000,
    "slug": "terameter"
  },
  {
    "name": "gigameter",
    "symbol": "Gm",
    "meter": 1000000000,
    "slug": "gigameter"
  },
  {
    "name": "megameter",
    "symbol": "Mm",
    "meter": 1000000,
    "slug": "megameter"
  },
  {
    "name": "hectometer",
    "symbol": "hm",
    "meter": 100,
    "slug": "hectometer"
  },
  {
    "name": "dekameter",
    "symbol": "dam",
    "meter": 10,
    "slug": "dekameter"
  },
  {
    "name": "micron",
    "symbol": "µ",
    "meter": 0.000001,
    "slug": "micron"
  },
  {
    "name": "picometer",
    "symbol": "pm",
    "meter": 1e-12,
    "slug": "picometer"
  },
  {
    "name": "femtometer",
    "symbol": "fm",
    "meter": 1e-15,
    "slug": "femtometer"
  },
  {
    "name": "attometer",
    "symbol": "am",
    "meter": 1e-18,
    "slug": "attometer"
  },
  {
    "name": "megaparsec",
    "symbol": "Mpc",
    "meter": 3.08567758128e+22,
    "slug": "megaparsec"
  },
  {
    "name": "kiloparsec",
    "symbol": "kpc",
    "meter": 30856775812800000000,
    "slug": "kiloparsec"
  },
  {
    "name": "parsec",
    "symbol": "pc",
    "meter": 30856775812800000,
    "slug": "parsec"
  },
  {
    "name": "astronomical unit",
    "symbol": "AU, UA",
    "meter": 149597870691,
    "slug": "astronomical-unit"
  },
  {
    "name": "league",
    "symbol": "lea",
    "meter": 4828.032,
    "slug": "league"
  },
  {
    "name": "nautical league (UK)",
    "symbol": "",
    "meter": 5559.552,
    "slug": "nautical-league-uk"
  },
  {
    "name": "nautical league (int.)",
    "symbol": "",
    "meter": 5556,
    "slug": "nautical-league-int"
  },
  {
    "name": "league (statute)",
    "symbol": "st.league",
    "meter": 4828.0416560833,
    "slug": "league-statute"
  },
  {
    "name": "nautical mile (UK)",
    "symbol": "NM (UK)",
    "meter": 1853.184,
    "slug": "nautical-mile-uk"
  },
  {
    "name": "nautical mile (international)",
    "symbol": "",
    "meter": 1852,
    "slug": "nautical-mile-international"
  },
  {
    "name": "mile (statute)",
    "symbol": "mi, mi (US)",
    "meter": 1609.3472186944,
    "slug": "mile-statute"
  },
  {
    "name": "mile (US survey)",
    "symbol": "mi",
    "meter": 1609.3472186944,
    "slug": "mile-us-survey"
  },
  {
    "name": "mile (Roman)",
    "symbol": "",
    "meter": 1479.804,
    "slug": "mile-roman"
  },
  {
    "name": "kiloyard",
    "symbol": "kyd",
    "meter": 914.4,
    "slug": "kiloyard"
  },
  {
    "name": "furlong",
    "symbol": "fur",
    "meter": 201.168,
    "slug": "furlong"
  },
  {
    "name": "furlong (US survey)",
    "symbol": "fur",
    "meter": 201.1684023368,
    "slug": "furlong-us-survey"
  },
  {
    "name": "chain",
    "symbol": "ch",
    "meter": 20.1168,
    "slug": "chain"
  },
  {
    "name": "chain (US survey)",
    "symbol": "ch",
    "meter": 20.1168402337,
    "slug": "chain-us-survey"
  },
  {
    "name": "rope",
    "symbol": "",
    "meter": 6.096,
    "slug": "rope"
  },
  {
    "name": "rod",
    "symbol": "rd",
    "meter": 5.0292,
    "slug": "rod"
  },
  {
    "name": "rod (US survey)",
    "symbol": "rd",
    "meter": 5.0292100584,
    "slug": "rod-us-survey"
  },
  {
    "name": "perch",
    "symbol": "",
    "meter": 5.0292,
    "slug": "perch"
  },
  {
    "name": "pole",
    "symbol": "",
    "meter": 5.0292,
    "slug": "pole"
  },
  {
    "name": "fathom",
    "symbol": "fath",
    "meter": 1.8288,
    "slug": "fathom"
  },
  {
    "name": "fathom (US survey)",
    "symbol": "fath",
    "meter": 1.8288036576,
    "slug": "fathom-us-survey"
  },
  {
    "name": "ell",
    "symbol": "",
    "meter": 1.143,
    "slug": "ell"
  },
  {
    "name": "foot (US survey)",
    "symbol": "ft",
    "meter": 0.3048006096,
    "slug": "foot-us-survey"
  },
  {
    "name": "link",
    "symbol": "li",
    "meter": 0.201168,
    "slug": "link"
  },
  {
    "name": "link (US survey)",
    "symbol": "li",
    "meter": 0.2011684023,
    "slug": "link-us-survey"
  },
  {
    "name": "cubit (UK)",
    "symbol": "",
    "meter": 0.4572,
    "slug": "cubit-uk"
  },
  {
    "name": "hand",
    "symbol": "",
    "meter": 0.1016,
    "slug": "hand"
  },
  {
    "name": "span (cloth)",
    "symbol": "",
    "meter": 0.2286,
    "slug": "span-cloth"
  },
  {
    "name": "finger (cloth)",
    "symbol": "",
    "meter": 0.1143,
    "slug": "finger-cloth"
  },
  {
    "name": "nail (cloth)",
    "symbol": "",
    "meter": 0.05715,
    "slug": "nail-cloth"
  },
  {
    "name": "inch (US survey)",
    "symbol": "in",
    "meter": 0.0254000508,
    "slug": "inch-us-survey"
  },
  {
    "name": "barleycorn",
    "symbol": "",
    "meter": 0.0084666667,
    "slug": "barleycorn"
  },
  {
    "name": "mil",
    "symbol": "mil, thou",
    "meter": 0.0000254,
    "slug": "mil"
  },
  {
    "name": "microinch",
    "symbol": "",
    "meter": 2.54e-8,
    "slug": "microinch"
  },
  {
    "name": "angstrom",
    "symbol": "A",
    "meter": 1e-10,
    "slug": "angstrom"
  },
  {
    "name": "a.u. of length",
    "symbol": "a.u., b",
    "meter": 5.2917724900001e-11,
    "slug": "au-of-length"
  },
  {
    "name": "X-unit",
    "symbol": "X",
    "meter": 1.00208e-13,
    "slug": "x-unit"
  },
  {
    "name": "fermi",
    "symbol": "F, f",
    "meter": 1e-15,
    "slug": "fermi"
  },
  {
    "name": "arpent",
    "symbol": "",
    "meter": 58.5216,
    "slug": "arpent"
  },
  {
    "name": "pica",
    "symbol": "",
    "meter": 0.0042333333,
    "slug": "pica"
  },
  {
    "name": "point",
    "symbol": "",
    "meter": 0.0003527778,
    "slug": "point"
  },
  {
    "name": "twip",
    "symbol": "",
    "meter": 0.0000176389,
    "slug": "twip"
  },
  {
    "name": "aln",
    "symbol": "",
    "meter": 0.5937777778,
    "slug": "aln"
  },
  {
    "name": "famn",
    "symbol": "",
    "meter": 1.7813333333,
    "slug": "famn"
  },
  {
    "name": "caliber",
    "symbol": "cl",
    "meter": 0.000254,
    "slug": "caliber"
  },
  {
    "name": "centiinch",
    "symbol": "cin",
    "meter": 0.000254,
    "slug": "centiinch"
  },
  {
    "name": "ken",
    "symbol": "",
    "meter": 2.11836,
    "slug": "ken"
  },
  {
    "name": "Russian archin",
    "symbol": "",
    "meter": 0.7112,
    "slug": "russian-archin"
  },
  {
    "name": "Roman actus",
    "symbol": "",
    "meter": 35.47872,
    "slug": "roman-actus"
  },
  {
    "name": "vara de tarea",
    "symbol": "",
    "meter": 2.505456,
    "slug": "vara-de-tarea"
  },
  {
    "name": "vara conuquera",
    "symbol": "",
    "meter": 2.505456,
    "slug": "vara-conuquera"
  },
  {
    "name": "vara castellana",
    "symbol": "",
    "meter": 0.835152,
    "slug": "vara-castellana"
  },
  {
    "name": "cubit (Greek)",
    "symbol": "",
    "meter": 0.462788,
    "slug": "cubit-greek"
  },
  {
    "name": "long reed",
    "symbol": "",
    "meter": 3.2004,
    "slug": "long-reed"
  },
  {
    "name": "reed",
    "symbol": "",
    "meter": 2.7432,
    "slug": "reed"
  },
  {
    "name": "long cubit",
    "symbol": "",
    "meter": 0.5334,
    "slug": "long-cubit"
  },
  {
    "name": "handbreadth",
    "symbol": "",
    "meter": 0.0762,
    "slug": "handbreadth"
  },
  {
    "name": "fingerbreadth",
    "symbol": "",
    "meter": 0.01905,
    "slug": "fingerbreadth"
  },
  {
    "name": "Planck length",
    "symbol": "",
    "meter": 1.61605e-35,
    "slug": "planck-length"
  },
  {
    "name": "Electron radius (classical)",
    "symbol": "",
    "meter": 2.81794092e-15,
    "slug": "electron-radius-classical"
  },
  {
    "name": "Bohr radius",
    "symbol": "b, a.u.",
    "meter": 5.2917724900001e-11,
    "slug": "bohr-radius"
  },
  {
    "name": "Earth's equatorial radius",
    "symbol": "",
    "meter": 6378160,
    "slug": "earths-equatorial-radius"
  },
  {
    "name": "Earth's polar radius",
    "symbol": "",
    "meter": 6356776.9999999,
    "slug": "earths-polar-radius"
  },
  {
    "name": "Earth's distance from sun",
    "symbol": "",
    "meter": 149600000000,
    "slug": "earths-distance-from-sun"
  },
  {
    "name": "Sun's radius",
    "symbol": "",
    "meter": 696000000,
    "slug": "suns-radius"
  }
];

module.exports = { SITE, UNITS };

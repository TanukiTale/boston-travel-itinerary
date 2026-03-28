import type { DayTemplate, Place } from "../types";

export interface MbtaOverride {
  minutes: number;
  directions: string;
  reverseDirections?: string;
}

export const HOTEL_BASE: Place = {
  id: "westin-seaport",
  name: "The Westin Boston Seaport District",
  category: "conference",
  neighborhood: "Seaport",
  address: "425 Summer St, Boston, MA 02210",
  lat: 42.3468,
  lng: -71.0422,
  visitDurationMins: 0,
  description: "Hotel base at 425 Summer St, Boston.",
  infoUrl:
    "https://www.marriott.com/en-us/hotels/bosow-the-westin-boston-seaport-district/overview/",
  infoLabel: "Hotel details"
};

export const CONFERENCE_VENUE: Place = {
  id: "thinktransit-conference",
  name: "ThinkTransit Conference (BCEC area)",
  category: "conference",
  neighborhood: "Seaport",
  address: "415 Summer St, Boston, MA 02210",
  lat: 42.3458,
  lng: -71.0457,
  visitDurationMins: 0,
  description: "Primary daytime conference venue near the hotel."
};

export const BOSTON_PLACES: Place[] = [
  {
    id: "freedom-trail-walk-tour",
    name: "Freedom Trail Walk Into History Tour",
    category: "historic",
    neighborhood: "Downtown",
    priceLevel: "$$",
    lat: 42.355,
    lng: -71.0649,
    visitDurationMins: 90,
    isFreedomTrailStop: true,
    description:
      "Guided 90-minute Freedom Trail tour starting at Boston Common Visitor Information Center.",
    infoUrl: "https://www.thefreedomtrail.org/tours/walk-history",
    infoLabel: "Tour details"
  },
  {
    id: "city-view-bike-tour",
    name: "Urban AdvenTours City View Bike Tour",
    category: "viewpoint",
    neighborhood: "Waterfront",
    priceLevel: "$$$",
    lat: 42.3603,
    lng: -71.0511,
    visitDurationMins: 180,
    description:
      "Guided bike tour that covers key historic and waterfront areas; check in 30 minutes before start.",
    infoUrl: "https://www.urbanadventours.com/bike-tours/city-view/",
    infoLabel: "Book bike tour"
  },
  {
    id: "paul-revere-house",
    name: "Paul Revere House",
    category: "historic",
    neighborhood: "North End",
    lat: 42.3637,
    lng: -71.0537,
    visitDurationMins: 45,
    isFreedomTrailStop: true,
    description: "Compact historic stop in the heart of old Boston.",
    infoUrl: "https://www.paulreverehouse.org/",
    infoLabel: "Official site"
  },
  {
    id: "old-north-church",
    name: "Old North Church",
    category: "historic",
    neighborhood: "North End",
    lat: 42.3664,
    lng: -71.0544,
    visitDurationMins: 40,
    isFreedomTrailStop: true,
    description: "Historic church tied to the famous lantern signal.",
    infoUrl: "https://www.oldnorth.com/",
    infoLabel: "Official site"
  },
  {
    id: "quincy-market",
    name: "Quincy Market + Faneuil Hall",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3601,
    lng: -71.0568,
    visitDurationMins: 50,
    isFreedomTrailStop: true,
    description: "Historic market district with lively street energy.",
    infoUrl: "https://www.nps.gov/thingstodo/visit-historic-faneuil-hall.htm",
    infoLabel: "Visitor info"
  },
  {
    id: "boston-common-loop",
    name: "Boston Common + Frog Pond Loop",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3550,
    lng: -71.0656,
    visitDurationMins: 45,
    isFreedomTrailStop: true,
    description: "Classic central-green loop through Boston Common and Frog Pond.",
    infoUrl: "https://www.boston.gov/parks/boston-common",
    infoLabel: "Park info"
  },
  {
    id: "granary-burying-ground",
    name: "Granary Burying Ground",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3573,
    lng: -71.0617,
    visitDurationMins: 35,
    isFreedomTrailStop: true,
    description:
      "Revolutionary-era cemetery with major colonial figures on the Freedom Trail.",
    infoUrl: "https://www.thefreedomtrail.org/site/granary-burying-ground",
    infoLabel: "Site history"
  },
  {
    id: "state-house-stop",
    name: "Massachusetts State House + Beacon Hill Steps",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3588,
    lng: -71.0638,
    visitDurationMins: 40,
    isFreedomTrailStop: true,
    description: "Gold-domed landmark with iconic brick streets nearby.",
    infoUrl: "https://malegislature.gov/StateHouse/Tour",
    infoLabel: "Tour info"
  },
  {
    id: "beacon-hill-stroll",
    name: "Acorn Street + Beacon Hill Stroll",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3587,
    lng: -71.0675,
    visitDurationMins: 65,
    description:
      "Walk down Acorn Street first, then continue through nearby Beacon Hill lanes and Louisburg Square.",
    infoUrl: "https://www.boston.gov/neighborhood/beacon-hill",
    infoLabel: "Neighborhood guide"
  },
  {
    id: "public-garden-loop",
    name: "Boston Public Garden Lagoon Loop",
    category: "viewpoint",
    neighborhood: "Beacon Hill",
    lat: 42.3542,
    lng: -71.0695,
    visitDurationMins: 45,
    description: "Low-stress scenic loop beside the lagoon and gardens.",
    infoUrl: "https://www.boston.gov/parks/public-garden",
    infoLabel: "Park info"
  },
  {
    id: "old-south-meeting-house",
    name: "Old South Meeting House",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3555,
    lng: -71.0595,
    visitDurationMins: 45,
    isFreedomTrailStop: true,
    description: "Historic meeting site tied to events leading to the Boston Tea Party.",
    infoUrl: "https://www.nps.gov/places/old-south-meeting-house.htm",
    infoLabel: "Site history"
  },
  {
    id: "copley-square-trinity",
    name: "Copley Square + Trinity Church Walk",
    category: "historic",
    neighborhood: "Back Bay",
    lat: 42.3499,
    lng: -71.0783,
    visitDurationMins: 50,
    description: "Architecture-focused walk around Trinity Church and Copley Square.",
    infoUrl: "https://trinitychurchboston.org/welcome/",
    infoLabel: "Trinity Church info"
  },
  {
    id: "bpl-courtyard",
    name: "Boston Public Library (McKim Courtyard)",
    category: "historic",
    neighborhood: "Back Bay",
    lat: 42.3493,
    lng: -71.0784,
    visitDurationMins: 55,
    description: "Historic library interiors and courtyard in a compact visit.",
    infoUrl: "https://www.bpl.org/locations/central/",
    infoLabel: "Library info"
  },
  {
    id: "newbury-street-stroll",
    name: "Newbury Street Brownstone Stroll",
    category: "viewpoint",
    neighborhood: "Back Bay",
    lat: 42.3492,
    lng: -71.0829,
    visitDurationMins: 60,
    description: "Classic Back Bay brownstones, side streets, and city energy.",
    infoUrl: "https://www.boston.gov/neighborhood/back-bay",
    infoLabel: "Neighborhood guide"
  },
  {
    id: "chinatown-gateway-walk",
    name: "Chinatown Gate + Greenway Walk",
    category: "viewpoint",
    neighborhood: "Downtown",
    lat: 42.3507,
    lng: -71.0606,
    visitDurationMins: 45,
    description: "Short city loop between Chinatown and the Rose Kennedy Greenway.",
    infoUrl: "https://www.boston.gov/neighborhood/chinatown-leather-district",
    infoLabel: "Neighborhood guide"
  },
  {
    id: "downtown-crossing-stroll",
    name: "Downtown Crossing Streetscape Walk",
    category: "viewpoint",
    neighborhood: "Downtown",
    lat: 42.3558,
    lng: -71.0606,
    visitDurationMins: 45,
    description: "Pedestrian core walk with historic facades and classic downtown energy.",
    infoUrl: "https://www.boston.gov/neighborhood/downtown",
    infoLabel: "Downtown guide"
  },
  {
    id: "boston-athenaeum-exterior",
    name: "Boston Athenaeum + Beacon Hill Exterior Stop",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3576,
    lng: -71.0625,
    visitDurationMins: 40,
    description: "Historic literary landmark and a quick Beacon Hill architecture pass.",
    infoUrl: "https://bostonathenaeum.org/visit/",
    infoLabel: "Visitor info"
  },
  {
    id: "harborwalk-seaport",
    name: "Seaport Harborwalk (Fan Pier Segment)",
    category: "waterfront",
    neighborhood: "Seaport",
    lat: 42.3515,
    lng: -71.0452,
    visitDurationMins: 55,
    description: "Best local waterfront stretch for skyline and harbor views.",
    infoUrl: "https://www.bostonharborwalk.org/",
    infoLabel: "Trail info"
  },
  {
    id: "ica-waterfront",
    name: "ICA Waterfront Deck",
    category: "waterfront",
    neighborhood: "Seaport",
    lat: 42.3519,
    lng: -71.0429,
    visitDurationMins: 40,
    description: "Quick modern waterfront stop with great harbor lookouts."
  },
  {
    id: "north-end-waterfront",
    name: "Christopher Columbus Waterfront Park",
    category: "waterfront",
    neighborhood: "North End",
    lat: 42.3619,
    lng: -71.0505,
    visitDurationMins: 45,
    description: "Historic-meets-coastal walk between North End and the harbor."
  },
  {
    id: "rowes-wharf",
    name: "Rowes Wharf Harbor Outlook",
    category: "waterfront",
    neighborhood: "Waterfront",
    lat: 42.3554,
    lng: -71.0491,
    visitDurationMins: 35,
    description: "Relaxed harbor-view pause point with easy transfer options."
  },
  {
    id: "tea-party-tea-room",
    name: "Abigail's Tea Room (Boston Tea Party Ships & Museum)",
    category: "historic",
    neighborhood: "Waterfront",
    priceLevel: "$$",
    address: "306 Congress St, Boston, MA 02210",
    lat: 42.3517,
    lng: -71.0468,
    visitDurationMins: 50,
    description:
      "Historic tea-room stop at the Boston Tea Party complex with harbor-channel atmosphere.",
    infoUrl: "https://www.bostonteapartyship.com/",
    infoLabel: "Museum details"
  },
  {
    id: "old-state-house-stop",
    name: "Old State House",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3588,
    lng: -71.0578,
    visitDurationMins: 40,
    isFreedomTrailStop: true,
    description: "Compact museum stop at one of Boston's most iconic Revolutionary sites.",
    infoUrl: "https://www.bostonhistory.org/old-state-house/",
    infoLabel: "Museum details"
  },
  {
    id: "copps-hill-burying-ground",
    name: "Copp's Hill Burying Ground",
    category: "historic",
    neighborhood: "North End",
    lat: 42.3672,
    lng: -71.055,
    visitDurationMins: 35,
    isFreedomTrailStop: true,
    description:
      "Hilltop cemetery stop with harbor views and deep colonial-era history on the Freedom Trail.",
    infoUrl: "https://www.thefreedomtrail.org/site/copps-hill-burying-ground",
    infoLabel: "Site history"
  },
  {
    id: "greenway-art-walk",
    name: "Nichols House Museum + Charles Street Stroll",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3589,
    lng: -71.0682,
    visitDurationMins: 45,
    description:
      "Quaint Beacon Hill stop with period-house history and a calm stroll along Charles Street side lanes.",
    infoUrl: "https://www.nicholshousemuseum.org/visit",
    infoLabel: "Museum details"
  },
  {
    id: "louisburg-square-loop",
    name: "Louisburg Square + Mount Vernon St Micro-Loop",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3589,
    lng: -71.0688,
    visitDurationMins: 25,
    description:
      "Quick 15-25 minute Beacon Hill micro-loop with classic brick streets just beyond Acorn Street.",
    infoUrl: "https://www.boston.gov/neighborhood/beacon-hill",
    infoLabel: "Neighborhood guide"
  },
  {
    id: "kings-chapel-stop",
    name: "King's Chapel + Burying Ground",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3576,
    lng: -71.0618,
    visitDurationMins: 40,
    isFreedomTrailStop: true,
    description:
      "Historic chapel and adjacent burying ground in the core of downtown Boston.",
    infoUrl: "https://www.kings-chapel.org/",
    infoLabel: "Visitor details"
  },
  {
    id: "commonwealth-ave-mall",
    name: "Commonwealth Avenue Mall Stroll",
    category: "viewpoint",
    neighborhood: "Back Bay",
    lat: 42.3507,
    lng: -71.0802,
    visitDurationMins: 45,
    description: "Tree-lined Back Bay promenade with statues, brownstones, and city rhythm.",
    infoUrl: "https://www.boston.gov/parks/commonwealth-avenue-mall",
    infoLabel: "Park details"
  },
  {
    id: "old-city-hall-stop",
    name: "Old City Hall Courtyard Stop",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3581,
    lng: -71.0598,
    visitDurationMins: 35,
    description: "Quick architectural stop in one of Boston's landmark civic buildings.",
    infoUrl: "https://www.boston.gov/departments/landmarks-commission",
    infoLabel: "Landmarks info"
  },
  {
    id: "boston-public-market-stop",
    name: "Boston Public Market Browse",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3611,
    lng: -71.0572,
    visitDurationMins: 45,
    description:
      "Indoor local-maker market with a classic central-city atmosphere and easy transit links.",
    infoUrl: "https://bostonpublicmarket.org/",
    infoLabel: "Market details"
  },
  {
    id: "trinity-church-interior-stop",
    name: "Trinity Church Interior Visit",
    category: "historic",
    neighborhood: "Back Bay",
    lat: 42.3499,
    lng: -71.0782,
    visitDurationMins: 40,
    description: "Short interior architecture visit at one of Boston's landmark churches.",
    infoUrl: "https://trinitychurchboston.org/visit/",
    infoLabel: "Visit details"
  },
  {
    id: "prudential-skyline-view",
    name: "View Boston at Prudential Center",
    category: "viewpoint",
    neighborhood: "Back Bay",
    lat: 42.3472,
    lng: -71.0829,
    visitDurationMins: 55,
    description: "Skyline panorama stop for a broad orientation of Boston neighborhoods.",
    infoUrl: "https://viewboston.com/",
    infoLabel: "Attraction details"
  },
  {
    id: "charles-esplanade-walk",
    name: "Charles River Esplanade Walk",
    category: "viewpoint",
    neighborhood: "Back Bay",
    lat: 42.3567,
    lng: -71.0734,
    visitDurationMins: 50,
    description: "Relaxed riverfront path with bridge views and an easy evening pace.",
    infoUrl: "https://esplanadeassociation.org/",
    infoLabel: "Trail details"
  },
  {
    id: "old-south-church-stop",
    name: "Old South Church (Back Bay) Visit",
    category: "historic",
    neighborhood: "Back Bay",
    lat: 42.3494,
    lng: -71.0768,
    visitDurationMins: 35,
    description:
      "Historic Back Bay church stop with striking Romanesque design and city-center location.",
    infoUrl: "https://oldsouth.org/",
    infoLabel: "Church details"
  },
  {
    id: "custom-house-tower-stop",
    name: "Custom House Tower Exterior Stop",
    category: "historic",
    neighborhood: "Waterfront",
    lat: 42.3589,
    lng: -71.0515,
    visitDurationMins: 35,
    description: "Historic skyline landmark near the harbor and downtown crossings.",
    infoUrl:
      "https://www.marriott.com/en-us/hotels/bosch-the-custom-house-a-marriott-vacation-club-resort/overview/",
    infoLabel: "Landmark details"
  },
  {
    id: "long-wharf-promenade",
    name: "Long Wharf Promenade",
    category: "viewpoint",
    neighborhood: "Waterfront",
    lat: 42.3598,
    lng: -71.0498,
    visitDurationMins: 35,
    description: "Short harbor promenade with ferries, skyline views, and sea-breeze break.",
    infoUrl: "https://www.bostonharborwalk.org/",
    infoLabel: "Harborwalk details"
  },
  {
    id: "fan-pier-park-stop",
    name: "Fan Pier Park Harbor Pause",
    category: "waterfront",
    neighborhood: "Seaport",
    lat: 42.3526,
    lng: -71.0443,
    visitDurationMins: 40,
    description: "Open-air Seaport pause point with broad harbor and skyline views.",
    infoUrl: "https://www.bostonharborwalk.org/",
    infoLabel: "Harborwalk details"
  },
  {
    id: "kanes-downtown",
    name: "Kane's Donuts (Downtown)",
    category: "restaurant",
    neighborhood: "Downtown",
    priceLevel: "$",
    address: "90 Oliver St, Boston, MA 02110",
    lat: 42.3572,
    lng: -71.0557,
    visitDurationMins: 35,
    description:
      "Classic Boston coffee-and-donut stop with dedicated gluten-free offerings and easy access to historic downtown streets.",
    soloDiningNote:
      "Fast counter service makes this an easy solo grab-and-go stop between sightseeing blocks.",
    infoUrl: "https://www.kanesdonuts.com/locations",
    infoLabel: "Location details",
    glutenFreeSafe: true
  },
  {
    id: "verveine-cafe",
    name: "Verveine Cafe & Bakery",
    category: "restaurant",
    neighborhood: "Cambridge",
    priceLevel: "$$",
    address: "268 Massachusetts Ave, Cambridge, MA 02139",
    lat: 42.3652,
    lng: -71.1037,
    visitDurationMins: 55,
    description:
      "Warm, modern cafe-bakery with a fully gluten-free menu and strong coffee options.",
    soloDiningNote:
      "Comfortable seating and counter ordering are convenient for solo travelers.",
    infoUrl: "https://www.verveinecafe.com/",
    infoLabel: "Cafe details",
    glutenFreeSafe: true
  },
  {
    id: "violette-bakers",
    name: "Violette Bakers",
    category: "restaurant",
    neighborhood: "Cambridge",
    priceLevel: "$$",
    address: "57 JFK St, Cambridge, MA 02138",
    lat: 42.3718,
    lng: -71.1191,
    visitDurationMins: 55,
    description:
      "Neighborhood bakery-cafe with dedicated gluten-free baking, espresso drinks, and a cozy sit-down feel.",
    soloDiningNote:
      "Low-pressure counter ordering with casual seating works well when traveling solo.",
    infoUrl: "https://violettegf.com/",
    infoLabel: "Bakery details",
    glutenFreeSafe: true
  },
  {
    id: "jennifer-lees",
    name: "Jennifer Lee's Gourmet Bakery",
    category: "restaurant",
    neighborhood: "Downtown",
    priceLevel: "$$",
    address: "100 Hanover St, Boston, MA 02108",
    lat: 42.3513,
    lng: -71.0622,
    visitDurationMins: 55,
    description:
      "Dedicated gluten-free bakery and cafe; useful for safe breakfast or snack planning.",
    soloDiningNote:
      "Counter-service setup is straightforward for solo travelers and easy for a quick stop.",
    infoUrl:
      "https://bostonpublicmarket.org/vendors/jennifer-lees-allergen-friendly-vegan-shoppe/",
    infoLabel: "Vendor details",
    glutenFreeSafe: true
  },
  {
    id: "sweetgreen-seaport",
    name: "Sweetgreen (Seaport Square)",
    category: "restaurant",
    neighborhood: "Seaport",
    priceLevel: "$$",
    address: "47 Northern Ave, Boston, MA 02210",
    lat: 42.3512,
    lng: -71.0463,
    visitDurationMins: 30,
    description:
      "Fast, customizable bowl-and-salad stop near the hotel with multiple gluten-free combinations; confirm cross-contact preferences when ordering.",
    soloDiningNote:
      "Excellent solo grab-and-go choice for quick pickup and an easy walk back to the hotel.",
    infoUrl: "https://www.sweetgreen.com/locations/seaport-square",
    infoLabel: "Location details",
    glutenFreeSafe: true
  },
  {
    id: "modern-pastry-gf-cannoli",
    name: "Modern Pastry (GF Cannoli Option)",
    category: "restaurant",
    neighborhood: "North End",
    priceLevel: "$$",
    address: "257 Hanover St, Boston, MA 02113",
    lat: 42.3637,
    lng: -71.0541,
    visitDurationMins: 35,
    description:
      "Historic North End pastry stop with a gluten-free cannoli shell option; confirm cross-contact handling when ordering.",
    soloDiningNote:
      "Quick counter ordering works well for a solo pickup-and-stroll stop.",
    infoUrl: "https://www.modernpastry.com/cannoli-ordering.html",
    infoLabel: "Cannoli options",
    glutenFreeSafe: true
  },
  {
    id: "nebo-cucina",
    name: "Nebo Cucina & Enoteca",
    category: "restaurant",
    neighborhood: "Seaport",
    priceLevel: "$$",
    address: "520 Atlantic Ave, Boston, MA 02210",
    lat: 42.3507,
    lng: -71.0516,
    visitDurationMins: 80,
    description:
      "Gluten-free-friendly Italian stop that works well for ordering pickup and taking dinner back to the Westin.",
    soloDiningNote:
      "Best used as a solo pickup stop in the evening so you can bring dinner back to the hotel without adding extra walking.",
    infoUrl: "https://www.neborestaurant.com/",
    infoLabel: "Restaurant details",
    glutenFreeSafe: true
  },
  {
    id: "mikes-pastry",
    name: "Mike's Pastry",
    category: "restaurant",
    neighborhood: "North End",
    lat: 42.3640,
    lng: -71.0548,
    visitDurationMins: 35,
    description: "Iconic pastry stop but not strict gluten-free safe.",
    glutenFreeSafe: false
  }
];

export const DAY_TEMPLATES: DayTemplate[] = [
  {
    key: "sunday",
    title: "Sunday",
    dateLabel: "March 29, 2026",
    availabilityLabel: "Full day available",
    startTime: "09:00",
    endTime: "20:30",
    fixedStartTimes: {
      "freedom-trail-walk-tour": "12:00"
    },
    startFrom: "airport",
    includeHotelBagDrop: true,
    targetNeighborhoods: ["Downtown", "Waterfront", "Seaport"],
    stopIds: [
      "freedom-trail-walk-tour",
      "greenway-art-walk",
      "tea-party-tea-room",
      "ica-waterfront",
      "kanes-downtown"
    ]
  },
  {
    key: "monday",
    title: "Monday",
    dateLabel: "March 30, 2026",
    availabilityLabel: "Conference day (evening only)",
    startTime: "18:15",
    endTime: "21:45",
    targetNeighborhoods: ["Beacon Hill", "Downtown", "Back Bay"],
    stopIds: [
      "beacon-hill-stroll",
      "state-house-stop",
      "louisburg-square-loop",
      "kings-chapel-stop",
      "commonwealth-ave-mall",
      "sweetgreen-seaport"
    ]
  },
  {
    key: "tuesday",
    title: "Tuesday",
    dateLabel: "March 31, 2026",
    availabilityLabel: "Conference day (ferry 3:00 PM-5:00 PM, evening only)",
    startTime: "18:30",
    endTime: "21:30",
    targetNeighborhoods: ["Downtown", "Back Bay"],
    stopIds: [
      "granary-burying-ground",
      "old-south-meeting-house",
      "old-city-hall-stop",
      "old-state-house-stop",
      "kings-chapel-stop",
      "modern-pastry-gf-cannoli"
    ]
  },
  {
    key: "wednesday",
    title: "Wednesday",
    dateLabel: "April 1, 2026",
    availabilityLabel: "Conference day (evening only)",
    startTime: "18:15",
    endTime: "21:30",
    targetNeighborhoods: ["Back Bay", "Downtown"],
    stopIds: [
      "bpl-courtyard",
      "copley-square-trinity",
      "trinity-church-interior-stop",
      "old-south-church-stop",
      "newbury-street-stroll",
      "boston-public-market-stop",
      "nebo-cucina"
    ]
  },
  {
    key: "thursday",
    title: "Thursday",
    dateLabel: "April 2, 2026",
    availabilityLabel: "Morning available before airport transfer",
    startTime: "08:00",
    endTime: "12:00",
    targetNeighborhoods: ["Downtown", "Waterfront", "Seaport"],
    stopIds: [
      "boston-public-market-stop",
      "old-state-house-stop",
      "old-south-meeting-house",
      "old-city-hall-stop",
      "kanes-downtown"
    ]
  }
];

export const NEARBY_MBTA_STATIONS: Record<string, string[]> = {
  "westin-seaport": ["World Trade Center (SL1)", "Courthouse (SL1)"],
  "thinktransit-conference": ["World Trade Center (SL1)", "Courthouse (SL1)"],
  "freedom-trail-walk-tour": ["Park Street", "Boylston"],
  "city-view-bike-tour": ["Aquarium", "State"],
  "paul-revere-house": ["Haymarket", "North Station"],
  "old-north-church": ["North Station", "Haymarket"],
  "quincy-market": ["Government Center", "Haymarket"],
  "boston-common-loop": ["Park Street", "Boylston"],
  "granary-burying-ground": ["Park Street", "Downtown Crossing"],
  "state-house-stop": ["Park Street", "Government Center"],
  "beacon-hill-stroll": ["Charles/MGH", "Park Street"],
  "public-garden-loop": ["Arlington", "Boylston"],
  "old-south-meeting-house": ["Downtown Crossing", "State"],
  "copley-square-trinity": ["Copley", "Back Bay"],
  "bpl-courtyard": ["Copley", "Back Bay"],
  "newbury-street-stroll": ["Copley", "Hynes Convention Center"],
  "chinatown-gateway-walk": ["Chinatown", "Downtown Crossing"],
  "downtown-crossing-stroll": ["Downtown Crossing", "State"],
  "boston-athenaeum-exterior": ["Park Street", "Downtown Crossing"],
  "harborwalk-seaport": ["World Trade Center (SL1)", "Courthouse (SL1)"],
  "ica-waterfront": ["World Trade Center (SL1)", "Courthouse (SL1)"],
  "north-end-waterfront": ["Aquarium", "Haymarket"],
  "rowes-wharf": ["Aquarium", "South Station"],
  "tea-party-tea-room": ["South Station", "Courthouse (SL1)"],
  "old-state-house-stop": ["State", "Downtown Crossing"],
  "copps-hill-burying-ground": ["Haymarket", "North Station"],
  "greenway-art-walk": ["Charles/MGH", "Park Street"],
  "louisburg-square-loop": ["Charles/MGH", "Park Street"],
  "kings-chapel-stop": ["Park Street", "Government Center"],
  "commonwealth-ave-mall": ["Copley", "Hynes Convention Center"],
  "old-city-hall-stop": ["State", "Downtown Crossing"],
  "boston-public-market-stop": ["Haymarket", "Government Center"],
  "trinity-church-interior-stop": ["Copley", "Back Bay"],
  "prudential-skyline-view": ["Prudential", "Back Bay"],
  "charles-esplanade-walk": ["Arlington", "Charles/MGH"],
  "old-south-church-stop": ["Copley", "Back Bay"],
  "custom-house-tower-stop": ["Aquarium", "State"],
  "long-wharf-promenade": ["Aquarium", "Government Center"],
  "fan-pier-park-stop": ["World Trade Center (SL1)", "Courthouse (SL1)"],
  "kanes-downtown": ["State", "Aquarium"],
  "verveine-cafe": ["Central", "Kendall/MIT"],
  "violette-bakers": ["Porter", "Alewife"],
  "jennifer-lees": ["Downtown Crossing", "Chinatown"],
  "sweetgreen-seaport": ["Courthouse (SL1)", "World Trade Center (SL1)"],
  "modern-pastry-gf-cannoli": ["Haymarket", "North Station"],
  "nebo-cucina": ["South Station", "Broadway"],
  "mikes-pastry": ["Haymarket", "North Station"],
  "airport-bos": ["Airport", "Maverick"]
};

export const MBTA_OVERRIDES: Record<string, MbtaOverride> = {
  "westin-seaport->freedom-trail-walk-tour": {
    minutes: 24,
    directions:
      "Walk to Courthouse Station, take the Silver Line to South Station, then continue one stop to Park Street for the Freedom Trail start.",
    reverseDirections:
      "From Park Street, ride toward South Station, transfer to the Silver Line outbound, and exit at Courthouse/World Trade Center for a short walk to the Westin."
  },
  "westin-seaport->city-view-bike-tour": {
    minutes: 18,
    directions:
      "Walk to World Trade Center Station, take the Silver Line inbound to South Station, then continue on foot toward Atlantic Ave for the bike-tour check-in area.",
    reverseDirections:
      "Walk to South Station, take the Silver Line outbound toward World Trade Center/Courthouse, and walk the final blocks to the Westin."
  },
  "westin-seaport->beacon-hill-stroll": {
    minutes: 27,
    directions:
      "Walk to Courthouse Station, take Silver Line to South Station, then transfer to the Red Line toward Park Street and walk uphill to Beacon Hill.",
    reverseDirections:
      "From Park Street, take the Red Line toward South Station, transfer to the Silver Line outbound to Courthouse, then walk to the Westin."
  },
  "westin-seaport->old-north-church": {
    minutes: 29,
    directions:
      "Take Silver Line to South Station, transfer to Orange Line toward North Station, then walk 10 minutes into the North End.",
    reverseDirections:
      "From the North End, take Orange Line toward Downtown, connect at South Station to the Silver Line outbound, then walk from Courthouse to the Westin."
  },
  "westin-seaport->rowes-wharf": {
    minutes: 16,
    directions:
      "Take the Silver Line toward South Station, exit near the Aquarium/Waterfront area, then walk 5 minutes to Rowes Wharf.",
    reverseDirections:
      "From Rowes Wharf, walk to the nearby Waterfront/South Station access point, take the Silver Line outbound, and exit at Courthouse for a short walk to the Westin."
  },
  "harborwalk-seaport->rowes-wharf": {
    minutes: 18,
    directions:
      "Walk to World Trade Center Station and ride the Silver Line inbound to the Waterfront stop closest to Rowes Wharf.",
    reverseDirections:
      "From Rowes Wharf, board the Silver Line outbound toward World Trade Center and walk to the Harborwalk in Seaport."
  },
  "north-end-waterfront->beacon-hill-stroll": {
    minutes: 17,
    directions:
      "Walk to Government Center and take the Green Line one stop toward Park Street, then walk up into Beacon Hill.",
    reverseDirections:
      "Walk down to Park Street and ride one stop to Government Center, then continue on foot toward the North End waterfront."
  },
  "rowes-wharf->jennifer-lees": {
    minutes: 15,
    directions:
      "Take the MBTA from Aquarium toward Downtown Crossing, then walk a few minutes to the bakery.",
    reverseDirections:
      "From Downtown Crossing, ride one stop toward Aquarium/Waterfront and walk back to Rowes Wharf."
  },
  "westin-seaport->airport-bos": {
    minutes: 38,
    directions:
      "Walk to World Trade Center Station, board Silver Line SL1 toward Logan Airport, and exit at your terminal.",
    reverseDirections:
      "From your Logan terminal, board Silver Line SL1 inbound toward South Station, exit at World Trade Center/Courthouse, then walk to the Westin."
  }
};

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
    name: "Beacon Hill Stroll (Acorn St + Louisburg Sq)",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3587,
    lng: -71.0675,
    visitDurationMins: 65,
    description: "Cobblestone lanes, gas lamps, and classic Boston architecture.",
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
    lat: 42.3517,
    lng: -71.0468,
    visitDurationMins: 50,
    description:
      "Historic tea-room stop at the Boston Tea Party complex with harbor-channel atmosphere.",
    infoUrl: "https://www.bostonteapartyship.com/",
    infoLabel: "Museum details"
  },
  {
    id: "legal-harborside",
    name: "Legal Sea Foods Harborside",
    category: "restaurant",
    neighborhood: "Waterfront",
    lat: 42.3592,
    lng: -71.0506,
    visitDurationMins: 75,
    description:
      "Gluten-free friendly seafood with an established allergen-handling menu.",
    infoUrl: "https://www.legalseafoods.com/locations/the-overlook-at-boston-harborside/",
    infoLabel: "Restaurant details",
    glutenFreeSafe: true
  },
  {
    id: "jennifer-lees",
    name: "Jennifer Lee's Gourmet Bakery",
    category: "restaurant",
    neighborhood: "Downtown",
    lat: 42.3513,
    lng: -71.0622,
    visitDurationMins: 55,
    description:
      "Dedicated gluten-free bakery and cafe; useful for safe breakfast or snack planning.",
    infoUrl:
      "https://bostonpublicmarket.org/vendors/jennifer-lees-allergen-friendly-vegan-shoppe/",
    infoLabel: "Vendor details",
    glutenFreeSafe: true
  },
  {
    id: "nebo-cucina",
    name: "Nebo Cucina & Enoteca",
    category: "restaurant",
    neighborhood: "Seaport",
    lat: 42.3507,
    lng: -71.0516,
    visitDurationMins: 80,
    description:
      "Italian dinner stop with clearly marked gluten-free options and allergy accommodations.",
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
    startFrom: "airport",
    includeHotelBagDrop: true,
    targetNeighborhoods: ["Downtown", "North End", "Beacon Hill"],
    stopIds: [
      "paul-revere-house",
      "old-north-church",
      "quincy-market",
      "tea-party-tea-room",
      "boston-common-loop",
      "legal-harborside"
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
      "public-garden-loop",
      "nebo-cucina"
    ]
  },
  {
    key: "tuesday",
    title: "Tuesday",
    dateLabel: "March 31, 2026",
    availabilityLabel: "Conference day (evening only)",
    startTime: "18:00",
    endTime: "21:30",
    targetNeighborhoods: ["Downtown", "Back Bay"],
    stopIds: [
      "freedom-trail-walk-tour",
      "granary-burying-ground",
      "old-south-meeting-house",
      "jennifer-lees",
      "downtown-crossing-stroll"
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
    stopIds: ["bpl-courtyard", "copley-square-trinity", "newbury-street-stroll"]
  },
  {
    key: "thursday",
    title: "Thursday",
    dateLabel: "April 2, 2026",
    availabilityLabel: "Morning available before airport transfer",
    startTime: "07:30",
    endTime: "12:00",
    targetNeighborhoods: ["Beacon Hill", "Downtown", "Seaport"],
    stopIds: [
      "boston-athenaeum-exterior",
      "chinatown-gateway-walk",
      "harborwalk-seaport"
    ]
  }
];

export const MBTA_OVERRIDES: Record<string, MbtaOverride> = {
  "westin-seaport->freedom-trail-walk-tour": {
    minutes: 24,
    directions:
      "Walk to Courthouse Station, take the Silver Line to South Station, then continue one stop to Park Street for the Freedom Trail start."
  },
  "westin-seaport->city-view-bike-tour": {
    minutes: 18,
    directions:
      "Walk to World Trade Center Station, take the Silver Line inbound to South Station, then continue on foot toward Atlantic Ave for the bike-tour check-in area."
  },
  "westin-seaport->beacon-hill-stroll": {
    minutes: 27,
    directions:
      "Walk to Courthouse Station, take Silver Line to South Station, then transfer to the Red Line toward Park Street and walk uphill to Beacon Hill."
  },
  "westin-seaport->old-north-church": {
    minutes: 29,
    directions:
      "Take Silver Line to South Station, transfer to Orange Line toward North Station, then walk 10 minutes into the North End."
  },
  "westin-seaport->rowes-wharf": {
    minutes: 16,
    directions:
      "Take the Silver Line toward South Station, exit near the Aquarium/Waterfront area, then walk 5 minutes to Rowes Wharf."
  },
  "harborwalk-seaport->rowes-wharf": {
    minutes: 18,
    directions:
      "Walk to World Trade Center Station and ride the Silver Line inbound to the Waterfront stop closest to Rowes Wharf."
  },
  "north-end-waterfront->beacon-hill-stroll": {
    minutes: 17,
    directions:
      "Walk to Government Center and take the Green Line one stop toward Park Street, then walk up into Beacon Hill."
  },
  "rowes-wharf->jennifer-lees": {
    minutes: 15,
    directions:
      "Take the MBTA from Aquarium toward Downtown Crossing, then walk a few minutes to the bakery."
  },
  "westin-seaport->airport-bos": {
    minutes: 38,
    directions:
      "Walk to World Trade Center Station, board Silver Line SL1 toward Logan Airport, and exit at your terminal."
  }
};

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
  description: "Hotel base at 425 Summer St, Boston."
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
    id: "freedom-trail-core",
    name: "Freedom Trail Core Walk (Boston Common -> Faneuil Hall)",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3558,
    lng: -71.0601,
    visitDurationMins: 120,
    description: "Classic Revolutionary-era route with major historic landmarks."
  },
  {
    id: "paul-revere-house",
    name: "Paul Revere House",
    category: "historic",
    neighborhood: "North End",
    lat: 42.3637,
    lng: -71.0537,
    visitDurationMins: 45,
    description: "Compact historic stop in the heart of old Boston."
  },
  {
    id: "old-north-church",
    name: "Old North Church",
    category: "historic",
    neighborhood: "North End",
    lat: 42.3664,
    lng: -71.0544,
    visitDurationMins: 40,
    description: "Historic church tied to the famous lantern signal."
  },
  {
    id: "quincy-market",
    name: "Quincy Market + Faneuil Hall",
    category: "historic",
    neighborhood: "Downtown",
    lat: 42.3601,
    lng: -71.0568,
    visitDurationMins: 50,
    description: "Historic market district with lively street energy."
  },
  {
    id: "beacon-hill-stroll",
    name: "Beacon Hill Stroll (Acorn St + Louisburg Sq)",
    category: "historic",
    neighborhood: "Beacon Hill",
    lat: 42.3587,
    lng: -71.0675,
    visitDurationMins: 65,
    description: "Cobblestone lanes, gas lamps, and classic Boston architecture."
  },
  {
    id: "public-garden-loop",
    name: "Boston Public Garden Lagoon Loop",
    category: "viewpoint",
    neighborhood: "Beacon Hill",
    lat: 42.3542,
    lng: -71.0695,
    visitDurationMins: 45,
    description: "Low-stress scenic loop beside the lagoon and gardens."
  },
  {
    id: "harborwalk-seaport",
    name: "Seaport Harborwalk (Fan Pier Segment)",
    category: "waterfront",
    neighborhood: "Seaport",
    lat: 42.3515,
    lng: -71.0452,
    visitDurationMins: 55,
    description: "Best local waterfront stretch for skyline and harbor views."
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
    id: "legal-harborside",
    name: "Legal Sea Foods Harborside",
    category: "restaurant",
    neighborhood: "Waterfront",
    lat: 42.3592,
    lng: -71.0506,
    visitDurationMins: 75,
    description:
      "Gluten-free friendly seafood with an established allergen-handling menu.",
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
    availabilityLabel: "Full day available",
    startTime: "09:00",
    endTime: "20:30",
    targetNeighborhoods: ["Downtown", "North End", "Waterfront"],
    stopIds: [
      "freedom-trail-core",
      "paul-revere-house",
      "quincy-market",
      "north-end-waterfront",
      "legal-harborside",
      "mikes-pastry"
    ]
  },
  {
    key: "monday",
    title: "Monday",
    availabilityLabel: "Conference day (evening only)",
    startTime: "18:15",
    endTime: "21:45",
    targetNeighborhoods: ["Seaport", "Waterfront"],
    stopIds: ["harborwalk-seaport", "ica-waterfront", "nebo-cucina"]
  },
  {
    key: "tuesday",
    title: "Tuesday",
    availabilityLabel: "Conference day (evening only)",
    startTime: "18:00",
    endTime: "21:30",
    targetNeighborhoods: ["Beacon Hill", "Downtown"],
    stopIds: [
      "beacon-hill-stroll",
      "public-garden-loop",
      "jennifer-lees",
      "rowes-wharf"
    ]
  },
  {
    key: "wednesday",
    title: "Wednesday",
    availabilityLabel: "Conference day (evening only)",
    startTime: "18:15",
    endTime: "21:30",
    targetNeighborhoods: ["North End", "Waterfront"],
    stopIds: ["old-north-church", "north-end-waterfront", "legal-harborside"]
  },
  {
    key: "thursday",
    title: "Thursday",
    availabilityLabel: "Morning available before airport transfer",
    startTime: "07:30",
    endTime: "12:00",
    targetNeighborhoods: ["Seaport", "Waterfront"],
    stopIds: ["harborwalk-seaport", "rowes-wharf", "jennifer-lees"]
  }
];

export const MBTA_OVERRIDES: Record<string, MbtaOverride> = {
  "westin-seaport->freedom-trail-core": {
    minutes: 24,
    directions:
      "Walk to Courthouse Station, take the Silver Line to South Station, then continue one stop to Park Street for the Freedom Trail start."
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


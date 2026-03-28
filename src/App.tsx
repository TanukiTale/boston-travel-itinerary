import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { generateBostonConferenceItinerary } from "./lib/itineraryGenerator";
import {
  BOSTON_PLACES,
  DAY_TEMPLATES,
  HOTEL_BASE,
  MBTA_OVERRIDES,
  NEARBY_MBTA_STATIONS
} from "./data/places";
import type {
  DayPlan,
  Place,
  ScheduledStop,
  TransitEstimate,
  TravelMode
} from "./types";
import "./styles.css";

const modeLabels = {
  WALK: "Walk",
  MBTA: "MBTA"
} as const;

const FREEDOM_TRAIL_TOUR_ID = "freedom-trail-walk-tour";
const RETURN_TO_HOTEL_LEG_ID = "__return_to_hotel__";
const fixedArrivalByDayAndStopId: Record<string, Record<string, string>> = {
  Sunday: {
    "freedom-trail-walk-tour": "12:00"
  }
};

const minVisitDurationMins = 15;
const maxVisitDurationMins = 240;
const extraOptionMaxWalkMins = 22;
const timelineShiftStepMins = 15;
const maxTimelineShiftMins = 120;
const mbtaTripPlannerUrl = "https://www.mbta.com/trip-planner";
const mbtaFaresUrl = "https://www.mbta.com/fares";

interface PlacePhoto {
  imageUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  caption: string;
}

const placePhotosById: Partial<Record<string, PlacePhoto>> = {
  "westin-seaport": {
    imageUrl:
      "https://cache.marriott.com/is/image/marriotts7prod/wi-bosow-daytime-exterior-18224?fit=constrain&wid=1336",
    sourceUrl:
      "https://www.marriott.com/en-us/hotels/bosow-the-westin-boston-seaport-district/photos/",
    sourceLabel: "Hotel gallery",
    caption: "The Westin Boston Seaport District exterior"
  },
  "freedom-trail-walk-tour": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Freedom_Trail.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boston_Freedom_Trail.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Freedom Trail brick marker route"
  },
  "city-view-bike-tour": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ruggles_Bluebikes_station_04.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Ruggles_Bluebikes_station_04.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Bluebikes scene for city riding"
  },
  "paul-revere-house": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Revere_House_Boston_MA.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Paul_Revere_House_Boston_MA.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Paul Revere House in the North End"
  },
  "quincy-market": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Faneuil_Hall.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Boston_Faneuil_Hall.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Faneuil Hall / Quincy Market district"
  },
  "boston-common-loop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Public_Garden_Lagoon_12.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Public_Garden_Lagoon_12.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Common / Public Garden area"
  },
  "granary-burying-ground": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Granary_Burying_Ground,_Boston.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Granary_Burying_Ground,_Boston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Granary Burying Ground"
  },
  "state-house-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Massachusetts_State_House_in_Boston.JPG",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Massachusetts_State_House_in_Boston.JPG",
    sourceLabel: "Wikimedia Commons",
    caption: "Massachusetts State House"
  },
  "old-north-church": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_North_Church.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Old_North_Church.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Old North Church"
  },
  "beacon-hill-stroll": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street,_Beacon_Hill,_Boston.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street,_Beacon_Hill,_Boston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Acorn Street in Beacon Hill"
  },
  "public-garden-loop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Public_Garden_Lagoon_12.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Public_Garden_Lagoon_12.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Public Garden lagoon"
  },
  "old-south-meeting-house": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_South_Meeting_House,_Boston.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_South_Meeting_House,_Boston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Old South Meeting House"
  },
  "copley-square-trinity": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Trinity_Church_in_Copley_Square.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Trinity_Church_in_Copley_Square.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Trinity Church at Copley Square"
  },
  "bpl-courtyard": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The_central_courtyard_at_Boston_Public_Library.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:The_central_courtyard_at_Boston_Public_Library.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Public Library courtyard"
  },
  "newbury-street-stroll": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Newbury_Street,_USA,_Boston.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Newbury_Street,_USA,_Boston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Newbury Street"
  },
  "downtown-crossing-stroll": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Downtown Crossing pedestrian core"
  },
  "boston-athenaeum-exterior": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Athenaeum_(54958906703).jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boston_Athenaeum_(54958906703).jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Athenaeum"
  },
  "chinatown-gateway-walk": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Chinatown_Gate_Boston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Chinatown_Gate_Boston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Chinatown Gate"
  },
  "harborwalk-seaport": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Harborwalk_Boston_at_Blue_Hills_Bank_Pavilion.JPG",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Harborwalk_Boston_at_Blue_Hills_Bank_Pavilion.JPG",
    sourceLabel: "Wikimedia Commons",
    caption: "Seaport Harborwalk"
  },
  "ica-waterfront": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Institute_of_Contemporary_Art,_Boston,_and_Harborwalk.JPG",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Institute_of_Contemporary_Art,_Boston,_and_Harborwalk.JPG",
    sourceLabel: "Wikimedia Commons",
    caption: "ICA Boston and Harborwalk"
  },
  "north-end-waterfront": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Christopher_Columbus_Waterfront_Park,_Boston,_MA.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Christopher_Columbus_Waterfront_Park,_Boston,_MA.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Christopher Columbus Waterfront Park"
  },
  "rowes-wharf": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2017_Rowes_Wharf_from_Boston_Harbor_1.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Rowes_Wharf_from_Boston_Harbor_1.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Rowes Wharf and Boston Harbor Hotel arch"
  },
  "tea-party-tea-room": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Tea_Party_museum.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Boston_Tea_Party_museum.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Tea Party Ships & Museum"
  },
  "old-state-house-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_State_House_Boston_2025.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_State_House_Boston_2025.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Old State House"
  },
  "copps-hill-burying-ground": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_North_Church.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Old_North_Church.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "North End historic district near Copp's Hill"
  },
  "greenway-art-walk": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Nichols_House_Museum_(54957839147).jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Nichols_House_Museum_(54957839147).jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Nichols House Museum"
  },
  "louisburg-square-loop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Louisburg_Square_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Louisburg_Square_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Louisburg Square area in Beacon Hill"
  },
  "kings-chapel-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_-_King%27s_Chapel_(48718908106).jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boston_-_King%27s_Chapel_(48718908106).jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "King's Chapel"
  },
  "commonwealth-ave-mall": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/(Back_Bay_Boston,_Massachusetts,_Commonwealth_Avenue_Mall).jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:(Back_Bay_Boston,_Massachusetts,_Commonwealth_Avenue_Mall).jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Commonwealth Avenue Mall"
  },
  "old-city-hall-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_City_Hall_in_Boston,_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_City_Hall_in_Boston,_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Old City Hall"
  },
  "boston-public-market-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Public_Market_Exterior.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Boston_Public_Market_Exterior.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Public Market"
  },
  "trinity-church-interior-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Trinity_Church_Copley_Square.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Trinity_Church_Copley_Square.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Trinity Church in Back Bay"
  },
  "prudential-skyline-view": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Seaport_Boulevard_and_International_Place.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Seaport_Boulevard_and_International_Place.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston skyline perspective from central neighborhoods"
  },
  "charles-esplanade-walk": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Public_Garden_Lagoon_12.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Public_Garden_Lagoon_12.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Charles River-side green space and walking path mood"
  },
  "old-south-church-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_South_Church_in_Boston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Old_South_Church_in_Boston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Old South Church"
  },
  "custom-house-tower-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Custom_House_Tower_-_Boston,_MA.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Custom_House_Tower_-_Boston,_MA.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Custom House Tower"
  },
  "long-wharf-promenade": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2017_Long_Wharf,_Boston,_Massachusetts_from_Boston_Harbor.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Long_Wharf,_Boston,_Massachusetts_from_Boston_Harbor.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Long Wharf waterfront promenade"
  },
  "fan-pier-park-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2017_Fan_Pier_and_Seaport_District_from_Central_Wharf.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Fan_Pier_and_Seaport_District_from_Central_Wharf.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Fan Pier in Seaport"
  },
  "thinktransit-conference": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Convention_and_Exhibition_Center_01.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boston_Convention_and_Exhibition_Center_01.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Convention and Exhibition Center area"
  },
  "kanes-downtown": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Downtown Boston streets near Kane's Donuts"
  },
  "verveine-cafe": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Central_Square,_Cambridge,_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Central_Square,_Cambridge,_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Central Square, Cambridge"
  },
  "violette-bakers": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Harvard_Square,_Cambridge,_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Harvard_Square,_Cambridge,_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Harvard Square, Cambridge"
  },
  "jennifer-lees": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Public_Market_Exterior.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Boston_Public_Market_Exterior.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Public Market area"
  },
  "sweetgreen-seaport": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Seaport_Boulevard_and_International_Place.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Seaport_Boulevard_and_International_Place.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Seaport Square area near Sweetgreen pickup"
  },
  "modern-pastry-gf-cannoli": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/North_End,_Boston,_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:North_End,_Boston,_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "North End streets near Modern Pastry"
  },
  "nebo-cucina": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Seaport_Boulevard_and_International_Place.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Seaport_Boulevard_and_International_Place.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Fort Point / Seaport streets near evening dining"
  },
  "mikes-pastry": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Mikes_Pastry,_Boston,_Mass.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mikes_Pastry,_Boston,_Mass.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Mike's Pastry on Hanover Street"
  }
};

const defaultPlacePhoto = {
  imageUrl:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street,_Beacon_Hill,_Boston.jpg",
  sourceUrl:
    "https://commons.wikimedia.org/wiki/File:Acorn_Street,_Beacon_Hill,_Boston.jpg",
  sourceLabel: "Wikimedia Commons",
  caption: "Historic Boston streetscape"
} as const;

function buildFallbackImageUrlForPlace(place: Place): string {
  void place;
  return defaultPlacePhoto.imageUrl;
}

function resolvePlacePhoto(place: Place): PlacePhoto {
  const curated = placePhotosById[place.id];
  if (curated) {
    return curated;
  }

  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) {
    return defaultPlacePhoto;
  }

  return {
    imageUrl: defaultPlacePhoto.imageUrl,
    sourceUrl: defaultPlacePhoto.sourceUrl,
    sourceLabel: defaultPlacePhoto.sourceLabel,
    caption: `${place.name} in Boston`
  };
}

const THEME_STORAGE_KEY = "boston-companion-theme";
const DAY_ADJUSTMENTS_STORAGE_KEY = "boston-day-adjustments-v1";
const REMOVED_STOPS_STORAGE_KEY = "boston-removed-stops-v1";
const ADDED_STOPS_STORAGE_KEY = "boston-added-stops-v1";
const LOCKED_STOPS_STORAGE_KEY = "boston-locked-stops-v1";
const HIDDEN_STOPS_STORAGE_KEY = "boston-hidden-stops-v1";
const defaultBostonMapUrl = "https://www.google.com/maps/search/?api=1&query=Boston%2C+MA";
function normalizeMyBostonMapUrl(urlValue: string): string {
  const value = urlValue.trim();
  if (!value) {
    return defaultBostonMapUrl;
  }

  try {
    const parsed = new URL(value);
    const isGoogleMapsHost =
      parsed.hostname === "google.com" ||
      parsed.hostname === "www.google.com" ||
      parsed.hostname.endsWith(".google.com");
    const isMyMapsEditPath = parsed.pathname.startsWith("/maps/d/edit");
    const mid = parsed.searchParams.get("mid");

    if (isGoogleMapsHost && isMyMapsEditPath && mid) {
      const viewerUrl = new URL("https://www.google.com/maps/d/viewer");
      viewerUrl.searchParams.set("mid", mid);
      const ll = parsed.searchParams.get("ll");
      const z = parsed.searchParams.get("z");
      if (ll) {
        viewerUrl.searchParams.set("ll", ll);
      }
      if (z) {
        viewerUrl.searchParams.set("z", z);
      }
      return viewerUrl.toString();
    }
  } catch {
    return value;
  }

  return value;
}

const myBostonMapUrl = normalizeMyBostonMapUrl(
  import.meta.env.VITE_MY_BOSTON_MAP_URL?.trim() || defaultBostonMapUrl
);
const hasCustomBostonMap = Boolean(import.meta.env.VITE_MY_BOSTON_MAP_URL?.trim());
const disabledPlaceIds = new Set<string>(["city-view-bike-tour"]);
const hotelWebsiteUrl =
  "https://www.marriott.com/en-us/hotels/bosow-the-westin-boston-seaport-district/overview/";
const placeById = new Map(BOSTON_PLACES.map((place) => [place.id, place]));
const dayTemplateByTitle = new Map(
  DAY_TEMPLATES.map((template) => [template.title, template])
);
const cozyCafeOptionIdsByDayTitle: Record<string, string[]> = {
  Sunday: ["kanes-downtown", "verveine-cafe", "violette-bakers"],
  Monday: ["sweetgreen-seaport", "kanes-downtown", "jennifer-lees"],
  Tuesday: ["modern-pastry-gf-cannoli", "sweetgreen-seaport", "jennifer-lees"],
  Wednesday: ["modern-pastry-gf-cannoli", "sweetgreen-seaport", "nebo-cucina"],
  Thursday: ["kanes-downtown", "jennifer-lees", "verveine-cafe"]
};
const weekdayIndexByDayTitle: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4
};
const likelyHoursByPlaceId: Partial<
  Record<string, { open: string; close: string; days: number[] }>
> = {
  "kanes-downtown": { open: "06:30", close: "18:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "verveine-cafe": { open: "08:00", close: "16:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "violette-bakers": { open: "08:00", close: "17:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "jennifer-lees": { open: "08:00", close: "18:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "sweetgreen-seaport": { open: "10:30", close: "22:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "modern-pastry-gf-cannoli": {
    open: "08:00",
    close: "22:00",
    days: [0, 1, 2, 3, 4, 5, 6]
  },
  "nebo-cucina": { open: "16:30", close: "22:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "tea-party-tea-room": { open: "11:00", close: "17:00", days: [0, 1, 2, 3, 4, 5, 6] },
  "freedom-trail-walk-tour": { open: "10:00", close: "17:00", days: [0, 1, 2, 3, 4, 5, 6] }
};

type ThemeMode = "light" | "dark";
type TransitModePreference = TravelMode;
type EnergyMode = "SEE_IT_ALL" | "JUST_RIGHT" | "TAKE_IT_SLOW";

interface EnergyModeOption {
  mode: EnergyMode;
  label: string;
}

interface EnergyModeConfig {
  majorSegmentLimit: number;
  bufferBetweenMajorMins: number;
  maxTransfers: number;
  allowEndExtensionMins: number;
  avoidMbtaTransfers: boolean;
  keepSingleCluster: boolean;
  maxMajorVisitMins: number;
  maxDiningVisitMins: number;
  includeOptionalSuggestion: boolean;
  returnNote: string;
}

interface MorningRunPreset {
  distanceLabel: string;
  durationLabel: string;
  turnaroundPlaceId: string;
  energyNote: string;
}

interface MorningRunPlan {
  title: string;
  bestTimeLabel: string;
  routeTypeLabel: string;
  surfaceLabel: string;
  distanceLabel: string;
  durationLabel: string;
  turnaroundLabel: string;
  turnaroundPlace?: Place;
  energyNote: string;
  routeSteps: string[];
  highlights: string[];
  safetyNote: string;
}

const energyModeOptions: EnergyModeOption[] = [
  {
    mode: "SEE_IT_ALL",
    label: "See It All"
  },
  {
    mode: "JUST_RIGHT",
    label: "Just Right"
  },
  {
    mode: "TAKE_IT_SLOW",
    label: "Take It Slow"
  }
];

const energyModeConfigByMode: Record<EnergyMode, EnergyModeConfig> = {
  SEE_IT_ALL: {
    majorSegmentLimit: 3,
    bufferBetweenMajorMins: 10,
    maxTransfers: 2,
    allowEndExtensionMins: 30,
    avoidMbtaTransfers: false,
    keepSingleCluster: false,
    maxMajorVisitMins: 55,
    maxDiningVisitMins: 70,
    includeOptionalSuggestion: true,
    returnNote: "Keep this as an optional extension only if energy and daylight still feel good."
  },
  JUST_RIGHT: {
    majorSegmentLimit: 2,
    bufferBetweenMajorMins: 15,
    maxTransfers: 1,
    allowEndExtensionMins: 0,
    avoidMbtaTransfers: false,
    keepSingleCluster: false,
    maxMajorVisitMins: 50,
    maxDiningVisitMins: 65,
    includeOptionalSuggestion: false,
    returnNote: "Return timing is held steady so the evening stays calm."
  },
  TAKE_IT_SLOW: {
    majorSegmentLimit: 1,
    bufferBetweenMajorMins: 20,
    maxTransfers: 0,
    allowEndExtensionMins: 0,
    avoidMbtaTransfers: true,
    keepSingleCluster: true,
    maxMajorVisitMins: 60,
    maxDiningVisitMins: 75,
    includeOptionalSuggestion: false,
    returnNote: "Return early and keep transitions simple."
  }
};

const morningRunPresetByMode: Record<EnergyMode, MorningRunPreset> = {
  SEE_IT_ALL: {
    distanceLabel: "3.8 - 4.0 miles",
    durationLabel: "40 - 45 minutes",
    turnaroundPlaceId: "north-end-waterfront",
    energyNote: "Extended option with a longer harbor push before the return."
  },
  JUST_RIGHT: {
    distanceLabel: "About 3.2 miles",
    durationLabel: "35 - 42 minutes",
    turnaroundPlaceId: "rowes-wharf",
    energyNote: "Balanced option with steady pace and enough photo pauses."
  },
  TAKE_IT_SLOW: {
    distanceLabel: "About 2.0 miles",
    durationLabel: "30 - 35 minutes",
    turnaroundPlaceId: "fan-pier-park-stop",
    energyNote: "Light movement option to stay fresh for the rest of the day."
  }
};

function isFullDayPlan(day: DayPlan): boolean {
  return day.availabilityLabel.toLowerCase().includes("full day");
}

function isEveningOnlyPlan(day: DayPlan): boolean {
  return day.availabilityLabel.toLowerCase().includes("evening only");
}

function defaultEnergyModeForDay(day: DayPlan): EnergyMode {
  return isFullDayPlan(day) ? "SEE_IT_ALL" : "JUST_RIGHT";
}

function isMorningRunEligibleDay(day: DayPlan): boolean {
  if (day.title === "Sunday") {
    return false;
  }

  if (isFullDayPlan(day)) {
    return true;
  }

  const hasEveningOnlyWindow = isEveningOnlyPlan(day);
  const startsLate = parseClockToMinutes(day.startTime) >= 16 * 60;

  return hasEveningOnlyWindow || startsLate;
}

function buildMorningRunPlan(
  day: DayPlan,
  energyMode: EnergyMode
): MorningRunPlan | undefined {
  if (!isMorningRunEligibleDay(day)) {
    return undefined;
  }

  const preset = morningRunPresetByMode[energyMode];
  const turnaroundPlace = placeById.get(preset.turnaroundPlaceId);
  const turnaroundLabel = turnaroundPlace?.name ?? "Harborwalk turnaround point";

  return {
    title: "Harbor Sunrise Walk / Run",
    bestTimeLabel: "Best time: 6:15 AM - 7:30 AM",
    routeTypeLabel: "Type: Out-and-back (walk or run)",
    surfaceLabel: "Surface: Paved Harborwalk",
    distanceLabel: `Distance: ${preset.distanceLabel}`,
    durationLabel: `Estimated duration: ${preset.durationLabel}`,
    turnaroundLabel: `Turnaround: ${turnaroundLabel}`,
    turnaroundPlace,
    energyNote: preset.energyNote,
    routeSteps: [
      "Exit the Westin toward Seaport Blvd and get onto the Harborwalk.",
      "Head north with the water on your left and stay on the paved waterfront path.",
      "Pass Fan Pier Park and continue toward your selected turnaround point.",
      "Turn around at your target point and return the same route to the Westin."
    ],
    highlights: [
      "Fan Pier Park skyline views",
      "Rowes Wharf harbor approach",
      "Optional North End waterfront extension on high-energy days"
    ],
    safetyNote:
      "Keep to the main Harborwalk path, use visible crossings at major intersections, and switch to a shorter turnaround if weather or footing changes."
  };
}

function resolveMajorSegmentLimitForDay(
  day: DayPlan,
  energyMode: EnergyMode,
  config: EnergyModeConfig
): number {
  if (day.title === "Thursday" && energyMode === "JUST_RIGHT") {
    return Math.max(config.majorSegmentLimit, 3);
  }

  if (!isFullDayPlan(day)) {
    return config.majorSegmentLimit;
  }

  switch (energyMode) {
    case "SEE_IT_ALL":
      return Math.max(config.majorSegmentLimit, 6);
    case "JUST_RIGHT":
      return Math.max(config.majorSegmentLimit, 4);
    case "TAKE_IT_SLOW":
      return Math.max(config.majorSegmentLimit, 2);
    default:
      return config.majorSegmentLimit;
  }
}

const AIRPORT_PLACE: Place = {
  id: "airport-bos",
  name: "Boston Logan International Airport (BOS)",
  category: "airport",
  neighborhood: "East Boston",
  lat: 42.3656,
  lng: -71.0096,
  visitDurationMins: 0,
  description: "Logan departure point."
};

interface DayTimingAdjustment {
  startTime: string;
  transportMode: TransitModePreference;
  legModeByToPlaceId: Record<string, TransitModePreference>;
  energyMode: EnergyMode;
  durationOffsetByStopIndex: Record<number, number>;
  timelineShiftByStopId: Record<string, number>;
}

interface EnergyModePreparedDay {
  plan: DayPlan;
  optionalSuggestion?: Place;
}

interface AdjustedReturnToHotelView {
  fromPlaceName: string;
  leaveByTime: string;
  arriveByTime: string;
  darkByTime: string;
  afterDark: boolean;
  modeInUse: TravelMode;
  travelMins: number;
  walkMins: number;
  mbtaMins: number;
  directions: string;
  safetyNote: string;
}

interface AdjustedDayView {
  startTime: string;
  endTime: string;
  stops: ScheduledStop[];
  returnToHotel?: AdjustedReturnToHotelView;
  optionalSuggestion?: Place;
}

interface UndoToastState {
  message: string;
  action: "UNDO_REMOVE" | "UNDO_ADD";
  dayTitle: string;
  placeId: string;
}

function buildDefaultDayAdjustments(dayPlans: DayPlan[]): Record<string, DayTimingAdjustment> {
  return Object.fromEntries(
    dayPlans.map((day) => [
      day.title,
      {
        startTime: day.startTime,
        transportMode: "WALK" as const,
        legModeByToPlaceId: {},
        energyMode: defaultEnergyModeForDay(day),
        durationOffsetByStopIndex: {},
        timelineShiftByStopId: {}
      }
    ])
  ) as Record<string, DayTimingAdjustment>;
}

function buildDefaultStringListByDay(dayPlans: DayPlan[]): Record<string, string[]> {
  return Object.fromEntries(dayPlans.map((day) => [day.title, []])) as Record<
    string,
    string[]
  >;
}

function placeToMapQuery(place: Place): string {
  return place.address?.trim().length
    ? `${place.name}, ${place.address}`
    : `${place.lat},${place.lng}`;
}

interface ScenicWalkWaypoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  neighborhoods: string[];
}

const scenicWalkWaypoints: ScenicWalkWaypoint[] = [
  {
    id: "fan-pier-seaport",
    label: "Fan Pier Harborwalk",
    lat: 42.3526,
    lng: -71.0443,
    neighborhoods: ["Seaport", "Waterfront"]
  },
  {
    id: "long-wharf",
    label: "Long Wharf",
    lat: 42.3598,
    lng: -71.0498,
    neighborhoods: ["Waterfront", "North End", "Downtown"]
  },
  {
    id: "public-garden",
    label: "Public Garden",
    lat: 42.3542,
    lng: -71.0695,
    neighborhoods: ["Beacon Hill", "Back Bay", "Downtown"]
  },
  {
    id: "faneuil-hall",
    label: "Faneuil Hall",
    lat: 42.3601,
    lng: -71.0568,
    neighborhoods: ["Downtown", "North End", "Waterfront"]
  }
];

function selectScenicWalkWaypoint(from: Place, to: Place): ScenicWalkWaypoint | undefined {
  const fromNeighborhood = from.neighborhood.toLowerCase();
  const toNeighborhood = to.neighborhood.toLowerCase();
  const directDistanceKm = haversineDistanceKm(from, to);
  let bestCandidate: ScenicWalkWaypoint | undefined;
  let bestViaDistanceKm = Number.POSITIVE_INFINITY;

  for (const waypoint of scenicWalkWaypoints) {
    const isRelevant = waypoint.neighborhoods.some((neighborhood) => {
      const normalized = neighborhood.toLowerCase();
      return normalized === fromNeighborhood || normalized === toNeighborhood;
    });
    if (!isRelevant) {
      continue;
    }

    const fromToWaypointKm = haversineDistanceByCoords(
      from.lat,
      from.lng,
      waypoint.lat,
      waypoint.lng
    );
    const waypointToDestinationKm = haversineDistanceByCoords(
      waypoint.lat,
      waypoint.lng,
      to.lat,
      to.lng
    );
    const viaDistanceKm = fromToWaypointKm + waypointToDestinationKm;
    const detourKm = viaDistanceKm - directDistanceKm;
    const isReasonableDetour =
      detourKm <= 1.35 || (directDistanceKm >= 3.2 && detourKm <= 1.9);

    if (!isReasonableDetour) {
      continue;
    }

    if (viaDistanceKm < bestViaDistanceKm) {
      bestViaDistanceKm = viaDistanceKm;
      bestCandidate = waypoint;
    }
  }

  return bestCandidate;
}

function readStoredRecord<T extends Record<string, unknown>>(
  key: string,
  defaults: T
): T {
  if (typeof window === "undefined") {
    return defaults;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      return defaults;
    }

    const merged: Record<string, unknown> = { ...defaults };
    for (const keyName of Object.keys(defaults)) {
      if (keyName in parsed) {
        merged[keyName] = parsed[keyName];
      }
    }
    return merged as T;
  } catch {
    return defaults;
  }
}

function buildGoogleMapsPlaceUrl(place: Place): string {
  const params = new URLSearchParams({
    api: "1",
    query: placeToMapQuery(place)
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function buildGoogleMapsNavigateUrl(
  place: Place,
  transportMode: TransitModePreference
): string {
  const params = new URLSearchParams({
    api: "1",
    destination: placeToMapQuery(place),
    travelmode: transportMode === "WALK" ? "walking" : "transit"
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildGoogleMapsLegRouteUrl(
  from: Place,
  to: Place,
  transportMode: TransitModePreference,
  preferScenicWalk = false
): string {
  const params = new URLSearchParams({
    api: "1",
    origin: placeToMapQuery(from),
    destination: placeToMapQuery(to),
    travelmode: transportMode === "WALK" ? "walking" : "transit"
  });

  if (preferScenicWalk && transportMode === "WALK") {
    const scenicWaypoint = selectScenicWalkWaypoint(from, to);
    if (scenicWaypoint) {
      params.set("waypoints", `${scenicWaypoint.lat},${scenicWaypoint.lng}`);
    }
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildGoogleMapsDayRouteUrl(
  startPlace: Place,
  stops: ScheduledStop[],
  transportMode: TransitModePreference
): string {
  if (stops.length === 0) {
    return buildGoogleMapsPlaceUrl(startPlace);
  }

  const routePoints = stops.map((stop) => placeToMapQuery(stop.place));
  const origin = placeToMapQuery(startPlace);
  const destination = placeToMapQuery(HOTEL_BASE);
  const waypoints = routePoints
    .filter((point) => point !== origin && point !== destination)
    .slice(0, 8);
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: transportMode === "WALK" ? "walking" : "transit"
  });

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildGoogleStreetViewUrl(place: Place): string {
  const params = new URLSearchParams({
    api: "1",
    map_action: "pano",
    viewpoint: `${place.lat},${place.lng}`
  });

  return `https://www.google.com/maps/@?${params.toString()}`;
}

function toMeridiem(clock24: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(clock24);
  if (!match) {
    return clock24;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;

  return `${normalizedHour}:${minutes} ${meridiem}`;
}

function parseClockToMinutes(value: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToClock(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getLikelyOpenStatus(
  place: Place,
  dayTitle: string,
  visitStartTime: string
): string | null {
  const hours = likelyHoursByPlaceId[place.id];
  const dayIndex = weekdayIndexByDayTitle[dayTitle];
  if (!hours || dayIndex === undefined || !hours.days.includes(dayIndex)) {
    return null;
  }

  const startMins = parseClockToMinutes(visitStartTime);
  const openMins = parseClockToMinutes(hours.open);
  const closeMins = parseClockToMinutes(hours.close);
  if (startMins >= openMins && startMins <= closeMins) {
    return `Likely open at this time (${toMeridiem(hours.open)}-${toMeridiem(hours.close)}).`;
  }

  return `May be closed at this time. Fallback: use a nearby add-on option below.`;
}

function getTransitMinsForMode(
  stop: ScheduledStop,
  transportMode: TransitModePreference
): number {
  const leg = stop.transitFromPrevious;
  if (!leg) {
    return 0;
  }

  return transportMode === "MBTA" ? leg.mbtaMins : leg.walkMins;
}

function getModeForLeg(
  adjustment: DayTimingAdjustment,
  toPlaceId: string
): TransitModePreference {
  return adjustment.legModeByToPlaceId[toPlaceId] ?? adjustment.transportMode;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceByCoords(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const arc =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(arc));
}

function haversineDistanceKm(a: Place, b: Place): number {
  return haversineDistanceByCoords(a.lat, a.lng, b.lat, b.lng);
}

function estimateWalkMinutesBetweenPlaces(from: Place, to: Place): number {
  const distanceKm = haversineDistanceKm(from, to);
  return Math.max(4, Math.round(distanceKm * 12));
}

function estimateMbtaMinutesBetweenPlaces(from: Place, to: Place): number {
  const directOverride = MBTA_OVERRIDES[`${from.id}->${to.id}`];
  if (directOverride) {
    return directOverride.minutes;
  }

  const reverseOverride = MBTA_OVERRIDES[`${to.id}->${from.id}`];
  if (reverseOverride) {
    return reverseOverride.minutes;
  }

  const distanceKm = haversineDistanceKm(from, to);
  return Math.max(12, Math.round(distanceKm * 8 + 10));
}

function formatNearbyStations(place: Place): string | null {
  const stations =
    NEARBY_MBTA_STATIONS[place.id] ??
    (place.id === AIRPORT_PLACE.id ? NEARBY_MBTA_STATIONS[AIRPORT_PLACE.id] : undefined);

  if (!stations || stations.length === 0) {
    return null;
  }

  if (stations.length === 1) {
    return stations[0];
  }

  return `${stations[0]} or ${stations[1]}`;
}

function buildWalkDirections(from: Place, to: Place): string {
  const destinationStations = formatNearbyStations(to);
  const stationFallback = destinationStations
    ? `If you want to shorten this leg, nearest T at arrival is ${destinationStations}.`
    : "If needed, switch to MBTA for this leg.";

  return `Walk from ${from.neighborhood} to ${to.neighborhood} on main streets. ${stationFallback}`;
}

function buildMbtaDirections(from: Place, to: Place): string {
  const directOverride = MBTA_OVERRIDES[`${from.id}->${to.id}`];
  const fromStations = formatNearbyStations(from);
  const toStations = formatNearbyStations(to);
  const stationHint =
    fromStations || toStations
      ? ` Nearest T near this leg: start ${fromStations ?? "by your current area"}, end ${
          toStations ?? "near your destination"
        }.`
      : "";
  if (directOverride) {
    return `${directOverride.directions}${stationHint}`;
  }

  const reverseOverride = MBTA_OVERRIDES[`${to.id}->${from.id}`];
  if (reverseOverride) {
    if (reverseOverride.reverseDirections) {
      return `${reverseOverride.reverseDirections}${stationHint}`;
    }

    return `Use MBTA from ${from.neighborhood} toward ${to.neighborhood}, then walk the final blocks.${stationHint}`;
  }

  return `Use MBTA from ${from.neighborhood} toward ${to.neighborhood}, then walk the final blocks.${stationHint}`;
}

function buildMbtaPaymentNote(from: Place, to: Place, directions: string): string {
  const involvesSilverLine = /\bSL1\b|Silver Line/i.test(directions);
  const involvesCommuterRailOrFerry = /Commuter Rail|ferry/i.test(directions);
  const fromAirport = from.id === AIRPORT_PLACE.id || from.category === "airport";
  const toAirport = to.id === AIRPORT_PLACE.id || to.category === "airport";

  if (fromAirport && involvesSilverLine) {
    return "Fare note: SL1 from Logan into the city is typically fare-free. If you transfer after that, tap to pay (or use a CharlieCard) for the next leg.";
  }

  if (toAirport && involvesSilverLine) {
    return "Fare note: SL1 toward Logan is typically a paid MBTA leg. Tap to pay when available; keep a CharlieCard as backup.";
  }

  if (involvesCommuterRailOrFerry) {
    return "Fare note: tap to pay may not cover Commuter Rail or ferry legs. Use mTicket/app or terminal ticketing for those segments.";
  }

  return "Fare note: tap to pay with a contactless card, phone, or watch on bus/subway where available. Keep a CharlieCard as backup.";
}

function pickRecommendedMode(walkMins: number, mbtaMins: number): TravelMode {
  if (walkMins <= 16) {
    return "WALK";
  }

  if (walkMins >= 28) {
    return "MBTA";
  }

  if (mbtaMins <= walkMins - 4) {
    return "MBTA";
  }

  if (walkMins > 20 && mbtaMins <= walkMins + 4) {
    return "MBTA";
  }

  return "WALK";
}

function buildTransitEstimateBetweenPlaces(from: Place, to: Place): TransitEstimate {
  const walkMins = estimateWalkMinutesBetweenPlaces(from, to);
  const mbtaMins = estimateMbtaMinutesBetweenPlaces(from, to);
  const recommendedMode = pickRecommendedMode(walkMins, mbtaMins);

  return {
    fromId: from.id,
    toId: to.id,
    walkMins,
    mbtaMins,
    recommendedMode,
    recommendedMins: recommendedMode === "MBTA" ? mbtaMins : walkMins,
    directions:
      recommendedMode === "MBTA"
        ? buildMbtaDirections(from, to)
        : buildWalkDirections(from, to)
  };
}

function withWalkPreferred(leg: TransitEstimate, from: Place, to: Place): TransitEstimate {
  return {
    ...leg,
    recommendedMode: "WALK",
    recommendedMins: leg.walkMins,
    directions: buildWalkDirections(from, to)
  };
}

function isMajorPlace(place: Place): boolean {
  return (
    place.category !== "restaurant" &&
    place.category !== "conference" &&
    place.category !== "airport"
  );
}

function isGlutenFreeRestaurant(place: Place): boolean {
  return place.category === "restaurant" && place.glutenFreeSafe === true;
}

function isEveningBakeryStop(place: Place): boolean {
  return place.id === "jennifer-lees" || place.id === "kanes-downtown";
}

function dedupePlacesById(places: Place[]): Place[] {
  const seen = new Set<string>();
  const deduped: Place[] = [];

  for (const place of places) {
    if (seen.has(place.id)) {
      continue;
    }
    seen.add(place.id);
    deduped.push(place);
  }

  return deduped;
}

function isWithinWalkingDistance(
  place: Place,
  anchorPlaces: Place[],
  maxWalkMins: number
): boolean {
  return anchorPlaces.some(
    (anchorPlace) =>
      estimateWalkMinutesBetweenPlaces(anchorPlace, place) <= maxWalkMins
  );
}

function estimateNearestWalkMinutes(place: Place, anchorPlaces: Place[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const anchorPlace of anchorPlaces) {
    const mins = estimateWalkMinutesBetweenPlaces(anchorPlace, place);
    if (mins < best) {
      best = mins;
    }
  }

  return Number.isFinite(best) ? best : 0;
}

function getAdditionalSightseeingOptions(
  day: DayPlan,
  visibleStops: ScheduledStop[],
  globallyExcludedSightIds: ReadonlySet<string>,
  dayStartPoint: Place
): Place[] {
  const dayTemplate = dayTemplateByTitle.get(day.title);
  if (!dayTemplate) {
    return [];
  }

  const visibleStopIds = new Set(visibleStops.map((stop) => stop.place.id));
  const walkingAnchors = [dayStartPoint, ...visibleStops.map((stop) => stop.place)];
  const templateOptions = dayTemplate.stopIds
    .map((id) => placeById.get(id))
    .filter((place): place is Place => Boolean(place))
    .filter(
      (place) =>
        isMajorPlace(place) &&
        !disabledPlaceIds.has(place.id) &&
        !visibleStopIds.has(place.id) &&
        !globallyExcludedSightIds.has(place.id) &&
        isWithinWalkingDistance(place, walkingAnchors, extraOptionMaxWalkMins)
    );

  if (templateOptions.length > 0) {
    return templateOptions;
  }

  return BOSTON_PLACES.filter(
    (place) =>
      isMajorPlace(place) &&
      !disabledPlaceIds.has(place.id) &&
      !visibleStopIds.has(place.id) &&
      !globallyExcludedSightIds.has(place.id) &&
      dayTemplate.targetNeighborhoods.includes(place.neighborhood) &&
      isWithinWalkingDistance(place, walkingAnchors, extraOptionMaxWalkMins)
  ).slice(0, 4);
}

function getAdditionalCozyCafeOptions(
  day: DayPlan,
  visibleStops: ScheduledStop[],
  dayStartPoint: Place
): Place[] {
  const dayTemplate = dayTemplateByTitle.get(day.title);
  if (!dayTemplate) {
    return [];
  }

  const optionIds = cozyCafeOptionIdsByDayTitle[day.title] ?? [];
  const visibleStopIds = new Set(visibleStops.map((stop) => stop.place.id));
  const walkingAnchors = [dayStartPoint, ...visibleStops.map((stop) => stop.place)];
  const preferredOptions = optionIds
    .map((id) => placeById.get(id))
    .filter((place): place is Place => Boolean(place))
    .filter(
      (place) =>
        isGlutenFreeRestaurant(place) &&
        (!isEveningOnlyPlan(day) || !isEveningBakeryStop(place)) &&
        !disabledPlaceIds.has(place.id) &&
        !visibleStopIds.has(place.id) &&
        isWithinWalkingDistance(place, walkingAnchors, extraOptionMaxWalkMins)
    );

  if (preferredOptions.length > 0) {
    return preferredOptions;
  }

  return BOSTON_PLACES.filter(
    (place) =>
      isGlutenFreeRestaurant(place) &&
      (!isEveningOnlyPlan(day) || !isEveningBakeryStop(place)) &&
      !disabledPlaceIds.has(place.id) &&
      !visibleStopIds.has(place.id) &&
      dayTemplate.targetNeighborhoods.includes(place.neighborhood) &&
      isWithinWalkingDistance(place, walkingAnchors, extraOptionMaxWalkMins)
  ).slice(0, 3);
}

function buildStartPointForDay(day: DayPlan): Place {
  return day.startFrom === "airport" ? AIRPORT_PLACE : HOTEL_BASE;
}

function buildClusterLabelFromStops(stops: ScheduledStop[]): string {
  const neighborhoodCounts = new Map<string, number>();
  for (const stop of stops) {
    neighborhoodCounts.set(
      stop.place.neighborhood,
      (neighborhoodCounts.get(stop.place.neighborhood) ?? 0) + 1
    );
  }

  const topNeighborhoods = [...neighborhoodCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([neighborhood]) => neighborhood);

  return topNeighborhoods.join(" + ") || "Seaport";
}

function buildRainFallbackTip(dayTitle: string): string {
  const tipByDayTitle: Record<string, string> = {
    Sunday:
      "Rain fallback nearby: Boston Tea Party Ships & Museum + Abigail's Tea Room are good indoor anchors in this zone.",
    Monday:
      "Rain fallback nearby: Nichols House Museum and Beacon Hill side streets keep this evening mostly sheltered and compact.",
    Tuesday:
      "Rain fallback nearby: Old South Meeting House and Boston Public Market are both indoor-friendly near Downtown Crossing.",
    Wednesday:
      "Rain fallback nearby: Boston Public Library + Trinity Church interiors keep Back Bay walk time short.",
    Thursday:
      "Rain fallback nearby: keep Thursday centered on Boston Public Market + Old State House/Old South, then return to the Westin for suitcase pickup before Logan."
  };

  return (
    tipByDayTitle[dayTitle] ??
    "Rain fallback nearby: switch to an indoor stop in this same neighborhood cluster."
  );
}

function pickNearestPlace(
  origin: Place,
  candidates: Place[],
  maxDistanceKm?: number
): Place | undefined {
  let best: Place | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const distance = haversineDistanceKm(origin, candidate);
    if (maxDistanceKm !== undefined && distance > maxDistanceKm) {
      continue;
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best;
}

function findBestInsertionIndex(
  places: Place[],
  insertPlace: Place,
  startPlace: Place
): number {
  let bestIndex = places.length;
  let bestCost = Number.POSITIVE_INFINITY;

  for (let index = 0; index <= places.length; index += 1) {
    const previousPlace = index === 0 ? startPlace : places[index - 1];
    const nextPlace = places[index];
    const transitBefore = buildTransitEstimateBetweenPlaces(previousPlace, insertPlace);
    const transitAfter = nextPlace
      ? buildTransitEstimateBetweenPlaces(insertPlace, nextPlace)
      : undefined;
    const transitDirect = nextPlace
      ? buildTransitEstimateBetweenPlaces(previousPlace, nextPlace)
      : undefined;

    const addedCost =
      transitBefore.recommendedMins +
      (transitAfter?.recommendedMins ?? 0) -
      (transitDirect?.recommendedMins ?? 0);

    if (addedCost < bestCost) {
      bestCost = addedCost;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function buildModeStops(
  day: DayPlan,
  orderedPlaces: Place[],
  config: EnergyModeConfig
): ScheduledStop[] {
  const startPoint = buildStartPointForDay(day);
  const isThursdayAirportDay = day.title === "Thursday";
  let previousPlace = startPoint;
  let mbtaTransfers = 0;
  const modeStops: ScheduledStop[] = [];

  for (const place of orderedPlaces) {
    let transit = buildTransitEstimateBetweenPlaces(previousPlace, place);

    if (config.avoidMbtaTransfers && transit.recommendedMode === "MBTA") {
      transit = withWalkPreferred(transit, previousPlace, place);
    }

    if (transit.recommendedMode === "MBTA" && mbtaTransfers >= config.maxTransfers) {
      if (transit.walkMins <= 28) {
        transit = withWalkPreferred(transit, previousPlace, place);
      } else {
        continue;
      }
    }

    if (transit.recommendedMode === "MBTA") {
      mbtaTransfers += 1;
    }

    const sourceStop = day.stops.find((stop) => stop.place.id === place.id);
    const baseDuration = sourceStop?.visitDurationMins ?? place.visitDurationMins;
    const isFixedGuidedTourStop = place.id === FREEDOM_TRAIL_TOUR_ID;
    const isThursdaySuitcasePickupStop =
      day.title === "Thursday" && place.id === HOTEL_BASE.id && sourceStop === undefined;
    const cappedDurationBase =
      place.id === HOTEL_BASE.id
        ? isThursdaySuitcasePickupStop
          ? 20
          : baseDuration
        : isFixedGuidedTourStop
          ? Math.max(90, baseDuration)
        : place.category === "restaurant"
          ? Math.max(minVisitDurationMins, Math.min(baseDuration, config.maxDiningVisitMins))
          : Math.max(minVisitDurationMins, Math.min(baseDuration, config.maxMajorVisitMins));
    const cappedDuration =
      isThursdayAirportDay && place.category !== "restaurant" && place.id !== HOTEL_BASE.id
        ? Math.min(cappedDurationBase, 32)
        : cappedDurationBase;

    modeStops.push({
      place,
      arrival: "00:00",
      departure: "00:00",
      visitDurationMins: cappedDuration,
      transitFromPrevious: transit
    });

    previousPlace = place;
  }

  for (let index = 0; index < modeStops.length - 1; index += 1) {
    const current = modeStops[index];
    const next = modeStops[index + 1];
    const isMajorToMajor = isMajorPlace(current.place) && isMajorPlace(next.place);

    current.bufferAfterMins = isMajorToMajor
      ? isThursdayAirportDay
        ? Math.min(config.bufferBetweenMajorMins, 10)
        : config.bufferBetweenMajorMins
      : Math.max(8, config.bufferBetweenMajorMins - 5);
  }

  return modeStops;
}

function prepareDayForEnergyMode(
  day: DayPlan,
  energyMode: EnergyMode,
  glutenFreeCatalog: Place[]
): EnergyModePreparedDay {
  const config = energyModeConfigByMode[energyMode];
  const majorSegmentLimit = resolveMajorSegmentLimitForDay(
    day,
    energyMode,
    config
  );
  const bagDropPlaces = day.stops
    .filter((stop) => stop.place.id === HOTEL_BASE.id && stop.visitDurationMins > 0)
    .map((stop) => stop.place);
  const nonBagStops = day.stops.filter((stop) => stop.place.id !== HOTEL_BASE.id);
  const majorStops = nonBagStops.filter((stop) => isMajorPlace(stop.place));
  const dayPriorityMajorIdsByTitle: Record<string, string[]> = {
    Sunday: ["tea-party-tea-room", "freedom-trail-walk-tour"],
    Monday: ["beacon-hill-stroll", "louisburg-square-loop"],
    Tuesday: ["old-south-meeting-house", "old-state-house-stop", "kings-chapel-stop"],
    Wednesday: ["bpl-courtyard", "copley-square-trinity", "old-south-church-stop"],
    Thursday: ["boston-public-market-stop", "old-state-house-stop", "old-south-meeting-house"]
  };
  const dayPriorityMajorIds = dayPriorityMajorIdsByTitle[day.title] ?? [];
  const priorityMajorPlaces = dayPriorityMajorIds
    .map((stopId) => majorStops.find((stop) => stop.place.id === stopId)?.place)
    .filter((place): place is Place => Boolean(place));
  const remainingMajorPlaces = majorStops
    .map((stop) => stop.place)
    .filter((place) => !priorityMajorPlaces.some((priority) => priority.id === place.id))
    .sort((a, b) => {
      if (day.title !== "Thursday") {
        return 0;
      }

      const aWaterfront = a.category === "waterfront" ? 1 : 0;
      const bWaterfront = b.category === "waterfront" ? 1 : 0;
      return aWaterfront - bWaterfront;
    });
  const majorPlaceCandidates = dedupePlacesById([
    ...priorityMajorPlaces,
    ...remainingMajorPlaces
  ]);
  const selectedMajorPlaces = majorPlaceCandidates.slice(0, majorSegmentLimit);

  const optionalSuggestion = config.includeOptionalSuggestion
    ? majorPlaceCandidates[majorSegmentLimit]
    : undefined;

  const anchorPlace =
    selectedMajorPlaces[0] ??
    majorPlaceCandidates[0] ??
    nonBagStops[0]?.place ??
    buildStartPointForDay(day);
  const excludeEveningBakery = isEveningOnlyPlan(day);
  const keepDinnerAsHotelPickup = isEveningOnlyPlan(day);
  const avoidSweetgreenForThursdayMorning = day.title === "Thursday";
  const sweetgreenPickupPlace = placeById.get("sweetgreen-seaport");

  const dayGlutenFreePlaces = nonBagStops
    .map((stop) => stop.place)
    .filter((place) => isGlutenFreeRestaurant(place))
    .filter((place) => !excludeEveningBakery || !isEveningBakeryStop(place))
    .filter((place) => !avoidSweetgreenForThursdayMorning || place.id !== "sweetgreen-seaport");
  const fallbackGlutenFreePlaces = glutenFreeCatalog.filter(
    (place) =>
      (!excludeEveningBakery || !isEveningBakeryStop(place)) &&
      (!avoidSweetgreenForThursdayMorning || place.id !== "sweetgreen-seaport") &&
      !dayGlutenFreePlaces.some((dayPlace) => dayPlace.id === place.id) &&
      !selectedMajorPlaces.some((majorPlace) => majorPlace.id === place.id)
  );

  function nearbyFiltered(candidates: Place[]): Place[] {
    if (!config.keepSingleCluster) {
      return candidates;
    }

    const nearbyCandidates = candidates.filter(
      (candidate) => haversineDistanceKm(anchorPlace, candidate) <= 2.1
    );
    return nearbyCandidates.length > 0 ? nearbyCandidates : candidates;
  }

  const preferredDayGlutenFree = nearbyFiltered(dedupePlacesById(dayGlutenFreePlaces));
  const preferredFallbackGlutenFree = nearbyFiltered(
    dedupePlacesById(fallbackGlutenFreePlaces)
  );
  const shouldForceSweetgreenDinnerPickup =
    keepDinnerAsHotelPickup &&
    sweetgreenPickupPlace !== undefined &&
    isGlutenFreeRestaurant(sweetgreenPickupPlace);
  const glutenFreeAnchor = keepDinnerAsHotelPickup ? HOTEL_BASE : anchorPlace;
  const thursdayMorningGlutenFreePlace =
    day.title === "Thursday"
      ? pickNearestPlace(glutenFreeAnchor, [
          ...preferredDayGlutenFree,
          ...preferredFallbackGlutenFree
        ])
      : undefined;
  const selectedGlutenFreePlace =
    day.title === "Thursday"
      ? undefined
      : (shouldForceSweetgreenDinnerPickup ? sweetgreenPickupPlace : undefined) ??
        thursdayMorningGlutenFreePlace ??
        pickNearestPlace(glutenFreeAnchor, preferredDayGlutenFree) ??
        pickNearestPlace(glutenFreeAnchor, preferredFallbackGlutenFree);

  const corePlaces = dedupePlacesById(selectedMajorPlaces);
  if (selectedGlutenFreePlace) {
    if (keepDinnerAsHotelPickup) {
      corePlaces.push(selectedGlutenFreePlace);
    } else {
      const insertionStart =
        bagDropPlaces[bagDropPlaces.length - 1] ?? buildStartPointForDay(day);
      const insertionIndex = findBestInsertionIndex(
        corePlaces,
        selectedGlutenFreePlace,
        insertionStart
      );
      corePlaces.splice(insertionIndex, 0, selectedGlutenFreePlace);
    }
  }

  const shouldAddThursdaySuitcasePickup =
    day.title === "Thursday" && !corePlaces.some((place) => place.id === HOTEL_BASE.id);
  if (shouldAddThursdaySuitcasePickup) {
    corePlaces.push(HOTEL_BASE);
  }

  const orderedPlaces = dedupePlacesById([...bagDropPlaces, ...corePlaces]);
  const modeStops = buildModeStops(day, orderedPlaces, config);
  const modeClusterLabel = buildClusterLabelFromStops(modeStops);
  const modeLabel = energyModeOptions.find((option) => option.mode === energyMode)?.label;
  const modeNote = `Energy mode: ${modeLabel ?? "Just Right"}. ${config.returnNote}`;
  const modeNotes = [modeNote, ...day.notes.filter((note) => !note.startsWith("Energy mode:"))];

  if (selectedGlutenFreePlace && !dayGlutenFreePlaces.some((place) => place.id === selectedGlutenFreePlace.id)) {
    modeNotes.push(
      `Added nearby gluten-free stop: ${selectedGlutenFreePlace.name}.`
    );
  }

  if (config.keepSingleCluster) {
    modeNotes.push("Take It Slow keeps this day centered in one nearby cluster.");
  }

  if (excludeEveningBakery) {
    modeNotes.push(
      "Evening plan avoids bakery stops and keeps food options aligned with post-conference timing."
    );
  }

  if (keepDinnerAsHotelPickup && selectedGlutenFreePlace) {
    modeNotes.push(
      `Dinner is set as pickup at ${selectedGlutenFreePlace.name} on your way back to the hotel.`
    );
  }

  if (day.title === "Thursday") {
    modeNotes.push(
      "Thursday is planned for weather flexibility: keep stops compact and prioritize indoor time if rain starts."
    );
  }

  if (shouldAddThursdaySuitcasePickup) {
    modeNotes.push(
      "Suitcase checkpoint added: return to the Westin before airport transfer."
    );
  }

  if (config.includeOptionalSuggestion && optionalSuggestion) {
    modeNotes.push(`Optional extra: ${optionalSuggestion.name}.`);
  }

  return {
    plan: {
      ...day,
      clusterLabel: modeClusterLabel,
      stops: modeStops,
      notes: modeNotes
    },
    optionalSuggestion
  };
}

function buildAdjustedDayView(
  day: DayPlan,
  adjustment: DayTimingAdjustment,
  modeConfig: EnergyModeConfig,
  optionalSuggestion?: Place
): AdjustedDayView {
  const dayEndLimitMins =
    parseClockToMinutes(day.endTime) + modeConfig.allowEndExtensionMins;
  let cursor = parseClockToMinutes(adjustment.startTime);
  const adjustedStops: ScheduledStop[] = [];

  for (let stopIndex = 0; stopIndex < day.stops.length; stopIndex += 1) {
    const stop = day.stops[stopIndex];
    const timelineShiftMins = adjustment.timelineShiftByStopId?.[stop.place.id] ?? 0;
    cursor += timelineShiftMins;
    const legMode = getModeForLeg(adjustment, stop.place.id);
    const legMins = getTransitMinsForMode(stop, legMode);
    const tentativeArrivalMins = cursor + legMins;
    const fixedArrival = fixedArrivalByDayAndStopId[day.title]?.[stop.place.id];
    const fixedArrivalMins = fixedArrival
      ? parseClockToMinutes(fixedArrival)
      : undefined;
    const arrivalMins =
      fixedArrivalMins !== undefined
        ? Math.max(tentativeArrivalMins, fixedArrivalMins)
        : tentativeArrivalMins;
    const bufferMins = stop.bufferAfterMins ?? 0;
    const durationOffset = adjustment.durationOffsetByStopIndex[stopIndex] ?? 0;
    const adjustedVisitDurationMins = Math.max(
      minVisitDurationMins,
      Math.min(maxVisitDurationMins, stop.visitDurationMins + durationOffset)
    );
    const departureWithoutBufferMins = arrivalMins + adjustedVisitDurationMins;
    if (departureWithoutBufferMins > dayEndLimitMins) {
      break;
    }

    const allowedBufferMins = Math.max(
      0,
      Math.min(bufferMins, dayEndLimitMins - departureWithoutBufferMins)
    );
    const departureMins = departureWithoutBufferMins + allowedBufferMins;

    cursor = departureMins;

    adjustedStops.push({
      ...stop,
      bufferAfterMins: allowedBufferMins > 0 ? allowedBufferMins : undefined,
      visitDurationMins: adjustedVisitDurationMins,
      arrival: minutesToClock(arrivalMins),
      departure: minutesToClock(departureMins)
    });
  }

  const adjustedEndTime =
    adjustedStops.length > 0
      ? adjustedStops[adjustedStops.length - 1].departure
      : adjustment.startTime;

  let returnToHotel: AdjustedReturnToHotelView | undefined;
  if (day.returnToHotel && adjustedStops.length > 0) {
    const finalStop = adjustedStops[adjustedStops.length - 1];
    const leaveByTime = finalStop.departure;
    const leaveByMins = parseClockToMinutes(leaveByTime);
    const darkByMins = parseClockToMinutes(day.returnToHotel.darkByTime);
    const afterDark = leaveByMins >= darkByMins;
    const modeInUse: TravelMode = getModeForLeg(
      adjustment,
      RETURN_TO_HOTEL_LEG_ID
    );
    const travelMins =
      modeInUse === "MBTA" ? day.returnToHotel.mbtaMins : day.returnToHotel.walkMins;
    const arriveByTime = minutesToClock(leaveByMins + travelMins);

    const directions =
      modeInUse === day.returnToHotel.recommendedMode
        ? day.returnToHotel.directions
        : modeInUse === "MBTA"
          ? "Use MBTA back toward Seaport/World Trade Center and walk the final blocks to the Westin."
          : "Walk back using well-lit, active streets and avoid isolated shortcuts.";

    const safetyNote = afterDark
      ? modeInUse === "MBTA"
        ? "After dark: MBTA is recommended. Stay on active platforms and main streets for the final walk."
        : "After dark: walking is doable, but switch to MBTA if streets feel too quiet."
      : "Before dark: keep to main streets and switch to MBTA if weather or energy changes.";

    returnToHotel = {
      ...day.returnToHotel,
      leaveByTime,
      arriveByTime,
      afterDark,
      modeInUse,
      travelMins,
      directions,
      safetyNote
    };
  }

  return {
    startTime: adjustment.startTime,
    endTime: adjustedEndTime,
    stops: adjustedStops,
    returnToHotel:
      returnToHotel && adjustment.energyMode === "TAKE_IT_SLOW"
        ? {
            ...returnToHotel,
            safetyNote: `${returnToHotel.safetyNote} Return a little earlier tonight for a lower-stress finish.`
          }
        : returnToHotel,
    optionalSuggestion:
      adjustment.energyMode === "SEE_IT_ALL" ? optionalSuggestion : undefined
  };
}

function buildCustomizedDayView(
  day: DayPlan,
  adjustedDay: AdjustedDayView,
  adjustment: DayTimingAdjustment,
  modeConfig: EnergyModeConfig,
  lockedPlaces: Place[],
  addedPlaces: Place[],
  removedStopIds: ReadonlySet<string>
): AdjustedDayView {
  const startPoint = buildStartPointForDay(day);
  const baseStops = adjustedDay.stops.filter(
    (stop) => !removedStopIds.has(stop.place.id)
  );
  const orderedPlaces = baseStops.map((stop) => stop.place);

  const requiredPlaces = dedupePlacesById([...lockedPlaces, ...addedPlaces]);
  for (const requiredPlace of requiredPlaces) {
    if (orderedPlaces.some((place) => place.id === requiredPlace.id)) {
      continue;
    }

    const insertionIndex = findBestInsertionIndex(orderedPlaces, requiredPlace, startPoint);
    orderedPlaces.splice(insertionIndex, 0, requiredPlace);
  }

  const sourceStopById = new Map(baseStops.map((stop) => [stop.place.id, stop]));
  const dayEndLimitMins =
    parseClockToMinutes(day.endTime) + modeConfig.allowEndExtensionMins;
  let cursor = parseClockToMinutes(adjustedDay.startTime);
  let previousPlace = startPoint;
  const rebuiltStops: ScheduledStop[] = [];

  for (let index = 0; index < orderedPlaces.length; index += 1) {
    const place = orderedPlaces[index];
    const timelineShiftMins = adjustment.timelineShiftByStopId?.[place.id] ?? 0;
    cursor += timelineShiftMins;
    const sourceStop = sourceStopById.get(place.id);
    const transit = buildTransitEstimateBetweenPlaces(previousPlace, place);
    const legMode = getModeForLeg(adjustment, place.id);
    const legMins = legMode === "MBTA" ? transit.mbtaMins : transit.walkMins;
    const tentativeArrivalMins = cursor + legMins;
    const fixedArrival = fixedArrivalByDayAndStopId[day.title]?.[place.id];
    const fixedArrivalMins = fixedArrival
      ? parseClockToMinutes(fixedArrival)
      : undefined;
    const arrivalMins =
      fixedArrivalMins !== undefined
        ? Math.max(tentativeArrivalMins, fixedArrivalMins)
        : tentativeArrivalMins;
    const visitDurationMins = sourceStop
      ? sourceStop.visitDurationMins
      : Math.max(minVisitDurationMins, Math.min(maxVisitDurationMins, place.visitDurationMins));
    const nextPlace = orderedPlaces[index + 1];
    const sourceBufferMins = sourceStop?.bufferAfterMins;
    const computedBufferMins = nextPlace
      ? isMajorPlace(place) && isMajorPlace(nextPlace)
        ? modeConfig.bufferBetweenMajorMins
        : Math.max(8, modeConfig.bufferBetweenMajorMins - 5)
      : 0;
    const bufferMins = sourceBufferMins ?? computedBufferMins;
    const departureWithoutBufferMins = arrivalMins + visitDurationMins;
    if (departureWithoutBufferMins > dayEndLimitMins) {
      break;
    }

    const allowedBufferMins = Math.max(
      0,
      Math.min(bufferMins, dayEndLimitMins - departureWithoutBufferMins)
    );
    const departureMins = departureWithoutBufferMins + allowedBufferMins;

    rebuiltStops.push({
      place,
      arrival: minutesToClock(arrivalMins),
      departure: minutesToClock(departureMins),
      visitDurationMins,
      transitFromPrevious: transit,
      bufferAfterMins: allowedBufferMins > 0 ? allowedBufferMins : undefined
    });

    cursor = departureMins;
    previousPlace = place;
  }

  const rebuiltEndTime =
    rebuiltStops.length > 0
      ? rebuiltStops[rebuiltStops.length - 1].departure
      : adjustedDay.startTime;

  let returnToHotel: AdjustedReturnToHotelView | undefined;
  if (day.returnToHotel && rebuiltStops.length > 0) {
    const finalStop = rebuiltStops[rebuiltStops.length - 1];
    const leaveByTime = finalStop.departure;
    const leaveByMins = parseClockToMinutes(leaveByTime);
    const darkByMins = parseClockToMinutes(day.returnToHotel.darkByTime);
    const afterDark = leaveByMins >= darkByMins;
    const modeInUse: TravelMode = getModeForLeg(
      adjustment,
      RETURN_TO_HOTEL_LEG_ID
    );
    const transitBack = buildTransitEstimateBetweenPlaces(finalStop.place, HOTEL_BASE);
    const travelMins =
      modeInUse === "MBTA" ? transitBack.mbtaMins : transitBack.walkMins;
    const arriveByTime = minutesToClock(leaveByMins + travelMins);
    const directions =
      modeInUse === "MBTA"
        ? buildMbtaDirections(finalStop.place, HOTEL_BASE)
        : buildWalkDirections(finalStop.place, HOTEL_BASE);
    const safetyNote = afterDark
      ? modeInUse === "MBTA"
        ? "After dark: MBTA is recommended. Stay on active platforms and main streets for the final walk."
        : "After dark: walking is doable, but switch to MBTA if streets feel too quiet."
      : "Before dark: keep to main streets and switch to MBTA if weather or energy changes.";

    returnToHotel = {
      fromPlaceName: finalStop.place.name,
      leaveByTime,
      arriveByTime,
      darkByTime: day.returnToHotel.darkByTime,
      afterDark,
      modeInUse,
      travelMins,
      walkMins: transitBack.walkMins,
      mbtaMins: transitBack.mbtaMins,
      directions,
      safetyNote
    };
  }

  const optionalSuggestion =
    adjustedDay.optionalSuggestion &&
    !rebuiltStops.some(
      (stop) => stop.place.id === adjustedDay.optionalSuggestion?.id
    )
      ? adjustedDay.optionalSuggestion
      : undefined;

  return {
    ...adjustedDay,
    endTime: rebuiltEndTime,
    stops: rebuiltStops,
    returnToHotel,
    optionalSuggestion
  };
}

function buildReturnToHotelView(
  finalStop: ScheduledStop,
  dayReturnPlan: NonNullable<DayPlan["returnToHotel"]>,
  modeInUse: TravelMode,
  energyMode: EnergyMode
): AdjustedReturnToHotelView {
  const leaveByTime = finalStop.departure;
  const leaveByMins = parseClockToMinutes(leaveByTime);
  const darkByMins = parseClockToMinutes(dayReturnPlan.darkByTime);
  const afterDark = leaveByMins >= darkByMins;
  const transitBack = buildTransitEstimateBetweenPlaces(finalStop.place, HOTEL_BASE);
  const travelMins = modeInUse === "MBTA" ? transitBack.mbtaMins : transitBack.walkMins;
  const arriveByTime = minutesToClock(leaveByMins + travelMins);
  const directions =
    modeInUse === "MBTA"
      ? buildMbtaDirections(finalStop.place, HOTEL_BASE)
      : buildWalkDirections(finalStop.place, HOTEL_BASE);
  const safetyNote = afterDark
    ? modeInUse === "MBTA"
      ? "After dark: MBTA is recommended. Stay on active platforms and main streets for the final walk."
      : "After dark: walking is doable, but switch to MBTA if streets feel too quiet."
    : "Before dark: keep to main streets and switch to MBTA if weather or energy changes.";

  return {
    fromPlaceName: finalStop.place.name,
    leaveByTime,
    arriveByTime,
    darkByTime: dayReturnPlan.darkByTime,
    afterDark,
    modeInUse,
    travelMins,
    walkMins: transitBack.walkMins,
    mbtaMins: transitBack.mbtaMins,
    directions,
    safetyNote:
      energyMode === "TAKE_IT_SLOW"
        ? `${safetyNote} Return a little earlier tonight for a lower-stress finish.`
        : safetyNote
  };
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function TransitLeg({
  stop,
  fromPlace,
  fromLabel,
  leaveByTime,
  transportMode,
  onTransportModeChange,
  isCollapsed,
  onToggleCollapse,
  timelineShiftMins,
  onTimelineShift,
  onClearTimelineShift
}: {
  stop: ScheduledStop;
  fromPlace: Place;
  fromLabel: string;
  leaveByTime: string;
  transportMode: TransitModePreference;
  onTransportModeChange: (nextMode: TransitModePreference) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  timelineShiftMins: number;
  onTimelineShift: (deltaMins: number) => void;
  onClearTimelineShift: () => void;
}) {
  if (!stop.transitFromPrevious) {
    return null;
  }

  const leg = stop.transitFromPrevious;
  const modeInUse = transportMode;
  const modeLabel = modeLabels[modeInUse];
  const travelMins = modeInUse === "MBTA" ? leg.mbtaMins : leg.walkMins;
  const destinationStations = formatNearbyStations(stop.place);
  const legRouteUrl = buildGoogleMapsLegRouteUrl(fromPlace, stop.place, modeInUse);
  const scenicWalkWaypoint =
    modeInUse === "WALK" ? selectScenicWalkWaypoint(fromPlace, stop.place) : undefined;
  const scenicWalkRouteUrl =
    modeInUse === "WALK"
      ? buildGoogleMapsLegRouteUrl(fromPlace, stop.place, "WALK", true)
      : undefined;
  const directions =
    modeInUse === leg.recommendedMode
      ? leg.directions
      : modeInUse === "MBTA"
        ? `Use MBTA for this leg and confirm the best line and next departure in Google Maps.${
            destinationStations
              ? ` Nearest T at arrival: ${destinationStations}.`
              : ""
          }`
        : "Walk this leg via well-lit main streets; check Google Maps for the safest path.";
  const mbtaPaymentNote = buildMbtaPaymentNote(fromPlace, stop.place, directions);

  return (
    <div className="transit-leg">
      <div className="transit-card-header">
        <p className="segment-card-label transit-card-label">How to get there</p>
        <button
          type="button"
          className="card-collapse-toggle"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={
            isCollapsed ? "Expand how to get there card" : "Collapse how to get there card"
          }
        >
          {isCollapsed ? "+" : "-"}
        </button>
      </div>
      <p className="transit-route">
        {fromLabel}
        {" -> "}
        {stop.place.name}
      </p>
      {isCollapsed ? (
        <p className="transit-collapsed-summary">
          {toMeridiem(leaveByTime)} {"->"} {toMeridiem(stop.arrival)} | {modeLabel}{" "}
          {travelMins} min
        </p>
      ) : (
        <>
          <label className="transit-mode-field">
            <span>Transit mode</span>
            <select
              value={transportMode}
              onChange={(event) =>
                onTransportModeChange(event.target.value as TransitModePreference)
              }
            >
              <option value="WALK">Walk</option>
              <option value="MBTA">Take the T</option>
            </select>
          </label>
          <div className="transit-metrics">
            <p>
              <span>Leave by</span>
              <strong>{toMeridiem(leaveByTime)}</strong>
            </p>
            <p>
              <span>Target arrival</span>
              <strong>{toMeridiem(stop.arrival)}</strong>
            </p>
            <p>
              <span>Selected mode</span>
              <strong>{modeLabel}</strong>
            </p>
            <p>
              <span>Travel estimate</span>
              <strong>{travelMins} min</strong>
            </p>
          </div>
          <div className="transit-time-adjust">
            <p className="transit-time-adjust-label">Adjust timing from this card</p>
            <div className="transit-time-adjust-controls">
              <button
                type="button"
                className="transit-time-adjust-btn"
                onClick={() => onTimelineShift(-timelineShiftStepMins)}
              >
                -15 min
              </button>
              <button
                type="button"
                className="transit-time-adjust-btn"
                onClick={() => onTimelineShift(timelineShiftStepMins)}
              >
                +15 min
              </button>
              {timelineShiftMins !== 0 ? (
                <button
                  type="button"
                  className="transit-time-adjust-btn transit-time-adjust-clear-btn"
                  onClick={onClearTimelineShift}
                >
                  Clear
                </button>
              ) : null}
            </div>
          <p className="transit-time-adjust-status">
              {timelineShiftMins === 0
                ? "No timing shift set for this card."
                : timelineShiftMins > 0
                  ? `Currently ${timelineShiftMins} min later from here.`
                  : `Currently ${Math.abs(timelineShiftMins)} min earlier from here.`}
            </p>
          </div>
          {modeInUse === "MBTA" ? <p className="transit-link-note">{mbtaPaymentNote}</p> : null}
          <p className="transit-times">
            Walk {leg.walkMins} min | MBTA {leg.mbtaMins} min
          </p>
          {destinationStations ? (
            <p className="transit-times">Nearest T near destination: {destinationStations}</p>
          ) : null}
          <p className="transit-directions">{directions}</p>
          <div className="transit-map-links">
            <a className="map-open-link" href={legRouteUrl} target="_blank" rel="noreferrer">
              Open this leg in Google Maps
            </a>
            {modeInUse === "MBTA" ? (
              <>
                <a className="map-open-link" href={mbtaTripPlannerUrl} target="_blank" rel="noreferrer">
                  Open MBTA trip details
                </a>
                <a className="map-open-link" href={mbtaFaresUrl} target="_blank" rel="noreferrer">
                  Open MBTA fare details
                </a>
              </>
            ) : null}
          </div>
          {scenicWalkWaypoint && modeInUse === "WALK" ? (
            <div className="scenic-route-callout">
              <a
                className="map-open-link scenic-route-link"
                href={scenicWalkRouteUrl}
                target="_blank"
                rel="noreferrer"
              >
                ✨ Scenic route option
              </a>
              <p className="scenic-route-hint">
                A slightly longer route with better waterfront views via{" "}
                {scenicWalkWaypoint.label}.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function App() {
  const itinerary = useMemo(() => generateBostonConferenceItinerary(), []);
  const glutenFreeCatalog = useMemo(
    () => BOSTON_PLACES.filter((place) => isGlutenFreeRestaurant(place)),
    []
  );
  const defaultDayAdjustments = useMemo(
    () => buildDefaultDayAdjustments(itinerary.dayPlans),
    [itinerary.dayPlans]
  );
  const defaultStringListByDay = useMemo(
    () => buildDefaultStringListByDay(itinerary.dayPlans),
    [itinerary.dayPlans]
  );
  const defaultCollapsedByDay = useMemo(
    () => Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, false])),
    [itinerary.dayPlans]
  );
  const defaultTransitHiddenByDay = useMemo(
    () => Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, true])),
    [itinerary.dayPlans]
  );
  const defaultSelectedAddOnByDay = useMemo(
    () =>
      Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, ""])) as Record<
        string,
        string
      >,
    [itinerary.dayPlans]
  );
  const defaultMorningRunExpandedByDay = useMemo(
    () => Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, false])),
    [itinerary.dayPlans]
  );
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [selectedFlightKey, setSelectedFlightKey] = useState<"inbound" | "outbound">(
    "inbound"
  );
  const [dayAdjustments, setDayAdjustments] = useState<
    Record<string, DayTimingAdjustment>
  >(() => readStoredRecord(DAY_ADJUSTMENTS_STORAGE_KEY, defaultDayAdjustments));
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(
    () => defaultCollapsedByDay
  );
  const [morningRunExpandedByDay, setMorningRunExpandedByDay] = useState<
    Record<string, boolean>
  >(() => defaultMorningRunExpandedByDay);
  const [collapsedSightseeingCards, setCollapsedSightseeingCards] = useState<
    Record<string, boolean>
  >({});
  const [selectedAddOnIdByDay, setSelectedAddOnIdByDay] = useState<
    Record<string, string>
  >(() => defaultSelectedAddOnByDay);
  const [collapsedTransitCards, setCollapsedTransitCards] = useState<
    Record<string, boolean>
  >({});
  const [collapsedReturnCards, setCollapsedReturnCards] = useState<
    Record<string, boolean>
  >({});
  const [removedStopIdsByDay, setRemovedStopIdsByDay] = useState<
    Record<string, string[]>
  >(() => readStoredRecord(REMOVED_STOPS_STORAGE_KEY, defaultStringListByDay));
  const [addedStopIdsByDay, setAddedStopIdsByDay] = useState<Record<string, string[]>>(
    () => readStoredRecord(ADDED_STOPS_STORAGE_KEY, defaultStringListByDay)
  );
  const [lockedStopIdsByDay, setLockedStopIdsByDay] = useState<
    Record<string, string[]>
  >(() => readStoredRecord(LOCKED_STOPS_STORAGE_KEY, defaultStringListByDay));
  const [hiddenStopIdsByDay, setHiddenStopIdsByDay] = useState<
    Record<string, string[]>
  >(() => readStoredRecord(HIDDEN_STOPS_STORAGE_KEY, defaultStringListByDay));
  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  const [transitHiddenByDay, setTransitHiddenByDay] = useState<Record<string, boolean>>(
    () => defaultTransitHiddenByDay
  );
  const [recalibratingDayTitle, setRecalibratingDayTitle] = useState<string | null>(
    null
  );
  const [openEnergyMenuDayTitle, setOpenEnergyMenuDayTitle] = useState<string | null>(
    null
  );
  const [airportCollapsed, setAirportCollapsed] = useState(false);
  const [photoLoadErrorByPlaceId, setPhotoLoadErrorByPlaceId] = useState<
    Record<string, boolean>
  >({});
  const selectedFlight = itinerary.flights[selectedFlightKey];
  const globallyExcludedSightOptionIds = useMemo(() => {
    const excluded = new Set<string>();
    let hasFreedomTrailTour = false;

    for (const disabledPlaceId of disabledPlaceIds) {
      excluded.add(disabledPlaceId);
    }

    for (const day of itinerary.dayPlans) {
      for (const stop of day.stops) {
        if (stop.place.id === FREEDOM_TRAIL_TOUR_ID) {
          hasFreedomTrailTour = true;
        }

        if (isMajorPlace(stop.place)) {
          excluded.add(stop.place.id);
        }
      }
    }

    if (hasFreedomTrailTour) {
      for (const place of BOSTON_PLACES) {
        if (place.isFreedomTrailStop && place.id !== FREEDOM_TRAIL_TOUR_ID) {
          excluded.add(place.id);
        }
      }
    }

    return excluded;
  }, [itinerary.dayPlans]);
  const areAllSectionsCollapsed =
    itinerary.dayPlans.every((day) => collapsedDays[day.title]) && airportCollapsed;

  function setAllSectionsCollapsed(collapse: boolean) {
    setCollapsedDays(
      Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, collapse]))
    );
    setAirportCollapsed(collapse);
  }

  function applyEnergyModeForDay(
    dayTitle: string,
    adjustment: DayTimingAdjustment,
    nextMode: EnergyMode
  ) {
    if (nextMode === adjustment.energyMode) {
      setOpenEnergyMenuDayTitle(null);
      return;
    }

    setDayAdjustments((previous) => ({
      ...previous,
      [dayTitle]: {
        ...adjustment,
        energyMode: nextMode,
        durationOffsetByStopIndex: {},
        timelineShiftByStopId: {}
      }
    }));
    setOpenEnergyMenuDayTitle(null);
    setRecalibratingDayTitle(dayTitle);
    window.setTimeout(() => {
      setRecalibratingDayTitle((current) =>
        current === dayTitle ? null : current
      );
    }, 260);
  }

  function setTransitModeForLeg(
    dayTitle: string,
    adjustment: DayTimingAdjustment,
    legKey: string,
    nextMode: TransitModePreference
  ) {
    setDayAdjustments((previous) => {
      const current = previous[dayTitle] ?? adjustment;
      const nextLegModeByToPlaceId = { ...current.legModeByToPlaceId };
      if (nextMode === current.transportMode) {
        delete nextLegModeByToPlaceId[legKey];
      } else {
        nextLegModeByToPlaceId[legKey] = nextMode;
      }

      return {
        ...previous,
        [dayTitle]: {
          ...current,
          legModeByToPlaceId: nextLegModeByToPlaceId
        }
      };
    });
  }

  function adjustTimelineFromStop(
    dayTitle: string,
    adjustment: DayTimingAdjustment,
    stopId: string,
    deltaMins: number
  ) {
    setDayAdjustments((previous) => {
      const current = previous[dayTitle] ?? adjustment;
      const existingShift = current.timelineShiftByStopId?.[stopId] ?? 0;
      const nextShift = Math.max(
        -maxTimelineShiftMins,
        Math.min(maxTimelineShiftMins, existingShift + deltaMins)
      );
      const nextTimelineShiftByStopId = { ...(current.timelineShiftByStopId ?? {}) };

      if (nextShift === 0) {
        delete nextTimelineShiftByStopId[stopId];
      } else {
        nextTimelineShiftByStopId[stopId] = nextShift;
      }

      return {
        ...previous,
        [dayTitle]: {
          ...current,
          timelineShiftByStopId: nextTimelineShiftByStopId
        }
      };
    });
  }

  function addPlaceToDay(dayTitle: string, place: Place) {
    const placeId = place.id;
    if (disabledPlaceIds.has(placeId)) {
      return;
    }
    setAddedStopIdsByDay((previous) => {
      const current = previous[dayTitle] ?? [];
      if (current.includes(placeId)) {
        return previous;
      }

      return {
        ...previous,
        [dayTitle]: [...current, placeId]
      };
    });
    setRemovedStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
    setHiddenStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
    setUndoToast({
      message: `Added ${place.name}.`,
      action: "UNDO_ADD",
      dayTitle,
      placeId
    });
  }

  function removePlaceFromDay(dayTitle: string, place: Place) {
    const placeId = place.id;
    setRemovedStopIdsByDay((previous) => {
      const current = previous[dayTitle] ?? [];
      if (current.includes(placeId)) {
        return previous;
      }

      return {
        ...previous,
        [dayTitle]: [...current, placeId]
      };
    });
    setAddedStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
    setHiddenStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
    setUndoToast({
      message: `Removed ${place.name}.`,
      action: "UNDO_REMOVE",
      dayTitle,
      placeId
    });
  }

  function removeAddedPlaceForDay(dayTitle: string, placeId: string) {
    setAddedStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
  }

  function restorePlaceForDay(dayTitle: string, placeId: string) {
    setRemovedStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
    setHiddenStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
  }

  function hideStopForDay(dayTitle: string, placeId: string) {
    setHiddenStopIdsByDay((previous) => {
      const current = previous[dayTitle] ?? [];
      if (current.includes(placeId)) {
        return previous;
      }

      return {
        ...previous,
        [dayTitle]: [...current, placeId]
      };
    });
  }

  function showHiddenStopForDay(dayTitle: string, placeId: string) {
    setHiddenStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
  }

  function showAllHiddenStopsForDay(dayTitle: string) {
    setHiddenStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: []
    }));
  }

  function toggleLockForDayStop(dayTitle: string, place: Place) {
    const placeId = place.id;
    if (disabledPlaceIds.has(placeId)) {
      return;
    }
    setLockedStopIdsByDay((previous) => {
      const current = previous[dayTitle] ?? [];
      const isLocked = current.includes(placeId);
      if (isLocked) {
        return {
          ...previous,
          [dayTitle]: current.filter((id) => id !== placeId)
        };
      }

      return {
        ...previous,
        [dayTitle]: [...current, placeId]
      };
    });
    setRemovedStopIdsByDay((previous) => ({
      ...previous,
      [dayTitle]: (previous[dayTitle] ?? []).filter((id) => id !== placeId)
    }));
  }

  function handleUndoToast() {
    if (!undoToast) {
      return;
    }

    if (undoToast.action === "UNDO_REMOVE") {
      restorePlaceForDay(undoToast.dayTitle, undoToast.placeId);
    } else {
      removeAddedPlaceForDay(undoToast.dayTitle, undoToast.placeId);
    }
    setUndoToast(null);
  }

  function resetPlannerEdits() {
    const shouldReset = window.confirm(
      "Reset local custom edits on this device? This returns all days to the original itinerary defaults."
    );
    if (!shouldReset) {
      return;
    }

    setDayAdjustments(defaultDayAdjustments);
    setRemovedStopIdsByDay(defaultStringListByDay);
    setAddedStopIdsByDay(defaultStringListByDay);
    setLockedStopIdsByDay(defaultStringListByDay);
    setHiddenStopIdsByDay(defaultStringListByDay);
    setTransitHiddenByDay(defaultTransitHiddenByDay);
    setCollapsedDays(defaultCollapsedByDay);
    setMorningRunExpandedByDay(defaultMorningRunExpandedByDay);
    setSelectedAddOnIdByDay(defaultSelectedAddOnByDay);
    setCollapsedSightseeingCards({});
    setCollapsedTransitCards({});
    setCollapsedReturnCards({});
    setOpenEnergyMenuDayTitle(null);
    setUndoToast(null);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(
      DAY_ADJUSTMENTS_STORAGE_KEY,
      JSON.stringify(dayAdjustments)
    );
  }, [dayAdjustments]);

  useEffect(() => {
    window.localStorage.setItem(
      REMOVED_STOPS_STORAGE_KEY,
      JSON.stringify(removedStopIdsByDay)
    );
  }, [removedStopIdsByDay]);

  useEffect(() => {
    window.localStorage.setItem(ADDED_STOPS_STORAGE_KEY, JSON.stringify(addedStopIdsByDay));
  }, [addedStopIdsByDay]);

  useEffect(() => {
    window.localStorage.setItem(
      LOCKED_STOPS_STORAGE_KEY,
      JSON.stringify(lockedStopIdsByDay)
    );
  }, [lockedStopIdsByDay]);

  useEffect(() => {
    window.localStorage.setItem(
      HIDDEN_STOPS_STORAGE_KEY,
      JSON.stringify(hiddenStopIdsByDay)
    );
  }, [hiddenStopIdsByDay]);

  useEffect(() => {
    if (!undoToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setUndoToast(null);
    }, 5200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [undoToast]);

  useEffect(() => {
    function closeMenuOnOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".day-more-menu-wrap")) {
        return;
      }

      setOpenEnergyMenuDayTitle(null);
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenEnergyMenuDayTitle(null);
      }
    }

    document.addEventListener("mousedown", closeMenuOnOutsideClick);
    document.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-top">
          <p className="eyebrow">Navigate Boston with confidence</p>
        </div>
        <h1>Mona's Boston Time</h1>
        <p className="hero-text">
          A calm, practical planner for conference week: clear directions, realistic timing, and
          easy free-time exploration.
        </p>
        <div className="hero-actions hero-actions-below-title">
          <button
            type="button"
            className="hero-action-btn"
            onClick={() => setAllSectionsCollapsed(!areAllSectionsCollapsed)}
          >
            {areAllSectionsCollapsed ? "Expand all sections" : "Collapse all sections"}
          </button>
          <button
            type="button"
            className="theme-toggle hero-action-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            className="hero-action-btn"
            onClick={resetPlannerEdits}
            aria-label="Reset local custom edits on this device"
            title="Resets only your local custom edits on this device"
          >
            Reset custom edits
          </button>
        </div>
        <p className="hero-actions-note">
          Reset only clears local custom edits on this device. Your base itinerary remains intact.
        </p>
      </header>

      <section className="controls controls-top">
        <div className="control my-map-control">
          <span>Master map</span>
          <a
            className="my-map-link"
            href={myBostonMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open master map
          </a>
          <p className="flight-line">
            {hasCustomBostonMap
              ? "Using your custom Google My Maps link."
              : "Use this as your main pinboard for quick navigation between stops."}
          </p>
          <p className="controls-helper">
            Tip: tap <strong>Navigate now</strong> on each sightseeing card when you are ready to
            move.
          </p>
        </div>
      </section>

      <section className="day-grid" aria-label="Daily itinerary blocks">
        {itinerary.dayPlans.map((day, cardIndex) => {
          const isCollapsed = collapsedDays[day.title] ?? false;
          const isTransitHidden = transitHiddenByDay[day.title] ?? false;
          const sectionId = `day-${day.title.toLowerCase()}-content`;
          const adjustment = dayAdjustments[day.title] ?? {
            startTime: day.startTime,
            transportMode: "WALK" as const,
            legModeByToPlaceId: {},
            energyMode: defaultEnergyModeForDay(day),
            durationOffsetByStopIndex: {},
            timelineShiftByStopId: {}
          };
          const modeConfig = energyModeConfigByMode[adjustment.energyMode];
          const preparedDay = prepareDayForEnergyMode(
            day,
            adjustment.energyMode,
            glutenFreeCatalog
          );
          const baseAdjustedDay = buildAdjustedDayView(
            preparedDay.plan,
            adjustment,
            modeConfig,
            preparedDay.optionalSuggestion
          );
          const lockedStopIds = lockedStopIdsByDay[day.title] ?? [];
          const lockedStopIdSet = new Set(lockedStopIds);
          const removedStopIds = new Set(
            (removedStopIdsByDay[day.title] ?? []).filter(
              (stopId) => !lockedStopIdSet.has(stopId)
            )
          );
          const lockedPlaces = lockedStopIds
            .map((placeId) => placeById.get(placeId))
            .filter(
              (place): place is Place =>
                place !== undefined && !disabledPlaceIds.has(place.id)
            );
          const addedPlaces = (addedStopIdsByDay[day.title] ?? [])
            .map((placeId) => placeById.get(placeId))
            .filter(
              (place): place is Place =>
                place !== undefined && !disabledPlaceIds.has(place.id)
            );
          const adjustedDay = buildCustomizedDayView(
            preparedDay.plan,
            baseAdjustedDay,
            adjustment,
            modeConfig,
            lockedPlaces,
            addedPlaces,
            removedStopIds
          );
          const hiddenStopIds = hiddenStopIdsByDay[day.title] ?? [];
          const hiddenStopIdSet = new Set(hiddenStopIds);
          const visibleStops = adjustedDay.stops.filter(
            (stop) => !hiddenStopIdSet.has(stop.place.id)
          );
          const hiddenStops = adjustedDay.stops.filter((stop) =>
            hiddenStopIdSet.has(stop.place.id)
          );
          const dayRouteMode: TransitModePreference = visibleStops.some((stop) =>
            getModeForLeg(adjustment, stop.place.id) === "MBTA"
          )
            ? "MBTA"
            : "WALK";
          const dayStartPoint = buildStartPointForDay(preparedDay.plan);
          const dayRouteUrl = buildGoogleMapsDayRouteUrl(
            dayStartPoint,
            visibleStops,
            dayRouteMode
          );
          const dayWalkTotalMins = visibleStops.reduce(
            (total, stop) => total + (stop.transitFromPrevious?.walkMins ?? 0),
            0
          );
          const dayMbtaTotalMins = visibleStops.reduce(
            (total, stop) => total + (stop.transitFromPrevious?.mbtaMins ?? 0),
            0
          );
          const additionalSightOptions = getAdditionalSightseeingOptions(
            day,
            visibleStops,
            globallyExcludedSightOptionIds,
            dayStartPoint
          );
          const additionalCozyCafeOptions = getAdditionalCozyCafeOptions(
            day,
            visibleStops,
            dayStartPoint
          );
          const addOnAnchors = [dayStartPoint, ...visibleStops.map((stop) => stop.place)];
          const combinedAddOnOptions = dedupePlacesById([
            ...additionalSightOptions,
            ...additionalCozyCafeOptions
          ])
            .map((place) => ({
              place,
              walkMins: estimateNearestWalkMinutes(place, addOnAnchors),
              categoryLabel: isGlutenFreeRestaurant(place)
                ? "GF food"
                : "Sightseeing"
            }))
            .sort((a, b) => a.walkMins - b.walkMins);
          const selectedAddOnId = selectedAddOnIdByDay[day.title] ?? "";
          const selectedAddOn = combinedAddOnOptions.find(
            (option) => option.place.id === selectedAddOnId
          );
          const removedPlaces = [...removedStopIds]
            .map((id) => placeById.get(id))
            .filter(
              (place): place is Place =>
                place !== undefined && !disabledPlaceIds.has(place.id)
            );
          const currentEnergyMode =
            energyModeOptions.find((option) => option.mode === adjustment.energyMode) ??
            energyModeOptions[1];
          const morningRunPlan = buildMorningRunPlan(day, adjustment.energyMode);
          const isMorningRunExpanded = morningRunExpandedByDay[day.title] ?? false;
          const returnLegMode = getModeForLeg(adjustment, RETURN_TO_HOTEL_LEG_ID);
          const returnFromPlace =
            visibleStops.length > 0 ? visibleStops[visibleStops.length - 1].place : undefined;
          const returnLegRouteUrl = returnFromPlace
            ? buildGoogleMapsLegRouteUrl(
                returnFromPlace,
                HOTEL_BASE,
                returnLegMode
              )
            : undefined;
          const returnScenicWalkWaypoint =
            returnFromPlace && returnLegMode === "WALK"
              ? selectScenicWalkWaypoint(returnFromPlace, HOTEL_BASE)
              : undefined;
          const returnScenicRouteUrl =
            returnFromPlace && returnLegMode === "WALK" && returnScenicWalkWaypoint
              ? buildGoogleMapsLegRouteUrl(returnFromPlace, HOTEL_BASE, "WALK", true)
              : undefined;
          const visibleReturnToHotel =
            preparedDay.plan.returnToHotel &&
            visibleStops.length > 0 &&
            visibleStops[visibleStops.length - 1].place.id !== HOTEL_BASE.id
              ? buildReturnToHotelView(
                  visibleStops[visibleStops.length - 1],
                  preparedDay.plan.returnToHotel,
                  returnLegMode,
                  adjustment.energyMode
                )
              : undefined;
          const returnCardId = `${day.title}-return-transit`;
          const isReturnCardCollapsed = collapsedReturnCards[returnCardId] ?? false;
          const isEnergyMenuOpen = openEnergyMenuDayTitle === day.title;
          const energyMenuId = `energy-menu-${day.title.toLowerCase()}`;

          return (
            <article
              className="day-card"
              key={day.title}
              style={{ "--stagger-index": cardIndex } as CSSProperties}
            >
              <header className="day-header">
                <div>
                  <p className="day-title">{day.title}</p>
                  <p className="day-date">{day.dateLabel}</p>
                  <p className="day-availability">{day.availabilityLabel}</p>
                </div>
                <div className="day-header-actions">
                  <div className="day-badges">
                    <span>
                      {toMeridiem(adjustedDay.startTime)} - {toMeridiem(adjustedDay.endTime)}
                    </span>
                    <span>Cluster: {preparedDay.plan.clusterLabel}</span>
                    <span>Pace: {currentEnergyMode.label}</span>
                    <span>Walk total: {dayWalkTotalMins} min</span>
                    <span>MBTA total: {dayMbtaTotalMins} min</span>
                  </div>
                  <div className="day-header-controls">
                    <div className="day-more-menu-wrap">
                      <button
                        type="button"
                        className="day-more-menu-btn"
                        aria-label={`Open pace options for ${day.title}`}
                        aria-haspopup="menu"
                        aria-expanded={isEnergyMenuOpen}
                        aria-controls={energyMenuId}
                        onClick={() =>
                          setOpenEnergyMenuDayTitle((current) =>
                            current === day.title ? null : day.title
                          )
                        }
                      >
                        Pace
                      </button>
                      {isEnergyMenuOpen ? (
                        <div
                          id={energyMenuId}
                          className="energy-mode-menu"
                          role="menu"
                          aria-label={`Energy mode for ${day.title}`}
                        >
                          {energyModeOptions.map((option) => (
                            <button
                              key={option.mode}
                              type="button"
                              role="menuitemradio"
                              aria-checked={option.mode === adjustment.energyMode}
                              className={
                                option.mode === adjustment.energyMode
                                  ? "energy-mode-menu-item is-selected"
                                  : "energy-mode-menu-item"
                              }
                              onClick={() =>
                                applyEnergyModeForDay(day.title, adjustment, option.mode)
                              }
                            >
                              <span className="energy-mode-menu-label">{option.label}</span>
                              {option.mode === adjustment.energyMode ? (
                                <span className="energy-mode-menu-state">Selected</span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="day-collapse-toggle"
                      onClick={() => {
                        setOpenEnergyMenuDayTitle(null);
                        setTransitHiddenByDay((previous) => ({
                          ...previous,
                          [day.title]: !isTransitHidden
                        }));
                      }}
                    >
                      {isTransitHidden
                        ? "Show how to get there"
                        : "Hide how to get there"}
                    </button>
                    <a
                      className="day-collapse-toggle"
                      href={dayRouteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open day route in Maps
                    </a>
                    <button
                      type="button"
                      className="day-collapse-toggle"
                      onClick={() => {
                        setOpenEnergyMenuDayTitle(null);
                        setCollapsedDays((previous) => ({
                          ...previous,
                          [day.title]: !isCollapsed
                        }));
                      }}
                      aria-expanded={!isCollapsed}
                      aria-controls={sectionId}
                    >
                      {isCollapsed ? "Expand day" : "Collapse day"}
                    </button>
                  </div>
                </div>
              </header>

              {isCollapsed ? (
                <p className="collapsed-summary">
                  {adjustedDay.stops.length} stop
                  {adjustedDay.stops.length === 1 ? "" : "s"} planned.
                </p>
              ) : (
                <div
                  id={sectionId}
                  className={
                    recalibratingDayTitle === day.title
                      ? "day-content day-content-recalibrating"
                      : "day-content"
                  }
                >
                  {recalibratingDayTitle === day.title ? (
                    <p className="recalibrating-note">Rebalancing this day...</p>
                  ) : null}
                  <div className="day-adjust-controls">
                    <label className="day-adjust-field">
                      <span>Start time</span>
                      <input
                        type="time"
                        value={adjustment.startTime}
                        onChange={(event) =>
                          setDayAdjustments((previous) => ({
                            ...previous,
                            [day.title]: {
                              ...adjustment,
                              startTime: event.target.value
                            }
                          }))
                        }
                        step={300}
                      />
                    </label>
                    <label className="day-adjust-field">
                      <span>Default mode for this day</span>
                      <select
                        value={adjustment.transportMode}
                        onChange={(event) =>
                          setDayAdjustments((previous) => {
                            const current = previous[day.title] ?? adjustment;
                            const nextDefaultMode = event.target
                              .value as TransitModePreference;
                            const nextLegModeByToPlaceId = Object.fromEntries(
                              Object.entries(current.legModeByToPlaceId).filter(
                                ([, legMode]) => legMode !== nextDefaultMode
                              )
                            ) as Record<string, TransitModePreference>;

                            return {
                              ...previous,
                              [day.title]: {
                                ...current,
                                transportMode: nextDefaultMode,
                                legModeByToPlaceId: nextLegModeByToPlaceId
                              }
                            };
                          })
                        }
                      >
                        <option value="WALK">Walk</option>
                        <option value="MBTA">MBTA</option>
                      </select>
                    </label>
                  </div>
                  <p className="day-adjust-help">
                    Use these defaults to set the day baseline. You can still switch walk vs. MBTA
                    on each How to get there card and shift timing there by +/-15 minutes.
                  </p>

                  {morningRunPlan ? (
                    <section className="morning-run-section">
                      <button
                        type="button"
                        className="day-collapse-toggle morning-run-toggle"
                        onClick={() =>
                          setMorningRunExpandedByDay((previous) => ({
                            ...previous,
                            [day.title]: !isMorningRunExpanded
                          }))
                        }
                        aria-expanded={isMorningRunExpanded}
                        aria-controls={`morning-run-${day.title.toLowerCase()}`}
                      >
                        {isMorningRunExpanded
                          ? "Hide morning run"
                          : "Show morning run"}
                      </button>
                      {isMorningRunExpanded ? (
                        <div
                          id={`morning-run-${day.title.toLowerCase()}`}
                          className="morning-run-card"
                        >
                          <p className="segment-card-label morning-run-card-label">
                            Morning movement
                          </p>
                          <p className="morning-run-title">{morningRunPlan.title}</p>
                          <p className="morning-run-meta">
                            {morningRunPlan.distanceLabel} | {morningRunPlan.durationLabel}
                          </p>
                          <p className="morning-run-meta">
                            {morningRunPlan.routeTypeLabel} | {morningRunPlan.surfaceLabel}
                          </p>
                          <p className="morning-run-meta">
                            {morningRunPlan.bestTimeLabel}
                          </p>
                          <p className="morning-run-meta">
                            {morningRunPlan.turnaroundLabel}
                          </p>
                          <p className="morning-run-energy-note">
                            Energy mode fit: {morningRunPlan.energyNote}
                          </p>
                          <p className="morning-run-heading">Route</p>
                          <ul className="morning-run-list">
                            {morningRunPlan.routeSteps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                          <p className="morning-run-heading">What you'll see</p>
                          <ul className="morning-run-list">
                            {morningRunPlan.highlights.map((highlight) => (
                              <li key={highlight}>{highlight}</li>
                            ))}
                          </ul>
                          {morningRunPlan.turnaroundPlace ? (
                            <a
                              className="map-open-link"
                              href={buildGoogleMapsPlaceUrl(morningRunPlan.turnaroundPlace)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open turnaround point in Google Maps
                            </a>
                          ) : null}
                          <p className="morning-run-safety-note">
                            Safety note: {morningRunPlan.safetyNote}
                          </p>
                        </div>
                      ) : (
                        <p className="morning-run-collapsed-note">
                          Optional Harbor Sunrise Walk / Run is available for this day.
                        </p>
                      )}
                    </section>
                  ) : null}

                  {visibleStops.length === 0 ? (
                    <div className="empty-block">
                      <p>No stops fit the current settings.</p>
                      <p>Try an earlier start time, a different pace, or add a nearby option.</p>
                      {hiddenStops.length > 0 ? (
                        <button
                          type="button"
                          className="day-collapse-toggle"
                          onClick={() => showAllHiddenStopsForDay(day.title)}
                        >
                          Show hidden cards
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <ol className="stop-list">
                      {visibleStops.map((stop) => {
                        const fullStopIndex = adjustedDay.stops.findIndex(
                          (candidate) =>
                            candidate.place.id === stop.place.id &&
                            candidate.arrival === stop.arrival &&
                            candidate.departure === stop.departure
                        );
                        const previousFullStop =
                          fullStopIndex > 0 ? adjustedDay.stops[fullStopIndex - 1] : undefined;
                        const fromPlace = previousFullStop?.place ?? dayStartPoint;
                        const fromLabel =
                          previousFullStop?.place.name ?? preparedDay.plan.startFromLabel;
                        const leaveByTime =
                          previousFullStop?.departure ?? adjustedDay.startTime;
                        const legMode = getModeForLeg(adjustment, stop.place.id);
                        const googleMapsPlaceUrl = buildGoogleMapsPlaceUrl(stop.place);
                        const navigateNowUrl = buildGoogleMapsNavigateUrl(
                          stop.place,
                          legMode
                        );
                        const googleStreetViewUrl = buildGoogleStreetViewUrl(stop.place);
                        const stopPhoto = resolvePlacePhoto(stop.place);
                        const nearbyStations = formatNearbyStations(stop.place);
                        const stopCardId = `${day.title}-${stop.place.id}-${stop.arrival}`;
                        const transitCardId = `${stopCardId}-transit`;
                        const isSightseeingCardCollapsed =
                          collapsedSightseeingCards[stopCardId] ?? false;
                        const isTransitCardCollapsed =
                          collapsedTransitCards[transitCardId] ?? false;
                        const isStopLocked = lockedStopIdSet.has(stop.place.id);
                        const likelyOpenStatus = getLikelyOpenStatus(
                          stop.place,
                          day.title,
                          stop.arrival
                        );

                        return (
                          <li className="stop-item" key={`${stop.place.id}-${stop.arrival}`}>
                            {!isTransitHidden ? (
                              <TransitLeg
                                stop={stop}
                                fromPlace={fromPlace}
                                fromLabel={fromLabel}
                                leaveByTime={leaveByTime}
                                transportMode={legMode}
                                isCollapsed={isTransitCardCollapsed}
                                onToggleCollapse={() =>
                                  setCollapsedTransitCards((previous) => ({
                                    ...previous,
                                    [transitCardId]: !isTransitCardCollapsed
                                  }))
                                }
                                onTransportModeChange={(nextMode) =>
                                  setTransitModeForLeg(
                                    day.title,
                                    adjustment,
                                    stop.place.id,
                                    nextMode
                                  )
                                }
                                timelineShiftMins={
                                  adjustment.timelineShiftByStopId?.[stop.place.id] ?? 0
                                }
                                onTimelineShift={(deltaMins) =>
                                  adjustTimelineFromStop(
                                    day.title,
                                    adjustment,
                                    stop.place.id,
                                    deltaMins
                                  )
                                }
                                onClearTimelineShift={() =>
                                  adjustTimelineFromStop(
                                    day.title,
                                    adjustment,
                                    stop.place.id,
                                    -(adjustment.timelineShiftByStopId?.[stop.place.id] ?? 0)
                                  )
                                }
                              />
                            ) : null}
                            <div className="stop-card">
                              <div className="stop-card-header">
                                <p className="segment-card-label sightseeing-card-label">
                                  Sightseeing card
                                </p>
                                <div className="stop-card-actions">
                                  <button
                                    type="button"
                                    className="stop-card-action-btn stop-card-add-btn"
                                    onClick={() => toggleLockForDayStop(day.title, stop.place)}
                                  >
                                    {isStopLocked ? "Unlock stop" : "Lock stop"}
                                  </button>
                                  <button
                                    type="button"
                                    className="stop-card-action-btn stop-card-hide-btn"
                                    onClick={() => hideStopForDay(day.title, stop.place.id)}
                                  >
                                    Hide card
                                  </button>
                                  <button
                                    type="button"
                                    className="stop-card-action-btn stop-card-remove-btn"
                                    onClick={() => removePlaceFromDay(day.title, stop.place)}
                                    disabled={isStopLocked}
                                  >
                                    Remove card
                                  </button>
                                  <button
                                    type="button"
                                    className="card-collapse-toggle"
                                    onClick={() =>
                                      setCollapsedSightseeingCards((previous) => ({
                                        ...previous,
                                        [stopCardId]: !isSightseeingCardCollapsed
                                      }))
                                    }
                                    aria-expanded={!isSightseeingCardCollapsed}
                                    aria-label={
                                      isSightseeingCardCollapsed
                                        ? "Expand sightseeing card"
                                        : "Collapse sightseeing card"
                                    }
                                  >
                                    {isSightseeingCardCollapsed ? "+" : "-"}
                                  </button>
                                </div>
                              </div>
                              <div className="stop-time-row">
                                <p className="stop-time">
                                  {toMeridiem(stop.arrival)} - {toMeridiem(stop.departure)}
                                </p>
                              </div>
                              <h3>{stop.place.name}</h3>
                              {stop.place.priceLevel ? (
                                <p className="price-level">Cost: {stop.place.priceLevel}</p>
                              ) : null}
                              {stop.place.address ? (
                                <p className="stop-address">{stop.place.address}</p>
                              ) : null}
                              {isSightseeingCardCollapsed ? (
                                <p className="stop-card-collapsed-summary">
                                  Card collapsed. Expand to view description, photos, and links.
                                </p>
                              ) : (
                                <>
                                  <p>{stop.place.description}</p>
                                  {day.title === "Thursday" && stop.place.id === HOTEL_BASE.id ? (
                                    <p className="open-status-note">
                                      Suitcase pickup checkpoint: collect your bag here before
                                      airport transfer.
                                    </p>
                                  ) : null}
                                  {likelyOpenStatus ? (
                                    <p className="open-status-note">{likelyOpenStatus}</p>
                                  ) : null}
                                  {stop.place.soloDiningNote ? (
                                    <p className="solo-dining-note">
                                      Solo dining note: {stop.place.soloDiningNote}
                                    </p>
                                  ) : null}
                                  <div className="stop-map">
                                    <div className="map-links">
                                      <a
                                        className="map-open-link"
                                        href={navigateNowUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Navigate now
                                      </a>
                                      <a
                                        className="map-open-link"
                                        href={googleMapsPlaceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Open in Google Maps
                                      </a>
                                      <a
                                        className="map-street-link"
                                        href={googleStreetViewUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Open Street View
                                      </a>
                                      {stop.place.infoUrl ? (
                                        <a
                                          className="map-info-link"
                                          href={stop.place.infoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          {stop.place.infoLabel ?? "More info"}
                                        </a>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="stop-photo-block">
                                    <img
                                      className="stop-photo-img"
                                      src={stopPhoto.imageUrl}
                                      alt={`${stopPhoto.caption}, Boston`}
                                      loading="lazy"
                                      onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        setPhotoLoadErrorByPlaceId((previous) => ({
                                          ...previous,
                                          [stop.place.id]: true
                                        }));
                                        currentTarget.src = buildFallbackImageUrlForPlace(
                                          stop.place
                                        );
                                      }}
                                    />
                                    {photoLoadErrorByPlaceId[stop.place.id] ? (
                                      <p className="photo-error-note">
                                        Photo preview is temporarily unavailable. Use Navigate now
                                        for exact routing.
                                      </p>
                                    ) : null}
                                    <a
                                      className="stop-photo-source"
                                      href={stopPhoto.sourceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Photo source: {stopPhoto.sourceLabel}
                                    </a>
                                  </div>
                                  {stop.place.isFreedomTrailStop ? (
                                    <p className="freedom-trail-note">
                                      Freedom Trail stop
                                    </p>
                                  ) : null}
                                  {stop.bufferAfterMins ? (
                                    <p className="buffer-note">
                                      Buffer after stop: {stop.bufferAfterMins} min
                                    </p>
                                  ) : null}
                                </>
                              )}
                              <p className="stop-foot">
                                Neighborhood: {stop.place.neighborhood} | Visit{" "}
                                {stop.visitDurationMins} min
                              </p>
                              {nearbyStations ? (
                                <p className="stop-foot">Nearest T: {nearbyStations}</p>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {adjustedDay.optionalSuggestion ? (
                    <div className="optional-extra-card">
                      <p className="segment-card-label optional-card-label">
                        If You Have Extra Time
                      </p>
                      <p className="optional-extra-title">
                        {adjustedDay.optionalSuggestion.name}
                      </p>
                      <p className="optional-extra-description">
                        {adjustedDay.optionalSuggestion.description}
                      </p>
                    </div>
                  ) : null}

                  {combinedAddOnOptions.length > 0 ? (
                    <div className="additional-options-section">
                      <p className="segment-card-label sightseeing-card-label">
                        Add-on options
                      </p>
                      <div className="add-on-dropdown-card">
                        <label className="add-on-dropdown-field">
                          <span>Choose a nearby option</span>
                          <select
                            value={selectedAddOnId}
                            onChange={(event) =>
                              setSelectedAddOnIdByDay((previous) => ({
                                ...previous,
                                [day.title]: event.target.value
                              }))
                            }
                          >
                            <option value="">Select add-on option</option>
                            {combinedAddOnOptions.map((option) => (
                              <option
                                key={`${day.title}-addon-${option.place.id}`}
                                value={option.place.id}
                              >
                                {option.place.name} - {option.walkMins} min walk (
                                {option.categoryLabel})
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="stop-card-action-btn stop-card-add-btn"
                          onClick={() => {
                            if (!selectedAddOn) {
                              return;
                            }

                            addPlaceToDay(day.title, selectedAddOn.place);
                            setSelectedAddOnIdByDay((previous) => ({
                              ...previous,
                              [day.title]: ""
                            }));
                          }}
                          disabled={!selectedAddOn}
                        >
                          Add selected
                        </button>
                      </div>
                      {selectedAddOn ? (
                        <p className="add-on-preview-note">
                          {selectedAddOn.place.description}
                        </p>
                      ) : (
                        <p className="add-on-preview-note">
                          Add-ons are filtered to stay near today's route.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {removedPlaces.length > 0 ? (
                    <div className="removed-cards-section">
                      <p className="segment-card-label transit-card-label">
                        Removed cards
                      </p>
                      <div className="removed-cards-list">
                        {removedPlaces.map((place) => (
                          <button
                            type="button"
                            key={`${day.title}-removed-${place.id}`}
                            className="removed-card-chip"
                            onClick={() => restorePlaceForDay(day.title, place.id)}
                          >
                            Restore: {place.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {hiddenStops.length > 0 ? (
                    <div className="hidden-cards-section">
                      <p className="segment-card-label transit-card-label">
                        Hidden cards
                      </p>
                      <div className="removed-cards-list">
                        {hiddenStops.map((stop) => (
                          <button
                            type="button"
                            key={`${day.title}-hidden-${stop.place.id}`}
                            className="removed-card-chip"
                            onClick={() => showHiddenStopForDay(day.title, stop.place.id)}
                          >
                            Show: {stop.place.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <p className="weather-tip">{buildRainFallbackTip(day.title)}</p>

                  {isTransitHidden ? (
                    <p className="transit-hidden-note">
                      How to get there cards are hidden for a cleaner view. Use "Show how to get
                      there" in the day header when needed.
                    </p>
                  ) : null}

                  {!isTransitHidden && visibleReturnToHotel ? (
                    <div className="return-hotel-card">
                      <div className="return-hotel-header">
                        <p className="return-hotel-title">
                          Return to Hotel
                          {visibleReturnToHotel.afterDark ? " (after dark)" : ""}
                        </p>
                        <button
                          type="button"
                          className="card-collapse-toggle"
                          onClick={() =>
                            setCollapsedReturnCards((previous) => ({
                              ...previous,
                              [returnCardId]: !isReturnCardCollapsed
                            }))
                          }
                          aria-expanded={!isReturnCardCollapsed}
                          aria-label={
                            isReturnCardCollapsed
                              ? "Expand return how to get there card"
                              : "Collapse return how to get there card"
                          }
                        >
                          {isReturnCardCollapsed ? "+" : "-"}
                        </button>
                      </div>
                      {isReturnCardCollapsed ? (
                        <p className="transit-collapsed-summary">
                          {toMeridiem(visibleReturnToHotel.leaveByTime)} {"->"}{" "}
                          {toMeridiem(visibleReturnToHotel.arriveByTime)} |{" "}
                          {modeLabels[visibleReturnToHotel.modeInUse]}{" "}
                          {visibleReturnToHotel.travelMins} min
                        </p>
                      ) : (
                        <>
                          <label className="transit-mode-field return-mode-field">
                            <span>Transit mode</span>
                            <select
                              value={returnLegMode}
                              onChange={(event) =>
                                setTransitModeForLeg(
                                  day.title,
                                  adjustment,
                                  RETURN_TO_HOTEL_LEG_ID,
                                  event.target.value as TransitModePreference
                                )
                              }
                            >
                              <option value="WALK">Walk</option>
                              <option value="MBTA">Take the T</option>
                            </select>
                          </label>
                          <div className="return-hotel-metrics">
                            <p>
                              <span>Depart from</span>
                              <strong>{visibleReturnToHotel.fromPlaceName}</strong>
                            </p>
                            <p>
                              <span>Leave by</span>
                              <strong>{toMeridiem(visibleReturnToHotel.leaveByTime)}</strong>
                            </p>
                            <p>
                              <span>Dark by</span>
                              <strong>{toMeridiem(visibleReturnToHotel.darkByTime)}</strong>
                            </p>
                            <p>
                              <span>Selected mode</span>
                              <strong>{modeLabels[visibleReturnToHotel.modeInUse]}</strong>
                            </p>
                            <p>
                              <span>Travel estimate</span>
                              <strong>{visibleReturnToHotel.travelMins} min</strong>
                            </p>
                            <p>
                              <span>Arrive hotel</span>
                              <strong>{toMeridiem(visibleReturnToHotel.arriveByTime)}</strong>
                            </p>
                          </div>
                          <p className="return-hotel-times">
                            Walk {visibleReturnToHotel.walkMins} min | MBTA{" "}
                            {visibleReturnToHotel.mbtaMins} min
                          </p>
                          {visibleReturnToHotel.modeInUse === "MBTA" && returnFromPlace ? (
                            <p className="transit-link-note">
                              {buildMbtaPaymentNote(
                                returnFromPlace,
                                HOTEL_BASE,
                                visibleReturnToHotel.directions
                              )}
                            </p>
                          ) : null}
                          <p className="return-hotel-directions">
                            {visibleReturnToHotel.directions}
                          </p>
                          <p className="return-hotel-safety">
                            {visibleReturnToHotel.safetyNote}
                          </p>
                          {returnLegRouteUrl ? (
                            <div className="transit-map-links">
                              <a
                                className="map-open-link"
                                href={returnLegRouteUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open return leg in Google Maps
                              </a>
                              {visibleReturnToHotel.modeInUse === "MBTA" ? (
                                <>
                                  <a
                                    className="map-open-link"
                                    href={mbtaTripPlannerUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open MBTA trip details
                                  </a>
                                  <a
                                    className="map-open-link"
                                    href={mbtaFaresUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open MBTA fare details
                                  </a>
                                </>
                              ) : null}
                            </div>
                          ) : null}
                          {returnScenicWalkWaypoint && returnScenicRouteUrl ? (
                            <div className="scenic-route-callout">
                              <a
                                className="map-open-link scenic-route-link"
                                href={returnScenicRouteUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                ✨ Scenic route option
                              </a>
                              <p className="scenic-route-hint">
                                A slightly longer route with better waterfront views via{" "}
                                {returnScenicWalkWaypoint.label}.
                              </p>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}

                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="hero-meta hero-meta-compact trip-anchor-section">
        <div className="hero-meta-card">
          <div className="hero-meta-row">
            <span className="hero-meta-label">Base</span>
            <a
              className="conference-link hero-meta-value"
              href={hotelWebsiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              {itinerary.hotel.name}
            </a>
            <span className="hero-meta-extra">425 Summer St, Boston</span>
          </div>
          <div className="hero-meta-row">
            <span className="hero-meta-label">Conference</span>
            <a
              className="conference-link hero-meta-value"
              href="https://www.trapezegroup.com/thinktransit/"
              target="_blank"
              rel="noreferrer"
            >
              {itinerary.conferenceVenue.name}
            </a>
            <span className="hero-meta-extra">Seaport District</span>
          </div>
        </div>
      </section>

      <section className="controls controls-bottom">
        <div className="control flight-control">
          <label htmlFor="flight-selector">Trip flights</label>
          <select
            id="flight-selector"
            value={selectedFlightKey}
            onChange={(event) =>
              setSelectedFlightKey(event.target.value as "inbound" | "outbound")
            }
          >
            <option value="inbound">Inbound (CMH to BOS)</option>
            <option value="outbound">Outbound (BOS to CMH)</option>
          </select>
          <p className="flight-line">
            {selectedFlight.origin}
            {" -> "}
            {selectedFlight.destination}
          </p>
          <p className="flight-line">Depart: {selectedFlight.departureLabel}</p>
          <p className="flight-line">Arrive: {selectedFlight.arrivalLabel}</p>
        </div>
      </section>

      <section className="airport-card">
        <div className="airport-header">
          <h2>Thursday Airport Timing Logic</h2>
          <button
            type="button"
            className="day-collapse-toggle airport-collapse-btn"
            onClick={() => setAirportCollapsed((previous) => !previous)}
            aria-expanded={!airportCollapsed}
            aria-controls="airport-timing-content"
          >
            {airportCollapsed ? "Expand section" : "Collapse section"}
          </button>
        </div>
        {airportCollapsed ? (
          <p className="collapsed-summary">Airport timing details are hidden.</p>
        ) : (
          <div id="airport-timing-content">
            <div className="airport-metrics">
              <p>
                <span>Flight departure</span>
                <strong>{toMeridiem(itinerary.airportPlan.flightDepartureTime)}</strong>
              </p>
              <p>
                <span>Leave hotel by</span>
                <strong>{toMeridiem(itinerary.airportPlan.recommendedLeaveHotelTime)}</strong>
              </p>
              <p>
                <span>Target airport arrival</span>
                <strong>{toMeridiem(itinerary.airportPlan.targetAirportArrivalTime)}</strong>
              </p>
              <p>
                <span>Transfer mode</span>
                <strong>{itinerary.airportPlan.transferMode}</strong>
              </p>
              <p>
                <span>Travel estimate</span>
                <strong>{itinerary.airportPlan.transferDurationMins} min</strong>
              </p>
              <p>
                <span>Check-in buffer</span>
                <strong>{itinerary.airportPlan.checkInBufferMins} min</strong>
              </p>
            </div>
            <ol className="airport-steps">
              {itinerary.airportPlan.directions.map((direction) => (
                <li key={direction}>{direction}</li>
              ))}
            </ol>
          </div>
        )}
      </section>
      {undoToast ? (
        <div className="undo-toast" role="status" aria-live="polite">
          <p>{undoToast.message}</p>
          <button type="button" onClick={handleUndoToast}>
            Undo
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;

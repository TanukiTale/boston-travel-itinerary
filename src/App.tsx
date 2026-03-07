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

const transferBufferByMode = {
  WALK: 6,
  MBTA: 12
} as const;
const FREEDOM_TRAIL_TOUR_ID = "freedom-trail-walk-tour";
const fixedArrivalByDayAndStopId: Record<string, Record<string, string>> = {
  Sunday: {
    "freedom-trail-walk-tour": "12:00"
  }
};

const visitDurationStepMins = 15;
const minVisitDurationMins = 15;
const maxVisitDurationMins = 240;

interface PlacePhoto {
  imageUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  caption: string;
}

interface WikipediaSummaryResponse {
  title?: string;
  thumbnail?: {
    source?: string;
  };
}

const placePhotosById: Partial<Record<string, PlacePhoto>> = {
  "westin-seaport": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Convention_and_Exhibition_Center_01.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boston_Convention_and_Exhibition_Center_01.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Convention and Exhibition Center area near the Westin"
  },
  "freedom-trail-walk-tour": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_State_House_Boston_2025.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_State_House_Boston_2025.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Old State House on the Freedom Trail"
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_State_House_Boston_2025.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_State_House_Boston_2025.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Downtown Freedom Trail core near Granary Burying Ground"
  },
  "state-house-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Beacon Hill streets near the State House"
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_State_House_Boston_2025.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_State_House_Boston_2025.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Historic downtown core near Old South Meeting House"
  },
  "copley-square-trinity": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "City streets between Downtown and Back Bay"
  },
  "bpl-courtyard": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Public_Garden_Lagoon_12.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Public_Garden_Lagoon_12.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Back Bay green space near the library district"
  },
  "newbury-street-stroll": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Classic Boston brownstone streets"
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Beacon Hill architecture near the Athenaeum"
  },
  "chinatown-gateway-walk": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Downtown streets near Chinatown and the Greenway"
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Beacon Hill brick streets near the Nichols House Museum"
  },
  "louisburg-square-loop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Louisburg Square area in Beacon Hill"
  },
  "kings-chapel-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Old_State_House_Boston_2025.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Old_State_House_Boston_2025.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Historic downtown district near King's Chapel"
  },
  "commonwealth-ave-mall": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Public_Garden_Lagoon_12.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Public_Garden_Lagoon_12.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Back Bay green promenade atmosphere"
  },
  "old-city-hall-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Downtown civic core near Old City Hall"
  },
  "boston-public-market-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Boston_Faneuil_Hall.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Boston_Faneuil_Hall.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Boston Public Market / Haymarket area"
  },
  "trinity-church-interior-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Back Bay church and square district"
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Back Bay streets near Old South Church"
  },
  "custom-house-tower-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2017_Rowes_Wharf_from_Boston_Harbor_1.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Rowes_Wharf_from_Boston_Harbor_1.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Waterfront skyline near Custom House Tower"
  },
  "long-wharf-promenade": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/2017_Rowes_Wharf_from_Boston_Harbor_1.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Rowes_Wharf_from_Boston_Harbor_1.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Long Wharf waterfront promenade"
  },
  "fan-pier-park-stop": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Harborwalk_Boston_at_Blue_Hills_Bank_Pavilion.JPG",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Harborwalk_Boston_at_Blue_Hills_Bank_Pavilion.JPG",
    sourceLabel: "Wikimedia Commons",
    caption: "Fan Pier Harborwalk in the Seaport"
  },
  "legal-harborside": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Legal_Harborside_Floor_Dining_Room_2013.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Legal_Harborside_Floor_Dining_Room_2013.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Legal Harborside dining room"
  },
  "jennifer-lees": {
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DowntownCrossingBoston.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DowntownCrossingBoston.jpg",
    sourceLabel: "Wikimedia Commons",
    caption: "Downtown Crossing streetscape"
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

const wikipediaPhotoTitleById: Partial<Record<string, string>> = {
  "westin-seaport": "Boston Convention and Exhibition Center",
  "freedom-trail-walk-tour": "Freedom Trail",
  "city-view-bike-tour": "Bluebikes",
  "paul-revere-house": "Paul Revere House",
  "old-north-church": "Old North Church",
  "quincy-market": "Quincy Market",
  "boston-common-loop": "Boston Common",
  "granary-burying-ground": "Granary Burying Ground",
  "state-house-stop": "Massachusetts State House",
  "beacon-hill-stroll": "Beacon Hill, Boston",
  "public-garden-loop": "Public Garden (Boston)",
  "old-south-meeting-house": "Old South Meeting House",
  "copley-square-trinity": "Copley Square",
  "bpl-courtyard": "Boston Public Library",
  "newbury-street-stroll": "Newbury Street",
  "chinatown-gateway-walk": "Chinatown, Boston",
  "downtown-crossing-stroll": "Downtown Crossing",
  "boston-athenaeum-exterior": "Boston Athenaeum",
  "harborwalk-seaport": "Boston Harborwalk",
  "ica-waterfront": "Institute of Contemporary Art, Boston",
  "north-end-waterfront": "Christopher Columbus Waterfront Park",
  "rowes-wharf": "Rowes Wharf",
  "tea-party-tea-room": "Boston Tea Party Ships and Museum",
  "old-state-house-stop": "Old State House (Boston)",
  "copps-hill-burying-ground": "Copp's Hill Burying Ground",
  "greenway-art-walk": "Nichols House Museum",
  "louisburg-square-loop": "Louisburg Square",
  "kings-chapel-stop": "King's Chapel",
  "commonwealth-ave-mall": "Commonwealth Avenue (Boston)",
  "old-city-hall-stop": "Old City Hall (Boston)",
  "boston-public-market-stop": "Boston Public Market",
  "trinity-church-interior-stop": "Trinity Church (Boston)",
  "prudential-skyline-view": "Prudential Center (Boston)",
  "charles-esplanade-walk": "Charles River Esplanade",
  "old-south-church-stop": "Old South Church",
  "custom-house-tower-stop": "Custom House Tower",
  "long-wharf-promenade": "Long Wharf (Boston)",
  "fan-pier-park-stop": "South Boston Waterfront",
  "legal-harborside": "Legal Sea Foods",
  "jennifer-lees": "Boston Public Market",
  "nebo-cucina": "Fort Point, Boston",
  "mikes-pastry": "North End, Boston"
};

const defaultPlacePhoto = {
  imageUrl:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
  sourceUrl:
    "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
  sourceLabel: "Wikimedia Commons",
  caption: "Historic Boston streetscape"
} as const;

function buildOpenStreetMapPreviewUrl(place: Place): string {
  const lat = place.lat.toFixed(5);
  const lng = place.lng.toFixed(5);
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=16&size=1200x675&markers=${lat},${lng},red-pushpin`;
}

function buildOpenStreetMapSourceUrl(place: Place): string {
  const lat = place.lat.toFixed(5);
  const lng = place.lng.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}

function buildWikipediaSummaryUrl(title: string): string {
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
}

function buildWikipediaPageUrl(title: string): string {
  const encoded = encodeURIComponent(title).replace(/%20/g, "_");
  return `https://en.wikipedia.org/wiki/${encoded}`;
}

function buildFallbackImageUrlForPlace(place: Place): string {
  if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
    return buildOpenStreetMapPreviewUrl(place);
  }

  return defaultPlacePhoto.imageUrl;
}

function resolvePlacePhoto(
  place: Place,
  wikipediaPhotosById?: Partial<Record<string, PlacePhoto>>
): PlacePhoto {
  const wikipediaPhoto = wikipediaPhotosById?.[place.id];
  if (wikipediaPhoto) {
    return wikipediaPhoto;
  }

  const curated = placePhotosById[place.id];
  if (curated) {
    return curated;
  }

  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) {
    return defaultPlacePhoto;
  }

  return {
    imageUrl: buildOpenStreetMapPreviewUrl(place),
    sourceUrl: buildOpenStreetMapSourceUrl(place),
    sourceLabel: "OpenStreetMap",
    caption: `${place.name} location preview`
  };
}

const THEME_STORAGE_KEY = "boston-companion-theme";
const defaultBostonMapUrl = "https://www.google.com/maps/search/?api=1&query=Boston%2C+MA";
const myBostonMapUrl =
  import.meta.env.VITE_MY_BOSTON_MAP_URL?.trim() || defaultBostonMapUrl;
const hasCustomBostonMap = Boolean(import.meta.env.VITE_MY_BOSTON_MAP_URL?.trim());
const hotelWebsiteUrl =
  "https://www.marriott.com/en-us/hotels/bosow-the-westin-boston-seaport-district/overview/";
const placeById = new Map(BOSTON_PLACES.map((place) => [place.id, place]));
const dayTemplateByTitle = new Map(
  DAY_TEMPLATES.map((template) => [template.title, template])
);

type ThemeMode = "light" | "dark";
type TransitModePreference = "AUTO" | TravelMode;
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
  if (day.startFrom !== "hotel") {
    return false;
  }

  const hasEveningOnlyWindow = day.availabilityLabel
    .toLowerCase()
    .includes("evening only");
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
    title: "Harbor Sunrise Run",
    bestTimeLabel: "Best time: 6:15 AM - 7:30 AM",
    routeTypeLabel: "Type: Out-and-back",
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
  energyMode: EnergyMode;
  durationOffsetByStopIndex: Record<number, number>;
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

function buildGoogleMapsPlaceUrl(place: Place): string {
  const params = new URLSearchParams({
    api: "1",
    query: `${place.lat},${place.lng}`
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
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

function getTransitMinsForMode(
  stop: ScheduledStop,
  transportMode: TransitModePreference
): number {
  const leg = stop.transitFromPrevious;
  if (!leg) {
    return 0;
  }

  if (transportMode === "AUTO") {
    return leg.recommendedMins;
  }

  return transportMode === "MBTA" ? leg.mbtaMins : leg.walkMins;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceKm(a: Place, b: Place): number {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const arc =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(arc));
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
    const reverseDirections = reverseOverride.reverseDirections ?? reverseOverride.directions;
    return `${reverseDirections}${stationHint}`;
  }

  return `Use MBTA from ${from.neighborhood} toward ${to.neighborhood}, then walk the final blocks.${stationHint}`;
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
  return place.id === "jennifer-lees";
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

function getAdditionalSightseeingOptions(
  day: DayPlan,
  visibleStops: ScheduledStop[],
  globallyExcludedSightIds: ReadonlySet<string>
): Place[] {
  const dayTemplate = dayTemplateByTitle.get(day.title);
  if (!dayTemplate) {
    return [];
  }

  const visibleStopIds = new Set(visibleStops.map((stop) => stop.place.id));
  return dayTemplate.stopIds
    .map((id) => placeById.get(id))
    .filter((place): place is Place => Boolean(place))
    .filter(
      (place) =>
        isMajorPlace(place) &&
        !visibleStopIds.has(place.id) &&
        !globallyExcludedSightIds.has(place.id)
    );
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
    const cappedDuration =
      place.id === HOTEL_BASE.id
        ? baseDuration
        : isFixedGuidedTourStop
          ? Math.max(90, baseDuration)
        : place.category === "restaurant"
          ? Math.max(minVisitDurationMins, Math.min(baseDuration, config.maxDiningVisitMins))
          : Math.max(minVisitDurationMins, Math.min(baseDuration, config.maxMajorVisitMins));

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
      ? config.bufferBetweenMajorMins
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
    Tuesday: ["old-city-hall-stop", "downtown-crossing-stroll"]
  };
  const dayPriorityMajorIds = dayPriorityMajorIdsByTitle[day.title] ?? [];
  const priorityMajorPlaces = dayPriorityMajorIds
    .map((stopId) => majorStops.find((stop) => stop.place.id === stopId)?.place)
    .filter((place): place is Place => Boolean(place));
  const remainingMajorPlaces = majorStops
    .map((stop) => stop.place)
    .filter((place) => !priorityMajorPlaces.some((priority) => priority.id === place.id));
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
  const keepDinnerAsMondayPickup = day.title === "Monday";

  const dayGlutenFreePlaces = nonBagStops
    .map((stop) => stop.place)
    .filter((place) => isGlutenFreeRestaurant(place))
    .filter((place) => !excludeEveningBakery || !isEveningBakeryStop(place));
  const fallbackGlutenFreePlaces = glutenFreeCatalog.filter(
    (place) =>
      (!excludeEveningBakery || !isEveningBakeryStop(place)) &&
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
  const glutenFreeAnchor = keepDinnerAsMondayPickup ? HOTEL_BASE : anchorPlace;
  const selectedGlutenFreePlace =
    pickNearestPlace(glutenFreeAnchor, preferredDayGlutenFree) ??
    pickNearestPlace(glutenFreeAnchor, preferredFallbackGlutenFree);

  const corePlaces = dedupePlacesById(selectedMajorPlaces);
  if (selectedGlutenFreePlace) {
    if (keepDinnerAsMondayPickup) {
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

  if (keepDinnerAsMondayPickup) {
    modeNotes.push(
      "Monday dinner is set as a pickup stop so you can bring food back to the hotel after sightseeing."
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
    const legMins = getTransitMinsForMode(stop, adjustment.transportMode);
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
    const modeInUse: TravelMode =
      adjustment.transportMode === "AUTO"
        ? afterDark
          ? "MBTA"
          : day.returnToHotel.recommendedMode
        : adjustment.transportMode;
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

function clampDurationOffset(
  baseDurationMins: number,
  nextOffsetMins: number
): number {
  const minOffset = minVisitDurationMins - baseDurationMins;
  const maxOffset = maxVisitDurationMins - baseDurationMins;

  return Math.max(minOffset, Math.min(maxOffset, nextOffsetMins));
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
  fromLabel,
  leaveByTime,
  transportMode
}: {
  stop: ScheduledStop;
  fromLabel: string;
  leaveByTime: string;
  transportMode: TransitModePreference;
}) {
  if (!stop.transitFromPrevious) {
    return null;
  }

  const leg = stop.transitFromPrevious;
  const modeInUse =
    transportMode === "AUTO" ? leg.recommendedMode : transportMode;
  const modeLabel = modeLabels[modeInUse];
  const modeFieldLabel =
    transportMode === "AUTO" ? "Recommended mode" : "Mode in use";
  const travelMins = modeInUse === "MBTA" ? leg.mbtaMins : leg.walkMins;
  const contingencyBufferMins = transferBufferByMode[modeInUse];
  const fallbackMode = modeInUse === "MBTA" ? "Walk" : "MBTA";
  const fallbackTravelMins =
    modeInUse === "MBTA" ? leg.walkMins : leg.mbtaMins;
  const destinationStations = formatNearbyStations(stop.place);
  const directions =
    transportMode === "AUTO" || modeInUse === leg.recommendedMode
      ? leg.directions
      : modeInUse === "MBTA"
        ? `Use MBTA for this leg and confirm the best line and next departure in Google Maps.${
            destinationStations
              ? ` Nearest T at arrival: ${destinationStations}.`
              : ""
          }`
        : "Walk this leg via well-lit main streets; check Google Maps for the safest path.";

  return (
    <div className="transit-leg">
      <p className="segment-card-label transit-card-label">Transit card</p>
      <p className="transit-route">
        {fromLabel}
        {" -> "}
        {stop.place.name}
      </p>
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
          <span>{modeFieldLabel}</span>
          <strong>{modeLabel}</strong>
        </p>
        <p>
          <span>Travel estimate</span>
          <strong>{travelMins} min</strong>
        </p>
        <p>
          <span>Transit buffer</span>
          <strong>{contingencyBufferMins} min</strong>
        </p>
        <p>
          <span>Fallback mode</span>
          <strong>
            {fallbackMode} ({fallbackTravelMins} min)
          </strong>
        </p>
      </div>
      <p className="transit-times">
        Walk {leg.walkMins} min | MBTA {leg.mbtaMins} min
      </p>
      {destinationStations ? (
        <p className="transit-times">Nearest T near destination: {destinationStations}</p>
      ) : null}
      <p className="transit-directions">{directions}</p>
      <p className="transit-buffer-note">
        Build in a {contingencyBufferMins}-minute cushion before this transfer when
        possible.
      </p>
      {transportMode !== "AUTO" ? (
        <p className="transit-override-note">
          Manual mode override is active for this day.
        </p>
      ) : null}
    </div>
  );
}

function App() {
  const itinerary = useMemo(() => generateBostonConferenceItinerary(), []);
  const glutenFreeCatalog = useMemo(
    () => BOSTON_PLACES.filter((place) => isGlutenFreeRestaurant(place)),
    []
  );
  const [wikipediaPhotosById, setWikipediaPhotosById] = useState<
    Partial<Record<string, PlacePhoto>>
  >({});
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [selectedFlightKey, setSelectedFlightKey] = useState<"inbound" | "outbound">(
    "inbound"
  );
  const [dayAdjustments, setDayAdjustments] = useState<
    Record<string, DayTimingAdjustment>
  >(() =>
    Object.fromEntries(
      itinerary.dayPlans.map((day) => [
        day.title,
        {
          startTime: day.startTime,
          transportMode: "AUTO",
          energyMode: defaultEnergyModeForDay(day),
          durationOffsetByStopIndex: {}
        }
      ])
    )
  );
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, false]))
  );
  const [morningRunExpandedByDay, setMorningRunExpandedByDay] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, false])));
  const [collapsedSightseeingCards, setCollapsedSightseeingCards] = useState<
    Record<string, boolean>
  >({});
  const [transitHiddenByDay, setTransitHiddenByDay] = useState<Record<string, boolean>>(
    () => Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, true]))
  );
  const [recalibratingDayTitle, setRecalibratingDayTitle] = useState<string | null>(
    null
  );
  const [openEnergyMenuDayTitle, setOpenEnergyMenuDayTitle] = useState<string | null>(
    null
  );
  const [airportCollapsed, setAirportCollapsed] = useState(false);
  const selectedFlight = itinerary.flights[selectedFlightKey];
  const globallyExcludedSightOptionIds = useMemo(() => {
    const excluded = new Set<string>();
    let hasFreedomTrailTour = false;

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
        durationOffsetByStopIndex: {}
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

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    async function loadWikipediaPhotos() {
      const photoEntries = Object.entries(wikipediaPhotoTitleById);
      const loadedEntries = await Promise.all(
        photoEntries.map(async ([placeId, pageTitle]) => {
          if (!pageTitle) {
            return null;
          }

          try {
            const response = await fetch(buildWikipediaSummaryUrl(pageTitle), {
              signal: abortController.signal
            });

            if (!response.ok) {
              return null;
            }

            const data = (await response.json()) as WikipediaSummaryResponse;
            const imageUrl = data.thumbnail?.source;

            if (!imageUrl) {
              return null;
            }

            const placePhoto: PlacePhoto = {
              imageUrl,
              sourceUrl: buildWikipediaPageUrl(pageTitle),
              sourceLabel: "Wikipedia",
              caption: data.title ?? pageTitle
            };

            return [placeId, placePhoto] as const;
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
              return null;
            }

            return null;
          }
        })
      );

      if (cancelled) {
        return;
      }

      const loadedPhotoMap: Partial<Record<string, PlacePhoto>> = {};
      for (const entry of loadedEntries) {
        if (!entry) {
          continue;
        }

        const [placeId, placePhoto] = entry;
        loadedPhotoMap[placeId] = placePhoto;
      }

      if (Object.keys(loadedPhotoMap).length > 0) {
        setWikipediaPhotosById(loadedPhotoMap);
      }
    }

    void loadWikipediaPhotos();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
          <p className="eyebrow">Mona's ThinkTransit Week Companion</p>
        </div>
        <h1>Mona's Boston Trip</h1>
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
        </div>
      </header>

      <section className="controls controls-top">
        <div className="control my-map-control">
          <span>My Boston Map</span>
          <a
            className="my-map-link"
            href={myBostonMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open My Boston Map
          </a>
          <p className="flight-line">
            {hasCustomBostonMap
              ? "Using your custom Google My Maps link."
              : "Set VITE_MY_BOSTON_MAP_URL in .env.local to use your custom My Maps link."}
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
            transportMode: "AUTO" as const,
            energyMode: defaultEnergyModeForDay(day),
            durationOffsetByStopIndex: {}
          };
          const modeConfig = energyModeConfigByMode[adjustment.energyMode];
          const preparedDay = prepareDayForEnergyMode(
            day,
            adjustment.energyMode,
            glutenFreeCatalog
          );
          const adjustedDay = buildAdjustedDayView(
            preparedDay.plan,
            adjustment,
            modeConfig,
            preparedDay.optionalSuggestion
          );
          const additionalSightOptions = getAdditionalSightseeingOptions(
            day,
            adjustedDay.stops,
            globallyExcludedSightOptionIds
          );
          const currentEnergyMode =
            energyModeOptions.find((option) => option.mode === adjustment.energyMode) ??
            energyModeOptions[1];
          const morningRunPlan = buildMorningRunPlan(day, adjustment.energyMode);
          const isMorningRunExpanded = morningRunExpandedByDay[day.title] ?? false;
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
                  </div>
                  <div className="day-header-controls">
                    <div className="day-more-menu-wrap">
                      <button
                        type="button"
                        className="day-more-menu-btn"
                        aria-haspopup="menu"
                        aria-expanded={isEnergyMenuOpen}
                        aria-controls={energyMenuId}
                        onClick={() =>
                          setOpenEnergyMenuDayTitle((current) =>
                            current === day.title ? null : day.title
                          )
                        }
                      >
                        ...
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
                      {isTransitHidden ? "Show transit cards" : "Hide transit cards"}
                    </button>
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
                  {preparedDay.plan.stops.length} stop
                  {preparedDay.plan.stops.length === 1 ? "" : "s"} planned.
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
                      <span>Transit mode</span>
                      <select
                        value={adjustment.transportMode}
                        onChange={(event) =>
                          setDayAdjustments((previous) => ({
                            ...previous,
                            [day.title]: {
                              ...adjustment,
                              transportMode: event.target.value as TransitModePreference
                            }
                          }))
                        }
                      >
                        <option value="AUTO">Auto (recommended)</option>
                        <option value="MBTA">MBTA</option>
                        <option value="WALK">Walk</option>
                      </select>
                    </label>
                  </div>

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
                          Optional Harbor Sunrise Run is available for this day.
                        </p>
                      )}
                    </section>
                  ) : null}

                  {adjustedDay.stops.length === 0 ? (
                    <p className="empty-block">No stop fits this time window.</p>
                  ) : (
                    <ol className="stop-list">
                      {adjustedDay.stops.map((stop, stopIndex) => {
                        const fromLabel =
                          stopIndex === 0
                            ? preparedDay.plan.startFromLabel
                            : adjustedDay.stops[stopIndex - 1].place.name;
                        const leaveByTime =
                          stopIndex === 0
                            ? adjustedDay.startTime
                            : adjustedDay.stops[stopIndex - 1].departure;
                        const googleMapsPlaceUrl = buildGoogleMapsPlaceUrl(stop.place);
                        const googleStreetViewUrl = buildGoogleStreetViewUrl(stop.place);
                        const stopPhoto = resolvePlacePhoto(
                          stop.place,
                          wikipediaPhotosById
                        );
                        const nearbyStations = formatNearbyStations(stop.place);
                        const stopCardId = `${day.title}-${stop.place.id}-${stop.arrival}`;
                        const isSightseeingCardCollapsed =
                          collapsedSightseeingCards[stopCardId] ?? false;
                        const baseVisitDurationMins =
                          preparedDay.plan.stops[stopIndex]?.visitDurationMins ??
                          stop.visitDurationMins;
                        const durationOffsetMins =
                          adjustment.durationOffsetByStopIndex[stopIndex] ?? 0;
                        const canDecreaseDuration =
                          baseVisitDurationMins + durationOffsetMins >
                          minVisitDurationMins;
                        const canIncreaseDuration =
                          baseVisitDurationMins + durationOffsetMins <
                          maxVisitDurationMins;

                        return (
                          <li className="stop-item" key={`${stop.place.id}-${stop.arrival}`}>
                            {!isTransitHidden ? (
                              <TransitLeg
                                stop={stop}
                                fromLabel={fromLabel}
                                leaveByTime={leaveByTime}
                                transportMode={adjustment.transportMode}
                              />
                            ) : null}
                            <div className="stop-card">
                              <div className="stop-card-header">
                                <p className="segment-card-label sightseeing-card-label">
                                  Sightseeing card
                                </p>
                                <button
                                  type="button"
                                  className="stop-card-toggle"
                                  onClick={() =>
                                    setCollapsedSightseeingCards((previous) => ({
                                      ...previous,
                                      [stopCardId]: !isSightseeingCardCollapsed
                                    }))
                                  }
                                  aria-expanded={!isSightseeingCardCollapsed}
                                >
                                  {isSightseeingCardCollapsed ? "Expand card" : "Collapse card"}
                                </button>
                              </div>
                              <div className="stop-time-row">
                                <p className="stop-time">
                                  {toMeridiem(stop.arrival)} - {toMeridiem(stop.departure)}
                                </p>
                                {!isSightseeingCardCollapsed ? (
                                  <div
                                    className="duration-adjust"
                                    role="group"
                                    aria-label={`Adjust time at ${stop.place.name}`}
                                  >
                                    <button
                                      type="button"
                                      className="duration-adjust-btn"
                                      onClick={() => {
                                        setDayAdjustments((previous) => {
                                          const previousDayAdjustment =
                                            previous[day.title] ?? adjustment;
                                          const currentOffset =
                                            previousDayAdjustment.durationOffsetByStopIndex[
                                              stopIndex
                                            ] ?? 0;
                                          const nextOffset =
                                            clampDurationOffset(
                                              baseVisitDurationMins,
                                              currentOffset - visitDurationStepMins
                                            );

                                          return {
                                            ...previous,
                                            [day.title]: {
                                              ...previousDayAdjustment,
                                              durationOffsetByStopIndex: {
                                                ...previousDayAdjustment.durationOffsetByStopIndex,
                                                [stopIndex]: nextOffset
                                              }
                                            }
                                          };
                                        });
                                      }}
                                      aria-label={`Spend ${visitDurationStepMins} fewer minutes at ${stop.place.name}`}
                                      disabled={!canDecreaseDuration}
                                    >
                                      -{visitDurationStepMins}m
                                    </button>
                                    <p className="duration-adjust-value">
                                      {durationOffsetMins === 0
                                        ? "Default"
                                        : `${durationOffsetMins > 0 ? "+" : ""}${durationOffsetMins}m`}
                                    </p>
                                    <button
                                      type="button"
                                      className="duration-adjust-btn"
                                      onClick={() => {
                                        setDayAdjustments((previous) => {
                                          const previousDayAdjustment =
                                            previous[day.title] ?? adjustment;
                                          const currentOffset =
                                            previousDayAdjustment.durationOffsetByStopIndex[
                                              stopIndex
                                            ] ?? 0;
                                          const nextOffset =
                                            clampDurationOffset(
                                              baseVisitDurationMins,
                                              currentOffset + visitDurationStepMins
                                            );

                                          return {
                                            ...previous,
                                            [day.title]: {
                                              ...previousDayAdjustment,
                                              durationOffsetByStopIndex: {
                                                ...previousDayAdjustment.durationOffsetByStopIndex,
                                                [stopIndex]: nextOffset
                                              }
                                            }
                                          };
                                        });
                                      }}
                                      aria-label={`Spend ${visitDurationStepMins} more minutes at ${stop.place.name}`}
                                      disabled={!canIncreaseDuration}
                                    >
                                      +{visitDurationStepMins}m
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <h3>{stop.place.name}</h3>
                              {isSightseeingCardCollapsed ? (
                                <p className="stop-card-collapsed-summary">
                                  Card collapsed. Expand to view description, photos, and links.
                                </p>
                              ) : (
                                <>
                                  <p>{stop.place.description}</p>
                                  {stop.place.soloDiningNote ? (
                                    <p className="solo-dining-note">
                                      Solo dining note: {stop.place.soloDiningNote}
                                    </p>
                                  ) : null}
                                  <div className="stop-photo-block">
                                    <img
                                      className="stop-photo-img"
                                      src={stopPhoto.imageUrl}
                                      alt={`${stopPhoto.caption}, Boston`}
                                      loading="lazy"
                                      onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src = buildFallbackImageUrlForPlace(
                                          stop.place
                                        );
                                      }}
                                    />
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
                                  <div className="stop-map">
                                    <div className="map-links">
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

                  {additionalSightOptions.length > 0 ? (
                    <div className="additional-options-section">
                      <p className="segment-card-label sightseeing-card-label">
                        Additional sightseeing options
                      </p>
                      <ol className="stop-list additional-options-list">
                        {additionalSightOptions.map((place) => {
                          const placePhoto = resolvePlacePhoto(
                            place,
                            wikipediaPhotosById
                          );
                          const nearbyStations = formatNearbyStations(place);
                          const googleMapsPlaceUrl = buildGoogleMapsPlaceUrl(place);
                          const googleStreetViewUrl = buildGoogleStreetViewUrl(place);

                          return (
                            <li className="stop-item" key={`${day.title}-${place.id}`}>
                              <div className="stop-card additional-sight-card">
                                <p className="stop-time">Flexible option</p>
                                <h3>{place.name}</h3>
                                <p>{place.description}</p>
                                <div className="stop-photo-block">
                                  <img
                                    className="stop-photo-img"
                                    src={placePhoto.imageUrl}
                                    alt={`${placePhoto.caption}, Boston`}
                                    loading="lazy"
                                    onError={({ currentTarget }) => {
                                      currentTarget.onerror = null;
                                      currentTarget.src = buildFallbackImageUrlForPlace(
                                        place
                                      );
                                    }}
                                  />
                                  <a
                                    className="stop-photo-source"
                                    href={placePhoto.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Photo source: {placePhoto.sourceLabel}
                                  </a>
                                </div>
                                <p className="stop-foot">
                                  Neighborhood: {place.neighborhood} | Suggested visit{" "}
                                  {place.visitDurationMins} min
                                </p>
                                {nearbyStations ? (
                                  <p className="stop-foot">Nearest T: {nearbyStations}</p>
                                ) : null}
                                {place.isFreedomTrailStop ? (
                                  <p className="freedom-trail-note">Freedom Trail stop</p>
                                ) : null}
                                <div className="stop-map">
                                  <div className="map-links">
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
                                    {place.infoUrl ? (
                                      <a
                                        className="map-info-link"
                                        href={place.infoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {place.infoLabel ?? "More info"}
                                      </a>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  ) : null}

                  {isTransitHidden ? (
                    <p className="transit-hidden-note">
                      Transit cards are hidden for this day. Use the day header toggle to
                      show them again.
                    </p>
                  ) : null}

                  {!isTransitHidden && adjustedDay.returnToHotel ? (
                    <div className="return-hotel-card">
                      <p className="return-hotel-title">
                        Return to Hotel
                        {adjustedDay.returnToHotel.afterDark ? " (after dark)" : ""}
                      </p>
                      <div className="return-hotel-metrics">
                        <p>
                          <span>Depart from</span>
                          <strong>{adjustedDay.returnToHotel.fromPlaceName}</strong>
                        </p>
                        <p>
                          <span>Leave by</span>
                          <strong>{toMeridiem(adjustedDay.returnToHotel.leaveByTime)}</strong>
                        </p>
                        <p>
                          <span>Dark by</span>
                          <strong>{toMeridiem(adjustedDay.returnToHotel.darkByTime)}</strong>
                        </p>
                        <p>
                          <span>Mode in use</span>
                          <strong>{modeLabels[adjustedDay.returnToHotel.modeInUse]}</strong>
                        </p>
                        <p>
                          <span>Travel estimate</span>
                          <strong>{adjustedDay.returnToHotel.travelMins} min</strong>
                        </p>
                        <p>
                          <span>Arrive hotel</span>
                          <strong>{toMeridiem(adjustedDay.returnToHotel.arriveByTime)}</strong>
                        </p>
                      </div>
                      <p className="return-hotel-times">
                        Walk {adjustedDay.returnToHotel.walkMins} min | MBTA{" "}
                        {adjustedDay.returnToHotel.mbtaMins} min
                      </p>
                      <p className="return-hotel-directions">
                        {adjustedDay.returnToHotel.directions}
                      </p>
                      <p className="return-hotel-safety">
                        {adjustedDay.returnToHotel.safetyNote}
                      </p>
                    </div>
                  ) : null}

                  <div className="notes">
                    {preparedDay.plan.notes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
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
          <label htmlFor="flight-selector">Flight</label>
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
    </div>
  );
}

export default App;

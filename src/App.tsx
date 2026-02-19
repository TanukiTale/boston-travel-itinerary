import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { generateBostonConferenceItinerary } from "./lib/itineraryGenerator";
import type { DayPlan, Place, ScheduledStop, TravelMode } from "./types";
import "./styles.css";

const modeLabels = {
  WALK: "Walk",
  MBTA: "MBTA"
} as const;

const transferBufferByMode = {
  WALK: 6,
  MBTA: 12
} as const;

const visitDurationStepMins = 15;
const minVisitDurationMins = 15;
const maxVisitDurationMins = 240;

const placePhotosById: Partial<
  Record<
    string,
    {
      imageUrl: string;
      sourceUrl: string;
      sourceLabel: string;
      caption: string;
    }
  >
> = {
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

const defaultPlacePhoto = {
  imageUrl:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
  sourceUrl:
    "https://commons.wikimedia.org/wiki/File:Acorn_Street_Beacon_Hill_Boston_Massachusetts.jpg",
  sourceLabel: "Wikimedia Commons",
  caption: "Historic Boston streetscape"
} as const;

const THEME_STORAGE_KEY = "boston-companion-theme";
const defaultBostonMapUrl = "https://www.google.com/maps/search/?api=1&query=Boston%2C+MA";
const myBostonMapUrl =
  import.meta.env.VITE_MY_BOSTON_MAP_URL?.trim() || defaultBostonMapUrl;
const hasCustomBostonMap = Boolean(import.meta.env.VITE_MY_BOSTON_MAP_URL?.trim());
const hotelWebsiteUrl =
  "https://www.marriott.com/en-us/hotels/bosow-the-westin-boston-seaport-district/overview/";

type ThemeMode = "light" | "dark";
type TransitModePreference = "AUTO" | TravelMode;

interface DayTimingAdjustment {
  startTime: string;
  transportMode: TransitModePreference;
  durationOffsetByStopIndex: Record<number, number>;
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

function buildAdjustedDayView(
  day: DayPlan,
  adjustment: DayTimingAdjustment
): AdjustedDayView {
  let cursor = parseClockToMinutes(adjustment.startTime);
  const adjustedStops = day.stops.map((stop, stopIndex) => {
    const legMins = getTransitMinsForMode(stop, adjustment.transportMode);
    const arrivalMins = cursor + legMins;
    const bufferMins = stop.bufferAfterMins ?? 0;
    const durationOffset = adjustment.durationOffsetByStopIndex[stopIndex] ?? 0;
    const adjustedVisitDurationMins = Math.max(
      minVisitDurationMins,
      Math.min(maxVisitDurationMins, stop.visitDurationMins + durationOffset)
    );
    const departureMins = arrivalMins + adjustedVisitDurationMins + bufferMins;

    cursor = departureMins;

    return {
      ...stop,
      visitDurationMins: adjustedVisitDurationMins,
      arrival: minutesToClock(arrivalMins),
      departure: minutesToClock(departureMins)
    };
  });

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
    returnToHotel
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
  const directions =
    transportMode === "AUTO" || modeInUse === leg.recommendedMode
      ? leg.directions
      : modeInUse === "MBTA"
        ? "Use MBTA for this leg and confirm the best line and next departure in Google Maps."
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
          durationOffsetByStopIndex: {}
        }
      ])
    )
  );
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, false]))
  );
  const [transitHiddenByDay, setTransitHiddenByDay] = useState<Record<string, boolean>>(
    () => Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, true]))
  );
  const [airportCollapsed, setAirportCollapsed] = useState(false);
  const selectedFlight = itinerary.flights[selectedFlightKey];
  const areAllSectionsCollapsed =
    itinerary.dayPlans.every((day) => collapsedDays[day.title]) && airportCollapsed;

  function setAllSectionsCollapsed(collapse: boolean) {
    setCollapsedDays(
      Object.fromEntries(itinerary.dayPlans.map((day) => [day.title, collapse]))
    );
    setAirportCollapsed(collapse);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
            durationOffsetByStopIndex: {}
          };
          const adjustedDay = buildAdjustedDayView(day, adjustment);

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
                    <span>Cluster: {day.clusterLabel}</span>
                  </div>
                  <button
                    type="button"
                    className="day-collapse-toggle"
                    onClick={() =>
                      setTransitHiddenByDay((previous) => ({
                        ...previous,
                        [day.title]: !isTransitHidden
                      }))
                    }
                  >
                    {isTransitHidden ? "Show transit cards" : "Hide transit cards"}
                  </button>
                  <button
                    type="button"
                    className="day-collapse-toggle"
                    onClick={() =>
                      setCollapsedDays((previous) => ({
                        ...previous,
                        [day.title]: !isCollapsed
                      }))
                    }
                    aria-expanded={!isCollapsed}
                    aria-controls={sectionId}
                  >
                    {isCollapsed ? "Expand day" : "Collapse day"}
                  </button>
                </div>
              </header>

              {isCollapsed ? (
                <p className="collapsed-summary">
                  {day.stops.length} stop{day.stops.length === 1 ? "" : "s"} planned.
                </p>
              ) : (
                <div id={sectionId}>
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

                  {adjustedDay.stops.length === 0 ? (
                    <p className="empty-block">No stop fits this time window.</p>
                  ) : (
                    <ol className="stop-list">
                      {adjustedDay.stops.map((stop, stopIndex) => {
                        const fromLabel =
                          stopIndex === 0
                            ? day.startFromLabel
                            : adjustedDay.stops[stopIndex - 1].place.name;
                        const leaveByTime =
                          stopIndex === 0
                            ? adjustedDay.startTime
                            : adjustedDay.stops[stopIndex - 1].departure;
                        const googleMapsPlaceUrl = buildGoogleMapsPlaceUrl(stop.place);
                        const googleStreetViewUrl = buildGoogleStreetViewUrl(stop.place);
                        const stopPhoto =
                          placePhotosById[stop.place.id] ?? defaultPlacePhoto;
                        const baseVisitDurationMins =
                          day.stops[stopIndex]?.visitDurationMins ??
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
                              <p className="segment-card-label sightseeing-card-label">
                                Sightseeing card
                              </p>
                              <div className="stop-time-row">
                                <p className="stop-time">
                                  {toMeridiem(stop.arrival)} - {toMeridiem(stop.departure)}
                                </p>
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
                              </div>
                              <h3>{stop.place.name}</h3>
                              <p>{stop.place.description}</p>
                              <div className="stop-photo-block">
                                <img
                                  className="stop-photo-img"
                                  src={stopPhoto.imageUrl}
                                  alt={`${stopPhoto.caption}, Boston`}
                                  loading="lazy"
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
                              <p className="stop-foot">
                                Neighborhood: {stop.place.neighborhood} | Visit{" "}
                                {stop.visitDurationMins} min
                              </p>
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
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}

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
                    {day.notes.map((note) => (
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

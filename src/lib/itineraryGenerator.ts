import {
  BOSTON_PLACES,
  CONFERENCE_VENUE,
  DAY_TEMPLATES,
  HOTEL_BASE,
  MBTA_OVERRIDES
} from "../data/places";
import type {
  AirportPlan,
  DayPlan,
  DayTemplate,
  FlightInfo,
  Itinerary,
  Place,
  ReturnToHotelPlan,
  ScheduledStop,
  TransitEstimate,
  TravelMode
} from "../types";

const placeById = new Map(BOSTON_PLACES.map((place) => [place.id, place]));

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

const CLUSTER_THRESHOLD_KM = 1.4;
const STANDARD_SEGMENT_BUFFER_MINS = 15;
const BAG_DROP_DURATION_MINS = 25;
const DOMESTIC_CHECKIN_BUFFER_MINS = 120;
const OUTBOUND_FLIGHT_DEPARTURE_TIME = "14:23";

const TRIP_FLIGHTS: FlightInfo = {
  inbound: {
    origin: "Columbus (CMH)",
    destination: "Boston (BOS)",
    departureLabel: "March 28, 06:00 AM",
    arrivalLabel: "March 28, 08:06 AM"
  },
  outbound: {
    origin: "Boston (BOS)",
    destination: "Columbus (CMH)",
    departureLabel: "April 2, 02:23 PM",
    arrivalLabel: "April 2, 04:40 PM"
  }
};

const DARK_BY_DAY_KEY: Record<string, string> = {
  sunday: "18:55",
  monday: "18:56",
  tuesday: "18:58",
  wednesday: "19:00",
  thursday: "19:01"
};

function parseTimeToMinutes(value: string, fallback = OUTBOUND_FLIGHT_DEPARTURE_TIME): number {
  const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const match = value.match(pattern) ?? fallback.match(pattern);

  if (!match) {
    return 930;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

function minutesToClock(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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

function getDarkByTime(template: DayTemplate): string {
  return DARK_BY_DAY_KEY[template.key] ?? "19:00";
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceKm(a: Place, b: Place): number {
  const earthRadius = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const arc =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(arc));
}

function estimateWalkMinutes(from: Place, to: Place): number {
  const km = haversineDistanceKm(from, to);
  return Math.max(4, Math.round(km * 12));
}

function estimateMbtaMinutes(from: Place, to: Place): number {
  const override = MBTA_OVERRIDES[`${from.id}->${to.id}`];
  if (override) {
    return override.minutes;
  }

  const reverseOverride = MBTA_OVERRIDES[`${to.id}->${from.id}`];
  if (reverseOverride) {
    return reverseOverride.minutes;
  }

  const distance = haversineDistanceKm(from, to);
  return Math.max(12, Math.round(distance * 8 + 10));
}

function walkDirections(from: Place, to: Place): string {
  return `Walk from ${from.neighborhood} to ${to.neighborhood}; this leg is short enough that walking is typically simplest and fastest.`;
}

function mbtaDirections(from: Place, to: Place): string {
  const directOverride = MBTA_OVERRIDES[`${from.id}->${to.id}`];
  if (directOverride) {
    return directOverride.directions;
  }

  const reverseOverride = MBTA_OVERRIDES[`${to.id}->${from.id}`];
  if (reverseOverride) {
    return reverseOverride.reverseDirections ?? reverseOverride.directions;
  }

  return `Use the MBTA from ${from.neighborhood} toward ${to.neighborhood} with one transfer, then walk the final few blocks.`;
}

function pickTravelMode(walkMins: number, mbtaMins: number): TravelMode {
  if (walkMins <= 18) {
    return "WALK";
  }

  if (mbtaMins + 8 < walkMins * 1.3) {
    return "MBTA";
  }

  return "WALK";
}

function buildTransitEstimate(from: Place, to: Place): TransitEstimate {
  const walkMins = estimateWalkMinutes(from, to);
  const mbtaMins = estimateMbtaMinutes(from, to);
  const recommendedMode = pickTravelMode(walkMins, mbtaMins);
  const recommendedMins = recommendedMode === "MBTA" ? mbtaMins : walkMins;
  const directions =
    recommendedMode === "MBTA"
      ? mbtaDirections(from, to)
      : walkDirections(from, to);

  return {
    fromId: from.id,
    toId: to.id,
    walkMins,
    mbtaMins,
    recommendedMode,
    recommendedMins,
    directions
  };
}

function clusterByProximity(stops: Place[]): Place[][] {
  const remaining = [...stops];
  const clusters: Place[][] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift();
    if (!seed) {
      break;
    }

    const cluster: Place[] = [seed];
    let addedAny = true;

    while (addedAny) {
      addedAny = false;

      for (let i = remaining.length - 1; i >= 0; i -= 1) {
        const candidate = remaining[i];
        const isNearCluster = cluster.some(
          (member) => haversineDistanceKm(member, candidate) <= CLUSTER_THRESHOLD_KM
        );

        if (isNearCluster) {
          cluster.push(candidate);
          remaining.splice(i, 1);
          addedAny = true;
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters.sort((a, b) => b.length - a.length);
}

function minDistanceToCluster(place: Place, cluster: Place[]): number {
  if (!cluster.length) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...cluster.map((member) => haversineDistanceKm(member, place)));
}

function choosePrimaryCluster(
  clusters: Place[][],
  targetNeighborhoods: string[]
): Place[] {
  if (clusters.length === 0) {
    return [];
  }

  const normalizedTargets = targetNeighborhoods.map((target) => target.toLowerCase());
  let bestCluster = clusters[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const cluster of clusters) {
    const targetHits = cluster.filter((stop) =>
      normalizedTargets.includes(stop.neighborhood.toLowerCase())
    ).length;
    const score = targetHits * 3 + cluster.length;

    if (score > bestScore) {
      bestScore = score;
      bestCluster = cluster;
    }
  }

  return bestCluster;
}

function dedupeById(stops: Place[]): Place[] {
  const map = new Map(stops.map((place) => [place.id, place]));
  return [...map.values()];
}

function orderByNearestNeighbor(start: Place, stops: Place[]): Place[] {
  const remaining = [...stops];
  const ordered: Place[] = [];
  let current = start;

  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const distance = haversineDistanceKm(current, remaining[i]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    const [nextStop] = remaining.splice(bestIndex, 1);
    ordered.push(nextStop);
    current = nextStop;
  }

  return ordered;
}

function buildClusterLabel(stops: Place[]): string {
  const counts = new Map<string, number>();
  for (const stop of stops) {
    counts.set(stop.neighborhood, (counts.get(stop.neighborhood) ?? 0) + 1);
  }

  const topNeighborhoods = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([neighborhood]) => neighborhood);

  return topNeighborhoods.join(" + ") || "Seaport";
}

function scheduleDay(
  template: DayTemplate,
  endOverrideMins?: number,
  excludedStopIds: ReadonlySet<string> = new Set()
): { plan: DayPlan; filteredRestaurants: number } {
  const templateStops = template.stopIds
    .map((stopId) => placeById.get(stopId))
    .filter((stop): stop is Place => Boolean(stop));
  const rawStops = templateStops.filter((stop) => !excludedStopIds.has(stop.id));
  const duplicateStopsSkipped = templateStops.length - rawStops.length;

  let filteredRestaurants = 0;
  const glutenFreeStops = rawStops.filter((stop) => {
    if (stop.category !== "restaurant") {
      return true;
    }

    const isSafe = stop.glutenFreeSafe === true;
    if (!isSafe) {
      filteredRestaurants += 1;
    }
    return isSafe;
  });

  const clusterableStops = glutenFreeStops.filter(
    (stop) => stop.category !== "restaurant"
  );
  const baseClusters = clusterByProximity(
    clusterableStops.length ? clusterableStops : glutenFreeStops
  );

  const primaryCluster = choosePrimaryCluster(
    baseClusters,
    template.targetNeighborhoods
  );
  const nearbyRestaurants = glutenFreeStops.filter(
    (stop) =>
      stop.category === "restaurant" &&
      minDistanceToCluster(stop, primaryCluster) <= 1.8
  );
  const selectedStops = dedupeById([...primaryCluster, ...nearbyRestaurants]);
  const startLocation = template.startFrom === "airport" ? AIRPORT_PLACE : HOTEL_BASE;
  const shouldAddHotelBagDrop =
    template.startFrom === "airport" && template.includeHotelBagDrop === true;
  const attractionStartLocation = shouldAddHotelBagDrop
    ? HOTEL_BASE
    : startLocation;
  const orderedStops = orderByNearestNeighbor(attractionStartLocation, selectedStops);

  const startMins = parseTimeToMinutes(template.startTime);
  const defaultEnd = parseTimeToMinutes(template.endTime);
  const effectiveEnd =
    endOverrideMins !== undefined ? Math.min(endOverrideMins, defaultEnd) : defaultEnd;
  const safeEnd = Math.max(startMins + 45, effectiveEnd);

  let cursor = startMins;
  let previousStop = startLocation;
  const scheduledStops: ScheduledStop[] = [];
  let hotelBagDropAdded = false;

  if (shouldAddHotelBagDrop) {
    const airportToHotelTransit = buildTransitEstimate(startLocation, HOTEL_BASE);
    const arrivalMins = cursor + airportToHotelTransit.recommendedMins;
    const departureMins = arrivalMins + BAG_DROP_DURATION_MINS;

    if (departureMins <= safeEnd) {
      const hotelBagDropStop: ScheduledStop = {
        place: HOTEL_BASE,
        arrival: minutesToClock(arrivalMins),
        departure: minutesToClock(departureMins),
        visitDurationMins: BAG_DROP_DURATION_MINS,
        transitFromPrevious: airportToHotelTransit
      };

      cursor = departureMins;
      if (orderedStops.length > 0 && cursor + STANDARD_SEGMENT_BUFFER_MINS <= safeEnd) {
        hotelBagDropStop.bufferAfterMins = STANDARD_SEGMENT_BUFFER_MINS;
        cursor += STANDARD_SEGMENT_BUFFER_MINS;
        hotelBagDropStop.departure = minutesToClock(cursor);
      }

      scheduledStops.push(hotelBagDropStop);
      previousStop = HOTEL_BASE;
      hotelBagDropAdded = true;
    }
  }

  for (let i = 0; i < orderedStops.length; i += 1) {
    const currentStop = orderedStops[i];
    const transit = buildTransitEstimate(previousStop, currentStop);
    const tentativeArrival = cursor + transit.recommendedMins;

    if (tentativeArrival + currentStop.visitDurationMins > safeEnd) {
      continue;
    }

    cursor = tentativeArrival;
    const arrivalMins = cursor;
    cursor += currentStop.visitDurationMins;

    const scheduled: ScheduledStop = {
      place: currentStop,
      arrival: minutesToClock(arrivalMins),
      departure: minutesToClock(cursor),
      visitDurationMins: currentStop.visitDurationMins,
      transitFromPrevious: transit
    };

    const shouldBuffer = i < orderedStops.length - 1;
    if (shouldBuffer) {
      const bufferMins =
        currentStop.category === "restaurant" ? 10 : STANDARD_SEGMENT_BUFFER_MINS;
      if (cursor + bufferMins <= safeEnd) {
        scheduled.bufferAfterMins = bufferMins;
        cursor += bufferMins;
        scheduled.departure = minutesToClock(cursor);
      }
    }

    scheduledStops.push(scheduled);
    previousStop = currentStop;
  }

  if (scheduledStops.length === 0 && orderedStops.length > 0) {
    const fallbackStop = orderedStops[0];
    const fallbackTransit = buildTransitEstimate(startLocation, fallbackStop);
    const arrival = startMins + fallbackTransit.recommendedMins;
    const fallbackDuration = Math.min(35, fallbackStop.visitDurationMins);
    const departure = Math.min(arrival + fallbackDuration, safeEnd);

    if (arrival < departure) {
      scheduledStops.push({
        place: fallbackStop,
        arrival: minutesToClock(arrival),
        departure: minutesToClock(departure),
        visitDurationMins: departure - arrival,
        transitFromPrevious: fallbackTransit
      });
    }
  }

  const notes: string[] = [
    "Transit recommendations prioritize MBTA for longer hops and walking for short links.",
    "Each major segment includes a built-in buffer to reduce schedule stress."
  ];

  if (orderedStops.length > scheduledStops.length) {
    notes.push("Optional stops were trimmed to keep the plan realistic for this window.");
  }

  if (filteredRestaurants > 0) {
    const noun = filteredRestaurants === 1 ? "option" : "options";
    const verb = filteredRestaurants === 1 ? "was" : "were";
    notes.push(
      `${filteredRestaurants} restaurant ${noun} ${verb} removed because ${
        filteredRestaurants === 1 ? "it" : "they"
      } did not pass strict gluten-free filtering.`
    );
  }

  if (duplicateStopsSkipped > 0) {
    notes.push(
      "Repeated places from earlier days were skipped to keep the itinerary unique."
    );
  }

  if (template.startFrom === "airport") {
    notes.push("This day begins from Boston Logan International Airport (BOS).");
  }

  if (hotelBagDropAdded) {
    notes.push("First stop routes to your hotel so you can drop bags before exploring.");
  }

  let returnToHotel: ReturnToHotelPlan | undefined;
  const finalStop = scheduledStops[scheduledStops.length - 1];
  if (finalStop && finalStop.place.id !== HOTEL_BASE.id) {
    const darkByTime = getDarkByTime(template);
    const leaveByMins = parseTimeToMinutes(finalStop.departure);
    const darkByMins = parseTimeToMinutes(darkByTime);
    const afterDark = leaveByMins >= darkByMins;
    const transitBack = buildTransitEstimate(finalStop.place, HOTEL_BASE);
    const recommendedMode: TravelMode = afterDark
      ? "MBTA"
      : transitBack.recommendedMode;
    const recommendedMins =
      recommendedMode === "MBTA" ? transitBack.mbtaMins : transitBack.walkMins;
    const arriveByTime = minutesToClock(leaveByMins + recommendedMins);
    const directions =
      recommendedMode === "MBTA"
        ? mbtaDirections(finalStop.place, HOTEL_BASE)
        : walkDirections(finalStop.place, HOTEL_BASE);
    const safetyNote = afterDark
      ? "Likely dark for this return. Prefer MBTA, stay on main streets near active corridors, and avoid isolated shortcuts."
      : "This return should still be before dark. Keep to main streets and switch to MBTA if weather or fatigue changes your comfort level.";

    returnToHotel = {
      fromPlaceName: finalStop.place.name,
      leaveByTime: finalStop.departure,
      arriveByTime,
      darkByTime,
      afterDark,
      recommendedMode,
      recommendedMins,
      walkMins: transitBack.walkMins,
      mbtaMins: transitBack.mbtaMins,
      directions,
      safetyNote
    };

    if (afterDark) {
      notes.push(
        `Night return plan: leave ${finalStop.place.name} by ${toMeridiem(
          finalStop.departure
        )}, use MBTA, and aim to be back at the hotel by ${toMeridiem(arriveByTime)}.`
      );
    }
  }

  return {
    plan: {
      title: template.title,
      dateLabel: template.dateLabel,
      availabilityLabel: template.availabilityLabel,
      clusterLabel: buildClusterLabel(selectedStops),
      startTime: template.startTime,
      endTime: minutesToClock(safeEnd),
      startFrom: template.startFrom ?? "hotel",
      startFromLabel: startLocation.name,
      stops: scheduledStops,
      returnToHotel,
      notes
    },
    filteredRestaurants
  };
}

function buildAirportPlan(): AirportPlan {
  const departureMins = parseTimeToMinutes(OUTBOUND_FLIGHT_DEPARTURE_TIME);
  const checkInBufferMins = DOMESTIC_CHECKIN_BUFFER_MINS;
  const transitBufferMins = 20;

  const mbtaTransit = buildTransitEstimate(HOTEL_BASE, AIRPORT_PLACE);
  const mbtaLeaveHotelMins =
    departureMins - checkInBufferMins - transitBufferMins - mbtaTransit.mbtaMins;

  const earliestComfortableMbta = 5 * 60;
  if (mbtaLeaveHotelMins >= earliestComfortableMbta) {
    return {
      flightDepartureTime: minutesToClock(departureMins),
      recommendedLeaveHotelTime: minutesToClock(mbtaLeaveHotelMins),
      recommendedLeaveHotelMins: mbtaLeaveHotelMins,
      targetAirportArrivalTime: minutesToClock(departureMins - checkInBufferMins),
      transferMode: "MBTA Silver Line SL1",
      transferDurationMins: mbtaTransit.mbtaMins,
      checkInBufferMins,
      transitBufferMins,
      directions: [
        "Leave the Westin and walk about 8 minutes to World Trade Center Station.",
        "Take Silver Line SL1 directly to Logan Airport.",
        "Exit at your terminal and allow 5-10 minutes for terminal walking."
      ]
    };
  }

  const rideshareTransitMins = 26;
  const rideshareTrafficBufferMins = 30;
  const leaveHotelMins =
    departureMins - checkInBufferMins - rideshareTrafficBufferMins - rideshareTransitMins;

  return {
    flightDepartureTime: minutesToClock(departureMins),
    recommendedLeaveHotelTime: minutesToClock(leaveHotelMins),
    recommendedLeaveHotelMins: leaveHotelMins,
    targetAirportArrivalTime: minutesToClock(departureMins - checkInBufferMins),
    transferMode: "Rideshare fallback (early departure)",
    transferDurationMins: rideshareTransitMins,
    checkInBufferMins,
    transitBufferMins: rideshareTrafficBufferMins,
    directions: [
      "MBTA service window is tight for this departure, so schedule a rideshare pickup at the hotel entrance.",
      "Use a 30-minute traffic cushion before the expected drive time to Logan.",
      "Head straight to check-in and security on arrival."
    ]
  };
}

export function generateBostonConferenceItinerary(): Itinerary {
  const airportPlan = buildAirportPlan();
  let removedRestaurants = 0;
  const usedStopIds = new Set<string>();

  const dayPlans = DAY_TEMPLATES.map((template) => {
    const isThursday = template.key === "thursday";
    const thursdayStopCutoff = airportPlan.recommendedLeaveHotelMins - 25;

    const { plan, filteredRestaurants } = scheduleDay(
      template,
      isThursday ? thursdayStopCutoff : undefined,
      usedStopIds
    );

    removedRestaurants += filteredRestaurants;
    for (const stop of plan.stops) {
      usedStopIds.add(stop.place.id);
    }

    if (isThursday) {
      plan.notes.push(
        `Airport transfer: leave hotel by ${toMeridiem(airportPlan.recommendedLeaveHotelTime)} using ${airportPlan.transferMode}.`
      );
    }

    return plan;
  });

  const glutenFreeFilterSummary =
    removedRestaurants > 0
      ? `${removedRestaurants} non-gluten-free restaurant option was automatically removed from recommendations.`
      : "All restaurant recommendations in this itinerary passed strict gluten-free safety filtering.";

  return {
    hotel: HOTEL_BASE,
    conferenceVenue: CONFERENCE_VENUE,
    flights: TRIP_FLIGHTS,
    dayPlans,
    airportPlan,
    glutenFreeFilterSummary
  };
}

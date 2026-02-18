export type PlaceCategory =
  | "historic"
  | "waterfront"
  | "restaurant"
  | "viewpoint"
  | "conference"
  | "airport";

export type TravelMode = "WALK" | "MBTA";

export type FlightType = "domestic" | "international";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  neighborhood: string;
  lat: number;
  lng: number;
  visitDurationMins: number;
  description: string;
  glutenFreeSafe?: boolean;
}

export interface DayTemplate {
  key: string;
  title: string;
  availabilityLabel: string;
  startTime: string;
  endTime: string;
  targetNeighborhoods: string[];
  stopIds: string[];
}

export interface TransitEstimate {
  fromId: string;
  toId: string;
  walkMins: number;
  mbtaMins: number;
  recommendedMode: TravelMode;
  recommendedMins: number;
  directions: string;
}

export interface ScheduledStop {
  place: Place;
  arrival: string;
  departure: string;
  visitDurationMins: number;
  transitFromPrevious?: TransitEstimate;
  bufferAfterMins?: number;
}

export interface DayPlan {
  title: string;
  availabilityLabel: string;
  clusterLabel: string;
  startTime: string;
  endTime: string;
  stops: ScheduledStop[];
  notes: string[];
}

export interface AirportPlan {
  flightType: FlightType;
  flightDepartureTime: string;
  recommendedLeaveHotelTime: string;
  recommendedLeaveHotelMins: number;
  targetAirportArrivalTime: string;
  transferMode: string;
  transferDurationMins: number;
  checkInBufferMins: number;
  transitBufferMins: number;
  directions: string[];
}

export interface GeneratorOptions {
  flightDepartureTime: string;
  flightType: FlightType;
}

export interface Itinerary {
  hotel: Place;
  conferenceVenue: Place;
  dayPlans: DayPlan[];
  airportPlan: AirportPlan;
  glutenFreeFilterSummary: string;
}

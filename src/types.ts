export type PlaceCategory =
  | "historic"
  | "waterfront"
  | "restaurant"
  | "viewpoint"
  | "conference"
  | "airport";

export type TravelMode = "WALK" | "MBTA";
export type DayStartPoint = "hotel" | "airport";

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
  isFreedomTrailStop?: boolean;
  infoUrl?: string;
  infoLabel?: string;
}

export interface DayTemplate {
  key: string;
  title: string;
  dateLabel: string;
  availabilityLabel: string;
  startTime: string;
  endTime: string;
  startFrom?: DayStartPoint;
  includeHotelBagDrop?: boolean;
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

export interface ReturnToHotelPlan {
  fromPlaceName: string;
  leaveByTime: string;
  arriveByTime: string;
  darkByTime: string;
  afterDark: boolean;
  recommendedMode: TravelMode;
  recommendedMins: number;
  walkMins: number;
  mbtaMins: number;
  directions: string;
  safetyNote: string;
}

export interface DayPlan {
  title: string;
  dateLabel: string;
  availabilityLabel: string;
  clusterLabel: string;
  startTime: string;
  endTime: string;
  startFrom: DayStartPoint;
  startFromLabel: string;
  stops: ScheduledStop[];
  returnToHotel?: ReturnToHotelPlan;
  notes: string[];
}

export interface AirportPlan {
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

export interface FlightSegment {
  origin: string;
  destination: string;
  departureLabel: string;
  arrivalLabel: string;
}

export interface FlightInfo {
  inbound: FlightSegment;
  outbound: FlightSegment;
}

export interface Itinerary {
  hotel: Place;
  conferenceVenue: Place;
  flights: FlightInfo;
  dayPlans: DayPlan[];
  airportPlan: AirportPlan;
  glutenFreeFilterSummary: string;
}

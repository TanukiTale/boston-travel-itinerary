import { useMemo, useState, type CSSProperties } from "react";
import { generateBostonConferenceItinerary } from "./lib/itineraryGenerator";
import type { FlightType, ScheduledStop } from "./types";
import "./styles.css";

const modeLabels = {
  WALK: "Walk",
  MBTA: "MBTA"
} as const;

function TransitLeg({
  stop,
  fromLabel
}: {
  stop: ScheduledStop;
  fromLabel: string;
}) {
  if (!stop.transitFromPrevious) {
    return null;
  }

  const leg = stop.transitFromPrevious;

  return (
    <div className="transit-leg">
      <p className="transit-route">
        {fromLabel}
        {" -> "}
        {stop.place.name}
      </p>
      <p className="transit-times">
        Walk {leg.walkMins} min | MBTA {leg.mbtaMins} min | Recommended{" "}
        {modeLabels[leg.recommendedMode]} ({leg.recommendedMins} min)
      </p>
      <p className="transit-directions">{leg.directions}</p>
    </div>
  );
}

function App() {
  const [flightDepartureTime, setFlightDepartureTime] = useState("15:30");
  const [flightType, setFlightType] = useState<FlightType>("domestic");

  const itinerary = useMemo(
    () => generateBostonConferenceItinerary({ flightDepartureTime, flightType }),
    [flightDepartureTime, flightType]
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Boston Conference Companion</p>
        <h1>ThinkTransit Itinerary Generator</h1>
        <p className="hero-text">
          MBTA-first travel planning for a solo conference week, optimized for
          historic Boston feel, coastal energy, and strict gluten-free dining.
        </p>
        <div className="hero-meta">
          <div>
            <h2>Hotel Base</h2>
            <p>{itinerary.hotel.name}</p>
            <p>425 Summer St, Boston, MA 02210</p>
          </div>
          <div>
            <h2>Conference Anchor</h2>
            <p>{itinerary.conferenceVenue.name}</p>
            <p>Seaport District (daytime fixed schedule)</p>
          </div>
        </div>
      </header>

      <section className="controls">
        <div className="control">
          <label htmlFor="departure-time">Thursday flight departure</label>
          <input
            id="departure-time"
            type="time"
            value={flightDepartureTime}
            onChange={(event) => setFlightDepartureTime(event.target.value)}
            step={900}
          />
        </div>
        <div className="control">
          <label htmlFor="flight-type">Flight type</label>
          <select
            id="flight-type"
            value={flightType}
            onChange={(event) => setFlightType(event.target.value as FlightType)}
          >
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
        </div>
        <div className="control summary-pill">
          <span>Safety Filter</span>
          <p>{itinerary.glutenFreeFilterSummary}</p>
        </div>
      </section>

      <section className="day-grid" aria-label="Daily itinerary blocks">
        {itinerary.dayPlans.map((day, cardIndex) => (
          <article
            className="day-card"
            key={day.title}
            style={{ "--stagger-index": cardIndex } as CSSProperties}
          >
            <header className="day-header">
              <div>
                <p className="day-title">{day.title}</p>
                <p className="day-availability">{day.availabilityLabel}</p>
              </div>
              <div className="day-badges">
                <span>{day.startTime} - {day.endTime}</span>
                <span>Cluster: {day.clusterLabel}</span>
              </div>
            </header>

            {day.stops.length === 0 ? (
              <p className="empty-block">No stop fits this time window.</p>
            ) : (
              <ol className="stop-list">
                {day.stops.map((stop, stopIndex) => {
                  const fromLabel =
                    stopIndex === 0
                      ? itinerary.hotel.name
                      : day.stops[stopIndex - 1].place.name;

                  return (
                    <li className="stop-item" key={`${stop.place.id}-${stop.arrival}`}>
                      <TransitLeg stop={stop} fromLabel={fromLabel} />
                      <div className="stop-card">
                        <p className="stop-time">
                          {stop.arrival} - {stop.departure}
                        </p>
                        <h3>{stop.place.name}</h3>
                        <p>{stop.place.description}</p>
                        <p className="stop-foot">
                          Neighborhood: {stop.place.neighborhood} | Visit{" "}
                          {stop.visitDurationMins} min
                        </p>
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

            <div className="notes">
              {day.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="airport-card">
        <h2>Thursday Airport Timing Logic</h2>
        <div className="airport-metrics">
          <p>
            <span>Flight departure</span>
            <strong>{itinerary.airportPlan.flightDepartureTime}</strong>
          </p>
          <p>
            <span>Leave hotel by</span>
            <strong>{itinerary.airportPlan.recommendedLeaveHotelTime}</strong>
          </p>
          <p>
            <span>Target airport arrival</span>
            <strong>{itinerary.airportPlan.targetAirportArrivalTime}</strong>
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
      </section>
    </div>
  );
}

export default App;

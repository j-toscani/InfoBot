import createClient, { Station, Location, Stop, Journey } from "hafas-client";
import dbProfile from "hafas-client/p/db";

const client = createClient(dbProfile, "Inf9Bot");

export async function getLocationIds(
  start: string,
  end: string
): Promise<{
  from: string | undefined;
  to: string | undefined;
}> {
  try {
    const options = {
      fuzzy: false, // find only exact matches?
      results: 1, // how many search results?
      stops: true, // return stops/stations?
      addresses: true,
      poi: true, // points of interest
      subStops: true, // parse & expose sub-stops of stations?
      entrances: false, // parse & expose entrances of stops/stations?
      linesOfStops: false, // parse & expose lines at each stop/station?
      language: "de",
    };

    const fromRequest = client.locations(start, options);
    const toRequest = client.locations(end, options);

    const [fromStations, toStations] = await Promise.all([
      fromRequest,
      toRequest,
    ]);

    const from = fromStations[0]?.id;
    const to = toStations[0]?.id;

    return {
      from,
      to,
    };
  } catch (error) {
    console.log(error);
    return {
      from: undefined,
      to: undefined,
    };
  }
}

export async function getJourneyData(
  from: string,
  to: string
): Promise<undefined | readonly Journey[]> {
  try {
    const journeys = (await client.journeys(from, to, { results: 1 }))
      ?.journeys;
    if (!journeys) {
      throw "No Journeys available";
    }
    return journeys;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export function createReadableJourneyData(journey: Journey) {
  const stops = journey.legs.map((leg) => {
    const { origin, destination, line } = leg;
    const stopInformation = {
      line: leg.line?.name || line?.additionalName || "Unbekannt",
      direction: leg.direction || "Unbekannt",
      peopleOnTrain: leg.loadFactor,
      start: {
        name: origin.name,
        departure: leg.departure,
        departurePlatform: leg.departurePlatform,
      },
      end: {
        name: destination.name,
        arrival: leg.arrival,
        arrivalPlatform: leg.arrivalPlatform,
      },
    };
    return stopInformation;
  });
  return stops;
}

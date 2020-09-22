import createClient, { Journey } from "hafas-client";
import dbProfile from "hafas-client/p/db";

interface Stop {
  line: string;
  direction: string;
  peopleOnTrain: string | undefined;

  from: string | undefined;
  departure: string | undefined;
  departurePlatform: string | undefined;

  to: string | undefined;
  arrival: string | undefined;
  arrivalPlatform: string | undefined;
}

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

function createDisplayTime(dateString: string) {
  const date = new Date(dateString);
  return `${date.getHours()}:${date.getMinutes()} Uhr`;
}

export function createReadableJourneyData(journey: Journey): Stop[] {
  const stops = journey.legs.map((leg) => {
    const { origin, destination, line } = leg;

    const stopInformation: Stop = {
      line: leg.line?.name || line?.additionalName || "Unbekannt",
      peopleOnTrain: leg.loadFactor,

      from: origin.name,
      departure: leg?.departure
        ? createDisplayTime(leg.departure)
        : "Unbekannt",
      departurePlatform: leg.departurePlatform,

      direction: leg.direction || "Unbekannt",

      to: destination.name,
      arrival: leg?.arrival ? createDisplayTime(leg.arrival) : "Unbekannt",
      arrivalPlatform: leg.arrivalPlatform,
    };
    return stopInformation;
  });
  return stops;
}

export function createStopString(obj: any) {
  let string = "";
  for (const key in obj) {
    string = string + `${key}: ${obj[key]} \n `;
  }
  return string;
}

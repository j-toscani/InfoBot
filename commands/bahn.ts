import createClient, { Journey } from "hafas-client";
import dbProfile from "hafas-client/p/db";
import { TelegrafContext } from "telegraf/typings/context";

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
  return `${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()} Uhr`;
}

export function createReadableJourneyData(journey: Journey): Stop[] {
  const stops = journey.legs.map((leg: any) => {
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

export function createStopString(obj: Stop) {
  return `Von ${obj.from} mit Linie ${obj.line} am Gleis ${obj.departurePlatform} um ${obj.departure} Uhr nach ${obj.to} Richtung ${obj.direction}. Ankunft auf Gleis ${obj.arrivalPlatform} um ${obj.arrival}. ${obj.peopleOnTrain ? 'Auslastung: ' + obj.peopleOnTrain : ''}`;
}

export function createBahnInfoMessage(readableData: Stop[], journeyString: string[]) {
  return `Diese Verbindung hat ${journeyString.length > 1 ? 'einen Stopp' : journeyString.length + ' Stopps'} . Die Reise dauert vermutlich von ${readableData[0].departure} bis ${readableData[readableData.length - 1].arrival} \n` + journeyString.join("\n \n")
}

async function handleBahnCommand(ctx: TelegrafContext) {
  try {
    if (ctx.message?.text) {
      const [_command, start, end] = ctx.message.text.split(" ");
      const { from, to } = await getLocationIds(start, end);

      if (!from || !to) {
        ctx.reply("Was not able to find connection");
        return;
      }

      ctx.reply("I found a connection for you!");

      const journeys = await getJourneyData(from, to);
      if (!journeys) {
        ctx.reply("Was not able to find journeys");
        return;
      }

      const readableData = createReadableJourneyData(journeys[0]);
      const journeyString = readableData.map((stop, index) => {
        const stopString = createStopString(stop);
        return `Informationen zu Stop Nummer: ${index + 1
          } \n${stopString}`;
      });

      if (!ctx.chat) {
        throw "No ChatID found";
      }
      const botMessage = createBahnInfoMessage(readableData, journeyString);
      ctx.telegram.sendMessage(ctx.chat.id, botMessage);
    } else {
      ctx.reply(
        "This command is not valid. Format is: '/bahn '<start>' '<ende>'"
      );
    }
  } catch (err) {
    console.log(err);
  }
}

export default handleBahnCommand
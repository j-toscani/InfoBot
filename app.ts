import Telegraf from "telegraf";
import dotenv from "dotenv";
import {
  getLocationIds,
  getJourneyData,
  createReadableJourneyData,
  createOutputFormatString,
} from "./bahn";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || "", { username: "InfoBot" });

bot.start((ctx) => {
  const sender =
    ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
  ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});

bot.command("bahn", async (ctx) => {
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
      const stopString = readableData.map((stop, index) => {
        const strings = createOutputFormatString(stop);
        return `This is jour Journey data for stop nr. ${
          index + 1
        } \n ${strings.concat()}`;
      });

      if (!ctx.chat) {
        throw "No ChatID found";
      }
      ctx.telegram.sendMessage(ctx.chat.id, stopString.join(" \n \n "));
    } else {
      ctx.reply(
        "This command is not valid. Format is: '/bahn '<start>' '<ende>'"
      );
    }
  } catch (err) {
    console.log(err);
  }
});

bot.launch();

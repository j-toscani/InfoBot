import Telegraf from "telegraf";
import dotenv from "dotenv";
import {
  getLocationIds,
  getJourneyData,
  createReadableJourneyData,
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
      ctx.reply(
        `You start at ${JSON.stringify(from)}, and end at ${JSON.stringify(to)}`
      );
      if (!from || !to) {
        ctx.reply("Was not able to find connection");
        return;
      }
      const journeys = await getJourneyData(from, to);
      if (!journeys) {
        ctx.reply("Was not able to find journeys");
        return;
      }

      const readableData = createReadableJourneyData(journeys[0]);
      ctx.reply(`This is jour Journey data ${JSON.stringify(readableData)}`);
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

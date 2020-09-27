import Telegraf from "telegraf";
import dotenv from "dotenv";
import handleBahnCommand from "./bahn";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || "", { username: "InfoBot" });

bot.start((ctx) => {
  const sender =
    ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
  ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});

bot.command("bahn", handleBahnCommand);

bot.launch();

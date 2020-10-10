import Telegraf from "telegraf";
import dotenv from "dotenv";
import handleBahnCommand from "./commands/bahn";

const express = require('express')
const expressApp = express()

dotenv.config();

const port = process.env.PORT || 3000
expressApp.get('/', (req: Request, res: Response) => {
  //@ts-ignore
  res.send('Hello World!')
})
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

const bot = new Telegraf(process.env.BOT_TOKEN || "", { username: "InfoBot" });

bot.start((ctx) => {
  const sender =
    ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
  ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});

bot.help(ctx => {
  ctx.reply(`Folgende Commandos stehen dir zur Verfügung: \n /bahn <start> <ziel>`);
})

bot.command("bahn", handleBahnCommand);

bot.startPolling();

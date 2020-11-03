import Telegraf from "telegraf";
import dotenv from "dotenv";
import handleBahnCommand from "./commands/bahn";

const express = require('express')
const expressApp = express()

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN
const PORT = process.env.PORT || 3000
const URL = process.env.URL || 'https://your-heroku-app.herokuapp.com';

const bot = new Telegraf(process.env.BOT_TOKEN || "", { username: "InfoBot" });
bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
expressApp.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

bot.start((ctx) => {
  const sender =
    ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
  ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});

bot.help(ctx => {
  ctx.reply(`Folgende Commandos stehen dir zur Verfügung: \n /bahn <start> <ziel>`);
})

bot.command("bahn", handleBahnCommand);
bot.command("roll", async function handleBahnCommand(ctx) {
  try {
    if (ctx.message?.text) {
      const [_command, number] = ctx.message.text.split(" ");
      const sender = ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
      const returnNumber = parseInt(number);

      if (isNaN(returnNumber)) {
        ctx.reply(
          "Lass den Blödsinn! Ich nehme nur Zahlen an!"
        );
      }

      const randomNumber = Math.ceil(Math.random() * returnNumber);

      ctx.reply(
        `${sender}, deine Nummer ist: ${randomNumber}`
      );
    }
  } catch (err) {
    console.log(err);
    ctx.reply(
      "fehler"
    );
  }
});

bot.launch()


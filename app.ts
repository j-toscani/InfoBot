import Telegraf from "telegraf";
import dotenv from "dotenv";
import handleBahnCommand from "./commands/bahn";
import handleDiceCommand from "./commands/dice";

const express = require("express");
const expressApp = express();

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const BOT_OPTIONS = {
  username: "InfoBot",
};

const bot = new Telegraf(BOT_TOKEN, BOT_OPTIONS);

bot.start((ctx) => {
  const sender =
    ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
  ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});

bot.help((ctx) => {
  ctx.reply(
    `Folgende Commandos stehen dir zur Verfügung: \n /bahn <start> <ziel>`
  );
});

bot.command("bahn", handleBahnCommand);
bot.command("roll", handleDiceCommand);

bot.launch();

bot.launch();

import Telegraf from "telegraf";
import dotenv from "dotenv";
import fs from 'fs';
import handleBahnCommand from "./commands/bahn";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || "", { username: "InfoBot" });

const tlsOptions = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
}

bot.telegram.setWebhook('https://server.tld:8443/secret-path')

// Start https webhook
bot.startWebhook('/secret-path', tlsOptions, 8443)

// Http webhook, for nginx/heroku users.
bot.startWebhook('/secret-path', null, 5000)

bot.start((ctx) => {
  const sender =
    ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
  ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});

bot.help(ctx => {
  ctx.reply(`Folgende Commandos stehen dir zur Verfügung: \n /bahn <start> <ziel>`);
})

bot.command("bahn", handleBahnCommand);

bot.launch();

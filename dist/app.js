"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = __importDefault(require("telegraf"));
const dotenv_1 = __importDefault(require("dotenv"));
const bahn_1 = __importDefault(require("./commands/bahn"));
dotenv_1.default.config();
const bot = new telegraf_1.default(process.env.BOT_TOKEN || "", { username: "InfoBot" });
bot.start((ctx) => {
    var _a, _b;
    const sender = ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username) || JSON.stringify((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name) || "User";
    ctx.reply(`Moin, ${sender}. Was möchtest du wissen?`);
});
bot.help(ctx => {
    ctx.reply(`Folgende Commandos stehen dir zur Verfügung: \n /bahn <start> <ziel>`);
});
bot.command("bahn", bahn_1.default);
bot.launch();
//# sourceMappingURL=app.js.map
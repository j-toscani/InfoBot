import { TelegrafContext } from "telegraf/typings/context";
import logger from "../lib/logger";

async function handleDiceCommand(ctx: TelegrafContext) {
  try {
    if (ctx.message?.text) {
      const sanitzedMsgArray = ctx.message.text
        .split(" ")
        .filter((item: string) => (item ? true : false))
        .map((item: string) => item.trim());

      logger.info(
        `Recieved message on ${new Date(ctx.message?.date).toString()}, from ${
          ctx.message?.from
        }: ${sanitzedMsgArray.join(" ")}`
      );

      const [_command, number] = sanitzedMsgArray;
      const sender =
        ctx.from?.username || JSON.stringify(ctx.from?.first_name) || "User";
      const returnNumber = parseInt(number);

      if (isNaN(returnNumber)) {
        ctx.reply("Bitte formuliere den Befehl wie folgt: \n /roll <zahl>");
      }

      const randomNumber = Math.round(Math.random() * returnNumber);

      ctx.reply(`${sender}, deine Nummer ist: ${randomNumber}`);
    }
  } catch (err) {
    console.log(err);
    ctx.reply("Es ist ein Fehler aufgetreten :/");
  }
}

export default handleDiceCommand;

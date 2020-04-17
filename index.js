"use strict";

require("dotenv").config();
const Telegraf = require("telegraf");
const Telegram = require("telegraf/telegram");

const { get_google_form } = require("./script/scrape_google_form.js");

const telegram = new Telegram(process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);

const answers = (quiz) => {
  if (quiz.checkbox != undefined) return quiz.checkbox;
  if (quiz.radio != undefined) return quiz.radio;
  if (quiz.grid_row != undefined) return quiz.grid_row;
  return null;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

bot.on("poll", (ctx) => console.log(ctx.poll));
//bot.on("poll_answer", (ctx) => console.log("Poll answer", ctx.pollAnswer));

bot.start((ctx) => ctx.reply("Supported commands: /quiz"));

bot.command("quiz", (ctx) => {
  sender(ctx.chat.id);
});

bot.launch();

const sender = async (chat_id) => {
  try {
    const google_form = await get_google_form(
      "https://forms.gle/V98AKWoJ861otJT1A"
    );
    if (google_form.length == undefined || google_form.length < 1) throw 404;
    await telegram.sendMessage(chat_id, `#InizioQuiz`, {
      parse_mode: "HTML",
      disable_notification: true,
    });
    await sleep(3000);
    for (let i = 0; i < google_form.length; i++) {
      if (answers(google_form[i]) != null) {
        await telegram.sendMessage(
          chat_id,
          `<b>${google_form[i].points.toUpperCase()}\n\n${
            google_form[i].question
          }</b>\n\n` +
            answers(google_form[i])
              .map((el, index) => `<b>${index})</b> ${el}`)
              .join("\n\n"),
          {
            parse_mode: "HTML",
            disable_notification: true,
          }
        );
        await sleep(3000);
        if (google_form[i].grid_row == undefined)
          await telegram.sendPoll(
            chat_id,
            `${google_form[i].question.split(")")[0]}`,
            [
              answers(google_form[i]).map((el, index) => `${index}`),
              "Visualizza Statistica",
            ].flat(1),
            {
              is_anonymous: false,
              disable_notification: true,
              allows_multiple_answers:
                google_form[i].checkbox != undefined ? true : false,
            }
          );
        else
          for (let j = 0; j < answers(google_form[i]).length; j++) {
            await telegram.sendMessage(
              chat_id,
              `<b>${google_form[i].question.split(")")[0]} - ${j}) ${
                answers(google_form[i])[j]
              }</b>\n\n` +
                google_form[i].grid_col
                  .map((el, index) => `<b>${index})</b> ${el}`)
                  .join("\n\n"),
              {
                parse_mode: "HTML",
                disable_notification: true,
              }
            );
            await sleep(3000);
            await telegram.sendPoll(
              chat_id,
              `${google_form[i].question.split(")")[0]} - ${j}`,
              [
                google_form[i].grid_col.map((el, index) => `${index}`),
                "Visualizza Statistica",
              ].flat(1),
              {
                is_anonymous: false,
                disable_notification: true,
              }
            );
            await sleep(3000);
          }
        await sleep(3500);
      }
    }
    await telegram.sendMessage(chat_id, `#FineQuiz`, {
      parse_mode: "HTML",
      disable_notification: true,
    });
  } catch (e) {
    await telegram.sendMessage(chat_id, `Quiz non trovato, riprova più tardi`, {
      parse_mode: "HTML",
      disable_notification: true,
    });
  }
};

/*
function intervalFunc() {
  console.log("Cant stop me now!");
}

setInterval(intervalFunc, 1500);
*/

import Telegram from './telegram';
import * as chrono from 'chrono-node';

export default async (req) => {
  const headers = new Headers({
    'content-type': 'application/json;charset=UTF-8',
  });
  const RETURN_FORBIDDEN = new Response('Oops...', {
    status: 403,
    statusText: 'Forbidden',
  });
  const RETURN_OK = new Response('working', {
    status: 200,
    headers: headers,
  });

  try {
    const body = await req.json();
    console.log(body);

    const MESSAGE = {
      date: body.message.date,
      id: `${body.message.chat.id}_${body.message.message_id}`,
      chat_id: body.message.chat.id,
      message_id: body.message.message_id,
      first_name: body.message.chat.first_name,
      last_name: body.message.chat.last_name,
      text: body.message.text.toLowerCase(),
    };

    const bot = new Telegram(BOT_TOKEN, MESSAGE);

    /******************************/
    /****** pseudo-security *******/
    // if (!ALLOWED_GROUPS.includes(MESSAGE.id)) {
    //   bot.sendText("Sorry, I can't talk to strangers");
    //   return RETURN_OK;
    // }
    /*** end of pseudo-security ***/
    /******************************/

    // commands
    if (MESSAGE.text.startsWith('/start')) {
      bot.sendText(MESSAGE.chat_id, 'Hey!');
      return RETURN_OK;
    } else if (MESSAGE.text.startsWith('/help')) {
      let media = {
        caption: 'Maybe this can help you...',
        url: 'https://media.giphy.com/media/pYw2Mmqkncj2E/giphy.gif',
      };
      bot.sendPhoto(MESSAGE.chat_id, media);
      return RETURN_OK;
    } else if (MESSAGE.text.startsWith('/hey')) {
      let media = {
        caption: 'Heeeeeeeeeeeeey!!',
        url: 'https://i.pinimg.com/originals/77/32/a0/7732a07aff30ef054bee2c26428ca7b8.jpg',
      };
      bot.sendPhoto(MESSAGE.chat_id, media);
      return RETURN_OK;
    } else if (MESSAGE.text.startsWith('/list')) {
      // let data = await HNR22_KV.list();
      // log(data);
      // data = JSON.parse(data);
      // log(data);

      // let result = [];
      // for (let [ts, v] of Object.entries(data)) {
      //   if (MESSAGE.chat_id in v) {
      //     result = result.concat(v[MESSAGE.chat_id]);
      //   }
      // }
      // log(result);
      bot.sendText(MESSAGE.chat_id, 'CURRENTLY NOT SUPPORTED!');
      return RETURN_OK;
    }

    const parseResults = chrono.parse(
      MESSAGE.text,
      {
        instant: new Date(MESSAGE.date * 1000),
        timezone: 'SGT',
      },
      {
        forwardDate: true,
      }
    );

    if (parseResults.length < 1) {
      console.log('No date found');
      return RETURN_OK;
    }

    const startDate = parseResults[0].start.date();
    const unixTs = convertToNearestMinute(
      Math.round(startDate.getTime() / 1000)
    );

    log(parseResults);
    log(startDate.toString());

    let reminders;
    const cache = await HNR22_KV.get(unixTs);
    if (!cache) {
      reminders = {};
    } else {
      reminders = JSON.parse(cache);
    }

    reminders[MESSAGE.chat_id] = [
      ...(reminders[MESSAGE.chat_id] || []),
      `test_${MESSAGE.id}`,
    ];
    log({ reminders });

    await HNR22_KV.put(unixTs, JSON.stringify(reminders));

    return RETURN_OK;
  } catch (err) {
    return new Response(err.stack || err);
  }
};

function convertToNearestMinute(unixTs) {
  return Math.round(unixTs / 60.0) * 60;
}

const log = (obj) => console.dir(JSON.stringify(obj, null, 4));

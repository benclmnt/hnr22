import Telegram from './telegram';
import * as chrono from 'chrono-node';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);

const bot = new Telegram(BOT_TOKEN);

export const sendReminderHandler = async () => {
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
    const ts = Math.floor(Date.now() / (60 * 1000)); // keys are rounded to its nearest minute

    let reminders = await HNR22_KV.get(ts);

    if (reminders) {
      reminders = JSON.parse(reminders);
      log(reminders);

      for (let [chat_id, v] of Object.entries(reminders)) {
        console.log(`sending reminder to ${chat_id}`);
        bot.sendText(
          chat_id,
          [
            dayjs(new Date(ts * 60 * 1000))
              .tz('Asia/Singapore')
              .format('dddd, D MMM YYYY HH:mm'),
            ...v,
          ].join('\n- ')
        );
      }
    } else {
      console.log(`no reminders at ${ts * 60}`);
    }

    return RETURN_OK;
  } catch (err) {
    return new Response(err.stack || err);
  }
};

export const remindMeHandler = async (req) => {
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

    const msg = body.message;

    const MESSAGE = {
      date: msg.date,
      id: `${msg.chat.id}_${msg.message_id}`,
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      first_name: msg.chat.first_name,
      last_name: msg.chat.last_name,
      text: msg.text.toLowerCase(),
    };

    /******************************/
    /****** pseudo-security *******/
    // if (!ALLOWED_GROUPS.includes(MESSAGE.message_id)) {
    //   bot.sendText("Sorry, I can't talk to strangers");
    //   return RETURN_OK;
    // }
    /*** end of pseudo-security ***/
    /******************************/

    // commands
    if (MESSAGE.text.startsWith('/start')) {
      bot.sendText(MESSAGE.chat_id, 'Hey!');
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
      console.log('No date found. skipping...');
      return RETURN_OK;
    }

    const startDate = parseResults[0].start.date();
    const unixMin = convertToNearestMinute(startDate.getTime());

    log(parseResults);
    log(startDate.toString());

    let reminders;
    const cache = await HNR22_KV.get(unixMin);
    if (!cache) {
      reminders = {};
    } else {
      reminders = JSON.parse(cache);
    }

    reminders[MESSAGE.chat_id] = [
      ...(reminders[MESSAGE.chat_id] || []),
      MESSAGE.text
        .replace(parseResults[0].text, '')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/gm, ''),
    ];
    log({ reminders });

    await HNR22_KV.put(unixMin, JSON.stringify(reminders), {
      expiration: (unixMin + 3) * 60, // expired 3 minutes after the scheduled reminder
    });

    return RETURN_OK;
  } catch (err) {
    return new Response(err.stack || err);
  }
};

function convertToNearestMinute(unixTs) {
  return Math.floor(unixTs / (60 * 1000));
}

const log = (obj) => console.log(JSON.stringify(obj, null, 4));

import { remindMeHandler, sendReminderHandler } from './src/remindMe';
import Telegram from './src/telegram';
import { Router } from 'itty-router';

const router = Router();

router.post('/remindMe', remindMeHandler);
router.get('/sendReminder', sendReminderHandler);

router.all('*', () => new Response('Not Found.', { status: 404 }));

addEventListener('fetch', (event) =>
  event.respondWith(router.handle(event.request))
);

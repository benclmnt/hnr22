import remindMe from './src/remindMe';
import { Router } from 'itty-router';

const router = Router();

router.post('/remindMe', remindMe);

router.all('*', () => new Response('Not Found.', { status: 404 }));

addEventListener('fetch', (event) =>
  event.respondWith(router.handle(event.request))
);

# Remind Me Ah Bro Bot

![image](https://user-images.githubusercontent.com/49342399/148555263-a3d05e34-4dde-4dc8-bd89-2a6a3208a6c1.png)

## Inspiration

I often found myself needing to postpone some tasks to do at a later time. More often than not, I will then easily forget about it. 

I found the UX to create a reminder is quite annoying, so currently, I just write it down in a notes app. However it doesn't have the reminder feature, so I sometimes missed it.

## What it does

Store things you need to do and remind you when it's time. You can use human-friendly words to indicate time, such as "tomorrow night" or "at 8pm".

## How I built it

I use Cloudflare Workers as the script runner and Cloudflare KV as the backing database. I then use a cron job to ping a route every minute to send the reminder.

## Challenges we ran into

Cloudflare Workers is not Node.js. So, some libraries doesn't work right away and we need to polyfill.

## What we learned

Use telegram api with cloudflare worker.

## What's next for Remind Me Bot

- Adding templates for recurring jobs, e.g. for a repeatable project
- Adding a setup step to set default timezone.

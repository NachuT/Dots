# Dots

## There is an empty canvas. You may place a pixel upon it, but you must code to place another. Individually you can create something. Together you can create something more.
*Modified from the description of r/places on Reddit*

This project is inspired off of r/places which was an expiriment where an individual could place one pixel at a time every 5 minutes and create artwork through teamwork with others. Using Hackatime stats this is designed to be a website for the hackclub community to have a fun incentive to keep coding.

## Features
- Time calculation using the Hackatime public api.
- Supabase integration for pixel storage and user storage.
- Slack authentification 

### Environment Variables
Set the following environment variables (see `vercel.json`):
- `NEXT_PUBLIC_SUPABASE_URL=`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `NEXTAUTH_URL=`
- `NEXTAUTH_SECRET=`

## Running Locally
After configuring all Enviornment variables:
```bash
npm install && npm run dev

```


## Deployment
Deployed using Vercel and server on Supabase

# COOLbackend

Backend voor www.0-0-0.nl

# Run local

import sql/WaagtorenCreate.sql into mysql

```sh
npm install
npm start
```

# Deploy to 0-0-0.nl

Deployments lopen via GitHub Actions voor tags die op de `production` branch staan.
De workflow heeft de repository secret `COOL_DEPLOY_SSH_KEY` nodig voor SSH-toegang tot `cool@0-0-0.nl`.

Een nieuwe productieversie deployen kan met de Git CLI:

```sh
git switch production
git pull --ff-only
npm test
git tag -a v0.8.68 -m "0-0-0.nl versie 0.8.68"
git push origin v0.8.68
```

Na het pushen van de tag start GitHub Actions de deploy naar 0-0-0.nl.
De deploy gaat alleen door als de tag op de `production` branch staat.

# [Database](doc/database.md)
De backend werkt met MySQL databases. In de database staan uitslagen, deelnemers en andere data per schaakvereniging.
Bovendien is de logic van het wedstrijdreglement vastgelegd in de database.

# Backend 
De backend bestaat voor het grootste deel uit standaard software:
[Objection.js](https://vincit.github.io/objection.js), 
[Knex.js](http://knexjs.org/) en
[Kao.js](https://koajs.com/).
De backend bevat zo min mogelijk logic en geeft vooral data uit de database door aan de frontend.

# Frontend
De frontend is helemaal geschreven in HTML, CSS en JavaScript.

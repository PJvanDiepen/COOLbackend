# COOLbackend

Backend voor www.0-0-0.nl

# Run local

import sql/WaagtorenCreate.sql into mysql

```sh
npm install
npm start
```

# Deploy to 0-0-0.nl WIP

TODO: Merge your work into the `production` branch on GitHub (use a pull request).

# [Database](doc/database.md)
De backend werkt met MySQL databases. In de database staan uitslagen, deelnemers en andere data per schaakvereniging.
Bovendien is de logic van het wedstrijdreglement vastgelegd in de database.

# [API](doc/api.md)
De backend bevat zo min mogelijk logic en geeft vooral data uit de database door aan de frontend.

# Backend 
De backend bestaat voor het grootste deel uit standaard software:
[Objection.js](https://vincit.github.io/objection.js), 
[Knex.js](http://knexjs.org/) en
[Kao.js](https://koajs.com/).

# Frontend
De frontend is helemaal geschreven in HTML, CSS en JavaScript.
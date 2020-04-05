# COOLbackend

Backend voor www.chessopenings.online

# Install and run local
Have a local mysql server running with:
 - a database `waagtoren`
 - with a table `spelers`
 - and a user `waag` with an empty password

Now run, in the projects root directory:

```sh
npm install
npm start

```

you should now be able to visit `http://localhost:4000/spelers` and see the contents of your spelers table in json format and visit `http://localhost:4000/spelers/1`, if your spelers table has a column `id` of type integer and a record with an id value of 1.

# Deploy to chessopenings.online

Merg your work into the `production` branch on GitHub (use a pull request).
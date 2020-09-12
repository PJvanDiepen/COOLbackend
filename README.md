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

you should now be able to visit `http://localhost:3000/spelers` and see the contents of your spelers table in json format and visit `http://localhost:4000/spelers/1`, if your spelers table has a column `id` of type integer and a record with an id value of 1.

# Deploy to chessopenings.online

Merge your work into the `production` branch on GitHub (use a pull request).

# Database

# Uitleg 

https://medium.com/velotio-perspectives/a-step-towards-simplified-querying-in-nodejs-8bfd9bb4097f

https://www.jakso.me/blog/objection-to-orm-hatred

https://dev.to/mrscx/a-definitive-guide-to-sql-in-nodejs-with-objection-js-knex-part-1-4c2e

https://blog.eperedo.com/2020/01/11/objection-js-transactions/

https://dzone.com/articles/the-complete-tutorial-on-the-top-5-ways-to-query-y

https://dzone.com/articles/the-complete-tutorial-on-the-top-5-ways-to-query-y-1



Filmpje:

https://www.youtube.com/watch?v=RyQ1MTVjYK8


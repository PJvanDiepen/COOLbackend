# API
De API specificeert hoe de backend informatie uit de MySQL database als JSON doorgeeft aan de frontend.
Dit zijn velden uit tabellen van de MySQL database of velden die zijn gemaakt door MySQL stored functions.

# Test procedure
1. test.sql 
2. api.js
3. default.json "debug": true
4. localhost:3000/ API call
5. default.json "debug": false
6. localhost:63342/COOLbackend/public/index.html
7. package.json "version": "x.y.z"
8. COOLbackend/bin/deploy_prod
9. 0-0-0.nl/ API call
10. 0-0-0.nl

Een nieuwe versie invoeren kan het best op woensdag wegens naijleffecten in browsers.
Uitleg over hard reload in browsers.

# JavaScript fouten

1. Volgorde uitvoeren JavaScript code met [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
2. Verschil tussen Number(getal) en "getal".
3. Verschil tussen SQL date, JSON date en [Date()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).


   

   
   
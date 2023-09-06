# API
De API specificeert hoe de backend informatie uit de MySQL database als JSON doorgeeft aan de frontend.
Dit zijn velden uit tabellen van de MySQL database of velden die zijn gemaakt door MySQL stored functions.

# Ontwerp procedure
1. Ontwerp een test (omgeving) voor de nieuwe functie
2. Begin bij het begin
3. Beschrijf wat de nieuwe functie precies moet doen
4. Programmeer een stukje voor de nieuwe functie
5. Test dit stukje
6. Ga terug naar stap 3 tot alles goed werkt
7. git commit, push, en zo voort
8. Ga terug naar stap 1

Voor elk stapje git commit met korte beschrijving.
Vlak voor in productie nemen verwijder alle console.log()'s en git commit 0-0-0.nl versie x.y.z en resolve #issue

# Test procedure
1. test.sql 
2. test.js
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
4. Misleidend of ontbrekend commentaar.
5. Verkeerde namen voor variabelen of functies.

   
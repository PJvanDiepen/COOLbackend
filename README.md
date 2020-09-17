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

you should now be able to visit `http://localhost:3000/spelers` and see the contents of your spelers table in json format and visit `http://localhost:3000/spelers/1`, if your spelers table has a column `id` of type integer and a record with an id value of 1.

# Deploy to chessopenings.online

Merge your work into the `production` branch on GitHub (use a pull request).

# Database
Er is een MySQL database per schaakvereniging met de volgende tabellen:
- `Ranglijst` berekenen van de ranglijst van de interne competitie per seizoen
- `Persoon` leden van de schaakvereniging
- `Seizoen` seizoensgegevens van de schaakvereniging 
- `Speler` spelers per seizoen
- `Team` teams of interne competitie (`teamCode = 'int'`) per seizoen
- `Ronde` ronden per team per seizoen
- `Uitslag` uitslagen per ronde per team per seizoen
 
Voorlopig is er 1 database van schaakvereniging de Waagtoren, die offline is gevuld 
vanuit de Online Leden Administratie (OLA) van de KNSB naar `Persoon` en `Speler` en
vanuit Rokade, het informatiesysteem voor de interne competitie naar `Ronde` en `Uitslag` en
vanuit de KNSB en de NHSB websites voor de externe competitie naar `Team`, `Ronde` en `Uitslag`.

## Ranglijst
De ranglijst van de Waagtoren wordt berekend volgens het [Alkmaar Systeem](https://www.waagtoren.nl/historie/alksys.html) 
door middel van stored procedures / functions in MySQL. 
Omdat het reglement van de interne competie per seizoen kan verschillen en 
omdat het nuttig is om te kunnen experimenteren met aanpassingen van het reglement 
willen we verschillende versies van parameters en formules voor de berekening van de ranglijst vastleggen in `Ranglijst`.
 
De verwerking voor de ranglijst berekening is dan als volgt: de juiste versie inlezen uit `Ranglijst`, 
de stored procedures / functions in MySQL installeren en vervolgens zo ongeveer alle tabellen verwerken per seizoen.

Hoe de backend ranglijsten maakt, is dus helemaal in de database vastgelegd en niet in de JavaScript code van de backend.
Op deze manier gaan we, behalve het Alkmaar Systeem, ook het Keizer Systeem en Zwitsers Systeem in `Ranglijst` vastleggen en
hopen we dat wedstrijdleiders zelf wedstrijdsystemen kunnen aanpassen en ermee kunnen experimenteren.

De specificaties van de `Ranglijst` tabel ontbreken nog.  
 
## Persoon
Voorlopig zijn dit de specificaties van `Persoon`.
```
knsbNummer INT
naam VARCHAR(45)
dummy VARCHAR(45)
PRIMARY KEY (knsbNummer)
```
In dit systeem willen we zo min mogelijk persoonsgegevens vastleggen. Het `knsbNummer` komt uit OLA.
Voor uitslagen en ranglijsten is `naam` voldoende. 
Andere persoonsgegevens staan in OLA en worden beheerd door de secretaris en de penningmeester en niet door de wedstrijdleider.

In `Persoon` staan uitsluitend leden van de eigen schaakvereniging. 
Tegenstanders in de externe competitie hebben `knsbNummer = 2` en `naam = 'extern'`. 
Dit systeem kan daarom wel complete uitslagen lijsten produceren van de interne competitie, 
maar de bij uitslagen van externe competitie staat uitsluitend de `naam` van de eigen speler, bordnummer, kleur, resultaat en
eventueel de naam van het team van de tegenstander, want die gegevens staan in `Ronde`.
   
Verder staan in `Persoon` een aantal records zoals `knsbNummer = 3` met `naam = 'afgezegd'`, 
`knsbNummer = 1` met `naam = 'oneven'` en zo voort. 
Deze worden gebruikt om de uitslagen in de interne competitie compleet te maken voor alle deelnemers.

Het is de bedoeling dat leden een kalender van de ronden van de interne competitie en
van de wedstrijden van hun eigen teams in externe competitie kunnen raadplegen en 
dat ze zich per ronde of per wedstrijd kunnen aanmelden of afzeggen.
Leden moeten een overzicht van hun uitslagen kunnen raadplegen en eventueel hun eigen uitslag kunnen wijzigen.
De wedstrijdleider moet alle uitslagen kunnen wijzigen.

Daarom moet het systeem weten welke gebruikers wat mogen doen. 
Is de gebruiker lid van de vereniging? Is de gebruiker wedstrijdleider?
Daarvoor moeten we het en en ander vastleggen in `Persoon`. 
Dit moeten we nog uitwerken. Voorlopig noemen we dat `dummy`.
  
## Seizoen
De specificaties van de `Seizoen` tabel ontbreken nog.  

Voorlopig is er 1 database van de Waagtoren met 3 seizoenen: 2018-2019, 2019-2020 en 2020-2021.
Deze seizoensgegevens zijn vastgelegd als `seizoen = '1819'`, `seizoen = '1920` en `seizoen = '2021'`.

Elk seizoen heeft een verwijzing naar de juiste versie van parameters en formules 
voor de berekening van de ranglijst in `Ranglijst`. 
Elk seizoen heeft een aantal spelers en een aantal teams in de interne en externe competitie.
Zie verder bij `Speler` en `Team`. 
 
## Speler
```
seizoen CHAR(4)
nhsbTeam CHAR(3)
knsbTeam CHAR(3)
knsbNummer INT
knsbRating INT
datumRating DATE
subgroep CHAR(1)
vanafRondeNummer INT
oneven CHAR(1)
PRIMARY KEY (seizoen, knsbNummer)
```

De leden van een schaakvereniging krijgen per `seizoen` uit OLA een nieuwe `knsbRating`,
die wordt gebruikt voor de indeling in een team van de KNSB competitie `knsbTeam`, 
een team in een onderbond competitie `nhsbTeam` en in een `subgroep` van de interne competitie.
Volgens de reglementen geldt de `knsbRating` van 1 augustus aan het begin van het `seizoen`.
Daarom is ook de `datumRating` vastgelegd.

## Team
```
seizoen CHAR(4)
teamCode CHAR(3)
bond CHAR(1)
poule CHAR(2)
omschrijving VARCHAR(45)
borden INT
PRIMARY KEY (seizoen, teamCode)
```

## Ronde
```
seizoen CHAR(4)
teamCode CHAR(3)
rondeNummer INT
compleet CHAR(1) 
uithuis CHAR(1)
tegenstander VARCHAR(45)
plaats VARCHAR(45)
datum DATE
PRIMARY KEY (seizoen, teamCode, rondeNummer)
```
  
## Uitslag
```
seizoen CHAR(4)
teamCode CHAR(3)
rondeNummer INT
bordNummer INT
knsbNummer INT
witZwart CHAR(1)
tegenstanderNummer INT
resultaat CHAR(1)
datum DATE
anderTeam CHAR(3)
PRIMARY KEY (seizoen, teamCode, rondeNummer, knsbNummer)
```


# [Objection.js](https://vincit.github.io/objection.js) 

https://medium.com/velotio-perspectives/a-step-towards-simplified-querying-in-nodejs-8bfd9bb4097f

https://www.jakso.me/blog/objection-to-orm-hatred

https://dev.to/mrscx/a-definitive-guide-to-sql-in-nodejs-with-objection-js-knex-part-1-4c2e

https://blog.eperedo.com/2020/01/11/objection-js-transactions/

https://dzone.com/articles/the-complete-tutorial-on-the-top-5-ways-to-query-y

https://dzone.com/articles/the-complete-tutorial-on-the-top-5-ways-to-query-y-1




# Database
Er is een MySQL database per schaakvereniging met de volgende tabellen:
- `Reglement` voor indelen en berekenen van de ranglijst van de interne competitie
- `Persoon` leden van de schaakvereniging en eventueel van tegenstanders in de externe competitie
- `Gebruiker` leden van de schaakvereniging, die gegevens in de database mogen wijzigen
- `Seizoen` seizoensgegevens van de schaakvereniging 
- `Speler` spelers per seizoen
- `Team` teams of interne competitie (`teamCode = 'int'`) per seizoen
- `Ronde` ronden per team per seizoen
- `Uitslag` uitslagen per ronde per team per seizoen
 
Voorlopig is er 1 database van schaakvereniging de Waagtoren, die offline is gevuld 
vanuit de Online Leden Administratie (OLA) van de KNSB naar `Persoon` en `Speler` en
vanuit Rokade, het informatiesysteem voor de interne competitie naar `Ronde` en `Uitslag` en
vanuit de KNSB en de NHSB websites voor de externe competitie naar `Team`, `Ronde` en `Uitslag`.

## Reglement
De ranglijst van de Waagtoren wordt berekend volgens het [Alkmaar Systeem](https://www.waagtoren.nl/historie/alksys.html) 
door middel van stored procedures / functions in MySQL. 
Omdat het reglement van de interne competie per seizoen kan verschillen en 
omdat het nuttig is om te kunnen experimenteren met aanpassingen van het reglement 
willen we verschillende versies van parameters en formules voor de berekening van de ranglijst vastleggen in `Reglement`.
De verwerking voor de ranglijst berekening is dan als volgt: de juiste versie inlezen uit `Reglement`, 
de stored procedures / functions in MySQL installeren en vervolgens zo ongeveer alle tabellen verwerken per seizoen.

Hoe de backend ranglijsten maakt, is dus helemaal in de database vastgelegd en niet in de JavaScript code van de backend.
Op deze manier gaan we, behalve het Alkmaar Systeem, ook het Keizer Systeem en Zwitsers Systeem in `Reglement` coderen.
Elke schaakvereniging kan dus eventueel per seizoen haar eigen reglement voor de interne competitie 
vastleggen in `Reglement`. Ons doel is dat wedstrijdleiders zelf wedstrijdsystemen kunnen aanpassen en ermee kunnen experimenteren.

Voor het indelen van wie tegen wie in de interne competitie gelden ook allerlei regels,
die per wedstrijdsysteem, per schaakvereniging en per seizoen kunnen verschillen.
Daarom willen we ook die vastleggen in `Reglement` en niet in de JavaScript code van de backend.

De database moet een lijst van alle mogelijke partijen produceren
waaruit de indeling van een ronde wordt gemaakt door software (backend of frontend) 
eventueel met interactie van een gebruiker.

De specificaties van de `Reglement` tabel ontbreken nog. 

Voorlopig staan de volgende stored functions voor het Alkmaar Systeem wel in de database van de Waagtoren, maar nog niet in `Reglement`:
- `waardeCijfer()` van een speler op basis van de `knsbRating` van 1 augustus aan het begin van het `seizoen` 
- `punten()` per `Uitslag`
- `totalen()` van punten en andere totalen per speler op basis van alle uitslagen van een `seizoen`    
 
## Persoon
Voorlopig zijn dit de specificaties van `Persoon`:
```
knsbNummer INT
naam VARCHAR(45)
dummy VARCHAR(45)
PRIMARY KEY (knsbNummer)
```
In dit systeem willen we zo min mogelijk persoonsgegevens vastleggen.
Het `knsbNummer` komt uit [OLA](https://www.schaakbond.nl/voor-clubs/ledenadministratie), 
de Online Leden Administratie van de KNSB.
Voor uitslagen en ranglijsten is `naam` voldoende. 
Andere persoonsgegevens staan in OLA en worden beheerd door de secretaris en de penningmeester en niet door de wedstrijdleider.

In `Persoon` staan voorlopig uitsluitend leden van de eigen schaakvereniging.
Tegenstanders in de externe competitie hebben `knsbNummer = 2` en `naam = 'extern'`. 
Dit systeem kan daarom wel complete uitslagen lijsten produceren van de interne competitie, 
maar de bij uitslagen van externe competitie staat uitsluitend de `naam` van de eigen speler, bordnummer, kleur, resultaat en
eventueel de naam van het team van de tegenstander, want die gegevens staan in `Ronde`.
   
Verder staan in `Persoon`: `knsbNummer = 3` met `naam = 'afgezegd'`, 
`knsbNummer = 1` met `naam = 'oneven'` en zo voort. 
Deze nummers worden gebruikt om de uitslagen in de interne competitie compleet te maken.
De reeks van `knsbNummer = 0` tot en met `knsbNummer = 100` zijn dus labels bij het berekenen van de ranglijst.
Ze staan in `Persoon` tabel, zodat verschillende schaakverenigingen verschillende labels kunnen gebruiken.

Een `knsbNummer` bestaat uit 7 cijfers en die krijgt een lid van de KNSB.
Leden van de schaakvereniging, die nog niet een officieel `knsbNummer` hebben krijgen een tijdelijk nummer
in de reeks vanaf `knsbNummer = 100` tot `knsbNummer = 1000000`.

Het is de bedoeling dat leden een kalender van de ronden van de interne competitie en
van de wedstrijden van hun eigen teams in externe competitie kunnen raadplegen en 
dat ze zich per ronde of per wedstrijd kunnen aanmelden of afzeggen.
Leden moeten ook een overzicht van hun uitslagen kunnen raadplegen en eventueel hun eigen uitslag kunnen invullen.
De wedstrijdleider moet alle uitslagen kunnen wijzigen.

Daarom moet het systeem weten welke gebruikers wat mogen doen. 
Is de gebruiker lid van de vereniging? Is de gebruiker wedstrijdleider?
Daarvoor moeten we waarschijnlijk nog wat gegevens vastleggen in `Persoon`. 
Dit is nog niet uitgewerkt en noemen we voorlopig `dummy`.

## Gebruiker
```
knsbNummer INT`
mutatieRechten INT
uuidToken CHAR(36)
email VARCHAR(100)
datumEmail DATE
PRIMARY KEY (uuidToken)
```
Leden van de schaakvereniging mogen gegevens in de database wijzigen afhankelijk van hun `mutatieRechten`. 
Gewone leden kunnen zich aanmelden of afzeggen.
Een wedstrijdleider kan uitslagen invoeren en ronden aanmaken.

Het systeem herkent een gebruiker aan het `uuidToken`, wat is opgeslagen op de computer van de gebruiker.
Een lid van de schaakvereniging kan zich als gebruiker registreren met een `email`.
Via die `email` ontvangt zo'n gebruiker een link om het `uuidToken` te activeren.
Dit wordt vastgelegd in `datumEmail`.

## Seizoen
Het seizoen van een schaakvereniging loopt meestal van eind augustus tot juni.

Voorlopig is er 1 database van de Waagtoren met 3 seizoenen: 2018-2019, 2019-2020 en 2020-2021.
Deze seizoensgegevens zijn vastgelegd als `seizoen = '1819'`, `seizoen = '1920` en `seizoen = '2021'`.

Elk seizoen krijgt een verwijzing naar de juiste versie van parameters en formules 
voor de berekening van de ranglijst in `Reglement`. 
Bij elk seizoen van een schaakvereniging hoort een aantal spelers en een aantal teams in de interne en externe competitie.
Zie verder bij `Speler` en `Team`.

De specificaties van de `Seizoen` tabel ontbreken nog.  
 
## Speler
```
seizoen CHAR(4)
nhsbTeam CHAR(3)
knsbTeam CHAR(3)
knsbNummer INT
knsbRating INT
datumRating DATE
subgroep CHAR(1)
PRIMARY KEY (seizoen, knsbNummer)
```

De leden van een schaakvereniging krijgen per `seizoen` uit OLA een nieuwe `knsbRating`,
die wordt gebruikt voor de indeling in een team van de KNSB competitie `knsbTeam`, 
een team in een onderbond competitie `nhsbTeam` en in een `subgroep` van de interne competitie.
Volgens de reglementen geldt de `knsbRating` van 1 augustus aan het begin van het `seizoen`.
Daarom is ook de `datumRating` vastgelegd.

Omdat de Waagtoren in de NHSB onderbond speelt heet het team in de onderbond voorlopig `nhsbTeam`.  

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
In elke seizoen heeft de schaakvereniging een interne competitie met `teamCode = 'int'` en
teams die spelen in de landelijke competitie en beker competitie van de KNSB en
de competitie en beker van de regionale onderbond. 
Elk team heeft een unieke `teamCode` per `seizoen`.
De Waagtoren heeft `teamCode = '1'` voor het eerste team in de KNSB,
`teamCode = 'kbe'` voor het KNSB bekerteam, `teamCode = 'n1'` voor het eerste team in de NHSB enz.

In `bond` staat een afkorting: i = intern, k = knsb en n = nhsb.
Elk team speelt in een `poule` met een vast aantal `borden`.

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

Elk team speelt een aantal ronden uit of thuis tegen een team van een tegenstander in een plaats op een bepaalde datum.
Indien `compleet = 'c'` zijn de uitslagen van deze ronde compleet.

Indien alle datums voor de ronden bekend zijn, kan de backend voor elke speler een kalender produceren.
  
## Uitslag
```
seizoen CHAR(4)
teamCode CHAR(3)
rondeNummer INT
bordNummer INT
knsbNummer INT
partij CHAR(1)
witZwart CHAR(1)
tegenstanderNummer INT
resultaat CHAR(1)
datum DATE
anderTeam CHAR(3)
PRIMARY KEY (seizoen, teamCode, rondeNummer, knsbNummer)
```

Elke ronde heeft uitslagen voor elk bord. (TODO niet bij interne competitie)

Voor de interne competitie staat elke uitslag twee keer in `Uitslag` voor wit en voor zwart.
Een keer is de witspeler vermeld in `knsbNummer` en de zwartspeler in `tegenstanderNummer` en
een keer is de zwartspeler vermeld  in `knsbNummer` en de witspeler in `tegenstanderNummer`.

De verschillende mogelijkheden voor `partij` zijn:
- a = AFGEZEGD (Rokade WedstrijdType = 2)   
- e = EXTERNE_WEDSTRIJD (Rokade WedstrijdType = 11 extern op dinsdag)
- i = INTERNE_PARTIJ
- o = ONEVEN (Rokade WedstrijdType = 3)
- t = TEAMLEIDER (Rokade WedstrijdType = 4)
- v = REGLEMENTAIR_VERLIES (Rokade WedstrijdType = 6)
- w = REGLEMENTAIRE_WINST (Rokade WedstrijdType = 5)

Voor de externe competitie zijn er twee mogelijkheden.
1. Indien de externe partij wordt gespeeld in plaats van een interne partij 
staat de uitslag twee keer in `Uitslag`: een keer met `teamCode = 'int'` 
en een keer met de `teamCode` bij welke team deze uitslag hoort.
2. Indien de externe partij op een andere dag wordt gespeeld 
staat de uitslag een keer in `Uitslag` met de `teamCode` bij welke team deze uitslag hoort.

Voor elke externe partij staat in `Uitslag` bij `knsbNummer` de speler 
van de eigen schaakvereniging en meestal `tegenstanderNummer = 0`.
Het is mogelijk om `tegenstanderNummer` in te vullen bij een externe wedstijd 
tegen een team van de eigen schaakvereniging 
(of als je alle tegenstanders ook in `Persoon` wilt opslaan).  
Indien `anderTeam = 'int'` telt deze uitslag mee voor de interne competitie.

De verschillende mogelijkheden voor `tegenstanderNummer` zijn:
- 0 = onbekend
- TIJDELIJK_LID_NUMMER > 100
- KNSB_NUMMER > 1000000
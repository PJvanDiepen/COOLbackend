 uitslagen van teams staan in dit systeem, kunnen meetellen in de  
De ranglijsten voor externe competies worden niet berekend in dit systeem.
# Database
Er is een MySQL database per schaakvereniging met de volgende tabellen:
- `Reglement` voor indelen en berekenen van de ranglijst van de interne competitie
- `Persoon` leden van de schaakvereniging en eventueel van tegenstanders in de externe competitie
- `Gebruiker` leden van de schaakvereniging, die gegevens in de database mogen wijzigen
- `Seizoen` seizoensgegevens van de schaakvereniging 
- `Speler` spelers per seizoen
- `Team` teams of competities per seizoen
- `Ronde` ronden per team of competitie per seizoen
- `Uitslag` uitslagen per ronde per team per seizoen
- `Mutatie` chronologie van mutaties per gebruiker
 
Voorlopig is er 1 database van schaakvereniging de Waagtoren, die offline is gevuld 
vanuit de Online Leden Administratie (OLA) van de KNSB naar `Persoon` en `Speler` en
vanuit Rokade, het informatiesysteem voor de interne competitie naar `Ronde` en `Uitslag` en
vanuit de KNSB en de NHSB websites voor de externe competitie naar `Team`, `Ronde` en `Uitslag`.

##Competitie
De database per schaakvereniging heeft een tabel `Team` voor teams en competities.
De eerste letter van `teamCode` in `Team` maakt het onderscheid tussen team en competitie.
De `teamCode` van een interne competitie begint met de letter i.

Een team speelt mee in een externe competitie. Bij de Waagtoren zijn dat teams,
die meespelen voor de KNSB en de NHSB.
Teams van andere schaakverenigingen kunnen spelen voor andere schaakbonden.

Bij de Waagtoren tellen de uitslagen van teamleden in de externe competities mee voor de interne competitie.
Daarom staan ze in dit systeem. Dit systeem berekent echter geen ranglijsten van externe competities.

Dit systeem berekent uitsluitend ranglijsten van externe competities. Zie `Reglement`.

Het belangrijkste verschil tussen team en competitie is dus de verwerking door dit systeem.
Behalve de eerste letter van `teamCode` is in de database verder geen verschil tussen team en competie.
De specificaties voor competitie staan daarom bij `Team`.

## Reglement
De ranglijst van de Waagtoren wordt berekend volgens het [Alkmaar Systeem](https://www.waagtoren.nl/historie/alksys.html) 
door middel van stored procedures / functions in MySQL. 
Omdat het reglement van de interne competie per seizoen kan verschillen en 
omdat het nuttig is om te kunnen experimenteren met aanpassingen van het reglement 
willen we verschillende versies van parameters en formules voor de berekening van de ranglijst vastleggen in `Reglement`.
De verwerking voor de ranglijst berekening is dan als volgt: selecteer de juiste versie volgens `Reglement` en 
verwerk de uitslagen per seizoen en competitie met de juiste versie van de stored procedures / functions in MySQL.

Hoe de backend ranglijsten maakt, is dus helemaal in de database vastgelegd en niet in de JavaScript code van de backend of frontend.
Op deze manier gaan we, behalve het Alkmaar Systeem, ook het Keizer Systeem en Zwitsers Systeem in `Reglement` coderen.
Elke schaakvereniging kan dus eventueel per seizoen haar eigen reglement voor de interne competitie 
vastleggen in `Reglement`. Ons doel is dat wedstrijdleiders zelf wedstrijdsystemen kunnen aanpassen en ermee kunnen experimenteren.

Voor het indelen van wie tegen wie in de interne competitie gelden ook allerlei regels,
die per wedstrijdsysteem, per schaakvereniging en per seizoen kunnen verschillen.
Daarom willen we ook die vastleggen in `Reglement` en niet in de JavaScript code van de backend.

Voor het opstellen van invallers in teams voor de externe competitie gelden allerlei regels,
die per schaakbond en per seizoen junnen verschillen.
Daarom willen we ook die vastleggen in `Reglement` en niet in de JavaScript code van de backend.

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
Dit systeem kan daarom wel complete uitslagen lijsten produceren van de interne competitie, 
maar de bij uitslagen van externe competitie staat uitsluitend de `naam` van de eigen speler, bordnummer, kleur, resultaat en
eventueel de naam van het team van de tegenstander, want die gegevens staan in `Ronde`.
   
Een `knsbNummer` bestaat uit 7 cijfers en die krijgt een lid van de KNSB.
Leden van de schaakvereniging, die nog niet een officieel `knsbNummer` hebben, 
krijgen een tijdelijk nummer in de reeks vanaf `knsbNummer = 100` tot `knsbNummer = 1000000`.

## Gebruiker
```
knsbNummer INT`
mutatieRechten INT
uuidToken CHAR(36)
email VARCHAR(100)
datumEmail DATE
PRIMARY KEY (uuidToken)
FOREIGN KEY (knsbNummer) REFERENCES Persoon (knsbNummer)
```
Leden van de schaakvereniging mogen gegevens in de database wijzigen afhankelijk van hun `mutatieRechten`. 
Gewone leden kunnen zich aanmelden of afzeggen.
Een wedstrijdleider kan uitslagen invoeren en ronden aanmaken.

Het systeem herkent een gebruiker aan het `uuidToken`, wat is opgeslagen op de computer van de gebruiker.
Een lid van de schaakvereniging kan zich als gebruiker registreren met een `email`.
Via die `email` ontvangt zo'n gebruiker een link om het `uuidToken` te activeren.
Na het activeren wordt dit vastgelegd in `datumEmail`.
In `fout` wordt eventueel vastgelegd als er iets misgaat tijdens het registreren of activeren.
  
## Seizoen
```
seizoen CHAR(4)
versie INT
datumCompleet DATE
```

Het seizoen van een schaakvereniging loopt meestal van eind augustus tot juni.

Voorlopig is er 1 database namelijk van de Waagtoren en zijn er 3 seizoenen: 2018-2019, 2019-2020 en 2020-2021.
Deze seizoensgegevens zijn vastgelegd als `seizoen = '1819'`, `seizoen = '1920` en `seizoen = '2021'`.

Elk seizoen krijgt een verwijzing naar de juiste `versie` van parameters en formules 
voor de berekening van de ranglijst in `Reglement`. 
Bij elk seizoen van een schaakvereniging hoort een aantal spelers en een aantal teams in de interne en externe competitie.
Zie verder bij `Speler` en `Team`.

De specificaties van de `Seizoen` tabel zijn nog niet verder uitgewerkt.
 
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
FOREIGN KEY (knsbNummer) REFERENCES Persoon (knsbNummer)
FOREIGN KEY (seizoen, nhsbTeam) REFERENCES Team (seizoen, teamCode)
FOREIGN KEY (seizoen, knsbTeam) REFERENCES Team (seizoen, teamCode)
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
uithuis CHAR(1)
tegenstander VARCHAR(45)
plaats VARCHAR(45)
datum DATE
PRIMARY KEY (seizoen, teamCode, rondeNummer)
FOREIGN KEY (seizoen, teamCode) REFERENCES Team (seizoen, teamCode)
```

Elk team speelt een aantal ronden uit of thuis tegen een team van een tegenstander in een plaats op een bepaalde datum.
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
FOREIGN KEY (seizoen, anderTeam) REFERENCES Team (seizoen, teamCode)
FOREIGN KEY (knsbNummer) REFERENCES Persoon (knsbNummer)
```

Voor de interne competitie staat elke uitslag twee keer in `Uitslag` voor wit en voor zwart.
Een keer is de witspeler vermeld in `knsbNummer` en de zwartspeler in `tegenstanderNummer` en
een keer is de zwartspeler vermeld  in `knsbNummer` en de witspeler in `tegenstanderNummer`.

De verschillende mogelijkheden voor `partij` zijn:
- a = AFGEZEGD (Rokade WedstrijdType = 2)   
- e = EXTERNE_WEDSTRIJD (Rokade WedstrijdType = 11 extern op dinsdag)
- i = INTERNE_PARTIJ
- m = MEEDOEN na aanmelden
- n = NIET_MEEDOEN na afzeggen
- o = ONEVEN (Rokade WedstrijdType = 3)
- t = REGLEMENTAIRE_REMISE of vrijgesteld (Rokade WedstrijdType = 4)
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

## Mutatie
```
tijdstip DATETIME
knsbNummer INT,
url VARCHAR(100),
aantal INT,
invloed INT,
PRIMARY KEY (tijdstip, knsbNummer, url)
FOREIGN KEY (knsbNummer) REFERENCES Persoon (knsbNummer)
```

In de `mutatie` tabel wordt vastgelegd welke gebruiker en wanneer iets muteert in tabellen van de database.
Welke gebruiker staat in `knsbNummer` en wanneer staat in `tijdstip`.
In `url` staat de omschrijving van de mutatie in url-vorm zoals die door de frontend aan de backend is doorgegeven. 
In `aantal` staat hoeveel rijen zijn gemuteerd.
In `invloed` legt de backend vast hoeveel invloed de mutatie heeft, 
zodat de frontend kan vragen of er tijdens een sessie belangijke mutaties zijn geweest.  

De verschillende mogelijkheden voor `invloed` zijn:
- 0 = GEEN_INVLOED
- 1 = OPNIEUW_INDELEN
- 2 = NIEUWE_RANGLIJST

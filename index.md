# Rokade wordt 0-0-0

Tot voor kort gebruikte schaakvereniging de Waagtoren [Rokade van Herman Nijhuis](https://www.waagtoren.nl/2020/08/29/herman-nijhuis-erelid-van-de-waagtoren/) 
voor het maken van indelingen en ranglijsten voor de interne competitie volgens het [Alkmaarse systeem](https://www.waagtoren.nl/historie/alksys.html). 
Sinds het schaakseizoen 2021-2022 wordt Rokade vervangen door 0-0-0.

## Uitslagen en ranglijsten
Rokade gebruikte een Microsoft Access database, die lokaal op de computer van de intern wedstrijdleider van de Waagtoren draaide. 
Vanuit Rokade konden we HTML maken en uploads doen naar de Waagtoren-website.
0-0-0 is een online database met een web-app die uitslagen en ranglijsten laat zien. 
De backend bestaat uit MySQL en Node.js. De frontend verwerkt JSON en gebruikt zo standaard mogelijke HTML, CSS en JavaScript.

Het belangrijkste verschil tussen 0-0-0 en Rokade is dus dat bij 0-0-0 alles online staat en niet lokaal en offline zoals bij Rokade. 
Met 0-0-0 wordt het mogelijk om vanaf allerlei computers, tablets of smartphones de database te raadplegen en te muteren.

Het is de bedoeling dat 0-0-0 een universeel bruikbaar uitslagen en ranglijsten systeem voor schaakverenigingen wordt. 
De [database](doc/database.md) en de [api](doc/api.md) van 0-0-0 worden zodanig ontworpen 
dat de logica van het Alkmaar systeem in de database wordt vastgelegd, 
zodat we die kunnen vervangen door bijvoorbeeld het Keizer systeem of het Zwitsers systeem. 
De regels van het interne competitie reglement worden dus niet in software vastgelegd, maar in reglement-data. 
Ranglijsten worden gegenereerd vanuit de uitslagen aan de hand van reglement-data. 

Door deze opzet is het mogelijk om wijzigingen van het reglement eenvoudig te testen door het wijzigen van de reglement-data 
en vervolgens nieuwe ranglijsten te genereren. 
Per seizoen (en per schaakvereniging) zal er dus andere reglement-data in de database staan. 

Externe wedstrijden in het Alkmaar systeem tellen mee voor de interne competitie.
Daarom maakt 0-0-0 overzichten van scores in de interne en externe competitie.
 
## Kalender, voorlopige indeling en invallers

Op 0-0-0.nl kan iedereen de uitslagen en ranglijsten zien van de laatste 4 seizoenen van de Waagtoren. 
Als lid van de Waagtoren zie je bovendien een persoonlijke kalender met de ronden van de interne competitie 
en jouw externe wedstrijden voor de rest van het seizoen. 
Op deze kalender-pagina kan je je per datum aanmelden of afzeggen.

Op basis van de leden die zijn aangemeld voor de komende ronde van de interne competitie maakt 0-0-0 automatisch een voorlopige indeling, 
die uitsluitend zichtbaar is voor leden. De intern wedstrijdleider maakt hoeft de voorlopige indeling alleen maar definitief te maken.

Voor de externe competitie houdt 0-0-0 overzichten bij voor de teamleiders met vaste spelers en mogelijke invallers. 
De afmeldingen verschijnen automatisch in dat overzicht.

Hoe de interactie tussen leden en 0-0-0 precies gaat werken, moeten we nog verder uitwerken.

## Database ontwerpen en vullen

Het ontwerp van de 0-0-0 database is afgerond voor wat betreft de ranglijst, uitslagen, indelen en de kalender. 
Voor de reglement-data is een prototype gemaakt met een werkende versie van het Alkmaar systeem. 
De algemene opzet voor reglement-data zal ongetwijfeld nog veranderen als we het Keizer systeem of Zwitsers systeem gaan implementeren.

Maar 0-0-0 berekent geen ratings en is geen leden administratie. 
In de database van 0-0-0 gebruiken we uitsluitend gegevens die noodzakelijk zijn voor de uitslagen en ranglijsten 
zoals naam, KNSB nummer en KNSB rating (met een bijbehorende datum), die worden overgenomen uit OLA, de Online Leden Administratie van de KNSB. 

Voor het vullen van de 0-0-0 database is een offline toepassing gemaakt die informatie inleest uit andere systemen:
- Excel-bestand uit OLA met de gegevens van de Waagtoren leden, 
- de offline database van Rokade voor de uitslagen van de interne competities van verschillende seizoenen en
- een web crawler die de websites van NHSB en KNSB raadpleegt voor de uitslagen van externe wedstrijden.

Voor de online 0-0-0 gaan we meer geavanceerde koppelingen maken met andere systemen, 
want het is de bedoeling dat gebruikers zo min mogelijk hoeven in te toetsen. 
Eventueel kunnen spelers zelf hun uitslagen invoeren, maar dan moeten beide spelers de uitslag bevestigen. 
Het doel is dat de intern wedstrijdleider steeds minder hoeft te doen. Het een en ander moet op een moderne manier beveiligd worden.

## Verdere ontwikkeling
Op dit moment heeft 0-0-0 nog geen gebruikers die de database kunnen muteren. 0-0-0 kan nog niet functioneren zonder de offline toepassing. 
Bovendien is 0-0-0 voorlopig alleen beschikbaar voor de Waagtoren.

Beveiliging en backup van de 0-0-0 database moeten we uiteraard goed regelen met mogelijkheden om log-bestanden te bekijken en eventueel fouten te herstellen.

Het is de bedoeling om 0-0-0 eerst helemaal functioneel te maken voor de Waagtoren. Daarna gaan we 0-0-0 geschikt maken 
- voor andere schaakverenigingen, 
- voor andere systemen dan alleen het Alkmaar systeem en 
- voor andere (onder)bonden dan alleen KNSB en NHSB.

Voorlopig zorgen we dat het uitwisselen van gegevens met Rokade blijft functioneren, zodat verenigingen die Rokade gebruiken eenvoudig kunnen overstappen.

Eventueel kunnen andere schaakverenigingen ook op 0-0-0.nl draaien.

De source code met documentatie is als open source beschikbaar stellen op GitHub, zodat andere programmeurs ook aan 0-0-0 kunnen werken.

Voorlopig is 0-0-0 gebaseerd op MySQL, maar indien een ander database management system in de toekomst een betere keuze blijkt te zijn, 
is het ontwerp van de database zodanig dat we MySQL kunnen vervangen.
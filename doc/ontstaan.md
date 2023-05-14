# Ontstaansgeschiedenis 0-0-0

Ik schaak al sinds 1971 in interne competities van schaakverenigingen. 
Eerst bij Lasker in Uitgeest, daarna bij Schaakvereniging Castricum, 0-0-0 in Alkmaar en tegenwoordig bij de Waagtoren in Alkmaar.
Bij Lasker en Castricum gebruikten ze voor het Keizersysteem voor de interne competitie.
Bij 0-0-0 waren er andere wedstrijdsystemen, maar daarna kwam het 
[Alkmaarse systeem](https://www.waagtoren.nl/timeline/2009-september-het-alkmaarse-systeem/) en dat gebruiken we bij de Waagtoren nog steeds.

[Herman Nijhuis](https://www.waagtoren.nl/2020/08/29/herman-nijhuis-erelid-van-de-waagtoren/)

TODO alle design beslissingen inclusief planning

Alles draait om de eenvoud
(Het Goede Doel)

We hebben je e-mailadres nodig om je een link met een unieke code op te sturen waarmee 0-0-0.nl je herkent.
Indien 0-0-0.nl je niet meer herkent, kan je opnieuw een registratie aanvragen.

Je aanvraag wordt gecontroleerd

Je aanvraag wordt niet onmiddellijk verwerkt, want we controleren eerst je e-mailadres.
Een wedstrijdleider stuurt je per e-mail een link met een unieke code.
0-0-0.nl stuurt dus nooit automatisch een unieke code.

Klik op de link, die je per e-mail hebt gekregen

0-0-0.nl genereert voor elk lid van de schaakvereniging een unieke code.
Die unieke code krijg je per e-mail met een link.
Pas als je op die link hebt geklikt, wordt de unieke code geactiveerd en
kan 0-0-0.nl je herkennen als geregistreerd gebruiker.
Indien je 0-0-0.nl gebruikt op verschillende apparaten (computer, tablet of smartphone),
moet je op elk apparaat dezelfde unieke code activeren.

0-0-0.nl herkent je als geregistreerd gebruiker

Als je een geregistreerd gebruiker bent, staat een unieke code op elk apparaat waarop je de registratie hebt geactiveerd.
Indien je met dat apparaat 0-0-0.nl gebruikt, stuur je automatisch die unieke code naar 0-0-0.nl.
Met de unieke code zoekt 0-0-0.nl je naam en KNSB nummer en
heb je een persoonlijke agenda, kan je je per ronde aanmelden of afzeggen
en kan je de voorlopige indeling van de komende ronde zien.

Technische uitleg

0-0-0.nl gebruikt [localStorage en sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
(DOM storage), een moderne en veilige techniek om gegevens van de server op je lokale computer, smartphone of tablet op te slaan.
0-0-0.nl gebruikt [geen ouderwetse, onveilige cookie's](https://blog.google/products/chrome/updated-timeline-privacy-sandbox-milestones/)!

0-0-0.nl gebruikt sessionStorage om ranglijsten en uitslagen tijdelijk op te slaan,
zodat het oproepen van verschillende ranglijsten en uitslagen van meer spelers sneller gaat,
omdat je browser niet steeds opnieuw een verbinding hoeft te maken met de server.
Na het sluiten van je sessie met je browser staan die ranglijsten en uitslagen niet meer in het geheugen van je apparaat.
0-0-0.nl gebruikt localStorage alleen voor de unieke code om jou te herkennen als geregistreerd gebruiker.
Deze unieke code blijft daarom wel in het geheugen van je apparaat staan,
maar is uitsluitend zichtbaar voor 0-0-0.nl en niet voor andere websites dankzij je browser.
            </p>
        </details>
    </details>

# Rokade wordt 0-0-0

Sinds het schaakseizoen 2021-2022 wordt Rokade vervangen door 0-0-0.

## Uitslagen en ranglijsten

TODO offline toepassing in Java voor OLA en KNSB en NHSB uitslagen, eerste opzet in seizoen 2019-2020

TODO eerste concrete toepassing in seizoen 2020-2021 naast Rokade

Omdat externe wedstrijden in het Alkmaar systeem meetellen voor de interne competitie maakt 0-0-0 overzichten van scores in de interne en externe competitie. 
Met Rokade moest de intern wedstrijdleider de externe wedstijden, die niet op de avonden van de interne competitie werden gespeeld, 
met de hand bijhouden in de kolom #XBP. 
Rokade geeft echter geen overzicht van de bijbehorende externe wedstrijden. 
Met 0-0-0 kunnen de leden van de Waagtoren de ranglijst helemaal zelf controleren.

TODO muteren, eerste opzet indelen, uitwerking competitie versus team in seizoen 2021-2022 zonder Rokade

TODO teamleider, competitie aanmaken, inlezen uit OLA, enz. in seizoen 2022-2023

Rokade gebruikte een Microsoft Access database, die lokaal op de computer van de intern wedstrijdleider van de Waagtoren draaide. 
Vanuit Rokade konden we HTML maken en uploads doen naar de Waagtoren-website.
0-0-0 is een online database met een web-app die uitslagen en ranglijsten laat zien. 
De backend bestaat uit MySQL en Node.js. De frontend verwerkt JSON en gebruikt zo standaard mogelijke HTML, CSS en JavaScript.

Het belangrijkste verschil tussen 0-0-0 en Rokade is dus dat bij 0-0-0 alles online staat en niet lokaal en offline zoals bij Rokade. 
Met 0-0-0 is het mogelijk om vanaf allerlei computers, tablets of smartphones de database te raadplegen en te muteren.

Het is de bedoeling dat 0-0-0 een universeel bruikbaar uitslagen en ranglijsten systeem voor schaakverenigingen wordt. 
De [database](doc/database.md) en de [api](doc/api.md) van 0-0-0 zijn daarom zodanig ontworpen 
dat de regels van het interne competitie reglement in de database zijn vastgelegd en niet in de software van 0-0-0.

Voor de Waagtoren staat de logica van het Alkmaar systeem in reglement-data, maar die kunnen we vervangen door 
bijvoorbeeld de het Keizer systeem, halve competitie of het Zwitsers systeem.
Ranglijsten worden gegenereerd vanuit de uitslagen aan de hand van reglement-data. 

Door deze opzet is het mogelijk om wijzigingen van het reglement eenvoudig te testen door het wijzigen van de reglement-data 
en vervolgens nieuwe ranglijsten te genereren. 
Per seizoen (en per schaakvereniging) zal er dus andere reglement-data in de database staan. 

Externe wedstrijden in het Alkmaar systeem tellen mee voor de interne competitie.
Daarom maakt 0-0-0 overzichten van scores in de interne en externe competitie.
 
## Kalender, voorlopige indeling en invallers

Op 0-0-0 kan iedereen de uitslagen en ranglijsten zien van een aantal seizoenen van de Waagtoren. 
Als lid van de Waagtoren zie je bovendien een persoonlijke kalender met de ronden van de interne competitie 
en jouw externe wedstrijden. 
Op deze kalender-pagina kan je je per datum aanmelden of afzeggen.

Op basis van de leden die zijn aangemeld voor de komende ronde van de interne competitie maakt 0-0-0 automatisch een voorlopige indeling, 
die uitsluitend zichtbaar is voor leden. De intern wedstrijdleider maakt de voorlopige indeling alleen maar definitief te maken.

Voor de externe competitie houdt 0-0-0 overzichten bij voor de teamleiders met vaste spelers en mogelijke invallers. 
De afmeldingen verschijnen automatisch in dat overzicht.

Hoe de interactie tussen leden en 0-0-0 precies gaat werken, moeten we nog verder uitwerken.

## Database ontwerpen en vullen

Het ontwerp van de 0-0-0 database is afgerond voor wat betreft de ranglijst, uitslagen, indelen en de kalender. 
Voor de reglement-data zijn prototypes gemaakt voor het Alkmaar systeem, de Rapid competitie en snelschaaktoernooien. 
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
Spelers kunnen zelf hun eigen uitslagen invoeren, maar alleen de intern wedstrijdleider kan uitslagen wijzigen. 
Het doel is dat de intern wedstrijdleider steeds minder hoeft te doen.

## Verdere ontwikkeling
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
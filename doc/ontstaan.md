# Ontstaansgeschiedenis 0-0-0

0-0-0 is geleidelijk ontstaan en bovendien via allerlei omwegen. 
Dit is de geschiedenis van de belangrijkste ontwerpbeslissingen beschreven door Peter van Diepen. 

Ik heb het nog nooit gedaan dus ik denk dat ik het wel kan
(Pipi Langkous)

Alles draait om de eenvoud
(Het Goede Doel)

## Wat vooraf ging

Ik schaak al sinds 1971 in interne competities van schaakverenigingen. 
Eerst bij Lasker in Uitgeest, daarna bij Schaakvereniging Castricum, 0-0-0 in Alkmaar en tegenwoordig bij de Waagtoren in Alkmaar.
Bij Lasker en Castricum gebruikten ze het Keizersysteem voor de interne competitie.
Bij 0-0-0 waren er andere wedstrijdsystemen, maar daarna kwam het 
Alkmaarse Systeem [(1)](https://www.waagtoren.nl/timeline/2009-september-het-alkmaarse-systeem/) 
en dat gebruiken we bij de Waagtoren nog steeds.

Sinds 1974 programmeer ik computers. In het begin waren dat computers die in zalen stonden van CDC, Univac, DEC en IBM.
Later ging microcomputers en de IBM PC programmeren. 
In 2003 werd ik docent wiskunde en in 2004 werd daarnaast ook docent informatica in het voortgezet onderwijs.
In 2017 werd ik docent software engineering aan de Hogeschool van Amsterdam.

Vanaf 2016 werd ik intern wedstrijdleider van de Waagtoren en gebruikte ik Rokade 
van Herman Nijhuis [(2)](https://www.waagtoren.nl/2020/08/29/herman-nijhuis-erelid-van-de-waagtoren/).
Met Rokade moest ik aanmeldingen en afzeggingen van leden verwerken, uitslagen invoeren en door middel van 
een upload naar de website indelingen, uitslagen en ranglijsten publiceren.
Rokade gebruikte een [Microsoft Access](https://en.wikipedia.org/wiki/Microsoft_Access) database en draaide lokaal op mijn laptop.
Dat wilde ik beter automatiseren. Daarom wilde ik in overleg met Herman Nijhuis Rokade aanpassen.

Rokade is gemaakt met [Delphi](https://en.wikipedia.org/wiki/Delphi_(software)) van [Embarcadero](https://www.embarcadero.com/products/delphi).
Een prachtig product dat ik nog kende uit de jaren 80 als [Turbo Pascal](https://en.wikipedia.org/wiki/Turbo_Pascal). 
Delphi is backward compatible met veel oude versies en is geschikt voor zowel Microsoft Windows, macOS, iOS, Android and Linux.
Maar bij mij draaide Rokade uitsluitend op een oude laptop met Windows XP en niet meer op mijn eigen Windows laptop. 
Waarschijnlijk was een update van Delphi noodzakelijk en vervolgens een update van Rokade. 
Om Rokade te kunnen aanpassen, zou ik meer dan 1500 euro aan Embarcadero moeten betalen voor Delphi en 
mij verdiepen in 20 jaar werk van Herman Nijhuis.

Zo ontstond het idee om helemaal opnieuw te beginnen en een web-app te maken met een on-line database, 
die dus op een website moest draaien.

## Eerste opzet

Mijn eerste idee was om het een en ander te integreren op de [WordPress](https://en.wikipedia.org/wiki/WordPress) website van de Waagtoren.
WordPress gebruikt [MySQL](https://en.wikipedia.org/wiki/MySQL) als on-line database voor de artikelen en gebruikers. 
Met alle leden in de database en paar extra tabellen voor uitslagen en wat [PHP](https://en.wikipedia.org/wiki/PHP) code 
om ranglijsten te berekenen zou ik een begin kunnen maken met een web-app. 
Al snel vond ik WordPress niet geschikt voor deze toepassing
en PHP te lelijk om zoiets als het algoritme voor indelen mee te programmeren.

Als docent software engineering gebruikte ik vooral [Java](https://en.wikipedia.org/wiki/Java_(programming_language)) en MySQL.
Daarom begon ik in 2019 met het ontwerpen van de database met MySQL en schreef ik een Java-programma om de database te vullen.
Dat was een off-line toepassing, omdat ik toen nog niet wist hoe ik de backend voor de on-line database zou gaan maken.

De Java-toepassing was vooral bedoeld om informatie in te lezen uit andere systemen:
- Excel-bestand uit OLA (On-line Leden Administratie van de KNSB) met de gegevens van de Waagtoren leden,
- de Microsoft Access database van Rokade en
- een web crawler die de uitslagen van externe wedstrijden inleest van de websites van NHSB en KNSB.

Een web-app draait op minstens twee computers: de personal computer, mobiele telefoon of tablet van de gebruiker en
de server computer ergens in de cloud op een website. De eerste noemen we frontend en de tweede backend.
Daarnaast zijn frontend en backend via allerlei computers op het internet met elkaar verbonden.

Op de frontend draait in ieder geval een browser die [HTML](https://en.wikipedia.org/wiki/HTML), 
[CSS](https://en.wikipedia.org/wiki/CSS) en de programmeertaal [JavaScript](https://en.wikipedia.org/wiki/JavaScript) kan verwerken.
De software van de backend daarentegen is ontzettend ingewikkeld. 
Bovendien bestaan in de praktijk veel verschillende oplossingen in combinatie met allerlei programmeertalen. 
Ik heb uiteindelijk gekozen voor de combinatie [Node.js](https://nodejs.org/en/about) 
en JavaScript, zodat ik alleen JavaScript hoefde te leren voor zowel de frontend als de backend.

In 2020 maakte Matheus de Boer van [Charper Bonaroo](https://www.bonaroo.nl/) de eerste opzet voor de web-app 
met MySQL voor de on-line database, Node.js voor de backend en nog een heleboel ondersteunende software:
[koa](https://koajs.com/), [knex](https://knexjs.org/) en [objection](http://vincit.github.io/objection.js/).
De web-app zou op chessopenings.online (COOL) gaan draaien. Daarom heet het project sindsdien COOLbackend.
En de Java-toepassing heet COOLoffline. COOLfrontend is er nooit gekomen, maar staat in public van COOLbackend.

## Eerste ontwerpbeslissingen

Die laag met backend software vond ik als beginner op het gebied van web-app's ontwikkelen heel verwarrend.
In theorie kan je op de backend de HTML en CSS compleet maken en doorsturen naar de browser als statische webpagina's, 
maar je kunt ook JavaScript toevoegen die dynamisch webpagina's genereert in de frontend.

Mijn eerste ontwerpbeslissing was om in de backend geen HTML en CSS te genereren, maar uitsluitend JSON.
De backend was toen vooral een doorgeefluik: resultaten uit MySQL verwerkte ik tot JSON en die stuurde ik door naar de frontend.

Voor de frontend bestaan in de praktijk ook veel oplossingen zoals: [Vue](https://vuejs.org/), [React](https://react.dev/) en [Angular](https://angular.io/), 
maar ik kon het niet opbrengen om te kiezen en me een van die frontend frameworks eigen te maken.
Mijn tweede ontwerpbeslissing was daarom om in de frontend zo standaard mogelijke HTML, CSS en JavaScript te gebruiken.

Bovendien maakte ik geen [SPA](https://en.wikipedia.org/wiki/Single-page_application), maar verschillende webpagina's in public:
ranglijst.html, speler.html, agenda.html, enz. Ieder met eigen JavaScript: ranglijst.js, speler.js, agenda.js, enz.
Dit was een simpele manier om de web-app te splitsen in onderdelen, die ik los van elkaar kon testen.

Toen functies ontstonden die ik op verschillende pagina's kon gebruiken, specificeerde ik in ranglijst.html 
behalve ranglijst.js ook const.js, op speler.html behalve speler.js ook const.js, enz. 
Dus geen modules, maar gewoon twee JavaScript bestanden per webpagina.
Zo deed ik dat in 2021. Pas in 2023 zou ik CommonJS modules voor Node.js en ES6 modules voor de frontend gaan toepassen.

## Externe wedstrijden meetellen voor de interne competitie

In het Alkmaar systeem tellen externe wedstrijden mee voor de interne competitie. 
Oorspronkelijk telde zo'n externe partij alleen mee als die werd gespeeld in plaats van een interne partij op dezelfde dag.
Toen vroegen spelers of hun externe partij van een andere dag kon meetellen in plaats van een interne partij.
Daarvoor moesten we het reglement van de interne competitie aanpassen en moest de intern wedstrijdleider per externe partij administreren 
of die wel of niet moest meetellen voor de interne competitie. 
De interpretatie van het reglement bleek verwarrend, 
want toen waren er spelers die in een week een interne en een externe wedstrijd wilden spelen
en die laten meetellen in een andere week, omdat ze in die andere week niet voor de interne competitie konden spelen. 
De administratie werd zo heel ingewikkeld en ging daarom af en toe fout.

In 2017 is het reglement drastisch vereenvoudigd: alle externe partijen tellen mee voor de interne competitie.
Maar voor een externe partij in plaats van een interne partij krijg je meer punten dan voor een externe partij op een andere dag. 
Spelen in de externe competities van NHSB en KNSB is hierdoor aantrekkelijker geworden.
Bovendien kreeg ik als intern wedstrijdleider minder administratie.

Maar ondanks de drastische vereenvoudiging bleef de administratie veel werk. Met Rokade moest de intern wedstrijdleider 
namelijk de externe wedstrijden, die niet op de avonden van de interne competitie werden gespeeld, met de hand bijhouden 
voor de kolom #XBP van de ranglijst. En Rokade gaf geen overzicht van de bijbehorende externe wedstrijden.

Een belangrijke ontwerpbeslissing was daarom om die administratie beter te automatiseren binnen de web-app, 
zodat de intern wedstrijdleider minder werk zou krijgen. 
Bovendien moest de web-app moest de bijbehorende externe wedstrijden laten zien, 
zodat de leden van de Waagtoren de ranglijst zelf konden controleren.

## Ranglijst en reglement

Een andere belangrijke ontwerpbeslissing was om een universeel bruikbaar uitslagen en ranglijsten systeem te maken.
Ik wilde daarom de regels van het interne competitie reglement niet in JavaScript programmeren, maar als reglement-data
opslaan in de MySQL database. Het systeem genereert ranglijsten vanuit de uitslagen aan de hand van reglement-data. 
Door deze opzet is het mogelijk om wijzigingen van het reglement te testen door het wijzigen van reglement-data en
vervolgens nieuwe ranglijsten te genereren. 
Zo kunnen we het Alkmaar systeem vervangen door bijvoorbeeld het Keizer systeem. 
Per schaakvereniging en per seizoen staat er andere reglement-data in de database.

Mijn ideaal is om het aanpassen van reglement-data zodanig te maken dat iedere intern wedstrijdleider 
zelf het reglement van de interne competitie van de eigen schaakvereniging kan implementeren en zelf kan wijzigen. 
Dit ideaal is nog niet gerealiseerd, maar er zijn inmiddels wel werkende prototypes voor de interne, rapid en jeugd 
competities van de Waagtoren. 

De reglement-data van deze prototypes staat vooralsnog in vier MySQL stored functions: 
`subgroep`, `waardeCijfer`, `punten` en `totalen`, die in de backend worden aangeroepen met `versie`.

- versie 1 is de oorspronkelijke versie van Alkmaar systeem (niet in gebruik)
- versie 2 met `afzeggingenAftrek` in de seizoenen 2018-2019, 2019-2020 en 2020-2021
- versie 3 zonder `afzeggingenAftrek` vanaf seizoen 2021-2022
- versie 4 `rapidPunten` voor rapid competitie
- versie 5 `zwitsersPunten` voor Zwitsers systeem (niet in gebruik)
- versie 6 jeugd competitie met barrière punten en drie keer afzeggen (najaars competitie 2023)
- versie 7 jeugd competitie vanaf voorjaars competitie 2024
- versie 8 Alkmaar systeem waarbij externe wedstrijden op andere dagen dan dinsdag niet meetellen (2025)

In de web-app verschijnt de ranglijst van een geselecteerde competitie, seizoen en schaakvereniging, 
maar je kunt ook testen hoe de ranglijst eruit ziet als je een andere `versie` kiest.  
Alle uitslagen worden opnieuw verwerkt en de ranglijst opnieuw berekend volgens de gekozen reglement-data. 

De MySQL stored function `totalen` verwerkt alle uitslagen en berekent allerlei totalen per speler.
Een MySQL query sorteert ze tot een ranglijst op volgorde van 
- `punten` (volgens Alkmaar systeem, rapid competitie of ander punten systeem)
- wel of geen prijs (afhankelijk van aantal gespeelde partijen)
- aantal winstpartijen in de interne competitie
- aantal winstpartijen in de externe competitie
- `interneRating`
- en nog veel meer getallen (onder andere tegenstanders, kleur en resultaten)
De backend verwerkt de gesorteerde ranglijst tot JSON en geeft die door naar de frontend.

De logica van de ranglijst is dus niet geprogrammeerd in JavaScript van backend of frontend,
maar is op deze manier als reglement-data in de database vastgelegd.
Vooralsnog is toch een programmeur nodig om de reglement-data aan te passen. 
We moeten nog een meer gebruikersvriendelijke manier bedenken om de reglement-data te wijzigen en te testen.

Na afloop van seizoen 2020-2021 is het reglement voor de interne competitie van de Waagtoren enigszins aangepast. 
Ten eerste voor het afzeggen. In versie 2 was er nog `afzeggingenAftrek` na 7 keer afzeggen. 
Vanaf versie 3 is die afgeschaft in de reglement-data en het reglement.
Ten tweede kende Rokade ingebouwde regels voor reglementaire winst, verlies en remise.
Die zijn overgenomen in `punten` van de reglement-data en in het reglement.

## Rokade wordt 0-0-0

Tijdens het seizoen 2020-2021 gebruikten we Rokade nog voor het indelen en uitslagen invoeren van de interne competitie.
Met COOLoffline kon ik de uitslagen van Rokade naar de MySQL database inlezen en de web-app testen als vervanger 
van de uploads van uitslagen en ranglijsten van Rokade.

Het was ooit de bedoeling om de web-app op chessopenings.online (COOL) te laten draaien.
Maar in oktober 2020 kocht ik 0-0-0.nl en daarom ging de web-app in november 2020 on-line op 0-0-0.nl.
Sindsdien heet de web-app: 0-0-0 als opvolger van Rokade van Herman Nijhuis en als herinnering 
aan de schaakvereniging 0-0-0, die tegenwoordig de Waagtoren heet. 

Overigens had de interne competitie van de Waagtoren in 2020-2021 slechts 17 ronden en er was geen externe competitie,
behalve twee wedstrijden van Waagtoren 1 helemaal op het einde van het seizoen. 
Dat was prima voor het ontwikkelen van 0-0-0. 

Met 0-0-0 kunnen de leden van de Waagtoren zelf controleren hoe de ranglijst tot stand komt door op een naam te klikken,
want dan verschijnt een lijst van alle uitslagen van de competitie en van externe wedstrijden die meetellen
en alle punten per uitslag en alle andere gegevens die van belang zijn voor de totalen in de ranglijst.
Alle seizoenen van de Waagtoren vanaf 2018-2019 staan op 0-0-0.nl.
COOLoffline wordt nog steeds gebruikt om uitslagen van externe wedstrijden van de websites van KNSB en NHSB in te lezen.

## Agenda

De belangrijkste ontwerpbeslissing (eigenlijk het hoofddoel) van 0-0-0 was interactief aanmelden en afzeggen 
en automatisch opnieuw indelen na elke aanmelding of afzegging.

Hieruit ontstond het idee om per gebruiker een persoonlijke agenda te maken: een lijst op datum 
van alle interne en rapid competitie ronden, NHSB- en KNSB-wedstrijden en snelschaakavonden.
In de kolom Aanwezig kan de gebruiker aanvinken of hij of zij meedoet in die ronde of wedstrijd. 
Niet alleen voor de komende ronde, maar eventueel voor het hele seizoen.
 
Om de agenda persoonlijk te maken was het noodzakelijk dat 0-0-0 de gebruiker herkent.
Leden van de Waagtoren kunnen zich registreren en krijgen per e-mail een link om hun registratie te activeren.
Op 0-0-0.nl staan geen wachtwoorden en gebruikt geen [cookie](https://en.wikipedia.org/wiki/HTTP_cookie)s, maar 
[uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)'s, die 0-0-0 opslaat in 
de [localStorage](https://en.wikipedia.org/wiki/Web_storage) van de browser op het apparaat van de gebruiker.
Een volgende keer stuurt 0-0-0 deze uuid naar de server en weet de server wie de gebruiker is.
In de praktijk blijkt dat bijvoorbeeld iPhone's de localStorage van de browser af en toe wissen en 
dan moet de gebruiker nogmaals de link uit de e-mail gebruiken om zijn of haar registratie opnieuw te activeren.

## Indelen
<!--- PvD: eerste versie indelen vanaf begin van seizoen 2021-2022 --->

## 2021-2022

Bij de Waagtoren spelen we de interne competitie sinds 2010 volgens het Alkmaarse Systeem en 
daarbij gebruikten we het computerprogramma Rokade tot en met het seizoen 2020-2021. 
In dat laatste seizoen werd de website 0-0-0.nl in gebruik genomen voor de uitslagen en ranglijsten. 
Met ingang van seizoen 2021-2022 is 0-0-0 ook een web-app voor aanmelden / afzeggen en indelen.

Met Rokade moest de interne wedstrijdleider nog aanmeldingen en afzeggingen verwerken, 
de indeling maken, uitslagen invullen en dit alles uploaden naar de website. 
Voor elke dinsdagavond kreeg de interne wedstrijdleider vele telefoontjes, e-mail, SMS en WhatsApp van de leden. 
Met 0-0-0 hoeft dat allemaal niet meer. 
In het seizoen 2021-2022 gebruikten 64 leden 0-0-0 om zich aan te melden, af te zeggen en zelfs om uitslagen in te voeren. 
Per aanmelding of afzegging maakt 0-0-0 automatisch een nieuwe voorlopige indeling. 
De intern wedstrijdleider maakt op dinsdagavond 19:00 de indeling definitief. 
Daarna kunnen de leden hun partijen spelen en de uitslagen invoeren.

0-0-0 is nog in ontwikkeling. Voor het rapidtoernooi gebruikten we 0-0-0 alleen voor ronde 7, 8 en 9 en 
0-0-0 is niet gebruikt voor het snelschaaktoernooi.

## 2022-2023

Sinds het seizoen 2021-2022 gebruiken we 0-0-0 voor aanmelden / afzeggen en automatisch indelen van de interne competitie 
en het rapidtoernooi.
In 2021-2022 moest ik als ontwikkelaar nog een aantal keren ingrijpen, omdat 0-0-0 vastliep of geen goede indeling maakte. 
In 2022-2023 was dat niet nodig. 
Ik heb wel wat aangepast voor de wit-zwart verdeling en voor het indelen tegen dezelfde speler na 7 partijen in plaats van na 7 ronden.
In het seizoen 2022-2023 gebruikten 81 leden 0-0-0 om zich aan te melden, af te zeggen en zelfs om uitslagen in te voeren. 
Er zijn letterlijk nog maar een paar leden die meedoen aan de interne competitie en 0-0-0 niet gebruiken.

## 2023-2024

In het seizoen 2023-2024 gebruikten 76 leden 0-0-0 om zich aan te melden, af te zeggen en zelfs om uitslagen in te voeren. 
Er zijn letterlijk nog maar een paar leden die meedoen aan de interne competitie en 0-0-0 niet gebruiken.

In 2022-2023 hoefde ik als intern wedstrijdleider niet in te grijpen, omdat 0-0-0 toen het hele seizoen niet vastliep 
met automatisch indelen. 
In 2023-2024 daarentegen ging het 8 keer fout. Deze fout is nog niet verholpen, maar er is wel een handmatige oplossing.

0-0-0 heeft namelijk de functionaliteit gekregen om handmatig in te delen en er is een nieuwe rondenlijst, 
waarop een wedstrijdleider duidelijk kan zien wie tegen wie heeft gespeeld. 
Dit alles op verzoek van de jeugdleiding, want vanaf 2024-2025 gaat de jeugdleiding 0-0-0 gebruiken 
voor de najaars en voorjaars competities van de jeugd.

0-0-0 is nog in ontwikkeling. 0-0-0 kan nog geen indelingen maken volgens het FIDE Dutch system (Zwitsers). 
Daarom gebruikten we SwissMaster voor onze snelschaaktoernooien op dinsdagavond.

## Indelen

indelen met Rokade en zie gesorteerde ranglijst 

Rokade wordt 0-0-0 




## Teamleider

## GitHub project

## Rokade en 0-0-0

In begintijd Rokade en 0-0-0 samen



## 2023

Invoering van CommonJS module voor node.js en ES6 modules voor frontend.

Het inlezen van KNSB gegevens uit OLA (Online Leden Administratie van de KNSB) was gerealiseerd in de Java toepassing.
Maar elk seizoen bleek het uit OLA afgetapte CSV-bestand anders te zijn. Dan maakte ik weer een paar aanpassingen
en werkte het weer. In de zomer van 2023 deed ik mee aan een aantal kroeglopertoernooien en daar gebruikten ze
[StickChess](https://stickchess.com/)steeds. een, 
maar bleek OLA helemaal uit 0-0-0 gehaald en inlezen ratinglijsten van de KNSB.

## 2024

In het seizoen 2023-2024 werd besloten om voor de jeugd van de Waagtoren ook 0-0-0 te gebruiken. 
In eerste instantie was de jeugd competitie een andere competitie naast de interne en rapid competitie
met een eigen manier om de ranglijst te berekenen.
De spelers in de interne en rapid competitie houden het hele seizoen de KNSB rating van 1 september (en subgroep),
maar de jeugd heeft een najaar en voorjaar competitie met een andere rating / subgroep.
Toen was het noodzakelijk om in 0-0-0 verschillende schaakverenigingen te onderscheiden met een clubCode
en de jeugd met clubCode = 1 af te splitsen van de Waagtoren met clubCode = 0.

Verschuiving van frontend naar backend en van MySQL naar backend
Synchroniseren frontend met backend. Geen doorgeefluik meer.

## Links
- (1) [Alkmaarse systeem](https://www.waagtoren.nl/timeline/2009-september-het-alkmaarse-systeem/)
- (2) [Herman Nijhuis](https://www.waagtoren.nl/2020/08/29/herman-nijhuis-erelid-van-de-waagtoren/)
- (3) [0-0-0 voor aanmelden en afzeggen](https://www.waagtoren.nl/2021/07/10/0-0-0-nl-voor-aanmelden-afzeggen/)
- (4) [Rapid als stress test voor 0-0-0](https://www.waagtoren.nl/2022/02/21/rapid-als-stress-test-voor-0-0-0/)
- (5) [Bericht van de intern wedstrijdleider](https://www.waagtoren.nl/2022/09/08/bericht-van-de-intern-wedstrijdleider-2/)
- (6) [Alberto Alvarez Alonso scoort 4 uit 4](https://www.waagtoren.nl/2023/10/27/alberto-alvarez-alonso-scoort-4-uit-4/)
- (7) [Informatie interne competitie](https://www.waagtoren.nl/4-senioren/interne-competitie/interne-informatie/)
- (8) [0-0-0 en de externe competitie](https://www.waagtoren.nl/2024/02/03/0-0-0-en-de-externe-competitie/)


Op dit moment verkeert het nieuwe systeem in fase 1: database ontwerpen en offline de database vullen.
Ik probeer zo veel mogelijk informatie af te tappen van andere systemen zoals het OLA systeem van de KNSB, de ratinglijsten,
de websites van de NHSB en KNSB voor de externe competities en bekercompetities en (voorlopig) van Rokade voor de interne competitie.

Import en export van andere systemen blijven belangrijk voor het nieuwe systeem,
want het is de bedoeling dat gebruikers zo min mogelijk hoeven in te toetsen.
In de toekomst is het misschien ook handig om informatie uit te wisselen met SwissMaster, Sevilla, enz.

Rokade is 
- Ledenadministratie
- Competities en toernooien
- Bondscompetitie
- Financiële administratie

Het is de bedoeling dat er web-apps en apps voor mobiele telefoons komen om uitslagen in te voeren. 
Eventueel kunnen spelers zelf hun uitslagen invoeren, maar dan moeten beide spelers (of de intern wedstrijdleider) de uitslag bevestigen. 
Het een en ander moet op een moderne manier beveiligd worden.

Beveiliging en backup van de database met uitslagen moet uiteraard goed geregeld worden met mogelijkheden om log-bestanden te bekijken 
en fouten te herstellen.

Voorlopig gebruik ik MySQL, maar indien een ander database management system in de toekomst een betere keuze blijkt te zijn, 
moet het ontwerp van het systeem zodanig zijn we MySQL kunnen vervangen.

### Database ontwerpen en vullen

Maar 0-0-0 berekent geen ratings en is geen leden administratie.
In de database van 0-0-0 gebruiken we uitsluitend gegevens die noodzakelijk zijn voor de uitslagen en ranglijsten
zoals naam, KNSB nummer en KNSB rating (met een bijbehorende datum), die worden overgenomen uit OLA, de Online Leden Administratie van de KNSB.

Voor het vullen van de 0-0-0 database is een offline toepassing gemaakt die informatie inleest uit andere systemen:
-	Excel-bestand uit OLA met de gegevens van de Waagtoren leden,
-	de offline database van Rokade voor de uitslagen van de interne competities van verschillende seizoenen en
-	een web crawler die de websites van NHSB en KNSB raadpleegt voor de uitslagen van externe wedstrijden.

Voor de online 0-0-0 gaan we meer geavanceerde koppelingen maken met andere systemen,
want het is de bedoeling dat gebruikers zo min mogelijk hoeven in te toetsen.
Eventueel kunnen spelers zelf hun uitslagen invoeren, maar dan moeten beide spelers de uitslag bevestigen.
Het doel is dat de intern wedstrijdleider steeds minder hoeft te doen. Het een en ander moet op een moderne manier beveiligd worden.

### Afzeggen en aanmelden
Na fase 1 is er een online database en een website die vanuit de database uitslagen en ranglijsten laat zien die voor iedereen zichtbaar zijn. 
Voor het bijwerken van de database zijn dan vooral offline tools gemaakt.

In fase 2 wordt het nieuwe systeem interactief. 
Spelers moeten zich aanmelden, want sommige lijsten zijn alleen zichtbaar voor de spelers zelf, teamleiders of competitieleiders.

-	Lijsten per speler met interne en externe resultaten.
-	Lijsten per speler met tegenstanders en kleuren in volgorde van voorkeur voor de indeling in de interne competitie.
-	Lijsten per speler met vermeldingen wanneer ze afwezig zijn.

In fase 3 kunnen spelers en competitieleiders de database bijwerken via de website.

-	Spelers kunnen zich aanmelden en afzeggen voor de interne en externe competitie.
-	Spelers kunnen partijen vastleggen om tegen elkaar te spelen.
-	Spelers kunnen zelf uitslagen doorgeven.

Deze lijst van specificaties moet nog verder uitgewerkt worden.

### Indelen
Voorlopig kan de interne competitieleider Rokade blijven gebruiken om in te delen. 
Indelen is sowieso iets wat zo veel mogelijk onafhankelijk van de rest van het nieuwe systeem moet functioneren.

In fase 4 zal een web-app of een app op een mobiele telefoon volledig automatisch een lijst van dinsdag te spelen partijen genereren.

### Open source
In fase 5 wil ik actief proberen of andere schaakverenigingen dit systeem willen gebruiken. 
Ik zal zorgen dat het uitwisselen van gegevens met Rokade blijft functioneren, zodat verenigingen die Rokade al gebruiken eenvoudig kunnen overstappen.

Eventueel kunnen andere schaakverenigingen hun databases ook op www.ChessOpenings.OnLine draaien.

Het nieuwe systeem wordt ontwikkeld in duidelijk afgebakende delen, die je onafhankelijk van elkaar kunt vervangen of verbeteren. 
De source code met documentatie zal ik open source beschikbaar stellen op GitHub, zodat andere programmeurs ook aan het nieuwe systeem kunnen werken.

## Rokade wordt 0-0-0


Schaakvereniging de Waagtoren gebruikt Rokade van Herman Nijhuis voor het maken van indelingen en ranglijsten voor de interne competitie volgens het Alkmaarse systeem van Bert Buitink en Wim Andriessen.
Rokade wil ik geleidelijk vervangen door een systeem op 0-0-0.nl.

### Uitslagen en ranglijsten
Rokade gebruikt een Microsoft Access database, die lokaal op de computer van de intern wedstrijdleider van de Waagtoren draait. 
Vanuit Rokade maken we HTML en doen we uploads naar de Waagtoren-website.

0-0-0 is een online database met een web-app die uitslagen en ranglijsten laat zien. 
De backend bestaat uit MySQL en Node.js. De frontend verwerkt JSON en gebruikt zo standaard mogelijke HTML, CSS en JavaScript.

Het belangrijkste verschil tussen 0-0-0 en Rokade is dus dat bij 0-0-0 alles online staat en niet lokaal en offline zoals bij Rokade. 
Met 0-0-0 wordt het mogelijk om vanaf allerlei computers, tablets of smartphones de database te raadplegen en eventueel te muteren.

Het is de bedoeling dat 0-0-0 een universeel bruikbaar uitslagen en ranglijsten systeem voor schaakverenigingen wordt. 
De database en de api van 0-0-0 worden zodanig ontworpen dat de logica van het Alkmaar systeem in de database wordt vastgelegd, 
zodat we die kunnen vervangen door bijvoorbeeld het Keizer systeem of het Zwitsers systeem. 
De regels van het interne competitie reglement worden dus niet in software vastgelegd, maar in reglement-data. 
Ranglijsten worden gegenereerd vanuit de uitslagen aan de hand van reglement-data.

Door deze opzet is het mogelijk om wijzigingen van het reglement eenvoudig te testen door het wijzigen van de reglement-data 
en vervolgens nieuwe ranglijsten te genereren. Per seizoen (en per schaakvereniging) zal er dus andere reglement-data in de database staan.

Omdat externe wedstrijden in het Alkmaar systeem meetellen voor de interne competitie 
maakt 0-0-0 overzichten van scores in de interne en externe competitie. 
Met Rokade moest de intern wedstrijdleider de externe wedstijden, die niet op de avonden van de interne competitie werden gespeeld, 
met de hand bijhouden in de kolom #XBP. Rokade geeft echter geen overzicht van de bijbehorende externe wedstrijden. 
Met 0-0-0 kunnen de leden van de Waagtoren de ranglijst helemaal zelf controleren.

### Kalender, voorlopige indeling en invallers
Op 0-0-0.nl kan iedereen de uitslagen en ranglijsten zien van de laatste 3 seizoenen van de Waagtoren. 
Als lid van de Waagtoren zie je bovendien een persoonlijke kalender met de ronden van de interne competitie 
en jouw externe wedstrijden voor de rest van het seizoen.
Op deze kalender-pagina kan je je per datum aanmelden of afzeggen.

Op basis van de leden die zijn aangemeld voor de komende ronde van de interne competitie maakt 0-0-0 automatisch een voorlopige indeling, 
die uitsluitend zichtbaar is voor leden. De intern wedstrijdleider hoeft de voorlopige indeling alleen maar definitief te maken.

Voor de externe competitie houdt 0-0-0 overzichten bij voor de teamleiders met vaste spelers en mogelijke invallers. 
De afmeldingen verschijnen automatisch in dat overzicht.

Hoe de interactie tussen leden en 0-0-0 precies gaat werken, moeten we nog verder uitwerken.

### Database ontwerpen en vullen
Het ontwerp van de 0-0-0 database is afgerond voor wat betreft de ranglijst, uitslagen, indelen en de kalender. 
Voor de reglement-data is een prototype gemaakt met een werkende versie van het Alkmaar systeem. 
De algemene opzet voor reglement-data zal ongetwijfeld nog veranderen als we het Keizer systeem of Zwitsers systeem gaan implementeren.

Maar 0-0-0 berekent geen ratings en is geen leden administratie. 
In de database van 0-0-0 gebruiken we uitsluitend gegevens die noodzakelijk zijn voor de uitslagen en ranglijsten 
zoals naam, KNSB nummer en KNSB rating (met een bijbehorende datum), die worden overgenomen uit OLA, de Online Leden Administratie van de KNSB.

Voor het vullen van de 0-0-0 database is een offline toepassing gemaakt die informatie inleest uit andere systemen:
-	Excel-bestand uit OLA met de gegevens van de Waagtoren leden,
-	de offline database van Rokade voor de uitslagen van de interne competities van verschillende seizoenen en
-	een web crawler die de websites van NHSB en KNSB raadpleegt voor de uitslagen van externe wedstrijden.

Voor de online 0-0-0 gaan we meer geavanceerde koppelingen maken met andere systemen, 
want het is de bedoeling dat gebruikers zo min mogelijk hoeven in te toetsen. 
Eventueel kunnen spelers zelf hun uitslagen invoeren, maar dan moeten beide spelers de uitslag bevestigen. 
Het doel is dat de intern wedstrijdleider steeds minder hoeft te doen. Het een en ander moet op een moderne manier beveiligd worden.

### Verdere ontwikkeling
Op dit moment heeft 0-0-0 nog geen gebruikers die de database kunnen muteren. 
0-0-0 kan nog niet functioneren zonder de offline toepassing. Bovendien is 0-0-0 voorlopig alleen beschikbaar voor de Waagtoren.

Beveiliging en backup van de 0-0-0 database moeten we uiteraard goed regelen met mogelijkheden om log-bestanden te bekijken 
en eventueel fouten te herstellen.

Het is mijn bedoeling om 0-0-0 eerst helemaal functioneel te maken voor de Waagtoren. Daarna wil ik 0-0-0 geschikt maken
-	voor andere schaakverenigingen,
-	voor andere systemen dan alleen het Alkmaar systeem en
-	voor andere (onder)bonden dan alleen KNSB en NHSB.

Ik zal zorgen dat het uitwisselen van gegevens met Rokade blijft functioneren, 
zodat verenigingen die Rokade al gebruiken eenvoudig kunnen overstappen.

Eventueel kunnen andere schaakverenigingen ook op 0-0-0.nl draaien.

De source code met documentatie zal ik open source beschikbaar stellen op GitHub, zodat andere programmeurs ook aan 0-0-0 kunnen werken.

Voorlopig is 0-0-0 gebaseerd op MySQL, maar indien een ander database management system in de toekomst een betere keuze blijkt te zijn, 
is het ontwerp van de database zodanig zijn we MySQL kunnen vervangen.

## Schaakseizoen 2021-2022
 
0-0-0 was nog lang niet compleet, maar ik meende dat ik 0-0-0 tijdens dit seizoen wel compleet kon maken.
Het algoritme voor het indelen van de eerste ronde had ik al met het offline Java-programma in de praktijk getest
en ik had wat ideeën voor het indelen van de andere ronden. Ik wist dat indelen later in het seizoen moeilijker zou worden,
maar ik dacht dat ik die problemen snel genoeg kon oplossen tussen de ronden. 
Kortom ik meende dat ik Rokade niet meer nodig zou hebben. 

Zo is het inderdaad gegaan. 2021-2022 was het eerste seizoen dat de interne competitie van de Waagtoren volledig draaide met 0-0-0.
En ook de rapid competitie, maar dat ging niet helemaal goed.

## Schaakseizoen 2022-2023

## Planning voor schaakseizoen 2023-2024

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
De [database](doc/database.md) en de [api](doc/ontwikkelen.md) van 0-0-0 zijn daarom zodanig ontworpen 
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
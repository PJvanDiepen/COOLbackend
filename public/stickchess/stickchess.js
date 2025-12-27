"use strict";

/*
StickChess.js laat de uitslagen van een StickChess toernooi zien.

Voorlopig moet je de informatie van de StickChess server inlezen door middel van commando's in de browser.
Om te beginnen heb je een overzicht van alle toernooien nodig:

https://portal.stickchess.com/api/tournaments

Het resultaat kopieer je naar tournaments.json
en die wordt vervolgens hieronder ingelezen en gefilterd op [plaats].

TODO spelfouten.md verbeteren in alkmaar/*.json (eerst kopie maken: alkmaar/*.stickchess)
TODO alkmaar.html, hoorn.html enz. afsplitsen van stickchess.html
TODO stick.js genereert de code voor alkmaar.js, hoorn.js enz. en stuurt naar juiste pagina
TODO informatie via server op 0-0-0.nl rechtstreeks inlezen van de StickChess server
 */
const plaats = "Alkmaar";
const aantalRonden = 7;
import tournaments from "./tournaments.json" with { type: "json" };
const toernooi = tournaments.finished.filter(function (toernooi) {
    return toernooi.name.includes(plaats);
}).map(function (toernooi) {
    return {
        naam: "",
        datum: "",
        ranglijst: [],
        ronde: [],
        endDate: toernooi.endDate,
        name: toernooi.name,
        urlKey: toernooi.urlKey
    }
});

/*
De selectie van toernooien in [plaats] is gesorteerd van laatste tot eerste toernooi.

De ranglijsten en uitslagen van die toernooien moet je van de StickChess server inlezen.
Per toernooi heeft StickChess een unieke [urlKey].

https://portal.stickchess.com/api/tournaments/[urlKey]/standings/[aantalRonden]
https://portal.stickchess.com/api/tournaments/[urlKey]/rounds/[j]

Ranglijsten kopieer je naar [urlKey].json en uitslagen naar [urlKey]_[j].json
in de [plaats] directory.
Bestanden met dezelfde [urlKey] horen bij 1 toernooi met [j] als het url.ronde.
De [plaats] directory is een selectie van toernooien.
Op deze manier kan je ook nieuwe StickChess toernooien gestructureerd opslaan.

In de code van stickchess.js heeft elk toernooi een url.toernooi: [i]
en elke ronde heeft een url.toernooi: [i] en een url.ronde: [j],
zodat deze code geschikt is voor verschillende selecties van toernooien.

De code voor selecties per [plaats] is slechts voor een deel verschillend.
Het coderen van de koppeling tussen de json-bestanden en stickchess.js
is zodanig geautomatiseerd dat stickchess.js die code zelf genereert!

Als je [plaats] wijzigt of nieuwe StickChess toernooien toevoegt,
moet je eerst de gegeneerde code verwijderen, daarna opnieuw genereren
en die tenslotte weer toevoegen. Zie hieronder.
 */
let code = `///// begin gegenereerde code voor ${plaats}\n`;
for (let i = 0; i < toernooi.length; i++) {
    toernooi[i].naam = `${toernooi.length - i}e ${plaats}s Kroegloperstoernooi`;
    toernooi[i].datum = datumLeesbaar(toernooi[i].endDate);
    const urlKey = toernooi[i].urlKey;
    code += `import standings_${i} from "./${plaats}/${urlKey}.json" with { type: "json" };\n`;
    code += `toernooi[${i}].ranglijst = standings_${i}.standing;\n`;
    for (let j = 1; j <= aantalRonden ; j++) {
        code += `import rounds_${i}_${j} from "./${plaats}/${urlKey}_${j}.json" with { type: "json" };\n`;
        code += `toernooi[${i}].ronde[${j}] = rounds_${i}_${j};\n`;
    }
}
code += `///// einde gegenereerde code voor ${plaats}\n`;
console.log(code);

///// begin gegenereerde code voor Alkmaar
import standings_0 from "./Alkmaar/Alkmaar25.json" with { type: "json" };
toernooi[0].ranglijst = standings_0.standing;
import rounds_0_1 from "./Alkmaar/Alkmaar25_1.json" with { type: "json" };
toernooi[0].ronde[1] = rounds_0_1;
import rounds_0_2 from "./Alkmaar/Alkmaar25_2.json" with { type: "json" };
toernooi[0].ronde[2] = rounds_0_2;
import rounds_0_3 from "./Alkmaar/Alkmaar25_3.json" with { type: "json" };
toernooi[0].ronde[3] = rounds_0_3;
import rounds_0_4 from "./Alkmaar/Alkmaar25_4.json" with { type: "json" };
toernooi[0].ronde[4] = rounds_0_4;
import rounds_0_5 from "./Alkmaar/Alkmaar25_5.json" with { type: "json" };
toernooi[0].ronde[5] = rounds_0_5;
import rounds_0_6 from "./Alkmaar/Alkmaar25_6.json" with { type: "json" };
toernooi[0].ronde[6] = rounds_0_6;
import rounds_0_7 from "./Alkmaar/Alkmaar25_7.json" with { type: "json" };
toernooi[0].ronde[7] = rounds_0_7;
import standings_1 from "./Alkmaar/Alkmaar2024.json" with { type: "json" };
toernooi[1].ranglijst = standings_1.standing;
import rounds_1_1 from "./Alkmaar/Alkmaar2024_1.json" with { type: "json" };
toernooi[1].ronde[1] = rounds_1_1;
import rounds_1_2 from "./Alkmaar/Alkmaar2024_2.json" with { type: "json" };
toernooi[1].ronde[2] = rounds_1_2;
import rounds_1_3 from "./Alkmaar/Alkmaar2024_3.json" with { type: "json" };
toernooi[1].ronde[3] = rounds_1_3;
import rounds_1_4 from "./Alkmaar/Alkmaar2024_4.json" with { type: "json" };
toernooi[1].ronde[4] = rounds_1_4;
import rounds_1_5 from "./Alkmaar/Alkmaar2024_5.json" with { type: "json" };
toernooi[1].ronde[5] = rounds_1_5;
import rounds_1_6 from "./Alkmaar/Alkmaar2024_6.json" with { type: "json" };
toernooi[1].ronde[6] = rounds_1_6;
import rounds_1_7 from "./Alkmaar/Alkmaar2024_7.json" with { type: "json" };
toernooi[1].ronde[7] = rounds_1_7;
import standings_2 from "./Alkmaar/Alkmaar.json" with { type: "json" };
toernooi[2].ranglijst = standings_2.standing;
import rounds_2_1 from "./Alkmaar/Alkmaar_1.json" with { type: "json" };
toernooi[2].ronde[1] = rounds_2_1;
import rounds_2_2 from "./Alkmaar/Alkmaar_2.json" with { type: "json" };
toernooi[2].ronde[2] = rounds_2_2;
import rounds_2_3 from "./Alkmaar/Alkmaar_3.json" with { type: "json" };
toernooi[2].ronde[3] = rounds_2_3;
import rounds_2_4 from "./Alkmaar/Alkmaar_4.json" with { type: "json" };
toernooi[2].ronde[4] = rounds_2_4;
import rounds_2_5 from "./Alkmaar/Alkmaar_5.json" with { type: "json" };
toernooi[2].ronde[5] = rounds_2_5;
import rounds_2_6 from "./Alkmaar/Alkmaar_6.json" with { type: "json" };
toernooi[2].ronde[6] = rounds_2_6;
import rounds_2_7 from "./Alkmaar/Alkmaar_7.json" with { type: "json" };
toernooi[2].ronde[7] = rounds_2_7;
import standings_3 from "./Alkmaar/AlkmaarsKLT22.json" with { type: "json" };
toernooi[3].ranglijst = standings_3.standing;
import rounds_3_1 from "./Alkmaar/AlkmaarsKLT22_1.json" with { type: "json" };
toernooi[3].ronde[1] = rounds_3_1;
import rounds_3_2 from "./Alkmaar/AlkmaarsKLT22_2.json" with { type: "json" };
toernooi[3].ronde[2] = rounds_3_2;
import rounds_3_3 from "./Alkmaar/AlkmaarsKLT22_3.json" with { type: "json" };
toernooi[3].ronde[3] = rounds_3_3;
import rounds_3_4 from "./Alkmaar/AlkmaarsKLT22_4.json" with { type: "json" };
toernooi[3].ronde[4] = rounds_3_4;
import rounds_3_5 from "./Alkmaar/AlkmaarsKLT22_5.json" with { type: "json" };
toernooi[3].ronde[5] = rounds_3_5;
import rounds_3_6 from "./Alkmaar/AlkmaarsKLT22_6.json" with { type: "json" };
toernooi[3].ronde[6] = rounds_3_6;
import rounds_3_7 from "./Alkmaar/AlkmaarsKLT22_7.json" with { type: "json" };
toernooi[3].ronde[7] = rounds_3_7;
import standings_4 from "./Alkmaar/waagtoren.json" with { type: "json" };
toernooi[4].ranglijst = standings_4.standing;
import rounds_4_1 from "./Alkmaar/waagtoren_1.json" with { type: "json" };
toernooi[4].ronde[1] = rounds_4_1;
import rounds_4_2 from "./Alkmaar/waagtoren_2.json" with { type: "json" };
toernooi[4].ronde[2] = rounds_4_2;
import rounds_4_3 from "./Alkmaar/waagtoren_3.json" with { type: "json" };
toernooi[4].ronde[3] = rounds_4_3;
import rounds_4_4 from "./Alkmaar/waagtoren_4.json" with { type: "json" };
toernooi[4].ronde[4] = rounds_4_4;
import rounds_4_5 from "./Alkmaar/waagtoren_5.json" with { type: "json" };
toernooi[4].ronde[5] = rounds_4_5;
import rounds_4_6 from "./Alkmaar/waagtoren_6.json" with { type: "json" };
toernooi[4].ronde[6] = rounds_4_6;
import rounds_4_7 from "./Alkmaar/waagtoren_7.json" with { type: "json" };
toernooi[4].ronde[7] = rounds_4_7;
import standings_5 from "./Alkmaar/alkmaar18.json" with { type: "json" };
toernooi[5].ranglijst = standings_5.standing;
import rounds_5_1 from "./Alkmaar/alkmaar18_1.json" with { type: "json" };
toernooi[5].ronde[1] = rounds_5_1;
import rounds_5_2 from "./Alkmaar/alkmaar18_2.json" with { type: "json" };
toernooi[5].ronde[2] = rounds_5_2;
import rounds_5_3 from "./Alkmaar/alkmaar18_3.json" with { type: "json" };
toernooi[5].ronde[3] = rounds_5_3;
import rounds_5_4 from "./Alkmaar/alkmaar18_4.json" with { type: "json" };
toernooi[5].ronde[4] = rounds_5_4;
import rounds_5_5 from "./Alkmaar/alkmaar18_5.json" with { type: "json" };
toernooi[5].ronde[5] = rounds_5_5;
import rounds_5_6 from "./Alkmaar/alkmaar18_6.json" with { type: "json" };
toernooi[5].ronde[6] = rounds_5_6;
import rounds_5_7 from "./Alkmaar/alkmaar18_7.json" with { type: "json" };
toernooi[5].ronde[7] = rounds_5_7;
import standings_6 from "./Alkmaar/alkmaar2017.json" with { type: "json" };
toernooi[6].ranglijst = standings_6.standing;
import rounds_6_1 from "./Alkmaar/alkmaar2017_1.json" with { type: "json" };
toernooi[6].ronde[1] = rounds_6_1;
import rounds_6_2 from "./Alkmaar/alkmaar2017_2.json" with { type: "json" };
toernooi[6].ronde[2] = rounds_6_2;
import rounds_6_3 from "./Alkmaar/alkmaar2017_3.json" with { type: "json" };
toernooi[6].ronde[3] = rounds_6_3;
import rounds_6_4 from "./Alkmaar/alkmaar2017_4.json" with { type: "json" };
toernooi[6].ronde[4] = rounds_6_4;
import rounds_6_5 from "./Alkmaar/alkmaar2017_5.json" with { type: "json" };
toernooi[6].ronde[5] = rounds_6_5;
import rounds_6_6 from "./Alkmaar/alkmaar2017_6.json" with { type: "json" };
toernooi[6].ronde[6] = rounds_6_6;
import rounds_6_7 from "./Alkmaar/alkmaar2017_7.json" with { type: "json" };
toernooi[6].ronde[7] = rounds_6_7;
///// einde gegenereerde code voor Alkmaar

/*
De code van stickchess.js laat 1 toernooi zien uit de selectie van toernooien met url.toernooi = 0
voor het laatste toernooi en url.toernooi = aantal toernooi - 1 voor het eerste toernooi.
Een toernooi bestaat uit de ranglijst en een gefilterde lijst met uitslagen.

Verwerk toernooi=[url.toernooi]
       &ronde=[url.ronde]
       &koppel=[url.koppel]
       &locatie=[url.locatie]
 */
const url = function (parameters) {
    const jaar = parameters.get("jaar");
    const toernooiNummer = toernooi.indexOf(toernooi.find(function (eenToernooi) {
        return jaar === eenToernooi.datum.substring(6); // dd-mm-jjjj
    }));
    return {
        toernooi: toernooiNummer >= 0 ? toernooiNummer : Number(parameters.get("toernooi")),
        ronde: Number(parameters.get("ronde")),
        koppel: Number(parameters.get("koppel")),
        locatie: Number(parameters.get("locatie"))
    }
}(new URLSearchParams(new URL(location).search));

const uitslagPartij = new Map([
    [0, "0-1"],
    [0.5, "½-½"],
    [1, "1-0"]
]);
const uitslagKoppel = new Map([
    [0, "0-2"],
    [0.5, "½-1½"],
    [1, "1-1"],
    [1.5, "1½-½"],
    [2, "0-2"]
]);

document.getElementById("kop").textContent = toernooi[url.toernooi].naam;
document.getElementById("toernooi").append(` toernooi op ${toernooi[url.toernooi].datum}`);
const ranglijst = document.getElementById("ranglijst");
const spelerNummer = new Map();
const locatieNummer = new Map();
for (let i = 0; i < toernooi[url.toernooi].ranglijst.length; i++) {
    koppelVerwerken(toernooi[url.toernooi].ranglijst[i]);
}
// Alle ronden verwerken, want sommige locaties doen niet alle ronden mee.
for (let i = 1; i <= aantalRonden ; i++) {
    rondeLocatieVerwerken(toernooi[url.toernooi].ronde[i]);
}
document.getElementById("filter").textContent =
    `Uitslagen ${url.koppel ? spelers(url.koppel) : url.locatie ? locatie(url.locatie) : "ronde " + url.ronde}`;
const uitslagenLijst = document.getElementById("uitslagen");
for (let i = 1; i <= aantalRonden ; i++) {
    uitslagenVerwerken(toernooi[url.toernooi].ronde[i]);
}

function datumLeesbaar(isoDatum) { // jjjj-mm-ddTuu:mm:ss.sssZ
    return `${isoDatum.substring(8,10)}${isoDatum.substring(4,7)}-${isoDatum.substring(0,4)}`;
}

function koppelVerwerken(koppel) {
    const koppelNummer = koppel.rank;
    spelerNummer.set(koppel.team.players[0].name, koppelNummer);
    spelerNummer.set(koppel.team.players[1].name, koppelNummer);
    ranglijst.append(htmlRij(
        punten(koppelNummer),
        koppelLink(koppelNummer),
        punten(koppel.boardPoints),
        punten(koppel.matchPoints),
        koppel.rating));
}

function rondeLocatieVerwerken(ronde) {
    const uitslagen = ronde.legacyPairing || ronde.pairing;
    for (const uitslag of uitslagen) {
        if (!locatieNummer.get(uitslag.location.name)) {
            locatieNummer.set(uitslag.location.name, locatieNummer.size + 1);
            console.log(locatieNummer.size);
            console.log(uitslag.location.name);
        }
    }
}

function uitslagenVerwerken(ronde) {
    const rondeNummer = ronde.number;
    if (url.ronde === 0 || url.ronde === rondeNummer) {
        const uitslagen = (ronde.legacyPairing || ronde.pairing).filter(function (uitslag) {
            if (url.koppel) {
                return url.koppel === spelerNummer.get(uitslag.firstTeam.players[0].name)
                    || url.koppel === spelerNummer.get(uitslag.firstTeam.players[1].name)
                    || url.koppel === spelerNummer.get(uitslag.secondTeam.players[0].name)
                    || url.koppel === spelerNummer.get(uitslag.secondTeam.players[1].name);
            } else if (url.locatie) {
                return url.locatie === locatieNummer.get(uitslag.location.name);
            } else {
                return true; // alle uitslagen van deze ronde
            }
        }).sort(function(uitslag1, uitslag2) { // elke ronde dezelfde volgorde van de locaties
            return locatieNummer.get(uitslag1.location.name) - locatieNummer.get(uitslag2.location.name);
        });
        let vorigeLocatie = url.locatie ? locatie(url.locatie) : "";
        for (const uitslag of uitslagen) {
            vorigeLocatie = rondeLocatie(rondeNummer, vorigeLocatie, uitslag.location.name);
            koppelUitslagen(rondeNummer, uitslag);
        }
        if (onevenVerwerken(ronde)) {
            onevenUitslagen(rondeNummer, ronde);
        }
    }
}

function onevenVerwerken(ronde) {
    if (url.locatie || !ronde.bye) {
        return false;
    } else if (url.koppel) {
        return (url.koppel === spelerNummer.get(ronde.bye.players[0].name))
    } else {
        return true;
    }
}

function rondeLocatie(rondeNummer, vorigeLocatie, dezeLocatie) {
    if (vorigeLocatie !== dezeLocatie) {
        uitslagenLijst.append(htmlRij(
            htmlVet(rondeLink(rondeNummer)),
            htmlVet(htmlLink(`index.html?toernooi=${url.toernooi}&locatie=${locatieNummer.get(dezeLocatie)}#filter`,
                dezeLocatie)),
            ""));
    }
    return dezeLocatie;
}

function koppelUitslagen(rondeNummer, uitslag) {
    const individueleUitslagen = uitslag.sortedGames;
    if (individueleUitslagen) { // TODO of toch koppel uitslagen indien url.uitslag="nee"
        uitslagenLijst.append(htmlRij(
            rondeLink(rondeNummer),
            spelerLink(individueleUitslagen[0].secondPlayer.name),
            spelerLink(individueleUitslagen[0].firstPlayer.name),
            uitslagPartij.get(individueleUitslagen[0].result.secondPlayer)));
        uitslagenLijst.append(htmlRij(
            "",
            spelerLink(individueleUitslagen[1].firstPlayer.name),
            spelerLink(individueleUitslagen[1].secondPlayer.name),
            uitslagPartij.get(individueleUitslagen[1].result.firstPlayer)));
    } else {
        uitslagenLijst.append(htmlRij(
            rondeLink(rondeNummer),
            koppelLink(spelerNummer.get(uitslag.firstTeam.players[0].name)),
            punten(uitslag.result.firstTeam),
            matchPunten(uitslag.result.firstTeam)));
        uitslagenLijst.append(htmlRij(
            "",
            koppelLink(spelerNummer.get(uitslag.secondTeam.players[0].name)),
            punten(uitslag.result.secondTeam),
            matchPunten(uitslag.result.secondTeam)));
    }
}

function onevenUitslagen(rondeNummer, ronde) {
    if (ronde.legacyPairing) {
        uitslagenLijst.append(htmlRij(
            htmlVet(rondeLink(rondeNummer)),
            koppelLink(spelerNummer.get(ronde.bye.players[0].name)),
            punten(2),
            matchPunten(2)));
        uitslagenLijst.append(htmlRij(
            "",
            "geen tegenstanders",
            "",
            ""));
    } else {
        uitslagenLijst.append(htmlRij(
            htmlVet(rondeLink(rondeNummer)),
            spelerLink(ronde.bye.players[0].name),
            "oneven",
            uitslagPartij.get(1)));
        uitslagenLijst.append(htmlRij(
            "",
            spelerLink(ronde.bye.players[1].name),
            "oneven",
            uitslagPartij.get(1)));
    }
}

function matchPunten(punten) {
    return punten > 1 ? 2 : punten < 1 ? 0 : 1;
}

function rondeLink(nummer) {
    return htmlLink(`index.html?toernooi=${url.toernooi}&ronde=${nummer}#filter`, nummer);
}

function spelerLink(naam) {
    return htmlLink(`index.html?toernooi=${url.toernooi}&koppel=${spelerNummer.get(naam)}#filter`, naam);
}

function koppelLink(nummer) {
    return htmlLink(`index.html?toernooi=${url.toernooi}&koppel=${nummer}#filter`, spelers(nummer));
}

function spelers(nummer) {
    const team = toernooi[url.toernooi].ranglijst[nummer - 1].team;
    return `${team.players[0].name} &  ${team.players[1].name}`;
}

function locatie(nummer) {
    return [...locatieNummer.entries()].find(function ([key, value]) {
        return value === nummer;
    })?.[0]; // TODO is ? nodig?
}

function punten(getal) {
    const HALF = "½";
    const SPATIE = "\u00A0\u00A0"
    const heelGetal = Math.trunc(getal);
    if (getal > 0 && getal < 1) {
        return `${SPATIE}${SPATIE}${HALF}`; // niet 0½ wel ½
    } else {
        return `${getal < 10 ? SPATIE : ""}${heelGetal}${getal > heelGetal ? HALF : SPATIE}`;
    }
}

function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    for (const kolom of kolommen) {
        const td = document.createElement("td");
        td.append(kolom);
        tr.append(td);
    }
    return tr;
}

function htmlLink(link, tekst) {
    const a = document.createElement("a");
    a.append(tekst);
    a.href = link;
    return a;
}

function htmlVet(htmlNode) {
    htmlNode.classList.add("vet");
    return htmlNode;
}
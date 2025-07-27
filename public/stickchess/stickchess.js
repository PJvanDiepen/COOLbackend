"use strict";

/*
StickChess.js laat de uitslagen van een StickChess toernooi zien.
De informatie moet je van de StickChess server inlezen door middel van commando's in de browser.
Om te beginnen heb je een overzicht van alle toernooien nodig:

https://portal.stickchess.com/api/tournaments

Het resultaat kopieer je naar tournaments.json
en die wordt vervolgens hieronder ingelezen en gefilterd op [plaats].
 */
const plaats = "Alkmaar";
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
Per toernooi heeft StickChess een unieke [urlKey]. Elk toernooi heeft (voorlopig) 7 ronden.

https://portal.stickchess.com/api/tournaments/[urlKey]/standings/7
https://portal.stickchess.com/api/tournaments/[urlKey]/rounds/[j]

Ranglijsten kopieer je naar [urlKey].json en uitslagen naar [urlKey]_[j].json
in de [plaats] directory.
Bestanden met dezelfde [urlKey] horen bij 1 toernooi met [j] als het rondeNr.
De [plaats] directory is een selectie van toernooien.
Op deze manier kan je ook nieuwe StickChess toernooien gestructureerd opslaan.

In de code van stickchess.js heeft elk toernooi een toernooiNr: [i]
en elke ronde heeft een toernooiNr: [i] en een rondeNr: [j],
zodat deze code geschikt is voor verschillende selecties van toernooien.

De code voor selecties per [plaats] is slechts voor een deel verschillend.
Het coderen van de koppeling tussen de json-bestanden en stickchess.js
is zodanig geautomatiseerd dat stickchess.js die code zelf genereert!

Als je [plaats] wijzigt of nieuwe StickChess toernooien toevoegt,
moet je eerst de gegeneerde code verwijderen, daarna opnieuw genereren
en die tenslotte weer toevoegen. Zie hieronder.
 */
let code = `// begin gegenereerde code voor ${plaats}\n`;
for (let i = 0; i < toernooi.length; i++) {
    toernooi[i].naam = `${toernooi.length - i}e ${plaats}s Kroegloperstoernooi`;
    toernooi[i].datum = datumLeesbaar(toernooi[i].endDate);
    const urlKey = toernooi[i].urlKey;
    code += `import standings_${i} from "./${plaats}/${urlKey}.json" with { type: "json" };\n`;
    code += `toernooi[${i}].ranglijst = standings_${i}.standing;\n`;
    for (let j = 1; j <= 7 ; j++) {
        code += `import rounds_${i}_${j} from "./${plaats}/${urlKey}_${j}.json" with { type: "json" };\n`;
        code += `toernooi[${i}].ronde[${j}] = rounds_${i}_${j};\n`;
    }
}
code += `// einde gegenereerde code voor ${plaats}\n`;
console.log(code);

// begin gegenereerde code voor Alkmaar
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
// einde gegenereerde code voor Alkmaar

console.log(toernooi);

function datumLeesbaar(jsonDatum) {
    const datum = new Date(jsonDatum);
    return `${voorloopNul(datum.getDate())}-${voorloopNul(datum.getMonth()+1)}-${datum.getFullYear()}`;
}

function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

/*
De code van stickchess.js laat 1 toernooi zien uit de selectie van toernooien met toernooiNr = 0
voor het laatste toernooi en toernooiNr = aantal toernooi - 1 voor het eerste toernooi.
Een toernooi bestaat uit de ranglijst en een gefilterde lijst met uitslagen.

Verwerk toernooi=[toernooiNr]
       &ronde=[rondeNr]
       &speler=[spelerNr]
       &locatie=[locatieNr]
 */
const parameter = new URLSearchParams(new URL(location).search);
const toernooiNr = Number(parameter.get("toernooi"));
const rondeNr = Number(parameter.get("ronde"));
const spelerNr = Number(parameter.get("speler"));
const locatieNr = Number(parameter.get("locatie"));
document.getElementById("kop").textContent = toernooi[toernooiNr].naam;
document.getElementById("toernooi").append(` toernooi op ${toernooi[toernooiNr].datum}`);
const ranglijst = document.getElementById("ranglijst");
for (let i = 0; i < toernooi[toernooiNr].ranglijst.length; i++) {
    ranglijst.append(koppelTotalen(toernooi[toernooiNr].ranglijst[i]));
}
const uitslagen = document.getElementById("uitslagen");

function koppelTotalen(koppel) {
    return htmlRij(
        punten(koppel.rank),
        koppel.team.players[0].name,
        koppel.team.players[1].name,
        punten(koppel.boardPoints),
        punten(koppel.matchPoints),
        koppel.rating);
}

function punten(getal) {
    const heelGetal = Math.trunc(getal);
    const SPATIE = "\u00A0\u00A0"
    return `${getal < 10 ? SPATIE : ""}${heelGetal}${getal > heelGetal ? "½" : SPATIE}`;
}

/*
TODO speler array met htmLink
TODO zoek spelerNr in spelerNummer Map
TODO locatie array met htmLink
TODO zoek locatieNr in locatieNummer Map
TODO uitslagen tabellen
TODO legacyPairing in 2019 en eerder?
TODO verwijder htmlParagraaf
TODO verwijder htmlTabblad
TODO verwijder htmlPlaatje
 */

function htmlParagraaf(tekst) {
    const p = document.createElement("p");
    p.append(tekst);
    return p;
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

function htmlTabblad(link, tekst) {
    const a = document.createElement("a");
    a.append(tekst);
    a.href = link;
    a.target = "_blank"; // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
    a.rel = "noopener noreferrer"
    return a;
}

function htmlLink(link, tekst) {
    const a = document.createElement("a");
    a.append(tekst);
    a.href = link;
    return a;
}

function htmlPlaatje(plaatje, percentage, breed, hoog) {
    const img = document.createElement("img");
    img.src = plaatje;
    const factor = (window.innerWidth * percentage / 100) / breed; // percentage maximale breedte
    if (factor > 1.0) {
        img.width = breed;
        img.height = hoog;
    } else {
        img.width = Math.round(breed * factor);
        img.height = Math.round(hoog * factor);
    }
    return img;
}
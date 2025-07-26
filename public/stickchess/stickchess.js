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
        ronden: [],
        endDate: toernooi.endDate,
        name: toernooi.name,
        urlKey: toernooi.urlKey
    }
});

// TODO welk toernooi inlezen?
const toernooiNummer = 0;

/*
De selectie van toernooien in [plaats] is gesorteerd van laatste tot eerste toernooi.

De code van stickchess.js laat 1 toernooi zien uit de selectie van toernooien met toernooiNummer = 0
voor het laatste toernooi en toernooiNummer = aantal toernooi - 1 voor het eerste toernooi.

De ranglijsten en uitslagen van die toernooien moet je van de StickChess server inlezen.
Per toernooi heeft StickChess een unieke [urlKey]. Elk toernooi heeft (voorlopig) 7 ronden.

https://portal.stickchess.com/api/tournaments/[urlKey]/standings/7
https://portal.stickchess.com/api/tournaments/[urlKey]/rounds/[j]

Ranglijsten kopieer je naar [urlKey].json en uitslagen naar [urlKey]_[j].json
in de [plaats] directory.
Bestanden met dezelfde [urlKey] horen bij 1 toernooi met [j] als het rondeNummer.
De [plaats] directory is een selectie van toernooien.
Op deze manier kan je ook nieuwe StickChess toernooien gestructureerd opslaan.

In de code van stickchess.js heeft elk toernooi een toernooiNummer: [i]
en elke ronde heeft een toernooiNummer: [i] en een rondeNummer: [j],
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
    for (let j = 1; j <= 7 ; j++) {
        code += `import rounds_${i}_${j} from "./${plaats}/${urlKey}_${j}.json" with { type: "json" };\n`;
    }
}
code += `toernooi[${toernooiNummer}].ranglijst = standings_${toernooiNummer}.standing;\n`;
for (let j = 1; j <= 7 ; j++) {
    // code += `import rounds_${i}_${j} from "/${plaats}/${urlKey}_${j}.json" with { type: "json" };\n`;
    // TODO legacyPairing in 2019 en eerder?
}
code += `// einde gegenereerde code voor ${plaats}\n`;
console.log(code);

// begin gegenereerde code voor Alkmaar
import standings_0 from "./Alkmaar/Alkmaar25.json" with { type: "json" };
import rounds_0_1 from "./Alkmaar/Alkmaar25_1.json" with { type: "json" };
import rounds_0_2 from "./Alkmaar/Alkmaar25_2.json" with { type: "json" };
import rounds_0_3 from "./Alkmaar/Alkmaar25_3.json" with { type: "json" };
import rounds_0_4 from "./Alkmaar/Alkmaar25_4.json" with { type: "json" };
import rounds_0_5 from "./Alkmaar/Alkmaar25_5.json" with { type: "json" };
import rounds_0_6 from "./Alkmaar/Alkmaar25_6.json" with { type: "json" };
import rounds_0_7 from "./Alkmaar/Alkmaar25_7.json" with { type: "json" };
import standings_1 from "./Alkmaar/Alkmaar2024.json" with { type: "json" };
import rounds_1_1 from "./Alkmaar/Alkmaar2024_1.json" with { type: "json" };
import rounds_1_2 from "./Alkmaar/Alkmaar2024_2.json" with { type: "json" };
import rounds_1_3 from "./Alkmaar/Alkmaar2024_3.json" with { type: "json" };
import rounds_1_4 from "./Alkmaar/Alkmaar2024_4.json" with { type: "json" };
import rounds_1_5 from "./Alkmaar/Alkmaar2024_5.json" with { type: "json" };
import rounds_1_6 from "./Alkmaar/Alkmaar2024_6.json" with { type: "json" };
import rounds_1_7 from "./Alkmaar/Alkmaar2024_7.json" with { type: "json" };
import standings_2 from "./Alkmaar/Alkmaar.json" with { type: "json" };
import rounds_2_1 from "./Alkmaar/Alkmaar_1.json" with { type: "json" };
import rounds_2_2 from "./Alkmaar/Alkmaar_2.json" with { type: "json" };
import rounds_2_3 from "./Alkmaar/Alkmaar_3.json" with { type: "json" };
import rounds_2_4 from "./Alkmaar/Alkmaar_4.json" with { type: "json" };
import rounds_2_5 from "./Alkmaar/Alkmaar_5.json" with { type: "json" };
import rounds_2_6 from "./Alkmaar/Alkmaar_6.json" with { type: "json" };
import rounds_2_7 from "./Alkmaar/Alkmaar_7.json" with { type: "json" };
import standings_3 from "./Alkmaar/AlkmaarsKLT22.json" with { type: "json" };
import rounds_3_1 from "./Alkmaar/AlkmaarsKLT22_1.json" with { type: "json" };
import rounds_3_2 from "./Alkmaar/AlkmaarsKLT22_2.json" with { type: "json" };
import rounds_3_3 from "./Alkmaar/AlkmaarsKLT22_3.json" with { type: "json" };
import rounds_3_4 from "./Alkmaar/AlkmaarsKLT22_4.json" with { type: "json" };
import rounds_3_5 from "./Alkmaar/AlkmaarsKLT22_5.json" with { type: "json" };
import rounds_3_6 from "./Alkmaar/AlkmaarsKLT22_6.json" with { type: "json" };
import rounds_3_7 from "./Alkmaar/AlkmaarsKLT22_7.json" with { type: "json" };
import standings_4 from "./Alkmaar/waagtoren.json" with { type: "json" };
import rounds_4_1 from "./Alkmaar/waagtoren_1.json" with { type: "json" };
import rounds_4_2 from "./Alkmaar/waagtoren_2.json" with { type: "json" };
import rounds_4_3 from "./Alkmaar/waagtoren_3.json" with { type: "json" };
import rounds_4_4 from "./Alkmaar/waagtoren_4.json" with { type: "json" };
import rounds_4_5 from "./Alkmaar/waagtoren_5.json" with { type: "json" };
import rounds_4_6 from "./Alkmaar/waagtoren_6.json" with { type: "json" };
import rounds_4_7 from "./Alkmaar/waagtoren_7.json" with { type: "json" };
import standings_5 from "./Alkmaar/alkmaar18.json" with { type: "json" };
import rounds_5_1 from "./Alkmaar/alkmaar18_1.json" with { type: "json" };
import rounds_5_2 from "./Alkmaar/alkmaar18_2.json" with { type: "json" };
import rounds_5_3 from "./Alkmaar/alkmaar18_3.json" with { type: "json" };
import rounds_5_4 from "./Alkmaar/alkmaar18_4.json" with { type: "json" };
import rounds_5_5 from "./Alkmaar/alkmaar18_5.json" with { type: "json" };
import rounds_5_6 from "./Alkmaar/alkmaar18_6.json" with { type: "json" };
import rounds_5_7 from "./Alkmaar/alkmaar18_7.json" with { type: "json" };
import standings_6 from "./Alkmaar/alkmaar2017.json" with { type: "json" };
import rounds_6_1 from "./Alkmaar/alkmaar2017_1.json" with { type: "json" };
import rounds_6_2 from "./Alkmaar/alkmaar2017_2.json" with { type: "json" };
import rounds_6_3 from "./Alkmaar/alkmaar2017_3.json" with { type: "json" };
import rounds_6_4 from "./Alkmaar/alkmaar2017_4.json" with { type: "json" };
import rounds_6_5 from "./Alkmaar/alkmaar2017_5.json" with { type: "json" };
import rounds_6_6 from "./Alkmaar/alkmaar2017_6.json" with { type: "json" };
import rounds_6_7 from "./Alkmaar/alkmaar2017_7.json" with { type: "json" };
toernooi[0].ranglijst = standings_0.standing;
// einde gegenereerde code voor Alkmaar

console.log(toernooi);
/*
TODO kop met datum
TODO ranglijst tabel
TODO 7 x ronde div
TODO uitslagen
 */

function datumLeesbaar(jsonDatum) {
    const datum = new Date(jsonDatum);
    return `${voorloopNul(datum.getDate())}-${voorloopNul(datum.getMonth()+1)}-${datum.getFullYear()}`;
}

function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

// TODO verwijderen vanaf hier

function parametersVerwerken() {
    const pagina = new URL(location);
    const parameters = new URLSearchParams(pagina.search);
    const anderJaar = Number(parameters.get("jaar"));
    if (anderJaar) {
        sessionStorage.setItem("jaar", anderJaar);
        jaar = anderJaar;
    }
    const welPartij = parameters.get("wel");
    if (welPartij) {
        sessionStorage.removeItem(welPartij);
    }
    const nietPartij = parameters.get("niet");
    if (nietPartij) {
        sessionStorage.setItem(nietPartij,"niet");
    }
}

const A1 = 0;
const B1 = 1;
const C1 = 2;
const D1 = 3;
const E1 = 4;
const F1 = 5;
const G1 = 6;
const H1 = 7;

// https://www.chessprogramming.org/Pieces
const KONING = "\u2654";
const DAME = "\u2655";
const TOREN = "\u2656";
const LOPER = "\u2657";
const PAARD = "\u2658";

const velden = [];
for (const veld of ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]) {
    velden.push(document.getElementById(veld));
}

let stellingNummer = 0; // TODO bereken stellingNummer in zetStuk

function zetStuk(keuzeVelden, stuk) {
    velden[kiesEen(keuzeVelden)].textContent = stuk;
}

function kiesEen(uitAantal) {
    return uitAantal.splice(Math.floor(Math.random() * uitAantal.length), 1);
}

const zwarteVelden = [A1, C1, E1, G1];
zetStuk(zwarteVelden, LOPER);

const witteVelden = [B1, D1, F1, H1];
zetStuk(witteVelden, LOPER);

const restVelden = [...zwarteVelden, ...witteVelden];
zetStuk(restVelden, DAME);
zetStuk(restVelden, PAARD);
zetStuk(restVelden, PAARD);

restVelden.sort();
velden[restVelden[0]].textContent = TOREN;
velden[restVelden[1]].textContent = KONING;
velden[restVelden[2]].textContent = TOREN;
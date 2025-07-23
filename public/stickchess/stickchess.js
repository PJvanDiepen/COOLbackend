"use strict";

/*
https://portal.stickchess.com/api/tournaments
 */
import tournaments from "./tournaments.json" with { type: "json" };

const toernooi = tournaments.finished.filter(function (alkmaar) {
    return alkmaar.name.includes("Alkmaar");
}).map(function (toernooi) {
    return {
        naam: "",
        ranglijst: [],
        ronden: [],
        endDate: toernooi.endDate,
        name: toernooi.name,
        urlKey: toernooi.urlKey
    }
});
/*
https://portal.stickchess.com/api/tournaments/[urlKey]/standings/7
https://portal.stickchess.com/api/tournaments/[urlKey]/rounds/[j]
 */
let code = "// begin gegenereerde code\n";
for (let i = 0; i < toernooi.length; i++) {
    toernooi[i].naam = `${toernooi.length - i}e Alkmaars Kroegloperstoernooi ${toernooi[i].endDate.substring(0,4)}`;
    code += `import standings_${i} from "./${toernooi[i].urlKey}.json" with { type: "json" };\n`;
    code += `toernooi[${i}].ranglijst = standings_${i}.standing;\n`;
    for (let j = 1; j <= 7 ; j++) {
        // code += `import rounds_${i}_${j} from "./${toernooi[i].urlKey}_${j}.json" with { type: "json" };\n`;
    }
}
code += "// einde gegenereerde code\n";
console.log(code);
// begin gegenereerde code
import standings_0 from "./Alkmaar25.json" with { type: "json" };
toernooi[0].ranglijst = standings_0.standing;
import standings_1 from "./Alkmaar2024.json" with { type: "json" };
toernooi[1].ranglijst = standings_1.standing;
import standings_2 from "./Alkmaar.json" with { type: "json" };
toernooi[2].ranglijst = standings_2.standing;
import standings_3 from "./AlkmaarsKLT22.json" with { type: "json" };
toernooi[3].ranglijst = standings_3.standing;
import standings_4 from "./waagtoren.json" with { type: "json" };
toernooi[4].ranglijst = standings_4.standing;
import standings_5 from "./alkmaar18.json" with { type: "json" };
toernooi[5].ranglijst = standings_5.standing;
import standings_6 from "./alkmaar2017.json" with { type: "json" };
toernooi[6].ranglijst = standings_6.standing;
// einde gegenereerde code

console.log(toernooi);

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
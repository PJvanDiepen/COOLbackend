"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, competitieTitel, rondeGegevens } from "./o_o_o.js"

import * as zyq from "./zyq.js";
/*
    verwerk ronde=<rondeNummer>
           &resultaten=<resultaten> TODO uit database
           &wit=<knsbNummer>

    terug naar ronde.html
 */
const rondeNummer = Number(html.params.get("ronde"));
const resultaten = html.params.get("resultaten").split("");
console.log(resultaten);
const speler = Number(html.params.get("wit"));


(async function() {
    await init();
    competitieTitel();
    html.id("kop").textContent =
        `Ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar(rondeGegevens(o_o_o.team, rondeNummer))}`;
    const lijst = html.id("uitslagen");
    const uitslagen = await zyq.serverFetch(
        `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/ronde`); // actuele situatie
    const uitslag = eenUitslag(uitslagen, speler);
    if (uitslagen.length === 0) {
        lijst.append(html.rij("nog", "geen", "uitslagen", ""));
    } else {
        let metWit = true; // speler met wit en tegenstander met zwart
        for (let i = 0; i < resultaten.length; i++) {
            if (metWit) {
                lijst.append(html.rij(
                    i ? "" : uitslag.bordNummer,
                    zyq.naarSpeler({knsbNummer: speler, naam: uitslag.wit}),
                    zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                    db.resultaatInvullen.get(resultaten[i])));
            } else {
                lijst.append(html.rij(
                    "",
                    zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                    zyq.naarSpeler({knsbNummer: speler, naam: uitslag.wit}),
                    resultaatRevanche(resultaten[i])));
            }
            metWit = !metWit; // speler met zwart en tegenstander met wit
        }
        html.id("wit").addEventListener("click", function () {
            wijzigResultaat(db.WINST);
        });
        html.id("remise").addEventListener("click", function() {
            wijzigResultaat(db.REMISE);
        });
        html.id("zwart").addEventListener("click", function () {
            wijzigResultaat(db.VERLIES);
        });
        if (resultaten[resultaten.length - 1] === " " || resultaten.length > 5) {
            html.id("revanche").disabled = true; // geen revanche
        } else {
            html.id("revanche").addEventListener("click", function () {
                resultaten.push(" "); // blanco revanche toevoegen
                wijzigResultaten();
            });
        }
        html.id("wissen").addEventListener("click", function () {
            if (resultaten.length === 1) {
                wijzigResultaat(" "); // resultaat wissen
            } else {
                resultaten.pop(); // revanche wissen
                wijzigResultaten();
            }
        });
    }
    html.id("opslaan").addEventListener("click", async function () {
        // Send the changed results to the server.
        html.anderePagina(
            `ronde.html?ronde=${rondeNummer}&wit=${speler}&zwart=${uitslag.tegenstanderNummer}`);
    });
})();

function eenUitslag(uitslagen, knsbNummer) {
    for (const uitslag of uitslagen) {
        if (uitslag.knsbNummer === knsbNummer) {
            return uitslag;
        }
        return uitslagen[0];
    }
}

function resultaatRevanche(resultaat) {
    return db.resultaatInvullen.get(
        resultaat === db.WINST ? db.VERLIES : resultaat === db.VERLIES ? db.WINST : resultaat);
}

function wijzigResultaat(resultaat) {
    resultaten[resultaten.length - 1] = resultaat;
    wijzigResultaten();
}

function wijzigResultaten() {
    html.zelfdePagina(
        `ronde=${rondeNummer}&resultaten=${resultaten.join("")}&wit=${speler}`);
}
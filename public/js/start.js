"use strict";

import * as db from "./db.js";
import * as html from "./html.js";

import * as zyq from "./zyq.js";

/*
    verwerk vereniging=[vereniging]
 */

const menuKeuzes = []; // in omgekeerde volgorde

function menuKeuze(elementId, minimumRechten, tekst, naarPagina) {
    menuKeuzes.unshift([minimumRechten, tekst, naarPagina]);
    document.getElementById(elementId).append(html.naarPaginaEnTerug(naarPagina,tekst));
}

(async function() {
    await zyq.init();
    document.getElementById("kop").innerHTML =
        zyq.o_o_o.vereniging + html.SCHEIDING + zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + zyq.teamVoluit(zyq.o_o_o.competitie);
    const plaatje = document.getElementById("plaatje");
    if (zyq.o_o_o.vereniging === "Waagtoren") {
        plaatje.append(html.plaatje("images/waagtoren.gif",60, 150, 123));
    }
    menuKeuze("ranglijst", db.IEDEREEN, `Ranglijst na ronde ${zyq.o_o_o.vorigeRonde}`,"ranglijst.html");
    menuKeuze("ronde", db.IEDEREEN, `Uitslagen ronde ${zyq.o_o_o.vorigeRonde}`,"ronde.html");
    if (zyq.gebruiker.mutatieRechten >= db.GEREGISTREERD) {
        if (zyq.o_o_o.huidigeRonde && zyq.o_o_o.ronde[zyq.o_o_o.huidigeRonde].resultaten === 0) { // indeling zonder resultaten)
            menuKeuze("indelen", db.GEREGISTREERD, `Definitieve indeling ronde ${zyq.o_o_o.huidigeRonde}`, `ronde.html?ronde=${zyq.o_o_o.huidigeRonde}`);
        } else if (zyq.o_o_o.vorigeRonde < zyq.o_o_o.laatsteRonde) {
            menuKeuze("indelen", db.GEREGISTREERD, `Voorlopige indeling ronde ${zyq.o_o_o.huidigeRonde}`, "indelen.html");
        }
    }
    if (zyq.gebruiker.mutatieRechten >= db.BESTUUR) {
        menuKeuze("bestuur", db.BESTUUR, `Overzicht voor bestuur`, "bestuur.html");
    }
    if (zyq.gebruiker.mutatieRechten >= db.TEAMLEIDER) {
        menuKeuze("teamleider", db.TEAMLEIDER, `Overzicht voor teamleiders`, "teamleider.html");
    }
    sessionStorage.setItem("menu", JSON.stringify(menuKeuzes));
    await seizoenSelecteren(db.INTERNE_COMPETITIE);
    await competitieSelecteren();
})();

async function seizoenSelecteren(teamCode) {
    const seizoenen = document.getElementById("seizoenSelecteren");
    let ditSeizoentoevoegen = true;
    (await zyq.localFetch("/seizoenen/" + teamCode)).forEach(
        function (seizoen) {
            if (seizoen === zyq.ditSeizoen) {
                ditSeizoentoevoegen = false;
            }
            seizoenen.append(html.optie(seizoen, zyq.seizoenVoluit(seizoen)));
        });
    if (ditSeizoentoevoegen) {
        seizoenen.append(html.optie(zyq.ditSeizoen, zyq.seizoenVoluit(zyq.ditSeizoen)));
    }
    seizoenen.value = zyq.o_o_o.seizoen; // werkt uitsluitend na await
    seizoenen.addEventListener("input",
        function () {
            sessionStorage.setItem("seizoen", seizoenen.value);
            sessionStorage.setItem("competitie", db.INTERNE_COMPETITIE);
            sessionStorage.setItem("team", db.INTERNE_COMPETITIE);
            zyq.naarZelfdePagina();
        });
}

async function competitieSelecteren() {
    const competities = document.getElementById("competitieSelecteren");
    (await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen)).forEach(
        function (team) {
            if (zyq.interneCompetitie(team.teamCode)) {
                competities.append(html.optie(team.teamCode, team.omschrijving));
            }
        });
    competities.value = zyq.o_o_o.competitie; // werkt uitsluitend na await
    competities.addEventListener("input",
        function () {
            sessionStorage.setItem("competitie", competities.value);
            sessionStorage.setItem("team", competities.value);
            zyq.naarZelfdePagina();
        });
}
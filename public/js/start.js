"use strict";

import * as db from "./db.js";
import * as html from "./html.js";

import * as zyq from "./zyq.js";

/*
    verwerk vereniging=[vereniging]
    of
    verwerk team=<teamCode>&competitie=<teamCode>
 */

(async function() {
    await zyq.init();
    document.getElementById("kop").innerHTML =
        zyq.o_o_o.vereniging + html.SCHEIDING + zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + zyq.teamVoluit(zyq.o_o_o.competitie);
    const plaatje = document.getElementById("plaatje");
    if (zyq.o_o_o.vereniging === "Waagtoren") {
        plaatje.append(html.plaatje("images/waagtoren.gif",60, 150, 123));
    }
    const menuKeuzes = [
        [db.IEDEREEN, `Ranglijst na ronde ${zyq.o_o_o.vorigeRonde}`,"ranglijst.html"], // menu0
        [db.IEDEREEN, `Uitslagen ronde ${zyq.o_o_o.vorigeRonde}`,"ronde.html"]]; // menu1
    if (zyq.o_o_o.huidigeRonde && zyq.o_o_o.ronde[zyq.o_o_o.huidigeRonde].resultaten === 0) { // indeling zonder resultaten)
        menuKeuzes.push([db.GEREGISTREERD, `Definitieve indeling ronde ${zyq.o_o_o.huidigeRonde}`, `ronde.html?ronde=${zyq.o_o_o.huidigeRonde}`]); // menu2
    } else if (zyq.o_o_o.vorigeRonde < zyq.o_o_o.laatsteRonde) {
        menuKeuzes.push([db.GEREGISTREERD, `Voorlopige indeling ronde ${zyq.o_o_o.huidigeRonde}`, "indelen.html"]); // menu2
    }
    menuKeuzes.push(
        [db.GEREGISTREERD, `Aanmelden / Afzeggen`, "agenda.html"], // menu3
        [db.BESTUUR, `Overzicht voor bestuur`, "bestuur.html"], // menu4
        [db.TEAMLEIDER, `Overzicht voor teamleiders`, "teamleider.html"]); // menu5
    for (let i = 0; i < 5; i++) {
        const [minimumRechten, tekst, naarPagina] = menuKeuzes[i];
        if (minimumRechten <= zyq.gebruiker.mutatieRechten ) {
            document.getElementById(`menu${i}`).append(html.naarPaginaEnTerug(naarPagina,tekst)); // menu0..5 op deze pagina
        }
    }
    menuKeuzes.push(
        [db.IEDEREEN, db.MENU],
        [db.GEREGISTREERD, "systeembeheer", "beheer.html"]);
    sessionStorage.setItem(db.MENU, JSON.stringify(menuKeuzes)); // algemeen menu voor de volgende pagina's
    await seizoenSelecteren(db.INTERNE_COMPETITIE);
    await competitieSelecteren();
})();

async function seizoenSelecteren(teamCode) {
    const seizoenen = (await zyq.localFetch("/seizoenen/" + teamCode)).map(function (seizoen) {
        return [seizoen, zyq.seizoenVoluit(seizoen)];
    });
    html.selectie(document.getElementById("seizoenSelecteren"), zyq.o_o_o.seizoen, seizoenen, function (seizoen) {
        html.zelfdePagina(`seizoen=${seizoen}&competitie=${db.INTERNE_COMPETITIE}&team=${db.INTERNE_COMPETITIE}`);
    });
}

async function competitieSelecteren() {
    const competities = (await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen)).filter(function (team) {
        return zyq.interneCompetitie(team.teamCode);
    }).map(function (team) {
        return [team.teamCode, team.omschrijving];
    });
    html.selectie(document.getElementById("competitieSelecteren"), zyq.o_o_o.competitie, competities, function (competitie) {
        html.zelfdePagina(`team=${competitie}&competitie=${competitie}`);
    });
}
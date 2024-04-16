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
    html.id("kop").textContent =
        `${zyq.o_o_o.vereniging}${html.SCHEIDING}${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}${html.SCHEIDING}${zyq.teamVoluit(zyq.o_o_o.competitie)}`;
    const plaatje = html.id("plaatje");
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
    if (zyq.gebruiker.mutatieRechten === db.IEDEREEN) { // indien niet geregistreerd
        menuKeuzes.push([db.IEDEREEN, "Aanmelden voor 0-0-0", "aanmelden.html"]);
    }
    menuKeuzes.push(
        [db.GEREGISTREERD, "Aanmelden / Afzeggen", "agenda.html"],
        [db.BESTUUR, "Overzicht voor bestuur", "bestuur.html"],
        [db.TEAMLEIDER, "Overzicht voor teamleiders", "teamleider.html"]);
    for (let i = 0; i < menuKeuzes.length; i++) {
        const [minimumRechten, tekst, naarPagina] = menuKeuzes[i];
        if (minimumRechten <= zyq.gebruiker.mutatieRechten ) {
            html.id(`menu${i}`).append(html.naarPaginaEnTerug(naarPagina,tekst)); // menu0..6 op deze pagina
        }
    }
    menuKeuzes.push(
        [db.IEDEREEN, db.MENU], // hier worden de menuKeuzes van andere pagina's tussengevoegd
        [db.GEREGISTREERD, "systeembeheer", "beheer.html"]);
    sessionStorage.setItem(db.MENU, JSON.stringify(menuKeuzes)); // algemeen menu voor de volgende pagina's
    console.log("--- hier 1 ---");
    await seizoenSelecteren(db.INTERNE_COMPETITIE);
    console.log("--- hier 2 ---");

    await competitieSelecteren();
    console.log("--- hier 3 ---");

})();

async function seizoenSelecteren(teamCode) {
    const seizoenen = (await zyq.localFetch(`/${zyq.o_o_o.clubCode}/seizoenen/${teamCode}`)).map(function (seizoen) {
        return [seizoen, zyq.seizoenVoluit(seizoen)];
    });
    html.selectie(html.id("seizoenSelecteren"), zyq.o_o_o.seizoen, seizoenen, function (seizoen) {
        html.zelfdePagina(`seizoen=${seizoen}&competitie=${db.INTERNE_COMPETITIE}&team=${db.INTERNE_COMPETITIE}`);
    });
}

// TODO zie o_o_o.js: teamSelecteren
async function competitieSelecteren() {
    const competities = (await zyq.localFetch(`/teams/${zyq.o_o_o.seizoen}`)).filter(function (team) {
        return zyq.interneCompetitie(team.teamCode);
    }).map(function (team) {
        return [team.teamCode, team.omschrijving];
    });
    html.selectie(html.id("competitieSelecteren"), zyq.o_o_o.competitie, competities, function (competitie) {
        html.zelfdePagina(`team=${competitie}&competitie=${competitie}`);
    });
}
"use strict";

import * as db from "./db.js";
import * as html from "./html.js";
import { o_o_o, init } from "./o_o_o.js";

import * as zyq from "./zyq.js";

/*
    verwerk vereniging=[vereniging]
    of
    verwerk team=<teamCode>&competitie=<teamCode>
 */

(async function() {
    await init();
    html.id("kop").textContent =
        `${o_o_o.vereniging}${html.SCHEIDING}${zyq.seizoenVoluit(o_o_o.seizoen)}${html.SCHEIDING}${db.teamVoluit(o_o_o.competitie)}`;
    const plaatje = html.id("plaatje");
    if (o_o_o.vereniging === "Waagtoren") {
        plaatje.append(html.plaatje("images/waagtoren.gif",60, 150, 123));
    }
    const menuKeuzes = [
        [db.IEDEREEN, `Ranglijst na ronde ${o_o_o.vorigeRonde}`,"ranglijst.html"], // menu0
        [db.IEDEREEN, `Uitslagen ronde ${o_o_o.vorigeRonde}`,"ronde.html"]]; // menu1
    /* TODO tijdelijk niet
    if (o_o_o.huidigeRonde && o_o_o.ronde[o_o_o.huidigeRonde].resultaten === 0) { // indeling zonder resultaten
        menuKeuzes.push([db.GEREGISTREERD, `Definitieve indeling ronde ${o_o_o.huidigeRonde}`, `ronde.html?ronde=${o_o_o.huidigeRonde}`]); // menu2
    } else if (o_o_o.vorigeRonde < o_o_o.laatsteRonde) {
        menuKeuzes.push([db.GEREGISTREERD, `Voorlopige indeling ronde ${o_o_o.huidigeRonde}`, "indelen.html"]); // menu2
    }
     */
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
    seizoenSelecteren(o_o_o.competitie);
    await competitieSelecteren();
})();

function seizoenSelecteren(teamCode) {
    const seizoenenSelectie = [];
    for (const seizoen of db.boom.eenClub(o_o_o.club).seizoen) {
        seizoenenSelectie.push([seizoen.seizoen, seizoen.seizoenTekst]);
    }
    html.selectie(html.id("seizoenSelecteren"), o_o_o.seizoen, seizoenenSelectie, function (seizoen) {
        html.zelfdePagina(`seizoen=${seizoen}&competitie=${db.INTERNE_COMPETITIE}&team=${db.INTERNE_COMPETITIE}`);
    });
}

// TODO zie o_o_o.js: teamSelecteren
async function competitieSelecteren() {
    const competities = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`)).filter(function (team) {
        return db.isCompetitie(team);
    }).map(function (team) {
        return [team.teamCode, team.omschrijving];
    });
    html.selectie(html.id("competitieSelecteren"), o_o_o.competitie, competities, function (competitie) {
        html.zelfdePagina(`team=${competitie}&competitie=${competitie}`);
    });
}
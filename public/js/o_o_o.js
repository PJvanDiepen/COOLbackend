/*
 * Deze module bevat code die op meer dan een pagina van de 0-0-0 app wordt toegepast.
 */

import * as html from "./html.js";

import * as zyq from "./zyq.js"; // TODO verwijderen

/**
 * teamSelecteren voor ranglijst.js en team.js
 *
 * @param teamCode team of competitie
 * @returns {Promise<void>}
 */
export async function teamSelecteren(teamCode) {
    const teams = (await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen)).filter(function (team) {
        return zyq.teamOfCompetitie(team.teamCode);
    }).map(function (team) {
        return [team.teamCode, zyq.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teams, function (team) {
        if (zyq.interneCompetitie(team)) {
            html.anderePagina(`ranglijst.html?competitie=${team}`);
        } else {
            html.anderePagina(`team.html?team=${team}`);
        }
    });
}

/**
 * rondeSelecteren voor ranglijst.js en ronde.js
 *
 * @param teamCode team of competitie
 * @param rondeNummer welke ronde
 * @returns {Promise<void>}
 */
export async function rondeSelecteren(teamCode, rondeNummer) {
    zyq.o_o_o.team = zyq.o_o_o.competitie;
    const ronden = (await zyq.localFetch("/ronden/" + zyq.o_o_o.seizoen + "/" + teamCode)).map(function (ronde) {
        return [ronde.rondeNummer, zyq.datumLeesbaar(ronde) + html.SCHEIDING + "ronde " + ronde.rondeNummer];
    });
    html.selectie(html.id("rondeSelecteren"), rondeNummer, ronden, function (ronde) {
        html.anderePagina(`ronde.html?ronde=${ronde}`);
    });
}
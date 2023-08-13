"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";
import {naarPagina} from "./html.js";

(async function() {
    await zyq.init();
    const andereGebruiker = Number(html.params.get("gebruiker")) || zyq.gebruiker.knsbNummer;
    const naam = html.params.get("naamGebruiker") || zyq.gebruiker.naam;
    document.getElementById("kop").append(`Agenda${html.SCHEIDING}${naam}`);
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await aanmelden(andereGebruiker, naam);
    await agenda(andereGebruiker, naam, document.getElementById("wedstrijden"));
})();

async function aanmelden(knsbNummer, naam) {
    console.log("aanmelden");
    const teams = await zyq.localFetch(`/teams/${zyq.o_o_o.seizoen}`);
    let intern = 0;
    for (const team of teams) {
        if (zyq.interneCompetitie(team.teamCode) ) { // if (speeltIntern(persoon, team.teamCode)) {
            document.getElementById(`aanmelden${++intern}`).append(naarPagina(
                `agenda.html?gebruiker=${knsbNummer}&gebruikerNaam=${naam}`,
                `Aanmelden ${zyq.teamVoluit(team.teamCode)}`));
        }
    }
}

/*
    verwerk gebruiker=<knsbNummer>
           &naamGebruiker=<naam>
           &team=<teamCode>
           &ronde=<rondeNummer>
           &partij=<partij>

    De agenda gaat uitsluitend over nog niet gespeelde wedstrijden in het huidige seizoen.

    In de agenda van een speler staan wedstrijden vastgelegd in uitslagen met partij = MEEDOEN, NIET_MEEDOEN, EXTERN_UIT of EXTERN_THUIS.
    De wedstrijden in de agenda staan op volgorde van datum, teamCode en rondeNummer.
    Per datum kunnen er verschillende competities / externe wedstrijden zijn (met een verschillende teamCode) en meer ronden.

    De rapid en snelschaak competitie kunnen per datum meer ronden hebben.
    De interne competitie, rapid competitie en snelschaak competitie zijn nooit op dezelfde datum.
    Tijdens een ronde van de interne competitie kunnen verschillende externe wedstrijden (uit of thuis) zijn.

    Een speler kan per datum meedoen in 1 competitie of meedoen in 1 externe wedstrijd of niet meedoen.

    Indien een externe wedstrijd meetelt voor de interne competitie (anderTeam = INTERNE_COMPETITIE)
    en de datum van de externe wedstrijd is de datum van een ronde van de interne competitie
    dan wordt dit vastgelegd in 2 uitslagen met 2 verschillende teamCode (van team en van INTERNE_COMPETITIE)
    en partij = EXTERN_UIT of EXTERN_THUIS.

 */
async function agenda(knsbNummer, naam, lijst) {
    const gewijzigd = await agendaMutatie(knsbNummer);
    let wedstrijden = await agendaLezen(knsbNummer);
    if (await agendaAanvullen(knsbNummer, wedstrijden)) {
        wedstrijden = await agendaLezen(knsbNummer);
    }
    let agendaLijst = false;
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (db.planningInvullen.has(w.partij)) {
            const datum = zyq.datumSQL(w.datum);
            const link = html.naarPagina(
                `agenda.html?gebruiker=${knsbNummer}&naamGebruiker=${naam}&team=${w.teamCode}&ronde=${w.rondeNummer}&datum=${datum}&partij=${w.partij}`,
                vinkjeInvullen.get(w.partij));
            html.rij(link,w.teamCode === gewijzigd.teamCode && w.rondeNummer === gewijzigd.rondeNummer);
            lijst.append(html.rij(
                zyq.datumLeesbaar(w),
                zyq.interneCompetitie(w.teamCode) ? w.rondeNummer : "",
                zyq.interneCompetitie(w.teamCode) ? zyq.teamVoluit(w.teamCode) : zyq.wedstrijdVoluit(w),
                link));
            agendaLijst = true;
        } else if (agendaLijst) {
            console.log("er kan nog geen uitslag zijn!")
            console.log(w);
        }
    }
}

async function agendaMutatie(knsbNummer) {
    const teamCode = html.params.get("team");
    const rondeNummer = Number(html.params.get("ronde"));
    const datum = html.params.get("datum");
    const partij = html.params.get("partij");
    if (teamCode && rondeNummer && datum && partij) {
        if (await zyq.serverFetch(`/${zyq.uuidToken}/planning/${zyq.ditSeizoen}/${teamCode}/${rondeNummer}/${knsbNummer}/${partij}/${datum}`)) {
            return {"teamCode": teamCode, "rondeNummer": rondeNummer};
        }
    }
    return {"teamCode": "", "rondeNummer": 0};
}

async function agendaLezen(knsbNummer) {
    return await zyq.serverFetch(`/${zyq.uuidToken}/kalender/${zyq.ditSeizoen}/${knsbNummer}`);
}

async function agendaAanvullen(knsbNummer, wedstrijden) {
    let aanvullingen = 0;
    for (const w of wedstrijden) {
        if (!w.partij) {
            const datum = zyq.datumSQL(w.datum);
            const vanafVandaag = datum >= zyq.datumSQL();
            if (vanafVandaag || zyq.interneCompetitie(w.teamCode)) {
                const partij = vanafVandaag ? db.PLANNING : db.AFWEZIG;  // voor interne competities voor vandaag afwezig invullen
                const competitie = zyq.interneCompetitie(w.teamCode) ? w.teamCode : db.INTERNE_COMPETITIE;
                const mutaties = await zyq.serverFetch(
                    `/${zyq.uuidToken}/uitslag/toevoegen/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${partij}/${datum}/${competitie}`);
                aanvullingen += mutaties;
            }
        }
    }
    return aanvullingen;
}

const vinkjeInvullen = new Map([
    [db.PLANNING, html.VRAAGTEKEN],
    [db.NIET_MEEDOEN, html.STREEP],
    [db.MEEDOEN, html.VINKJE],
    [db.EXTERN_THUIS, html.VINKJE],
    [db.EXTERN_UIT, html.VINKJE]]);
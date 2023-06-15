"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await agenda(
        document.getElementById("kop"),
        document.getElementById("wedstrijden"),
        document.getElementById("speler")
    );
})();

/*
    verwerk gebruiker=<andereGebruiker>
           &naamGebruiker=<naamGebruiker>
           &team=<teamCode>
           &ronde=<rondeNummer>
           &partij=[MEEDOEN of NIET_MEEDOEN]

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
async function agenda(kop, lijst, speler) {
    const andereGebruiker = Number(html.params.get("gebruiker")) || zyq.gebruiker.knsbNummer;
    const gewijzigd = await agendaMutatie(andereGebruiker);
    const naam = html.params.get("naamGebruiker") || zyq.gebruiker.naam;
    kop.append(`Agenda${html.SCHEIDING}${naam}`);
    let wedstrijden = await agendaLezen(andereGebruiker);
    if (await agendaAanvullen(andereGebruiker, wedstrijden)) {
        wedstrijden = await agendaLezen(andereGebruiker);
    }
    let agendaLijst = false;
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (db.agenda(w.partij)) {
            const teamleden = await zyq.serverFetch( // actuele situatie
                `/${zyq.uuidToken}/teamleden/${w.seizoen}/${w.teamCode}/${w.rondeNummer}`);
            const link = html.naarPagina(
                `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&team=${w.teamCode}&ronde=${w.rondeNummer}&datum=${zyq.datumSQL(w.datum)}&partij=${wijzig(w)}`,
                vinkje(w));
            html.rij(link,w.teamCode === gewijzigd.teamCode && w.rondeNummer === gewijzigd.rondeNummer);
            lijst.append(html.rij(
                zyq.interneCompetitie(w.teamCode) ? w.rondeNummer : "",
                zyq.datumLeesbaar(w),
                zyq.interneCompetitie(w.teamCode) ? zyq.teamVoluit(w.teamCode) : zyq.wedstrijdVoluit(w),
                teamleden.length,
                link));
            agendaLijst = true;
        } else if (agendaLijst) {
            console.log(w); // TODO er kan nog geen uitslag zijn!
        }
    }
    speler.append(html.naarPagina(`lid.html?lid=${andereGebruiker}`, `Teams en competities ${naam}`));
}

async function agendaMutatie(knsbNummer) {
    const teamCode = html.params.get("team");
    const rondeNummer = Number(html.params.get("ronde"));
    const datum = html.params.get("datum");
    const partij = html.params.get("partij");
    if (teamCode && rondeNummer && datum && partij) {
        if (await zyq.serverFetch(`/${zyq.uuidToken}/aanwezig/${zyq.ditSeizoen}/${teamCode}/${rondeNummer}/${knsbNummer}/${datum}/${partij}`)) {
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
            /*
            TODO voor interne competities bij gespeelde ronden afwezig invullen en daarna niet meedoen invullen
            uitsluitend nodig op de datum dat er meer ronden op 1 dag zijn
            op andere dagen is vergelijken met de datum van vandaag voldoende
            uitzoeken wat de meest actuele competititie (ook voor start.html)
             */
            // console.log('--- deze wedstrijd invullen ----');
            // console.log(w);
            const datum = zyq.datumSQL(w.datum);
            const vanafVandaag = datum >= zyq.datumSQL();
            // voor interne competities voor vandaag afwezig invullen en vanafVandaag altijd niet meedoen invullen
            if (vanafVandaag || zyq.interneCompetitie(w.teamCode)) {
                const afwezig = vanafVandaag ? db.NIET_MEEDOEN : db.AFWEZIG;
                const competitie = zyq.interneCompetitie(w.teamCode) ? w.teamCode : db.INTERNE_COMPETITIE;
                const mutaties = await zyq.serverFetch(
                    `/${zyq.uuidToken}/agenda/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${afwezig}/${datum}/${competitie}`);
                aanvullingen += mutaties;
            }
        }
    }
    return aanvullingen;
}

function wijzig(w) {
    if (w.partij === db.NIET_MEEDOEN) {
        return db.MEEDOEN;
    } else if (w.partij === db.MEEDOEN) {
        return db.NIET_MEEDOEN;
    } else if (w.teamCode === w.anderTeam) { // indien EXTERN_THUIS of EXTERN_UIT dan geen interne ronde
        return db.MEEDOEN;
    } else { // indien EXTERN_THUIS of EXTERN_UIT
        return db.NIET_MEEDOEN;
    }
}

function vinkje(w) {
    if (w.partij === db.NIET_MEEDOEN) {
        return zyq.STREEP;
    } else if (w.partij === db.MEEDOEN) {
        return zyq.VINKJE;
    } else if (w.teamCode === w.anderTeam) { // indien EXTERN_THUIS of EXTERN_UIT dan geen interne ronde
        return zyq.STREEP;
    } else { // indien EXTERN_THUIS of EXTERN_UIT
        return zyq.VINKJE;
    }
}
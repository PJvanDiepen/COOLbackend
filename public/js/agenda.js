"use strict";

menu(naarRanglijst,
    [8, `agenda van ${speler ? naamSpeler : "nog te selecteren speler"}`, function () {
        if (speler) {
            naarAnderePagina(`agenda.html?gebruiker=${speler}&naamGebruiker=${naamSpeler}`);
        }
    }],
    naarGebruiker,
    terugNaar);
if (uuidToken) {
    agenda(document.getElementById("kop"), document.getElementById("wedstrijden"));
    mogelijkeTegenstanders(document.getElementById("tabel"));
} else {
    naarAnderePagina("gebruiker.html");
}

const VINKJE = "\u00a0\u00a0✔\u00a0\u00a0";
const STREEP = "___";

async function agenda(kop, lijst) {
    const gebruiker = params.get("gebruiker") || await knsbNummerGebruiker();
    await agendaMutatie(gebruiker);
    const naam = params.get("naamGebruiker") || await naamGebruiker();
    kop.innerHTML = "Agenda" + SCHEIDING + naam;
    let wedstrijden = await agendaLezen(gebruiker);
    if (await agendaAanvullen(gebruiker, wedstrijden)) {
        wedstrijden = await agendaLezen(gebruiker);
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (w.partij === MEEDOEN || w.partij === NIET_MEEDOEN) {
            const deelnemers = await serverFetch(`/deelnemers/${w.seizoen}/${w.teamCode}/${w.rondeNummer}`);
            console.log(deelnemers);
            const partij = w.partij === MEEDOEN ? NIET_MEEDOEN : MEEDOEN;
            const aanwezig = w.partij === MEEDOEN ? VINKJE : STREEP;
            lijst.appendChild(htmlRij(
                w.rondeNummer,
                datumLeesbaar(w.datum),
                deelnemers.length,
                htmlLink(
                    `agenda.html?gebruiker=${gebruiker}&naamGebruiker=${naam}&teamCode=${w.teamCode}&ronde=${w.rondeNummer}&partij=${partij}`,
                    aanwezig)));
        }
    }
}

async function agendaMutatie(knsbNummer) {
    const partij = params.get("partij");
    if (partij) {
        await serverFetch(`/${uuidToken}/partij/${ditSeizoen()}/${teamCode}/${rondeNummer}/${knsbNummer}/${partij}`);
    }
}

async function agendaLezen(knsbNummer) {
    return await serverFetch(`/agenda/${ditSeizoen()}/${knsbNummer}`);
}

async function agendaAanvullen(knsbNummer, wedstrijden) {
    let aanvullingen = 0;
    for (const w of wedstrijden) {
        if (!w.partij) {
            const afwezig = datumLater(w.datum) ? NIET_MEEDOEN : AFWEZIG;
            const mutaties = await serverFetch(
                `/${uuidToken}/agenda/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${afwezig}/${datumSQL(w.datum)}/int`);
            aanvullingen += mutaties;
        }
    }
    return aanvullingen;
}

function mogelijkeTegenstanders(lijst) {
    console.log("mogelijkeTegenstanders");
}
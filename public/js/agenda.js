"use strict";

menu(naarRanglijst,
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
    kop.innerHTML = ["Agenda", await naamGebruiker()].join(SCHEIDING);
    const gebruiker = await knsbNummerGebruiker();
    if (await agendaMutatie(gebruiker)) {
        agendaVerwijderen(gebruiker);
    }
    let wedstrijden = await agendaLezen(gebruiker);
    if (await agendaAanvullen(gebruiker, wedstrijden)) {
        agendaVerwijderen(gebruiker);
        wedstrijden = await agendaLezen(gebruiker);
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (w.partij === MEEDOEN || w.partij === NIET_MEEDOEN) {
            const partij = w.partij === MEEDOEN ? NIET_MEEDOEN : MEEDOEN;
            const aanwezig = w.partij === MEEDOEN ? VINKJE : STREEP;
            lijst.appendChild(htmlRij(
                w.rondeNummer,
                datumLeesbaar(w.datum),
                htmlLink(`agenda.html?teamCode=${w.teamCode}&ronde=${w.rondeNummer}&partij=${partij}`, aanwezig)));
        }
    }
}

async function agendaMutatie(knsbNummer) {
    const partij = params.get("partij");
    let mutaties = 0;
    if (partij) {
        mutaties = await serverFetch(
            `/${uuidToken}/partij/${seizoen}/${teamCode}/${rondeNummer}/${knsbNummer}/${partij}`);
    }
    return mutaties; // werkt uitsluitend na await
}

function agendaVerwijderen(knsbNummer) {
    sessionStorage.removeItem(`/agenda/${ditSeizoen()}/${knsbNummer}`);
}

async function agendaLezen(knsbNummer) {
    const wedstrijden = [];
    await mapAsync(`/agenda/${ditSeizoen()}/${knsbNummer}`,
        function (wedstrijd) {
            wedstrijden.push(wedstrijd);
        });
    return wedstrijden; // werkt uitsluitend na await
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
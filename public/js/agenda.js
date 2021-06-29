"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarBeheer,
        naarRanglijst,
        naarGebruiker,
        terugNaar);
    agenda(document.getElementById("kop"), document.getElementById("wedstrijden"));
    mogelijkeTegenstanders(document.getElementById("tabel"));
})();

async function agenda(kop, lijst) {
    const andereGebruiker = params.get("gebruiker") || gebruiker.knsbNummer;
    await agendaMutatie(andereGebruiker);
    const naam = params.get("naamGebruiker") || gebruiker.naam;
    kop.innerHTML = "Agenda" + SCHEIDING + naam;
    let wedstrijden = await agendaLezen(andereGebruiker);
    if (await agendaAanvullen(andereGebruiker, wedstrijden)) {
        wedstrijden = await agendaLezen(andereGebruiker);
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (w.partij === MEEDOEN || w.partij === NIET_MEEDOEN) {
            const deelnemers = await serverFetch(`/deelnemers/${w.seizoen}/${w.teamCode}/${w.rondeNummer}`);
            const partij = w.partij === MEEDOEN ? NIET_MEEDOEN : MEEDOEN;
            const aanwezig = w.partij === MEEDOEN ? VINKJE : STREEP;
            lijst.appendChild(htmlRij(
                w.rondeNummer,
                datumLeesbaar(w.datum),
                deelnemers.length,
                htmlLink(
                    `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&teamCode=${w.teamCode}&ronde=${w.rondeNummer}&partij=${partij}`,
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
    // TODO voor bepaalde ronde (zie vorige TODO)
    console.log("mogelijkeTegenstanders");
}
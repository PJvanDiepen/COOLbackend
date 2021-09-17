"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarIndelen,
        naarRanglijst,
        naarGebruiker,
        naarBeheer);
    wedstrijdSelecteren(document.getElementById("extern"));
    agenda(document.getElementById("kop"), document.getElementById("wedstrijden"));
})();

async function wedstrijdSelecteren(wedstrijden) {
    wedstrijden.appendChild(htmlOptie("eigen", "wedstrijden van eigen team(s)"));
    wedstrijden.appendChild(htmlOptie("inval", "wedstrijden van eigen en invalteam(s)"));
    wedstrijden.appendChild(htmlOptie("alle", "wedstrijden van alle teams"));
    wedstrijden.value = params.get("wedstrijden") || "eigen";
    wedstrijden.addEventListener("input",
        function () {
            naarZelfdePagina("?wedstrijden=" + wedstrijden.value);
        });
}

async function agenda(kop, lijst) {
    const andereGebruiker = Number(params.get("gebruiker")) || gebruiker.knsbNummer;
    const [teamGewijzigd, rondeGewijzigd ] = await agendaMutatie(andereGebruiker);
    const naam = params.get("naamGebruiker") || gebruiker.naam;
    kop.innerHTML = "Agenda" + SCHEIDING + naam;
    let wedstrijden = await agendaLezen(andereGebruiker);
    if (await agendaAanvullen(andereGebruiker, wedstrijden)) {
        wedstrijden = await agendaLezen(andereGebruiker);
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (w.partij === MEEDOEN || w.partij === NIET_MEEDOEN) {
            const deelnemers = await serverFetch(`/${uuidToken}/deelnemers/${w.seizoen}/${w.teamCode}/${w.rondeNummer}`); // actuele situatie
            const partij = w.partij === MEEDOEN ? NIET_MEEDOEN : w.partij === NIET_MEEDOEN ? MEEDOEN : w.partij;
            const aanwezig = w.partij === MEEDOEN ? VINKJE : w.partij === NIET_MEEDOEN ? STREEP : FOUTJE;
            const link = htmlLink(
                `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&team=${w.teamCode}&ronde=${w.rondeNummer}&partij=${partij}`, aanwezig);
            if (w.teamCode === teamGewijzigd && w.rondeNummer === rondeGewijzigd) {
                link.className += "verwerkt"; // kan ook met classList.add("gewijzigd")
            }
            lijst.appendChild(htmlRij(
                w.teamCode === INTERNE_COMPETITIE ? w.rondeNummer : "",
                datumLeesbaar(w.datum),
                w.teamCode === INTERNE_COMPETITIE ? "interne competitie" : wedstrijdVoluit(w),
                deelnemers.length,
                link));
        }
    }
}

async function agendaMutatie(knsbNummer) {
    const teamCode = params.get("team");
    const rondeNummer = Number(params.get("ronde"));
    const partij = params.get("partij");
    if (teamCode && rondeNummer && partij) {
        await serverFetch(`/${uuidToken}/partij/${ditSeizoen()}/${teamCode}/${rondeNummer}/${knsbNummer}/${partij}`);
    }
    return [teamCode, rondeNummer];
}

async function agendaLezen(knsbNummer) {
    return await serverFetch(`/${uuidToken}/kalender/${ditSeizoen()}/${knsbNummer}`);
}

async function agendaAanvullen(knsbNummer, wedstrijden) {
    let aanvullingen = 0;
    for (const w of wedstrijden) {
        if (!w.partij) {
            const afwezig = datumSQL(w.datum) > datumSQL() ? NIET_MEEDOEN : AFWEZIG;
            const mutaties = await serverFetch(
                `/${uuidToken}/agenda/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${afwezig}/${datumSQL(w.datum)}/int`);
            aanvullingen += mutaties;
        }
    }
    return aanvullingen;
}
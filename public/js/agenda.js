"use strict";

(async function() {
    await gebruikerVerwerken();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    agenda(document.getElementById("kop"), document.getElementById("wedstrijden"));
})();

/*
    verwerk gebruiker=[andereGebruiker]&naamGebruiker=[naamGebruiker]&team=teamCode&ronde=rondeNummer&partij=[MEEDOEN of NIET_MEEDOEN]
 */
async function agenda(kop, lijst) {
    const andereGebruiker = Number(params.get("gebruiker")) || gebruiker.knsbNummer;
    const gewijzigd = await agendaMutatie(andereGebruiker);
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
            const link = htmlVerwerkt(htmlLink(
                `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&team=${w.teamCode}&ronde=${w.rondeNummer}&partij=${partij}`, aanwezig),
                w.teamCode === gewijzigd.teamCode && w.rondeNummer === gewijzigd.rondeNummer);
            lijst.appendChild(htmlRij(
                w.teamCode === INTERNE_COMPETITIE ? w.rondeNummer : "",
                datumLeesbaar(w.datum),
                w.teamCode === INTERNE_COMPETITIE ? "interne competitie" : wedstrijdVoluit(w), // TODO of teamVoluit ?
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
        await serverFetch(`/${uuidToken}/partij/${ditSeizoen}/${teamCode}/${rondeNummer}/${knsbNummer}/${partij}`);
    }
    return {"teamCode": teamCode, "rondeNummer": rondeNummer};
}

async function agendaLezen(knsbNummer) {
    return await serverFetch(`/${uuidToken}/kalender/${ditSeizoen}/${knsbNummer}`);
}

async function agendaAanvullen(knsbNummer, wedstrijden) {
    let aanvullingen = 0;
    for (const w of wedstrijden) {
        if (!w.partij) {
            if (datumSQL(w.datum) > datumSQL() || w.teamCode === INTERNE_COMPETITIE) { // uitsluitend voor interne competitie afwezig invullen
                const afwezig = datumSQL(w.datum) > datumSQL() ? NIET_MEEDOEN : AFWEZIG; // wel altijd niet meedoen invullen
                const mutaties = await serverFetch(
                    `/${uuidToken}/agenda/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${afwezig}/${datumSQL(w.datum)}/int`);
                aanvullingen += mutaties;
            }
        }
    }
    return aanvullingen;
}
"use strict";

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    agenda(document.getElementById("kop"), document.getElementById("wedstrijden"));
})();

/*
    verwerk gebruiker=<andereGebruiker>
           &naamGebruiker=<naamGebruiker>
           &team=<teamCode>
           &ronde=<rondeNummer>
           &partij=[MEEDOEN of NIET_MEEDOEN]
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
        if (w.partij === MEEDOEN || w.partij === NIET_MEEDOEN || w.partij === EXTERN_THUIS || w.partij === EXTERN_UIT) {
            const deelnemers = await serverFetch( // actuele situatie
                `/${uuidToken}/deelnemers/${w.seizoen}/${w.teamCode}/${w.rondeNummer}`);
            const partij = w.partij === NIET_MEEDOEN ? MEEDOEN : NIET_MEEDOEN;
            const link = htmlLink( // TODO gebruiker en naamGebruiker anders doorgeven
                `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&team=${w.teamCode}&ronde=${w.rondeNummer}&datum=${datumSQL(w.datum)}&partij=${partij}`,
                w.partij === NIET_MEEDOEN ? STREEP : VINKJE);
            htmlVerwerkt(link,w.teamCode === gewijzigd.teamCode && w.rondeNummer === gewijzigd.rondeNummer);
            lijst.appendChild(htmlRij(
                interneCompetitie(w.teamCode) ? w.rondeNummer : "",
                datumLeesbaar(w),
                interneCompetitie(w.teamCode) ? teamVoluit(w.teamCode) : wedstrijdVoluit(w),
                deelnemers.length,
                link));
        }
    }
}

/*
    verwerk gebruiker=<andereGebruiker>&naamGebruiker=<naamGebruiker>&team=<teamCode>&ronde=<rondeNummer>&partij=[MEEDOEN of NIET_MEEDOEN]
 */
async function agendaMutatie(knsbNummer) {
    const teamCode = params.get("team");
    const rondeNummer = Number(params.get("ronde"));
    const datum = params.get("datum");
    const partij = params.get("partij");
    if (teamCode && rondeNummer && partij) {
        await serverFetch(`/${uuidToken}/aanwezig/${ditSeizoen}/${teamCode}/${rondeNummer}/${knsbNummer}/${datum}/${partij}`);
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
            const datum = datumSQL(w.datum);
            const vanafVandaag = datum >= datumSQL();
            // voor interne competities voor vandaag afwezig invullen en vanafVandaag altijd niet meedoen invullen
            if (vanafVandaag || interneCompetitie(w.teamCode)) {
                const afwezig = vanafVandaag ? NIET_MEEDOEN : AFWEZIG;
                const competitie = interneCompetitie(w.teamCode) ? w.teamCode : INTERNE_COMPETITIE;
                const mutaties = await serverFetch(
                    `/${uuidToken}/agenda/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${afwezig}/${datum}/${competitie}`);
                aanvullingen += mutaties;
            }
        }
    }
    return aanvullingen;
}
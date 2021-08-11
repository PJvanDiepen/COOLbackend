"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarBeheer,
        naarRanglijst,
        naarGebruiker,
        terugNaar);
    wedstrijdSelecteren(document.getElementById("extern"));
    agenda(document.getElementById("kop"), document.getElementById("wedstrijden"), document.getElementById("tabel"));
})();

async function wedstrijdSelecteren(wedstrijden) {
    wedstrijden.appendChild(htmlOptie("eigen", "wedstrijden van eigen team(s)"));
    wedstrijden.appendChild(htmlOptie("inval", "wedstrijden van eigen en invalteam(s)"));
    wedstrijden.appendChild(htmlOptie("alle", "westrijden van alle teams"));
    wedstrijden.value = params.get("wedstrijden") || "eigen";
    wedstrijden.addEventListener("input",
        function () {
            naarZelfdePagina("?wedstrijden=" + wedstrijden.value);
        });
}

async function agenda(kop, lijst, deelnemersLijst) {
    const andereGebruiker = Number(params.get("gebruiker")) || gebruiker.knsbNummer;
    await agendaMutatie(andereGebruiker);
    const naam = params.get("naamGebruiker") || gebruiker.naam;
    kop.innerHTML = "Agenda" + SCHEIDING + naam;
    let wedstrijden = await agendaLezen(andereGebruiker);
    if (await agendaAanvullen(andereGebruiker, wedstrijden)) {
        wedstrijden = await agendaLezen(andereGebruiker);
    }
    let volgendeRonde = 0;
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        console.log(w);
        if (w.partij === MEEDOEN || w.partij === NIET_MEEDOEN) {
            const deelnemers = await serverFetch(`/deelnemers/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${MEEDOEN}`);
            const partij = w.partij === MEEDOEN ? NIET_MEEDOEN : MEEDOEN;
            const aanwezig = w.partij === MEEDOEN ? VINKJE : STREEP;
            lijst.appendChild(htmlRij(
                w.teamCode === INTERNE_COMPETITIE ? w.rondeNummer : "",
                datumLeesbaar(w.datum),
                w.teamCode === INTERNE_COMPETITIE ? "interne competitie" : wedstrijdVoluit(w),
                deelnemers.length,
                htmlLink(
                    `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&teamCode=${w.teamCode}&ronde=${w.rondeNummer}&partij=${partij}`,
                    aanwezig)));
            if (!volgendeRonde && deelnemers.length) {
                volgendeRonde = w.rondeNummer;
            }
        }
    }
    mogelijkeTegenstanders(deelnemersLijst, andereGebruiker, volgendeRonde);
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

async function mogelijkeTegenstanders(lijst, knsbNummer, rondeNummer) {
    const deelnemers = await serverFetch(`/deelnemers/${ditSeizoen()}/${INTERNE_COMPETITIE}/${rondeNummer}/${MEEDOEN}`);
    const s = spelerTotalen(await spelerUitRanglijst(ditSeizoen(), knsbNummer));
    const tegenstanders = await spelersUitRanglijst(ditSeizoen(), deelnemers);
    for (const tegenstander of tegenstanders) {
        if (s.knsbNummer !== tegenstander.knsbNummer) {
            const t = spelerTotalen(tegenstander);
            lijst.appendChild(htmlRij(
                naarSpeler(t.knsbNummer, t.naam),
                s.kleur(t),
                t.punten() - s.punten(), // afstand
                s.tegen(t, rondeNummer) ? "" : KRUISJE));  // artikel 3
        }
    }
}
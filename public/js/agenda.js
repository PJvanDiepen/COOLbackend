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

async function agenda(kop, lijst) {
    kop.innerHTML = ["Agenda", await naamGebruiker()].join(SCHEIDING);
    const gebruiker = await knsbNummerGebruiker();
    if (agendaMutatie()) {
        agendaVerwijderen(gebruiker);
    }
    let wedstrijden = await agendaLezen(gebruiker);
    if (await agendaAanvullen(gebruiker, wedstrijden)) {
        agendaVerwijderen(gebruiker);
        wedstrijden = await agendaLezen(gebruiker);
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        console.log(w);
        if (w.resultaat !== WINST && w.resultaat !== REMISE && w.resultaat !== VERLIES) {
            const partij = w.partij === AFGEZEGD ? INTERNE_PARTIJ : AFGEZEGD;
            const aanwezig = w.partij === AFGEZEGD ? "afgezegd" : VINKJE;
            lijst.appendChild(htmlRij(
                w.rondeNummer,
                datumLeesbaar(w.datum),
                htmlLink(`agenda.html?teamCode=${w.teamCode}&rondeNummer=${w.rondeNummer}&partij=${partij}`, aanwezig)));
        }
    }
}

function agendaMutatie() {
    const partij = params.get("partij");
    let mutaties = 0;
    if (partij) {
        console.log("agendaMutatie");
        /*
        TODO
        patch uitslag partij = i, e of a
            uuidToken
            seizoen = ditSeizoen()
            teamCode = parameter
            rondeNummer = parameter
            knsbNummer = knsbNummerGebruiker()
         */
    }
    return mutaties;
}

function agendaVerwijderen(gebruiker) {
    console.log("agendaVerwijderen");
    sessionStorage.removeItem(`/agenda/${ditSeizoen()}/${gebruiker}`);
}

async function agendaLezen(gebruiker) {
    const wedstrijden = [];
    await mapAsync("/agenda/" + ditSeizoen() + "/" + gebruiker,
        function (wedstrijd) {
            wedstrijden.push(wedstrijd);
        });
    return wedstrijden; // werkt uitsluitend na await
}

async function agendaAanvullen(gebruiker, wedstrijden) {
    console.log("agendaAanvullen");
    let aanvullingen = 0;
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (!w.partij) {
            console.log(w);
            const mutaties = await serverFetch(
                `/${uuidToken}/afwezig/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${gebruiker}/${datumSQL(w.datum)}/int`);
            aanvullingen += mutaties;
        }
    }
    return aanvullingen;
}

function mogelijkeTegenstanders(lijst) {

}
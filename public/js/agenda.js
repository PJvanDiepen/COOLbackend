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

async function agenda(kop, lijst) {
    kop.innerHTML = ["Agenda", await naamGebruiker()].join(SCHEIDING);
    if (agendaMutatie()) {
        agendaVerwijderen();
    }
    const gebruiker = await knsbNummerGebruiker();
    let wedstrijden = await agendaLezen(gebruiker);
    if (await agendaAanvullen(gebruiker, wedstrijden)) {
        agendaVerwijderen();
        wedstrijden = await agendaLezen(gebruiker);
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        console.log(w);
        if (true) { // TODO reeds gespeelde ronde overslaan
            /*
            TODO
            if (ronde.resultaat !== WINST && ronde.resultaat !== REMISE && ronde.resultaat !== VERLIES) {
            htmlLink naar agenda.html?teamCode= &rondeNummer= &partij= i, e, of a
             */
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

function agendaVerwijderen() {
    console.log("agendaVerwijderen");
    /*
    TODO
    verwijder localStorage, die werd ingelezen door agendaLezen()
     */
}

async function agendaLezen(gebruiker) {
    const wedstrijden = [];
    await mapAsync("/agenda/" + ditSeizoen() + "/" + gebruiker,
        function (wedstrijd) {
            wedstrijden.push(wedstrijd);
        });
    return wedstrijden; // werkt uitsluitend na await
}

function agendaAanvullen(gebruiker, wedstrijden) {
    console.log("agendaAanvullen");
    let aanvullingen = 0;
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        if (!w.partij) {
            console.log(w);
            /*
            TODO
            insert uitslag met partij = a
                router.get('/:uuidToken/afwezig/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:datum/:anderTeam', async function (ctx) {

             */
            if (false) { // TODO uitslag is toegevoegd
                aanvullingen++;
            }
        }
    }
    return aanvullingen;
}

function mogelijkeTegenstanders(lijst) {

}
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

function agenda(kop, lijst) {
    if (agendaMutatie()) {
        agendaVerwijderen();
    }
    let wedstrijden = agendaLezen();
    if (agendaAanvullen(wedstrijden)) {
        agendaVerwijderen();
        wedstrijden = agendaLezen();
    }
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        console.log(w);
        if (true) { // TODO reeds gespeelde ronde overslaan
            /*
            TODO
            htmlLink naar agenda.html?teamCode= &rondeNummer= &partij= i, e,of a
             */
        }
    }
}

function agendaMutatie() {
    const partij = params.get("partij");
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
        return true; // TODO indien gelukt
    } else {
        return false;
    }
}

function agendaVerwijderen() {
    console.log("agendaVerwijderen");
    /*
    TODO
    verwijder localStorage, die werd ingelezen door agendaLezen()
     */
}

function agendaLezen() {
    console.log("agendaLezen");
    /*
    TODO
    lees speler
        seizoen = ditSeizoen()
        knsbNummer = knsbNummerGebruiker()
    lees ronde
        seizoen = speler.seizoen
        teamCode = 'int' or speler.knsbTeam or speler.nhsbTeam
    left join uitslag
        seizoen = speler.seizoen
        teamCode = ronde.teamCode
        rondeNummer = ronde.rondeNummer
        knsbNummer = speler.knsbNummer
     */
}

function agendaAanvullen(wedstrijden) {
    console.log("agendaAanvullen");
    let aanvullingen = 0;
    for (const w of wedstrijden) { // verwerk ronde / uitslag
        console.log(w);
        if (true) { // TODO indien w.partij ontbreekt
            /*
            TODO
            insert uitslag met partij = a
             */
            if (true) { // TODO uitslag is toegevoegd
                aanvullingen++;
            }
        }
    }
    return aanvullingen > 0;
}

function mogelijkeTegenstanders(lijst) {

}
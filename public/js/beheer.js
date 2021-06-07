"use strict";

menu(naarAgenda,
    naarRanglijst,
    [9, "Arie Boots / mutatieRechten = 1", function () {
        sessionStorage.setItem("uuidToken", "d94400be-adb3-11eb-947d-7c0507c81823");
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [9, "Aad Schuit / mutatieRechten = 0", function () {
        sessionStorage.setItem("uuidToken", "1eb9375f-adb9-11eb-947d-7c0507c81823");
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [9, "onbekend / mutatieRechten = 0", function () {
        sessionStorage.setItem("uuidToken", "f77cf407-af70-11eb-947d-7c0507c81823");
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    terugNaar);
gebruikers(document.getElementById("gebruikers"));
laatsteMutaties(document.getElementById("mutaties"))

async function gebruikers(lijst) {
    const gebruikers = await serverFetch("/gebruikers");
    for (const gebruiker of gebruikers) {
        console.log(gebruiker);
        lijst.appendChild(htmlRij(
            gebruiker.datumEmail ? datumLeesbaar(gebruiker.datumEmail) : "AANVRAAG",
            gebruiker.knsbNummer,
            gebruiker.naam));
    }
}

async function laatsteMutaties(lijst) {
    const mutaties = await serverFetch("/mutaties/0/9/100"); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
        console.log(mutatie);
        lijst.appendChild(htmlRij(
            tijdGeleden(mutatie.tijdstip),
            mutatie.knsbNummer === vorige ? "" : mutatie.knsbNummer,
            mutatie.knsbNummer === vorige ? "" : mutatie.naam,
            mutatie.url,
            mutatie.aantal,
            mutatie.invloed));
        vorige = mutatie.knsbNummer;
    }
}
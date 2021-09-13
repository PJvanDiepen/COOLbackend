"use strict";

/*
TODO mutaties per gebruiker afsplitsen
TODO mutaties met filters
TODO mutaties met verwijderen
 */

(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        naarIndelen,
        naarRanglijst,
        naarGebruiker,
        [BEHEERDER, `backup uitslag seizoen =  ${seizoen}`, async function () {
            await backup("uitslag");
        }]);
    gebruikers(document.getElementById("gebruikers"));
    laatsteMutaties(document.getElementById("mutaties"));
    document.getElementById("computer").appendChild(
        htmlTekst(`Operating System: ${navigator.platform} Browser: ${navigator.vendor}`));  // TODO client hints
})();

async function backup(tabel) {
    const rij = await serverFetch(`/backup/${tabel}/${seizoen}`);
    console.log(rij[0]);
    for (const [key, value] of Object.entries(rij[0])) {
        console.log(`${key}: ${value} typeof ${typeof value}`);
    }
}

async function gebruikers(lijst) {
    const leden = await serverFetch(`/${uuidToken}/gebruikers`);
    for (const lid of leden) {
        lijst.appendChild(htmlRij(
            naarSpeler(lid.knsbNummer, lid.naam),
            gebruiker.mutatieRechten === BEHEERDER ? gebruikerEmailSturen(lid) : lid.email,
            gebruikerFunctie(lid)));
    }
}

function gebruikerEmailSturen(lid) {
    return htmlLink(`email.html?speler=${lid.knsbNummer}&email=${lid.email}`, lid.email);
}

// TODO email corrigeren
// TODO gebruiker hoger of lagere functie geven

function gebruikerFunctie(lid) {
    if (!lid.datumEmail) {
        return KRUISJE; // TODO eventueel verwijderen
    } else if (Number(lid.mutatieRechten) === GEREGISTREERD) {
        return datumLeesbaar(lid.datumEmail);
    } else if (Number(lid.mutatieRechten) === BEHEERDER) {
        return "systeembeheerder";
    } else if (Number(lid.mutatieRechten) === WEDSTRIJDLEIDER) {
        return "wedstrijdleider";
    } else if (Number(lid.mutatieRechten) === TEAMLEIDER) {
        return "teamleider";
    } else if (Number(lid.mutatieRechten) === BESTUUR) {
        return "bestuur";
    } else {
        return "???"
    }
}

async function laatsteMutaties(lijst) {
    const mutaties = await serverFetch(`/${uuidToken}/mutaties/0/9/100`); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
        lijst.appendChild(htmlRij(
            tijdGeleden(mutatie.tijdstip),
            mutatie.knsbNummer === vorige ? "" : naarSpeler(mutatie.knsbNummer, mutatie.naam),
            mutatie.knsbNummer === vorige ? "" : mutatie.knsbNummer,
            mutatie.url,
            mutatie.aantal,
            mutatie.invloed));
        vorige = mutatie.knsbNummer;
    }
}
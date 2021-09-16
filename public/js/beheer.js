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
        htmlTekst(`0-0-0.nl versie 0.5.8 met operating system: ${navigator.platform} en browser: ${navigator.vendor}`));  // TODO client hints
})();      // TODO 0-0-0 versie uit package.json

async function backup(tabel) {
    const rij = await serverFetch(`/backup/${tabel}/${seizoen}`);
    console.log(rij[0]);
    for (const [key, value] of Object.entries(rij[0])) {
        console.log(`${key}: ${value}  [ ${valueSQL(value)} ]`);
        if (typeof value === "string") {
            let x = new Date(value);
            if (x instanceof Date && !isNaN(x)) {
                console.log("Date");
            }
        }
    }
}

/*
insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2021', 'int', '1', '0', '101', 'a', '', '0', '', '2020-08-25', 'int'),
 */
function valueSQL(value) {
    if (typeof value === "string") {
        const datum = new Date(value);
        if (datum instanceof Date && !isNaN(datum)) {
            return `[ "${datumSQL(value)}" ]`;
        } else {
            return `[ "${value}" ]`;
        }
    } else if (typeof value === "number") {
        return value;
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
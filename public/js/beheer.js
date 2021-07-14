"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        naarRanglijst,
        terugNaar);
    gebruikers(document.getElementById("gebruikers"));
    laatsteMutaties(document.getElementById("mutaties"));
    document.getElementById("computer").appendChild(
        htmlTekst(`Operating System: ${navigator.platform} Browser: ${navigator.vendor}`));
    showEstimatedQuota();
})();

// https://dexie.org/docs/StorageManager
async function showEstimatedQuota() {
    if (navigator.storage && navigator.storage.estimate) {
        const estimation = await navigator.storage.estimate();
        console.log(`Quota: ${estimation.quota}`);
        console.log(`Usage: ${estimation.usage}`);
    } else {
        console.error("StorageManager not found");
    }
}

async function gebruikers(lijst) {
    const leden = await serverFetch(`/${uuidToken}/gebruikers`);
    for (const lid of leden) {
        lijst.appendChild(htmlRij(
            lid.naam,
            gebruiker.mutatieRechten === BEHEERDER ? htmlLink(`email.html?speler=${lid.knsbNummer}`, lid.email) : lid.email,
            gebruikerRol(lid)));
    }
}

function gebruikerRol(lid) {
    if (lid.datumEmail && Number(lid.mutatieRechten) === GEREGISTREERD) {
        return datumLeesbaar(lid.datumEmail);
    } else if (lid.datumEmail && Number(lid.mutatieRechten) === BEHEERDER) {
        return "systeembeheerder";
    } else if (lid.datumEmail && Number(lid.mutatieRechten) === WEDSTRIJDLEIDER) {
        return "wedstrijdleider";
    } else {
        return KRUISJE;
    }
}

async function laatsteMutaties(lijst) {
    const mutaties = await serverFetch(`/${uuidToken}/mutaties/0/9/100`); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
        lijst.appendChild(htmlRij(
            tijdGeleden(mutatie.tijdstip),
            mutatie.knsbNummer === vorige ? "" : mutatie.naam,
            mutatie.knsbNummer === vorige ? "" : mutatie.knsbNummer,
            mutatie.url,
            mutatie.aantal,
            mutatie.invloed));
        vorige = mutatie.knsbNummer;
    }
}
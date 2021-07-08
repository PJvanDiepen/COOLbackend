"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        naarRanglijst,
        terugNaar);
    beheerders(document.getElementById("beheerders"));
    gebruikers(document.getElementById("gebruikers"));
    laatsteMutaties(document.getElementById("mutaties"));
    console.log("Operating System: " + navigator.platform);
    console.log("Browser: " + navigator.vendor);
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

async function beheerders(lijst) {
    const beheerders = await serverFetch("/beheerders");
    for (const beheerder of beheerders) {
        lijst.appendChild(htmlRij(beheerder.naam, beheerder.email));
    }
}

async function gebruikers(lijst) {
    const gebruikers = await serverFetch("/gebruikers");
    for (const gebruiker of gebruikers) {
        lijst.appendChild(htmlRij(
            gebruiker.datumEmail ? datumLeesbaar(gebruiker.datumEmail) : "---",
            gebruiker.knsbNummer,
            gebruiker.naam));
    }
}

async function laatsteMutaties(lijst) {
    const mutaties = await serverFetch("/mutaties/0/9/100"); // laatste 100 mutaties
    let vorige = 0;
    for (const mutatie of mutaties) {
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
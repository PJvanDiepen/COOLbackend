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

    De agenda gaat uitsluitend over nog niet gespeelde wedstrijden in het huidige seizoen.

    In de agenda van een speler staan wedstrijden vastgelegd in uitslagen met partij = MEEDOEN, NIET_MEEDOEN, EXTERN_UIT of EXTERN_THUIS.
    De wedstrijden in de agenda staan op volgorde van datum, teamCode en rondeNummer.
    Per datum kunnen er verschillende competities / externe wedstrijden zijn (met een verschillende teamCode) en meer ronden.

    De rapid en snelschaak competitie kunnen per datum meer ronden hebben.
    De interne competitie, rapid competitie en snelschaak competitie zijn nooit op dezelfde datum.
    Tijdens een ronde van de interne competitie kunnen verschillende externe wedstrijden (uit of thuis) zijn.

    Een speler kan per datum meedoen in 1 competitie of meedoen in 1 externe wedstrijd of niet meedoen.

    Indien een externe wedstrijd meetelt voor de interne competitie (anderTeam = INTERNE_COMPETITIE)
    en de datum van de externe wedstrijd is de datum van een ronde van de interne competitie
    dan wordt dit vastgelegd in 2 uitslagen met 2 verschillende teamCode (van team en van INTERNE_COMPETITIE)
    en partij = EXTERN_UIT of EXTERN_THUIS.

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
            const teamleden = await serverFetch( // actuele situatie
                `/${uuidToken}/teamleden/${w.seizoen}/${w.teamCode}/${w.rondeNummer}`);
            const link = htmlLink(
                `agenda.html?gebruiker=${andereGebruiker}&naamGebruiker=${naam}&team=${w.teamCode}&ronde=${w.rondeNummer}&datum=${datumSQL(w.datum)}&partij=${wijzig(w)}`,
                vinkje(w));
            htmlVerwerkt(link,w.teamCode === gewijzigd.teamCode && w.rondeNummer === gewijzigd.rondeNummer);
            lijst.appendChild(htmlRij(
                isCompetitie(w.teamCode) ? w.rondeNummer : "",
                datumLeesbaar(w),
                isCompetitie(w.teamCode) ? teamVoluit(w.teamCode) : wedstrijdVoluit(w),
                teamleden.length,
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
    if (teamCode && rondeNummer && datum && partij) {
        if (await serverFetch(`/${uuidToken}/aanwezig/${ditSeizoen}/${teamCode}/${rondeNummer}/${knsbNummer}/${datum}/${partij}`)) {
            return {"teamCode": teamCode, "rondeNummer": rondeNummer};
        }
    }
    return {"teamCode": "", "rondeNummer": 0};
}

async function agendaLezen(knsbNummer) {
    return await serverFetch(`/${uuidToken}/kalender/${ditSeizoen}/${knsbNummer}`);
}

async function agendaAanvullen(knsbNummer, wedstrijden) {
    let aanvullingen = 0;
    for (const w of wedstrijden) {
        if (!w.partij) {
            /*
            TODO voor interne competities bij gespeelde ronden afwezig invullen en daarna niet meedoen invullen
            uitsluitend nodig op de datum dat er meer ronden op 1 dag zijn
            op andere dagen is vergelijken met de datum van vandaag voldoende
            uitzoeken wat de meest actuele competititie (ook voor start.html)
             */
            // console.log('--- deze wedstrijd invullen ----');
            // console.log(w);
            const datum = datumSQL(w.datum);
            const vanafVandaag = datum >= datumSQL();
            // voor interne competities voor vandaag afwezig invullen en vanafVandaag altijd niet meedoen invullen
            if (vanafVandaag || isCompetitie(w.teamCode)) {
                const afwezig = vanafVandaag ? NIET_MEEDOEN : AFWEZIG;
                const competitie = isCompetitie(w.teamCode) ? w.teamCode : INTERNE_COMPETITIE;
                const mutaties = await serverFetch(
                    `/${uuidToken}/agenda/${w.seizoen}/${w.teamCode}/${w.rondeNummer}/${knsbNummer}/${afwezig}/${datum}/${competitie}`);
                aanvullingen += mutaties;
            }
        }
    }
    return aanvullingen;
}

function wijzig(w) {
    if (w.partij === NIET_MEEDOEN) {
        return MEEDOEN;
    } else if (w.partij === MEEDOEN) {
        return NIET_MEEDOEN;
    } else if (w.teamCode === w.anderTeam) { // indien EXTERN_THUIS of EXTERN_UIT dan geen interne ronde
        return MEEDOEN;
    } else { // indien EXTERN_THUIS of EXTERN_UIT
        return NIET_MEEDOEN;
    }
}

function vinkje(w) {
    if (w.partij === NIET_MEEDOEN) {
        return STREEP;
    } else if (w.partij === MEEDOEN) {
        return VINKJE;
    } else if (w.teamCode === w.anderTeam) { // indien EXTERN_THUIS of EXTERN_UIT dan geen interne ronde
        return STREEP;
    } else { // indien EXTERN_THUIS of EXTERN_UIT
        return VINKJE;
    }
}
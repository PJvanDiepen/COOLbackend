"use strict";

(async function() {
    await gebruikerVerwerken();
    const [rondeNummer, datumRonde, totDatum]  = await rondenVerwerken(INTERNE_COMPETITIE, Number(params.get("ronde")), 0);
    menu(naarTeamleider,
        naarGebruiker,
        naarBeheer,
        [WEDSTRIJDLEIDER, `ranglijst na ronde ${rondeNummer}`, function() {
            naarAnderePagina(`ranglijst.html?ronde=${rondeNummer}`);
        }],
        [WEDSTRIJDLEIDER, `ronde ${rondeNummer} opnieuw indelen`, function () {
            naarAnderePagina(`indelen.html?ronde=${rondeNummer}`);
        }],
        [BEHEERDER, `ranglijst ${ditSeizoen()} opnieuw verwerken`, function () {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${ditSeizoen()}`)) {
                    sessionStorage.removeItem(key);
                }
            }
        }],
        [BEHEERDER, `verwijder ronde ${rondeNummer}`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/ronde/${seizoen}/int/${rondeNummer}`);
            if (mutaties) {
                sessionStorage.removeItem(`/ronde/${seizoen}/${rondeNummer}`);  // TODO ranglijst weggooien
                naarAnderePagina("ronde.html?ronde=" + rondeNummer);
            }
        }]);
    rondeSelecteren(INTERNE_COMPETITIE, rondeNummer);
    wedstrijdenBijRonde(rondeNummer, document.getElementById("kop"), document.getElementById("wedstrijden"));
    document.getElementById("subkop").innerHTML = "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(datumRonde);
    uitslagenRonde(rondeNummer, document.getElementById("tabel"));
})();

/*
    verwerk &ronde=[rondeNummer]&wit=[wit]&zwart=[zwart]&uitslag=[uitslag]
 */

async function wedstrijdenBijRonde(rondeNummer, kop, lijst) {
    kop.innerHTML = vereniging + SCHEIDING + seizoenVoluit(seizoen);
    if (rondeNummer > 1) {
        lijst.appendChild(ranglijstTot(rondeNummer - 1, ronden[rondeNummer - 2].datum));
    }
    const wedstrijden = await localFetch("/wedstrijden/" + seizoen);
    for (const wedstrijd of wedstrijden) {
        if (wedstrijdBijRonde(rondeNummer, wedstrijd.datum)) {
            const datumKolom = datumLeesbaar(wedstrijd.datum);
            const wedstrijdKolom = naarTeam(wedstrijdVoluit(wedstrijd), wedstrijd);
            const rondeUitslagen = await uitslagenTeamAlleRonden(wedstrijd.teamCode);
            const u = rondeUitslagen[wedstrijd.rondeNummer - 1];
            const uitslagKolom = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
            lijst.appendChild(htmlRij("", datumKolom, wedstrijdKolom, uitslagKolom));
        }
    }
    lijst.appendChild(ranglijstTot(rondeNummer, ronden[rondeNummer - 1].datum));
}

function ranglijstTot(ronde, datum) {
    return htmlRij(ronde, datumLeesbaar(datum), "interne competitie", "");
}

function wedstrijdBijRonde(rondeNummer, datum) {
    if (rondeNummer === 1) {
        return datum <= ronden[0].datum; // bij ronde 1 uitsluitend wedstrijden tot en met datum ronde 1
    } else if (rondeNummer === ronden.length) {
        return datum > ronden[rondeNummer - 2].datum; // bij laatste ronde alle wedstrijden vanaf voorlaatste ronde
    } else {
        return datum > ronden[rondeNummer - 2].datum && datum <= ronden[rondeNummer - 1].datum;
    }
}

/*
  -- uitslagen interne competitie per ronde
  select
      uitslag.bordNummer,
      uitslag.knsbNummer,
      wit.naam,
      uitslag.tegenstanderNummer,
      zwart.naam,
      uitslag.resultaat
  from uitslag
  join persoon as wit on uitslag.knsbNummer = wit.knsbNummer
  join persoon as zwart on uitslag.tegenstanderNummer = zwart.knsbNummer
  where seizoen = @seizoen and teamCode = 'int' and rondeNummer = @rondeNummer and witZwart = 'w'
  order by uitslag.seizoen, uitslag.bordNummer;
 */
async function uitslagenRonde(rondeNummer, lijst) {
    const gewijzigd = await uitslagMutatie(rondeNummer);
    const uitslagen = await serverFetch(`/ronde/${seizoen}/${rondeNummer}`); // actuele situatie
    if (uitslagen.length > 0) {
        for (const uitslag of uitslagen) {
            const uitslagKolom = htmlVerwerkt(uitslagVerwerken(rondeNummer, uitslag),
            uitslag.knsbNummer === gewijzigd.wit && uitslag.tegenstanderNummer === gewijzigd.zwart);
            lijst.appendChild(htmlRij(
                uitslag.bordNummer,
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslagKolom));
        }
    } else {
        lijst.appendChild(htmlRij("nog", "geen", "uitslagen", ""));
    }
}

async function uitslagMutatie(rondeNummer) {
    const wit = params.get("wit");
    const zwart = params.get("zwart");
    const uitslag = params.get("uitslag");
    if (wit && zwart && uitslag) {
        const mutaties = await serverFetch(
            `/${uuidToken}/uitslag/${seizoen}/${competitie}/${rondeNummer}/${wit}/${zwart}/${uitslag}`);
        if (mutaties > 0) {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${seizoen}`) ||
                    key.startsWith(`/uitslagen/${seizoen}`)) { // TODO beperken tot 1 competitie
                    sessionStorage.removeItem(key);
                }
            }
        }
    }
    return {"wit": Number(wit), "zwart": Number(zwart)};
}

function uitslagVerwerken(rondeNummer, uitslag) {
    if (uitslagWijzigen(uitslag)) {
        return uitslagSelecteren(rondeNummer, uitslag)
    } else if (uitslag.resultaat === WINST) {
        return "1-0";
    } else if (uitslag.resultaat === REMISE) {
        return "½-½";
    } else if (uitslag.resultaat === VERLIES) {
        return "0-1";
    } else if (uitslag.knsbNummer === gebruiker.knsbNummer || uitslag.tegenstanderNummer === gebruiker.knsbNummer) {
        return uitslagWijzigen(uitslag);
    } else {
        return "";
    }
}

function uitslagWijzigen(uitslag)  {
    if (seizoen !== ditSeizoen()) { // vorig seizoen nooit wijzigen
        return false;
    } else if (gebruiker.mutatieRechten >= WEDSTRIJDLEIDER) {
        return true;
    } else if (gebruiker.mutatieRechten >= GEREGISTREERD && uitslag.resultaat === "") {
        return uitslag.knsbNummer === gebruiker.knsbNummer || uitslag.tegenstanderNummer === gebruiker.knsbNummer;
    } else {
        return false;
    }
}

function uitslagSelecteren(rondeNummer, uitslag) {
    const select = document.createElement("select");
    select.appendChild(htmlOptie(WINST, "1-0"));
    select.appendChild(htmlOptie(REMISE, "½-½"));
    select.appendChild(htmlOptie(VERLIES, "0-1"));
    // select.appendChild(htmlOptie("", ""));
    select.value = uitslag.resultaat;
    select.addEventListener("input",function () {
        naarZelfdePagina(
            `ronde=${rondeNummer}&wit=${uitslag.knsbNummer}&zwart=${uitslag.tegenstanderNummer}&uitslag=${select.value}`);
    });
    return select;
}
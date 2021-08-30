"use strict";

(async function() {
    await gebruikerVerwerken();
    const ronden = await localFetch(`/ronden/${seizoen}/${INTERNE_COMPETITIE}`);
    const datumTot = ronden[rondeNummer - 1].datum;
    menu(naarBeheer,
        naarAgenda,
        naarRanglijst,
        [WEDSTRIJDLEIDER, `ranglijst tot ronde ${rondeNummer}`, function() {
            naarAnderePagina(`ranglijst.html?datum=${datumSQL(datumTot)}`);
        }],
        [WEDSTRIJDLEIDER, `indeling ronde ${rondeNummer}`, function () {
            naarAnderePagina(`indelen.html?datum${datumSQL(datumTot)}`);
        }],
        naarGebruiker,
        terugNaar);
    rondeSelecteren(INTERNE_COMPETITIE, rondeNummer);
    wedstrijdenBijRonde(ronden, document.getElementById("kop"), document.getElementById("wedstrijden"));
    document.getElementById("subkop").innerHTML = "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(datumTot);
    uitslagenRonde(document.getElementById("tabel"));
})();

async function wedstrijdenBijRonde(ronden, kop, lijst) {
    kop.innerHTML = vereniging + SCHEIDING + seizoenVoluit(seizoen);
    if (rondeNummer > 1) {
        lijst.appendChild(ranglijstTot(rondeNummer - 1, ronden[rondeNummer - 2].datum));
    }
    const wedstrijden = await localFetch("/wedstrijden/" + seizoen);
    for (const wedstrijd of wedstrijden) {
        if (wedstrijdBijRonde(wedstrijd.datum, ronden)) {
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

function wedstrijdBijRonde(datum, ronden) {
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
async function uitslagenRonde(lijst) {
    let geenUitslagen = true;
    (await localFetch("/ronde/" + seizoen + "/" + rondeNummer)).forEach(
        function (uitslag) {
            geenUitslagen = false;
            lijst.appendChild(htmlRij(
                uitslag.bordNummer,
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslagVerwerken(uitslag)));
        });
    if (geenUitslagen) {
        lijst.appendChild(htmlRij("nog", "geen", "uitslagen", ""));
    }
}

function uitslagVerwerken(uitslag) {
    if (uitslagWijzigen(uitslag)) {
        return uitslagSelecteren(uitslag)
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
    if (WEDSTRIJDLEIDER <= gebruiker.mutatieRechten) {
        return true;
    } else if (GEREGISTREERD <= gebruiker.mutatieRechten && uitslag.resultaat === "") {
        return uitslag.knsbNummer === gebruiker.knsbNummer || uitslag.tegenstanderNummer === gebruiker.knsbNummer
    } else {
        return false;
    }
}

function uitslagSelecteren(uitslag) {
    const select = document.createElement("select");
    select.appendChild(htmlOptie(WINST, "1-0"));
    select.appendChild(htmlOptie(REMISE, "½-½"));
    select.appendChild(htmlOptie(VERLIES, "0-1"));
    select.appendChild(htmlOptie("", ""));
    select.value = uitslag.resultaat;
    select.addEventListener("input",async function () {
        const mutaties = await serverFetch( // TODO ranglijst opnieuw inlezen
            `/${uuidToken}/uitslag/${seizoen}/int/${rondeNummer}/${uitslag.knsbNummer}/${uitslag.tegenstanderNummer}/${select.value}`);
    });
    return select;
}
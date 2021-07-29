"use strict";

(async function() {
    await gebruikerVerwerken();
    const ronden = await localFetch("/ronden/" + seizoen + "/int");
    const datumTot = ronden[rondeNummer - 1].datum;
    menu(naarBeheer,
        naarAgenda,
        naarRanglijst,
        [WEDSTRIJDLEIDER, `ranglijst tot ronde ${rondeNummer}`, function() {
            naarAnderePagina(`ranglijst.html?datum=${datumSQL(datumTot)}`);
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
    await mapAsync("/ronde/" + seizoen + "/" + rondeNummer,
        function (uitslag) {
        geenUitslagen = false;
            lijst.appendChild(htmlRij(
                uitslag.bordNummer,
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslag.resultaat === "1" ? "1-0" : uitslag.resultaat === "0" ? "0-1" : "½-½"));
        });
    if (geenUitslagen) {
        lijst.appendChild(htmlRij("nog", "geen", "uitslagen", ""));
    }
}
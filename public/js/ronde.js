"use strict";

menu(naarBeheer,
    naarAgenda,
    naarRanglijst,
    naarGebruiker,
    terugNaar);
rondeSelecteren(INTERNE_COMPETITIE, rondeNummer);
wedstrijdenBijRonde(document.getElementById("kop"), document.getElementById("wedstrijden"));
uitslagenRonde(document.getElementById("subkop"), document.getElementById("tabel"));

async function wedstrijdenBijRonde(kop, lijst) {
    kop.innerHTML = [schaakVereniging, seizoenVoluit(seizoen)].join(SCHEIDING);
    const ronden = await localFetch("/ronden/" + seizoen + "/int");
    if (rondeNummer > 1) {
        lijst.appendChild(htmlRij(rondeNummer - 1, datumLeesbaar(ronden[rondeNummer - 2].datum), "interne competitie", ""));
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
    lijst.appendChild(htmlRij(rondeNummer, datumLeesbaar(ronden[rondeNummer - 1].datum), "interne competitie", ""));
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
async function uitslagenRonde(kop, lijst) {
    kop.innerHTML = "Ronde " + rondeNummer;
    let geenUitslagen = true;
    await mapAsync("/ronde/" + seizoen + "/" + rondeNummer,
        function (uitslag) {
        geenUitslagen = false;
            lijst.appendChild(htmlRij(
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslag.resultaat === "1" ? "1-0" : uitslag.resultaat === "0" ? "0-1" : "½-½"));
        });
    if (geenUitslagen) {
        lijst.appendChild(htmlRij("geen", "uitslagen", ""));
    }
}
"use strict";

import * as db from "./db.js";

import * as zyq from "./zyq.js";

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    zyq.menu([db.WEDSTRIJDLEIDER, `agenda van ${zyq.o_o_o.naam}`, function () {
            zyq.naarAnderePagina(`agenda.html?gebruiker=${zyq.o_o_o.speler}&naamGebruiker=${zyq.o_o_o.naam}`);
        }],
        [db.BEHEERDER, `backup uitslagen ${zyq.o_o_o.naam}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/speler/uitslag/${zyq.o_o_o.seizoen}/${zyq.o_o_o.speler}`);
            zyq.backupSQL("uitslag", rijen);
        }]);
    uitslagenSpeler(document.getElementById("kop"), document.getElementById("tabel"));
})();

/*
  -- punten van alle uitslagen per speler
  select u.datum,
      u.rondeNummer,
      u.bordNummer,
      u.witZwart,
      u.tegenstanderNummer,
      p.naam,
      u.resultaat,
      u.teamCode,
      u.partij,
      r.uithuis,
      r.tegenstander,
      punten(@seizoen, @knsbNummer, u.teamCode, u.partij, u.tegenstanderNummer, u.resultaat) as punten
  from uitslag u
  join persoon p on u.tegenstanderNummer = p.knsbNummer
  join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
  where u.seizoen = @seizoen
      and u.knsbNummer = @knsbNummer
      and u.anderTeam = 'int'
  order by u.datum, u.rondeNummer;
  */

async function uitslagenSpeler(kop, lijst) {
    const t = (await zyq.ranglijst(zyq.o_o_o.vorigeRonde, [zyq.o_o_o.speler]))[0];
    kop.innerHTML = t.naam + zyq.SCHEIDING + zyq.seizoenVoluit(zyq.o_o_o.seizoen);
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern() && t.eigenWaardeCijfer()) {
        lijst.appendChild(zyq.htmlRij("", "", `waardecijfer: ${t.eigenWaardeCijfer()}, rating: ${t.rating()}`, "", "", "", totaal, totaal));
    }
    const uitslagen = await zyq.localFetch(`/uitslagen/${zyq.o_o_o.seizoen}/${zyq.o_o_o.versie}/${zyq.o_o_o.speler}/${zyq.o_o_o.competitie}`);
    let samenvoegen = -1; // niet samengevoegd
    for (let i = 0; i < uitslagen.length; i++) {
        if (samenvoegen < i && geenGeplandePartij(uitslagen, i)) { // verwerken indien niet samengevoegd
            samenvoegen = externTijdensIntern(uitslagen, i);
            if (samenvoegen === i + 1) {
                if (t.intern()) {
                    totaal += uitslagen[i].punten + uitslagen[i + 1].punten;
                }
                if (uitslagen[i].teamCode === zyq.o_o_o.competitie) { // TODO verplaatsen naar externePartijTijdensInterneRonde
                    lijst.appendChild(externePartijTijdensInterneRonde(uitslagen[i + 1], totaal, uitslagen[i]));
                } else if (uitslagen[i + 1].teamCode === zyq.o_o_o.competitie) {
                    lijst.appendChild(externePartijTijdensInterneRonde(uitslagen[i], totaal, uitslagen[i + 1]));
                } else {
                    console.log("--- fout met externePartijTijdensInterneRonde ---");
                }
            } else {
                if (t.intern()) {
                    totaal += uitslagen[i].punten;
                }
                if (uitslagen[i].partij === db.INTERNE_PARTIJ) {
                    lijst.appendChild(internePartij(uitslagen[i], totaal));
                } else if (uitslagen[i].partij === db.EXTERNE_PARTIJ && uitslagen[i].teamCode !== db.INTERNE_COMPETITIE) {
                    lijst.appendChild(externePartij(uitslagen[i], totaal));
                } else {
                    lijst.appendChild(geenPartij(uitslagen[i], totaal));
                }
            }
        }
    }
    if (t.aftrek()) {
        lijst.appendChild(htmlRij("", "", "aftrek", "", "", "", t.aftrek(), totaal + t.aftrek()));
    }
    if (!t.intern() && t.afzeggingen()) {
        lijst.appendChild(zyq.htmlRij("", "", "uitsluitend afzeggingen", "", "", "", "", ""));
    }
    if (!t.intern() && !t.extern()) {
        lijst.appendChild(zyq.htmlRij("", "", "geen interne en geen externe partijen", "", "", "", "", ""));
    }
}

function externTijdensIntern(uitslagen, i) {
    if (i + 1 < uitslagen.length && uitslagen[i].partij === db.EXTERNE_PARTIJ && uitslagen[i + 1].partij === db.EXTERNE_PARTIJ) {
        return uitslagen[i].datum === uitslagen[i + 1].datum ? i + 1 : -1;
    } else {
        return -1;
    }
}

function geenGeplandePartij(uitslagen, i) {
    return ![db.MEEDOEN, db.NIET_MEEDOEN, db.EXTERN_THUIS, db.EXTERN_UIT].includes(uitslagen[i].partij);
}

/*
kolommen in lijst
1. rondeNummer + link naar interne ronde indien interne ronde
2. datum + link naar interne ronde indien interne ronde
3. link naar interne tegenstander of link naar externe wedstrijd of andere tekst
4. externe bord
5. kleur
6. resultaat
7. punten
8. voortschrijdend totaal
 */

function internePartij(uitslag, totaal) {
    const datumKolom = naarRonde(uitslag);
    const tegenstanderKolom = zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.naam});
    return zyq.htmlRij(uitslag.rondeNummer, datumKolom, tegenstanderKolom, "", uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function externePartijTijdensInterneRonde(uitslag, totaal, interneRonde) {
    const datumKolom = naarRonde(uitslag);
    const tegenstanderKolom = zyq.naarTeam(uitslag);
    const puntenKolom = interneRonde.punten + uitslag.punten;
    return zyq.htmlRij(interneRonde.rondeNummer, datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, puntenKolom, totaal);
}

function externePartij(uitslag, totaal) {
    const datumKolom = zyq.datumLeesbaar(uitslag);
    const tegenstanderKolom = zyq.naarTeam(uitslag);
    return zyq.htmlRij("", datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function geenPartij(uitslag, totaal) {
    const datumKolom = naarRonde(uitslag);
    const omschrijving = uitslag.partij === db.AFWEZIG ? "afgezegd"
        : uitslag.partij === db.ONEVEN                 ? "oneven"
        : uitslag.partij === db.REGLEMENTAIRE_REMISE   ? "vrijgesteld"
        : uitslag.partij === db.REGLEMENTAIR_VERLIES   ? "reglementair verlies"
        : uitslag.partij === db.REGLEMENTAIRE_WINST    ? "reglementaire winst"
        : uitslag.partij === db.EXTERNE_PARTIJ         ? "externe partij" : "???";
    return zyq.htmlRij(uitslag.rondeNummer, datumKolom, omschrijving, "", "", "", uitslag.punten, totaal);
}

function naarRonde(uitslag) {
    return zyq.htmlLink(`ronde.html?ronde=${uitslag.rondeNummer}`, zyq.datumLeesbaar(uitslag));
}

"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import {ranglijst} from "./o_o_o.js"

import * as zyq from "./zyq.js";

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    await html.menu(zyq.gebruiker.mutatieRechten,[db.WEDSTRIJDLEIDER, `agenda van ${zyq.o_o_o.naam}`, function () {
            html.anderePagina(`agenda.html?gebruiker=${zyq.o_o_o.speler}&naamGebruiker=${zyq.o_o_o.naam}`);
        }],
        [db.ONTWIKKElAAR, `backup uitslagen ${zyq.o_o_o.naam}` , async function () {
            zyq.backupSQL("uitslag", await zyq.serverFetch(
                `/${zyq.o_o_o.club}/${zyq.o_o_o.seizoen}/backup/speler/${zyq.o_o_o.speler}`));
        }]);
    uitslagenSpeler(html.id("kop"), html.id("tabel"));
    await ratingPerMaandSpeler(html.id("ratings"), zyq.o_o_o.speler);
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
      and u.competitie = 'int'
  order by u.datum, u.rondeNummer;
  */

async function uitslagenSpeler(kop, lijst) {
    const t = (await ranglijst(zyq.o_o_o.vorigeRonde, [zyq.o_o_o.speler]))[0];
    kop.textContent = `${t.naam}${html.SCHEIDING}${zyq.seizoenVoluit(zyq.o_o_o.seizoen)}`;
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern() && t.eigenWaardeCijfer()) {
        lijst.append(html.rij("", "", `waardecijfer: ${t.eigenWaardeCijfer()}, rating: ${t.rating()}`, "", "", "", totaal, totaal));
    }
    const uitslagen = await zyq.localFetch(
        `/${zyq.o_o_o.club}/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/uitslagen/${zyq.o_o_o.speler}/${zyq.o_o_o.versie}`);
    let samenvoegen = -1; // niet samengevoegd
    for (let i = 0; i < uitslagen.length; i++) {
        if (samenvoegen < i && !db.planningInvullen.has(uitslagen[i].partij)) { // verwerken indien niet samengevoegd en geen planning
            samenvoegen = externTijdensIntern(uitslagen, i);
            if (samenvoegen === i + 1) {
                if (t.intern()) {
                    totaal += uitslagen[i].punten + uitslagen[i + 1].punten;
                }
                if (uitslagen[i].teamCode === zyq.o_o_o.competitie) { // TODO verplaatsen naar externePartijTijdensInterneRonde
                    lijst.append(externePartijTijdensInterneRonde(uitslagen[i + 1], totaal, uitslagen[i]));
                } else if (uitslagen[i + 1].teamCode === zyq.o_o_o.competitie) {
                    lijst.append(externePartijTijdensInterneRonde(uitslagen[i], totaal, uitslagen[i + 1]));
                } else {
                    console.log("--- fout met externePartijTijdensInterneRonde ---");
                }
            } else {
                if (t.intern()) {
                    totaal += uitslagen[i].punten;
                }
                if (uitslagen[i].partij === db.INTERNE_PARTIJ) {
                    lijst.append(internePartij(uitslagen[i], totaal));
                } else if (uitslagen[i].partij === db.EXTERNE_PARTIJ && uitslagen[i].teamCode !== db.INTERNE_COMPETITIE) {
                    lijst.append(externePartij(uitslagen[i], totaal));
                } else {
                    lijst.append(geenPartij(uitslagen[i], totaal));
                }
            }
        }
    }
    if (t.aftrek()) {
        const tekst = t.aftrek() > 0 ? "bijtelling" : "aftrek";
        lijst.append(html.rij("", "", tekst, "", "", "", t.aftrek(), totaal + t.aftrek()));
    }
    if (!t.intern() && t.afzeggingen()) {
        lijst.append(html.rij("", "", "uitsluitend afzeggingen", "", "", "", "", ""));
    }
    if (!t.intern() && !t.extern()) {
        lijst.append(html.rij("", "", "geen interne en geen externe partijen", "", "", "", "", ""));
    }
}

function externTijdensIntern(uitslagen, i) {
    if (i + 1 < uitslagen.length && uitslagen[i].partij === db.EXTERNE_PARTIJ && uitslagen[i + 1].partij === db.EXTERNE_PARTIJ) {
        return uitslagen[i].datum === uitslagen[i + 1].datum ? i + 1 : -1;
    } else {
        return -1;
    }
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
    return html.rij(uitslag.rondeNummer, datumKolom, tegenstanderKolom, "", uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function externePartijTijdensInterneRonde(uitslag, totaal, interneRonde) {
    const datumKolom = naarRonde(uitslag);
    const tegenstanderKolom = zyq.naarTeam(uitslag);
    const puntenKolom = interneRonde.punten + uitslag.punten;
    return html.rij(interneRonde.rondeNummer, datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, puntenKolom, totaal);
}

function externePartij(uitslag, totaal) {
    const datumKolom = zyq.datumLeesbaar(uitslag);
    const tegenstanderKolom = zyq.naarTeam(uitslag);
    return html.rij("", datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function geenPartij(uitslag, totaal) {
    const datumKolom = naarRonde(uitslag);
    const omschrijving = geenPartijInvullen.get(uitslag.partij);
    return html.rij(uitslag.rondeNummer, datumKolom, omschrijving, "", "", "", uitslag.punten, totaal);
}

function naarRonde(uitslag) {
    return html.naarPagina(`ronde.html?ronde=${uitslag.rondeNummer}`, zyq.datumLeesbaar(uitslag));
}

const geenPartijInvullen = new Map([
    [db.AFWEZIG, "afgezegd"],
    [db.ONEVEN, "oneven"],
    [db.REGLEMENTAIRE_REMISE, "reglementair remise"],
    [db.REGLEMENTAIR_VERLIES, "reglementair verlies"],
    [db.REGLEMENTAIRE_WINST, "reglementaire winst"],
    ["j", "niet gespeeld"]]);

async function ratingPerMaandSpeler(lijst, speler) {
    const ratings = await zyq.localFetch(`/rating/${speler}`);
    let geenRating = true;
    for (const rating of ratings) {
        if (Number(rating.knsbRating)) {
            geenRating = false;
            lijst.append(html.rij(`${db.maandInvullen.get(rating.maand)} ${rating.jaar}`, rating.knsbRating));
        }
    }
    if (geenRating) {
        lijst.append(html.rij("", "geen rating"));
    }
}
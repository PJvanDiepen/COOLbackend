"use strict";

(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        [8, `agenda van ${naamSpeler}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${speler}&naamGebruiker=${naamSpeler}`);
        }],
        naarRanglijst,
        naarGebruiker,
        [9, "afzeggingen verwijderen", async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/afzeggingen/${seizoen}/${speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${seizoen}/${speler}`);
                sessionStorage.removeItem(`/ranglijst/${seizoen}`);
                naarZelfdePagina();
            }
        }],
        [9, `${naamSpeler} verwijderen`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/speler/${seizoen}/${speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${seizoen}/${speler}`);
                sessionStorage.removeItem(`/ranglijst/${seizoen}`);
                naarAnderePagina("ranglijst.html");
            }
        }],
        terugNaar);
    seizoenSelecteren(INTERNE_COMPETITIE);
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
  order by u.datum, u.bordNummer;
  */

async function uitslagenSpeler(kop, lijst) {
    kop.innerHTML = [vereniging, seizoenVoluit(seizoen), naamSpeler].join(SCHEIDING);
    const t = spelerTotalen(await spelerUitRanglijst(seizoen, speler));
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern()) {
        lijst.appendChild(htmlRij("", "", "startpunten", "", "", "", totaal, totaal));
    }
    let vorigeUitslag;
    await mapAsync("/uitslagen/" + seizoen + "/" + speler,
        function (u) {
            if (t.intern()) {
                totaal += u.punten;
            }
            if (u.tegenstanderNummer > 0) {
                lijst.appendChild(internePartij(u, totaal));
            } else if (u.partij === MEEDOEN || u.partij === NIET_MEEDOEN) {
                // geen uitslag, geplande partij overslaan
            } else if (u.teamCode === INTERNE_COMPETITIE && u.partij === EXTERNE_WEDSTRIJD) {
                vorigeUitslag = u; // deze uitslag overslaan en combineren met volgende uitslag
            } else if (u.teamCode === INTERNE_COMPETITIE) {
                lijst.appendChild(geenPartij(u, totaal));
            } else if (vorigeUitslag && vorigeUitslag.datum === u.datum) {
                lijst.appendChild(externePartijTijdensInterneRonde(vorigeUitslag, u, totaal));
            } else {
                lijst.appendChild(externePartij(u, totaal));
            }
        });
    if (t.aftrek()) {
        lijst.appendChild(htmlRij("", "", "aftrek", "", "", "", t.aftrek(), totaal + t.aftrek()));
    }
    if (!t.intern() && t.afzeggingen() && informatieNivo) {
        lijst.appendChild(htmlRij("", "", "uitsluitend afzeggingen", "", "", "", "", ""));
    }
    if (!t.intern() && !t.extern() && informatieNivo) {
        lijst.appendChild(htmlRij("", "", "geen interne en geen externe partijen", "", "", "", "", ""));
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

function internePartij(u, totaal) {
    const rondeKolom = naarRonde(u.rondeNummer, u);
    const datumKolom = naarRonde(datumLeesbaar(u.datum), u);
    const tegenstanderKolom = naarSpeler(u.tegenstanderNummer, u.naam);
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, "", u.witZwart, u.resultaat, u.punten, totaal);
}

function geenPartij(u, totaal) {
    const rondeKolom = naarRonde(u.rondeNummer, u);
    const datumKolom = naarRonde(datumLeesbaar(u.datum), u);
    const omschrijving = u.partij === AFWEZIG              ? "afgezegd"
                       : u.partij === EXTERNE_WEDSTRIJD    ? "extern"
                       : u.partij === INTERNE_PARTIJ       ? "intern"
                       : u.partij === ONEVEN               ? "oneven"
                       : u.partij === REGLEMENTAIRE_REMISE ? "vrijgesteld"
                       : u.partij === REGLEMENTAIR_VERLIES ? "reglementair verlies"
                       : u.partij === REGLEMENTAIRE_WINST  ? "reglementaire winst" : "geenPartij???";
    return htmlRij(rondeKolom, datumKolom, omschrijving, "", "", "", u.punten, totaal);
}

function externePartijTijdensInterneRonde(vorigeUitslag, u, totaal) {
    const rondeKolom = naarRonde(vorigeUitslag.rondeNummer, vorigeUitslag);
    const datumKolom = naarRonde(datumLeesbaar(u.datum), vorigeUitslag);
    const tegenstanderKolom = naarTeam(wedstrijdVoluit(u), u);
    const puntenKolom = vorigeUitslag.punten + u.punten;
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, u.bordNummer, u.witZwart, u.resultaat, puntenKolom, totaal);
}

function externePartij(u, totaal) {
    const rondeKolom = "";
    const datumKolom = datumLeesbaar(u.datum);
    const tegenstanderKolom = naarTeam(wedstrijdVoluit(u), u);
    return htmlRij(rondeKolom, datumKolom, tegenstanderKolom, u.bordNummer, u.witZwart, u.resultaat, u.punten, totaal);
}

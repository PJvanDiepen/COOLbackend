"use strict";

(async function() {
    await init();
    competitieTitel();
    menu([WEDSTRIJDLEIDER, `agenda van ${competitie.naam}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${competitie.speler}&naamGebruiker=${competitie.naam}`);
        }],
        [GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }],
        [BEHEERDER, "afzeggingen verwijderen", async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/afzeggingen/${competitie.seizoen}/${competitie.speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${competitie.seizoen}/${competitie.versie}/${competitie.speler}/${competitie.competitie}`);
                sessionStorage.removeItem(`/ranglijst/${competitie.seizoen}/${competitie.versie}/${competitie.competitie}/${datumSQL()}`);
                naarZelfdePagina();
            }
        }],
        [BEHEERDER, `${competitie.naam} verwijderen`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/speler/${competitie.seizoen}/${competitie.speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${competitie.seizoen}/${competitie.versie}/${competitie.speler}/${competitie.competitie}`);
                sessionStorage.removeItem(`/ranglijst/${competitie.seizoen}/${competitie.versie}/${competitie.competitie}/${datumSQL()}`);
                naarAnderePagina("ranglijst.html");
            }
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
  order by u.datum, u.bordNummer;
  */

async function uitslagenSpeler(kop, lijst) {
    const totDatum = datumSQL(null, 10); // + 10 dagen voor testen
    const t = (await ranglijst(totDatum, [competitie.speler]))[0];
    kop.innerHTML = t.naam + SCHEIDING + seizoenVoluit(competitie.seizoen);
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern()) {
        lijst.appendChild(htmlRij("", "", `waardecijfer: ${t.eigenWaardeCijfer()}, rating: ${t.rating()}`, "", "", "", totaal, totaal));
    }
    let vorigeUitslag = {partij: "?"}; // vorigeUitslag is geen externe partij;
    (await localFetch(`/uitslagen/${competitie.seizoen}/${competitie.versie}/${competitie.speler}/${competitie.competitie}`)).forEach(
        function (uitslag) {
            console.log(uitslag);
            /*
            if (vorigeUitslag.partij === EXTERNE_PARTIJ && uitslag.partij !== EXTERNE_PARTIJ) { // externe partij niet tijdens interne ronde
                lijst.appendChild(externePartij(vorigeUitslag, totaal)); // was nog niet verwerkt
            }
            if (vorigeUitslag.partij === EXTERNE_PARTIJ && uitslag.partij === EXTERNE_PARTIJ) { // externe partij tijdens interne ronde
                        } else if (uitslag.teamCode === INTERNE_COMPETITIE && uitslag.partij === EXTERNE_PARTIJ) {
                vorigeUitslag = uitslag; // deze uitslag overslaan en combineren met volgende uitslag
             */
            if (t.intern()) {
                totaal += uitslag.punten;
            }
            if (uitslag.partij === INTERNE_PARTIJ) {
                lijst.appendChild(internePartij(uitslag, totaal));
            } else if ([MEEDOEN, NIET_MEEDOEN, EXTERN_THUIS, EXTERN_UIT].includes(uitslag.partij)) {
                // geplande partij overslaan
            } else if (uitslag.partij === EXTERNE_PARTIJ && uitslag.teamCode !== INTERNE_COMPETITIE) {
                lijst.appendChild(externePartij(uitslag, totaal));
            } else {
                lijst.appendChild(geenPartij(uitslag, totaal));
            }
        });
    if (t.aftrek()) {
        lijst.appendChild(htmlRij("", "", "aftrek", "", "", "", t.aftrek(), totaal + t.aftrek()));
    }
    if (!t.intern() && t.afzeggingen()) {
        lijst.appendChild(htmlRij("", "", "uitsluitend afzeggingen", "", "", "", "", ""));
    }
    if (!t.intern() && !t.extern()) {
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

function internePartij(uitslag, totaal) {
    const datumKolom = naarRonde(uitslag);
    const tegenstanderKolom = naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.naam});
    return htmlRij(uitslag.rondeNummer, datumKolom, tegenstanderKolom, "", uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function geenPartij(uitslag, totaal) {
    const datumKolom = naarRonde(uitslag);
    const omschrijving = uitslag.partij === AFWEZIG              ? "afgezegd"
                       : uitslag.partij === ONEVEN               ? "oneven"
                       : uitslag.partij === REGLEMENTAIRE_REMISE ? "vrijgesteld"
                       : uitslag.partij === REGLEMENTAIR_VERLIES ? "reglementair verlies"
                       : uitslag.partij === REGLEMENTAIRE_WINST  ? "reglementaire winst"
                       : uitslag.partij === EXTERNE_PARTIJ       ? "externe partij" : "???";
    return htmlRij(uitslag.rondeNummer, datumKolom, omschrijving, "", "", "", uitslag.punten, totaal);
}

function externePartijTijdensInterneRonde(vorigeUitslag, uitslag, totaal) {
    console.log("externePartijTijdensInterneRonde()");
    const datumKolom = naarRonde(uitslag);
    const tegenstanderKolom = naarTeam(uitslag);
    const puntenKolom = vorigeUitslag.punten + uitslag.punten;
    return htmlRij(vorigeUitslag.rondeNummer, datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, puntenKolom, totaal);
}

function externePartij(uitslag, totaal) {
    const datumKolom = datumLeesbaar(uitslag);
    const tegenstanderKolom = naarTeam(uitslag);
    return htmlRij("", datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function naarRonde(uitslag) {
    return htmlLink(`ronde.html?ronde=${uitslag.rondeNummer}`, datumLeesbaar(uitslag));
}

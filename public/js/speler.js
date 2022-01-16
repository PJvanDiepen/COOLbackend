"use strict";

(async function() {
    await gebruikerVerwerken();
    menu([WEDSTRIJDLEIDER, `agenda van ${naamSpeler}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${speler}&naamGebruiker=${naamSpeler}`);
        }],
        naarTeamleider,
        naarGebruiker,
        naarBeheer,
        [BEHEERDER, "afzeggingen verwijderen", async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/afzeggingen/${seizoen}/${speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${seizoen}/${versie}/${speler}/${competitie}`);
                sessionStorage.removeItem(`/ranglijst/${seizoen}/${versie}/${competitie}/${datumSQL()}`);
                naarZelfdePagina();
            }
        }],
        [BEHEERDER, `${naamSpeler} verwijderen`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/speler/${seizoen}/${speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${seizoen}/${versie}/${speler}/${competitie}`);
                sessionStorage.removeItem(`/ranglijst/${seizoen}/${versie}/${competitie}/${datumSQL()}`);
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
    const t = (await ranglijst(seizoen, versie, totDatum, [speler]))[0];
    kop.innerHTML = t.naam + SCHEIDING + seizoenVoluit(seizoen);
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern()) {
        lijst.appendChild(htmlRij("", "", `waardecijfer: ${t.eigenWaardeCijfer()}, rating: ${t.rating()}`, "", "", "", totaal, totaal));
    }
    let vorigeUitslag;
    (await localFetch(`/uitslagen/${seizoen}/${versie}/${speler}/${competitie}`)).forEach(
        function (u) {
            if (t.intern()) {
                totaal += u.punten;
            }
            if (u.tegenstanderNummer > 0) {
                lijst.appendChild(internePartij(u, totaal));
            } else if ([MEEDOEN, NIET_MEEDOEN, EXTERN_THUIS, EXTERN_UIT, EXTERN_INDELEN].includes(u.partij)) {
                // geplande partij overslaan
            } else if (u.teamCode === INTERNE_COMPETITIE && u.partij === EXTERNE_PARTIJ) {
                vorigeUitslag = u; // deze uitslag overslaan en combineren met volgende uitslag
            } else if (vorigeUitslag && vorigeUitslag.datum === u.datum) { // TODO dit gaat fout als bordNummer niet is ingevuld
                lijst.appendChild(externePartijTijdensInterneRonde(vorigeUitslag, u, totaal));
            } else if (u.partij === EXTERNE_PARTIJ) {
                lijst.appendChild(externePartij(u, totaal));
            } else {
                lijst.appendChild(geenPartij(u, totaal));
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
                       : u.partij === ONEVEN               ? "oneven"
                       : u.partij === REGLEMENTAIRE_REMISE ? "vrijgesteld"
                       : u.partij === REGLEMENTAIR_VERLIES ? "reglementair verlies"
                       : u.partij === REGLEMENTAIRE_WINST  ? "reglementaire winst" : "???";
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

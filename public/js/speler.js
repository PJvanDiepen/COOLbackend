"use strict";

actieSelecteren(
    naarAgenda,
    naarRanglijst,
    naarGebruiker,
    [1, "wijzigen..."],
    terugNaar
);
seizoenSelecteren(INTERNE_COMPETITIE);
uitslagenSpeler(document.getElementById("kop"), document.getElementById("tabel"));

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
      r.compleet,
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

const TIJDELIJK_LID_NUMMER = 100;

async function uitslagenSpeler(kop, lijst) {
    kop.innerHTML = [schaakVereniging, seizoenVoluit(seizoen), naamSpeler].join(SCHEIDING);
    const t = await totalenSpeler(seizoen, speler);
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
            if (!t.intern() && u.partij === AFGEZEGD) {
                // deze uitslag overslaan TODO deze uitslag verwijderen
            } else if (u.tegenstanderNummer > TIJDELIJK_LID_NUMMER) {
                lijst.appendChild(internePartij(u, totaal));
            } else if (u.teamCode === INTERNE_COMPETITIE && u.partij === EXTERNE_WEDSTRIJD) {
                vorigeUitslag = u; // deze uitslag overslaan en combineren met volgende uitslag
            } else if (u.teamCode === INTERNE_COMPETITIE) {
                lijst.appendChild(geenPartij(u, totaal));
            } else if (vorigeUitslag && vorigeUitslag.datum === u.datum) {
                lijst.appendChild(externePartijTijdensInterneRonde(vorigeUitslag, u, totaal))
            } else {
                lijst.appendChild(externePartij(u, totaal));
            }
        });
    if (t.aftrek()) {
        lijst.appendChild(htmlRij("", "", "aftrek", "", "", "", t.aftrek(), totaal + t.aftrek()));
    }
}

async function totalenSpeler(seizoen, knsbNummer) {
    let alleTotalen = {};
    await findAsync("/ranglijst/" + seizoen,
        function (speler) {
            if (speler.knsbNummer === knsbNummer) {
                alleTotalen = speler.totalen;
                return true; // stop findAsync()
            }});
    return totalen(alleTotalen);
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
    return htmlRij(rondeKolom, datumKolom, u.naam, "", "", "", u.punten, totaal);
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

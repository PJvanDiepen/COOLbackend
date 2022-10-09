"use strict";

(async function() {
    await init();
    competitieTitel();
    menu([WEDSTRIJDLEIDER, `agenda van ${o_o_o.naam}`, function () {
            naarAnderePagina(`agenda.html?gebruiker=${o_o_o.speler}&naamGebruiker=${o_o_o.naam}`);
        }],
        [BEHEERDER, `backup uitslagen ${o_o_o.naam}` , async function () {
            const rijen = await serverFetch(`/backup/speler/uitslag/${o_o_o.seizoen}/${o_o_o.speler}`);
            backupSQL("uitslag", rijen);
        }],
        [BEHEERDER, "afzeggingen verwijderen", async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/afzeggingen/${o_o_o.seizoen}/${o_o_o.speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${o_o_o.seizoen}/${o_o_o.versie}/${o_o_o.speler}/${o_o_o.competitie}`);
                sessionStorage.removeItem(`/ranglijst/${o_o_o.seizoen}/${o_o_o.versie}/${o_o_o.competitie}/${datumSQL()}`);
                naarZelfdePagina();
            }
        }],
        [BEHEERDER, `${o_o_o.naam} verwijderen`, async function () {
            const mutaties = await serverFetch(`/${uuidToken}/verwijder/speler/${o_o_o.seizoen}/${o_o_o.speler}`);
            if (mutaties) {
                sessionStorage.removeItem(`/uitslagen/${o_o_o.seizoen}/${o_o_o.versie}/${o_o_o.speler}/${o_o_o.competitie}`);
                sessionStorage.removeItem(`/ranglijst/${o_o_o.seizoen}/${o_o_o.versie}/${o_o_o.competitie}/${datumSQL()}`);
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
  order by u.datum, u.rondeNummer;
  */

async function uitslagenSpeler(kop, lijst) {
    const t = (await ranglijst(o_o_o.vorigeRonde, [o_o_o.speler]))[0];
    kop.innerHTML = t.naam + SCHEIDING + seizoenVoluit(o_o_o.seizoen);
    let totaal = t.intern() ? t.startPunten() : "";
    if (t.intern() && t.eigenWaardeCijfer()) {
        lijst.appendChild(htmlRij("", "", `waardecijfer: ${t.eigenWaardeCijfer()}, rating: ${t.rating()}`, "", "", "", totaal, totaal));
    }
    const uitslagen = await localFetch(`/uitslagen/${o_o_o.seizoen}/${o_o_o.versie}/${o_o_o.speler}/${o_o_o.competitie}`);
    let samenvoegen = -1; // niet samengevoegd
    for (let i = 0; i < uitslagen.length; i++) {
        if (samenvoegen < i && geenGeplandePartij(uitslagen, i)) { // verwerken indien niet samengevoegd
            samenvoegen = externTijdensIntern(uitslagen, i);
            if (samenvoegen === i + 1) {
                if (t.intern()) {
                    totaal += uitslagen[i].punten + uitslagen[i + 1].punten;
                }
                if (uitslagen[i].teamCode === o_o_o.competitie) { // TODO verplaatsen naar externePartijTijdensInterneRonde
                    lijst.appendChild(externePartijTijdensInterneRonde(uitslagen[i + 1], totaal, uitslagen[i]));
                } else if (uitslagen[i + 1].teamCode === o_o_o.competitie) {
                    lijst.appendChild(externePartijTijdensInterneRonde(uitslagen[i], totaal, uitslagen[i + 1]));
                } else {
                    console.log("--- fout met externePartijTijdensInterneRonde ---");
                }
            } else {
                if (t.intern()) {
                    totaal += uitslagen[i].punten;
                }
                if (uitslagen[i].partij === INTERNE_PARTIJ) {
                    lijst.appendChild(internePartij(uitslagen[i], totaal));
                } else if (uitslagen[i].partij === EXTERNE_PARTIJ && uitslagen[i].teamCode !== INTERNE_COMPETITIE) {
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
        lijst.appendChild(htmlRij("", "", "uitsluitend afzeggingen", "", "", "", "", ""));
    }
    if (!t.intern() && !t.extern()) {
        lijst.appendChild(htmlRij("", "", "geen interne en geen externe partijen", "", "", "", "", ""));
    }
}

function externTijdensIntern(uitslagen, i) {
    if (i + 1 < uitslagen.length && uitslagen[i].partij === EXTERNE_PARTIJ && uitslagen[i + 1].partij === EXTERNE_PARTIJ) {
        return uitslagen[i].datum === uitslagen[i + 1].datum ? i + 1 : -1;
    } else {
        return -1;
    }
}

function geenGeplandePartij(uitslagen, i) {
    return ![MEEDOEN, NIET_MEEDOEN, EXTERN_THUIS, EXTERN_UIT].includes(uitslagen[i].partij);
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

function externePartijTijdensInterneRonde(uitslag, totaal, interneRonde) {
    const datumKolom = naarRonde(uitslag);
    const tegenstanderKolom = naarTeam(uitslag);
    const puntenKolom = interneRonde.punten + uitslag.punten;
    return htmlRij(interneRonde.rondeNummer, datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, puntenKolom, totaal);
}

function externePartij(uitslag, totaal) {
    const datumKolom = datumLeesbaar(uitslag);
    const tegenstanderKolom = naarTeam(uitslag);
    return htmlRij("", datumKolom, tegenstanderKolom, uitslag.bordNummer, uitslag.witZwart, uitslag.resultaat, uitslag.punten, totaal);
}

function geenPartij(uitslag, totaal) {
    const datumKolom = naarRonde(uitslag);
    const omschrijving = uitslag.partij === AFWEZIG ? "afgezegd"
        : uitslag.partij === ONEVEN                 ? "oneven"
        : uitslag.partij === REGLEMENTAIRE_REMISE   ? "vrijgesteld"
        : uitslag.partij === REGLEMENTAIR_VERLIES   ? "reglementair verlies"
        : uitslag.partij === REGLEMENTAIRE_WINST    ? "reglementaire winst"
        : uitslag.partij === EXTERNE_PARTIJ         ? "externe partij" : "???";
    return htmlRij(uitslag.rondeNummer, datumKolom, omschrijving, "", "", "", uitslag.punten, totaal);
}

function naarRonde(uitslag) {
    return htmlLink(`ronde.html?ronde=${uitslag.rondeNummer}`, datumLeesbaar(uitslag));
}

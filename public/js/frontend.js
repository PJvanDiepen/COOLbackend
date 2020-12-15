"use strict";

/*
const
- webPage
- api
- params
- schaakVereniging
- seizoen

doorgeven:
- schaakVereniging
- seizoen
 */

const pagina = new URL(location);
const api = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = pagina.searchParams;
const schaakVereniging = doorgeven("schaakVereniging");
const seizoen = doorgeven("seizoen");

const INTERNE_COMPETITIE = "int";
const SCHEIDING = " » ";

function doorgeven(key) {
    let value = params.get(key);
    if (value) {
        sessionStorage.setItem(key, value);
    } else {
        value = sessionStorage.getItem(key);
    }
    return value;
}

async function mapAsync(url, mapFun) {
    let object = await localFetch(url);
    object.map(mapFun);
}

async function localFetch(url) {
    let object = JSON.parse(sessionStorage.getItem(url));
    if (!object) {
        object = await serverFetch(url);
        sessionStorage.setItem(url, JSON.stringify(object));
    }
    return object;
}

async function serverFetch(url) {
    try {
        let response = await fetch(api + url);
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

function option(value, text) {
    let option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

function rij(...kolommen) {
    let tr = document.createElement("tr");
    kolommen.map(kolom => {
        let td = document.createElement("td");
        if (kolom.nodeType === Node.ELEMENT_NODE) {
            td.appendChild(kolom);
        } else {
            td.innerHTML = kolom;
        }
        tr.appendChild(td);
    });
    return tr;
}

function href(link, text) {
    let a = document.createElement("a");
    if (text) {
        a.appendChild(document.createTextNode(text));
    }
    a.href = link;
    return a;
}

function naarSpeler(knsbNummer, naam) {
    return href(`speler.html?speler=${knsbNummer}&naam=${naam}`, naam);
}

function naarRonde(tekst, u) {
    let datum = datumLeesbaar(u.datum);
    return href(`ronde.html?ronde=${u.rondeNummer}&datum=${datum}`, tekst);
}

function naarTeam(u) {
    return href(`team.html?team=${u.teamCode}#ronde${u.rondeNummer}`, wedstrijdVoluit(u));
}

function naarZelfdePagina() {
    location.replace(pagina.pathname);
}

function naarAnderePagina(naarPagina) {
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

function datumLeesbaar(datumJson) {
    const d = new Date(datumJson);
    return `${voorloopNul(d.getDate())}-${voorloopNul(d.getMonth()+1)}-${d.getFullYear()}`;
}

function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

function seizoenVoluit(seizoen) {
    return "20" + seizoen.substring(0,2) + "-20" +  seizoen.substring(2,4);
}

function teamVoluit(teamCode) {
    if (teamCode === INTERNE_COMPETITIE) {
        return "interne competitie";
    } else if (teamCode === "kbe") {
        return schaakVereniging + " bekerteam";
    } else if (teamCode === "nbe") {
        return schaakVereniging + " nhsb bekerteam";
    } else {
        return wedstrijdTeam(teamCode)
    }
}

function wedstrijdTeam(teamCode) {
    return schaakVereniging + (teamCode.substring(1) === "be" ? " " : " " + teamCode);
}

function wedstrijdVoluit(r) {
    let eigenTeam = wedstrijdTeam(r.teamCode);
    return r.uithuis === THUIS ? eigenTeam + " - " + r.tegenstander : r.tegenstander + " - " + eigenTeam;
}

async function seizoenen(seizoenSelecteren, teamCode) {
    await mapAsync("/seizoenen/" + teamCode,
        (team) => {
            seizoenSelecteren.appendChild(option(team.seizoen, seizoenVoluit(team.seizoen)));
        });
    seizoenSelecteren.value = seizoen; // werkt uitsluitend na await
    seizoenSelecteren.addEventListener("input",
        () => {
            sessionStorage.setItem("seizoen", seizoenSelecteren.value);
            naarZelfdePagina();
        });
}

async function teams(teamSelecteren, teamCode) {
    await mapAsync("/teams/" + seizoen,
        (team) => {
            teamSelecteren.appendChild(option(team.teamCode, teamVoluit(team.teamCode)));
        });
    teamSelecteren.value = teamCode; // werkt uitsluitend na await
    teamSelecteren.addEventListener("input",
        () => {
            if (teamSelecteren.value === INTERNE_COMPETITIE) {
                naarAnderePagina("ranglijst.html");
            } else {
                naarAnderePagina("team.html?team=" + teamSelecteren.value);
            }
        });
}

async function ronden(rondeSelecteren, teamCode) {
    await mapAsync("/ronden/" + seizoen + "/" + teamCode,
        (ronde) => {
            rondeSelecteren.appendChild(option(ronde.rondeNummer, datumLeesbaar(ronde.datum) + SCHEIDING + "ronde " + ronde.rondeNummer));
        });
    rondeSelecteren.value = rondeNummer; // werkt uitsluitend na await
    rondeSelecteren.addEventListener("input",
        () => {
            sessionStorage.setItem("ronde", rondeSelecteren.value);
            naarZelfdePagina();
        });
}

async function wedstrijden(wedstrijdenSelecteren) {
    await mapAsync("/wedstrijden/" + seizoen,
        (r) => {
            wedstrijdenSelecteren.appendChild(option(r.teamCode + ":" + r.rondeNummer, datumLeesbaar(r.datum) + SCHEIDING + wedstrijdVoluit(r)));
        });
    wedstrijdenSelecteren.appendChild(option(0,wedstrijdenSelecteren.length + " externe wedstrijden"))
    wedstrijdenSelecteren.value = 0; // werkt uitsluitend na await
    wedstrijdenSelecteren.addEventListener("input",
        () => {
            console.log("wedstrijdenSelecteren: " + wedstrijdenSelecteren.value);
        });
}

function ranglijst(kop, lijst) {
    kop.innerHTML = schaakVereniging + SCHEIDING + seizoenVoluit(seizoen);
    mapAsync("/ranglijst/" + seizoen,
        (speler, i) => {
            if (speler.totaal > 0) {
                lijst.appendChild(rij(
                    i + 1,
                    naarSpeler(speler.knsbNummer, speler.naam),
                    speler.totaal));
            }});
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
function uitslagenRonde(kop, lijst) {
    kop.innerHTML = [schaakVereniging, seizoenVoluit(seizoen), "ronde "+ rondeNummer].join(SCHEIDING);
    mapAsync("/ronde/" + seizoen + "/" + rondeNummer,
        (uitslag) => {
            lijst.appendChild(rij(
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslag.resultaat === "1" ? "1-0" : uitslag.resultaat === "0" ? "0-1" : "½-½"));
        });
}

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
      r.compleet,
      r.uithuis,
      r.tegenstander,
      punten(@seizoen, @knsbNummer, u.teamCode, u.tegenstanderNummer, u.resultaat) as punten
  from uitslag u
  join persoon p on u.tegenstanderNummer = p.knsbNummer
  join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
  where u.seizoen = @seizoen
      and u.knsbNummer = @knsbNummer
      and u.anderTeam = 'int'
  order by u.datum, u.bordNummer;
  */

const TIJDELIJK_LID_NUMMER = 100;
const EXTERNE_WEDSTRIJD = 2;

function uitslagenSpeler(kop, lijst) {
    kop.innerHTML = [schaakVereniging, seizoenVoluit(seizoen), naam].join(SCHEIDING);
    let totaal = 300; // TODO uit de MySQL database
    let vorigeUitslag;
    mapAsync("/uitslagen/" + seizoen + "/" + speler,
        (uitslag) => {
            totaal += uitslag.punten;
            if (uitslag.tegenstanderNummer > TIJDELIJK_LID_NUMMER) {
                lijst.appendChild(internePartij(uitslag, totaal));
            } else if (uitslag.teamCode === INTERNE_COMPETITIE && uitslag.tegenstanderNummer === EXTERNE_WEDSTRIJD) {
                vorigeUitslag = uitslag; // deze uitslag overslaan en combineren met volgende uitslag
            } else if (uitslag.teamCode === INTERNE_COMPETITIE) {
                lijst.appendChild(geenPartij(uitslag, totaal));
            } else if (vorigeUitslag && vorigeUitslag.datum === uitslag.datum) {
                lijst.appendChild(externePartijTijdensInterneRonde(vorigeUitslag, uitslag, totaal))
            } else {
                lijst.appendChild(externePartij(uitslag, totaal));
            }
        });
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
    let rondeKolom = naarRonde(u.rondeNummer, u);
    let datumKolom = naarRonde(datumLeesbaar(u.datum), u);
    let tegenstanderKolom = naarSpeler(u.tegenstanderNummer, u.naam);
    return rij(rondeKolom, datumKolom, tegenstanderKolom, "", u.witZwart, u.resultaat, u.punten, totaal);
}

function geenPartij(u, totaal) {
    let rondeKolom = naarRonde(u.rondeNummer, u);
    let datumKolom = naarRonde(datumLeesbaar(u.datum), u);
    return rij(rondeKolom, datumKolom, u.naam, "", "", "", u.punten, totaal);
}

function externePartijTijdensInterneRonde(vorigeUitslag, u, totaal) {
    let rondeKolom = naarRonde(vorigeUitslag.rondeNummer, vorigeUitslag);
    let datumKolom = naarRonde(datumLeesbaar(u.datum), vorigeUitslag);
    let tegenstanderKolom = naarTeam(u);
    let puntenKolom = vorigeUitslag.punten + u.punten;
    return rij(rondeKolom, datumKolom, tegenstanderKolom, u.bordNummer, u.witZwart, u.resultaat, puntenKolom, totaal);
}

function externePartij(u, totaal) {
    return rij("", datumLeesbaar(u.datum), naarTeam(u), u.bordNummer, u.witZwart, u.resultaat, u.punten, totaal);
}

/*

-- uitslagen externe competitie per team
select uitslag.rondeNummer,
    uitslag.bordNummer,
    uitslag.witZwart,
    uitslag.resultaat,
    uitslag.knsbNummer,
    persoon.naam,
from uitslag
join persoon on uitslag.knsbNummer = persoon.knsbNummer
where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;
 */

/**
 * uitslagenTeam doet fetch van JSON ronden en uitslagen per team
 * en verwerkt die tot een tabel met ronden en een aantal tabellen met uitslagen per ronde.
 *
 * @param kop
 * @param rondenTabel
 * @returns {Promise<void>}
 */

async function uitslagenTeam(kop, rondenTabel) {
    console.log(rondenTabel);
    await mapAsync("/teams/" + seizoen,
        (team) => {
            if (team.teamCode === teamCode) {
                kop.innerHTML = [wedstrijdTeam(teamCode), seizoenVoluit(seizoen), team.omschrijving].join(SCHEIDING);
            }
        });
    let rondeUitslagen = [];
    await mapAsync("/ronden/" + seizoen + "/" + teamCode,
        (ronde) => {
            rondeUitslagen[ronde.rondeNummer - 1] = {ronde: ronde, winst: 0, verlies: 0, remise: 0, uitslagen: []};
        });
    await mapAsync("/team/" + seizoen + "/" + teamCode,
        (u) => {
            let rondeUitslag = rondeUitslagen[u.rondeNummer - 1];
            if (u.resultaat === WINST) {
                rondeUitslag.winst += 1;
            } else if (u.resultaat === VERLIES) {
                rondeUitslag.verlies += 1;
            } else {
                rondeUitslag.remise += 1;
            }
            rondeUitslag.uitslagen.push(rij(u.bordNummer, naarSpeler(u.knsbNummer, u.naam), u.witZwart, u.resultaat));
        });
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        const div = document.getElementById("ronde" + (i + 1)); // 9 x div met id="ronde1".."ronde9"
        div.appendChild(document.createElement("h2")).innerHTML = "Ronde " + (i + 1);
        const tabel = div.appendChild(document.createElement("table"));
        if (rondeUitslagen[i]) {
            let ronde = rondeUitslagen[i].ronde;
            let datum = datumLeesbaar(ronde.datum);
            let uitslag = wedstrijdUitslag(ronde, rondeUitslagen[i]);
            rondenTabel.appendChild(rij(ronde.rondeNummer, datum, naarTeam(ronde), uitslag));
            tabel.appendChild(rij(datum, wedstrijdVoluit(ronde), "", uitslag));
            for (let uitslag of rondeUitslagen[i].uitslagen) {
                tabel.appendChild(uitslag);
            }
        }
    }
}

const REMISE = "½";
const WINST  = "1";
const VERLIES = "0";
const THUIS = "t";
const UIT = "u";

function wedstrijdUitslag(ronde, u) {
    while (u.remise >= 2) {
        u.winst += 1;
        u.verlies += 1;
        u.remise -= 2;
    }
    let remise = u.remise > 0 ? REMISE : "";
    return ronde.uithuis === THUIS ? `${u.winst}${remise} - ${u.verlies}${remise}` : `${u.verlies}${remise} - ${u.winst}${remise}`;
    // return uitslagen.sort().join("");
}

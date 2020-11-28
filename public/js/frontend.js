'use strict';

// https://www.digitalocean.com/community/tutorials/understanding-modules-and-import-and-export-statements-in-javascript

/*
const
- url
- api
- params
- schaakVereniging
- seizoen

doorgeven:
- schaakVereniging
- seizoen
 */

const status = document.getElementById("status");
const url = new URL(location);
const api = url.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = url.searchParams;
const schaakVereniging = doorgeven("schaakVereniging");
const seizoen = doorgeven("seizoen");

const INTERNE_COMPETITIE = "int";
const KOP_SCHEIDING = " | ";

melding(url.searchParams);

function melding(tekst) {
    status.innerHTML = tekst;
}

function debugKnop(knopNaam) {
    const knop = document.getElementById(knopNaam);
    const knopUrl = knop.textContent;
    knop.addEventListener("click",
        () => {
            console.log("click: " + knopUrl);
            debugFetch(knopUrl);
        });
}

async function debugFetch(url) {
    melding("lees van database: " + url);
    try {
        let response = await fetch(api + url);
        let json = await response.json();
        console.log(json);
        melding("json: " + url);
        sessionStorage.setItem(url, JSON.stringify(json));
    } catch (e) {
        console.log("catch");
        console.error(e);
    }
}

function doorgeven(key) {
    let value = params.get(key) || sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
    return value
}

async function asyncFetch(url, mapFun, reduceFun) {
    let object = JSON.parse(sessionStorage.getItem(url)) || await backendFetch(url);
    object.map(mapFun);
    if (reduceFun) {
        return json.reduce(reduceFun);
    }
}

async function backendFetch(url) {
    melding("lees van database: " + url);
    try {
        let response = await fetch(api + url);
        let json = await response.json();
        melding("json: " + url);
        sessionStorage.setItem(url, JSON.stringify(json));
        return json;
    } catch (e) {
        console.error(e);
    }
}

function element(tag, text) {
    let el = document.createElement(tag);
    el.innerHTML = text;
    return el;
}

function option(value, text) {
    let option = document.createElement('option');
    option.value = value;
    option.text = text;
    return option;
}

function rij(...kolommen) {
    let tr = document.createElement('tr');
    kolommen.map(kolom => {
        let td = document.createElement('td');
        if (kolom.nodeType === Node.ELEMENT_NODE) {
            td.appendChild(kolom);
        } else {
            td.innerHTML = kolom;
        }
        tr.appendChild(td);
    });
    return tr;
}

function href(text, link) {
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(text));
    a.href = link;
    return a;
}

function datumLeesbaar(datumJson) {
    const d = new Date(datumJson);
    return `${voorloopNul(d.getDate())}-${voorloopNul(d.getMonth()+1)}-${d.getFullYear()}`;
}

function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

function teamVoluit(teamCode) {
    return schaakVereniging + (teamCode.substring(1) === 'be' ? " " : " " + teamCode);
}

function seizoenVoluit(seizoen) {
    return "20" + seizoen.substring(0,2) + "-20" +  seizoen.substring(2,4);
}

async function seizoenen(seizoenSelecteren, teamCode) {
    await asyncFetch("/seizoenen/" + teamCode,
        (team) => {
            seizoenSelecteren.appendChild(option(team.seizoen, seizoenVoluit(team.seizoen)));
        });
    if (seizoen) {
        seizoenSelecteren.value = seizoen; // eerst alle seizoenen in select
    }
    seizoenSelecteren.addEventListener("input",
        () => {
            sessionStorage.setItem("seizoen", seizoenSelecteren.value);
            location.replace(url.pathname); // zonder searchParams
        });
}

async function ronden(rondeSelecteren, teamCode) {
    await asyncFetch("/ronden/" + seizoen + "/" + teamCode,
        (ronde) => {
            rondeSelecteren.appendChild(option(ronde.rondeNummer, datumLeesbaar(ronde.datum) + " ronde " + ronde.rondeNummer));
        });
    if (rondeNummer) {
        rondeSelecteren.value = rondeNummer; // eerst alle ronden in select
    }
    rondeSelecteren.addEventListener("input",
        () => {
            sessionStorage.setItem("ronde", rondeSelecteren.value);
            location.replace(url.pathname); // zonder searchParams
        });
}

function ranglijst(kop, lijst) {
    kop.innerHTML = schaakVereniging + KOP_SCHEIDING + seizoenVoluit(seizoen);
    asyncFetch("/ranglijst/" + seizoen,
        (speler, i) => {
            lijst.appendChild(rij(
                i + 1,
                naarSpeler(speler.knsbNummer,speler.naam),
                speler.totaal));
        });
}

function naarSpeler(knsbNummer, naam) {
    return href(naam,`speler.html?speler=${knsbNummer}&naam=${naam}`);
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
    kop.innerHTML = schaakVereniging + KOP_SCHEIDING + seizoenVoluit(seizoen) + KOP_SCHEIDING + "ronde "+ rondeNummer;
    asyncFetch("/ronde/" + seizoen + "/" + rondeNummer,
        (uitslag) => {
            lijst.appendChild(rij(
                naarSpeler(uitslag.knsbNummer, uitslag.wit),
                naarSpeler(uitslag.tegenstanderNummer, uitslag.zwart),
                uitslag.resultaat === "1" ? "1-0" : uitslag.resultaat === "0" ? "0-1" : "½-½"));
        });
}

/*
 Fetch JSON uitslagen en verwerk die met uitslagRij tot rijen voor de uitslagen tabel.
 */

function uitslagenSpeler(kop, lijst) {
    kop.innerHTML = schaakVereniging + KOP_SCHEIDING + seizoenVoluit(seizoen) + KOP_SCHEIDING + naam;
    let totaal = 300;
    asyncFetch("/uitslagen/" + seizoen + "/" + speler,
        (uitslag) => {
            totaal = totaal + uitslag.punten;
            lijst.appendChild(uitslagRij(uitslag, totaal));
        });
}

/*
Verwerk een JSON uitslag tot een rij van 8 kolommen.

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

1. link naar interne ronde
2. datum
3. link naar interne tegenstander, link naar externe wedstrijd of andere tekst
4. externe bord
5. kleur
6. resultaat
7. punten
8. voortschrijdend totaal

@param u JSON uitslag
@param totaal punten
 */

const TIJDELIJK_LID_NUMMER = 100;

function uitslagRij(u, totaal) {
    let datum = datumLeesbaar(u.datum);
    if (u.tegenstanderNummer > TIJDELIJK_LID_NUMMER) {
        return rij(naarRonde(u.rondeNummer, datum), datum, naarSpeler(u.tegenstanderNummer, u.naam), "", u.witZwart, u.resultaat, u.punten, totaal);
    } else if (u.teamCode === "int") {
        return rij(naarRonde(u.rondeNummer, datum), datum, u.naam, "", "", "", u.punten, totaal);
    } else {
        return rij("", datum, naarTeam(u), u.bordNummer, u.witZwart, u.resultaat, u.punten, totaal);
    }
}

function naarRonde(rondeNummer, datum) {
    return href(rondeNummer,`ronde.html?ronde=${rondeNummer}&datum=${datum}`);
}

function naarTeam(u) {
    return href(wedstrijdVoluit(u),`team.html?team=${u.teamCode}#ronde${u.rondeNummer}`);
}

function wedstrijdVoluit(u, teamCode) {
    let eigenTeam = teamVoluit(u.teamCode || teamCode);
    return u.uithuis === "t" ? eigenTeam + " -  " + u.tegenstander : u.tegenstander + " - " + eigenTeam;
}


/*
-- uitslagen externe competitie per team
select uitslag.rondeNummer,
    uitslag.bordNummer,
    uitslag.witZwart,
    uitslag.resultaat,
    uitslag.knsbNummer,
    persoon.naam,
    ronde.uithuis,
    ronde.tegenstander,
    ronde.plaats,
    ronde.datum
from uitslag
join persoon on uitslag.knsbNummer = persoon.knsbNummer
join ronde on uitslag.seizoen = ronde.seizoen and uitslag.teamCode = ronde.teamCode and uitslag.rondeNummer = ronde.rondeNummer
where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;
 */
// router.get('/team/:seizoen/:teamCode', async ctx => {

function uitslagenTeam(kop) {
    kop.innerHTML = schaakVereniging + KOP_SCHEIDING + seizoenVoluit(seizoen) + KOP_SCHEIDING + teamVoluit(teamCode);
    let rondeNummer = 0;
    let lijst;
    asyncFetch("/team/" + seizoen + "/" + teamCode,
        (uitslag) => {
            if (uitslag.rondeNummer > rondeNummer) {
                rondeNummer = uitslag.rondeNummer;
                lijst = document.getElementById("ronde" + rondeNummer);
                lijst.appendChild(element("h4",
                    datumLeesbaar(uitslag.datum) + KOP_SCHEIDING + "Ronde " + rondeNummer + KOP_SCHEIDING + wedstrijdVoluit(uitslag, teamCode)));
                console.log(uitslag);
            }
            // lijst.appendChild(uitslagRij(uitslag, totaal));
        });
}

function rondeLijst(rondeNummer, lijst, uitslag) {


    return lijst;
}

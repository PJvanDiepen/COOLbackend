'use strict'

/*
ranglijst.html:
- h1 id="ranglijst"
- select id="seizoenSelecteren"
- h1 id="seizoen"
- table id="spelers"

URL searchParams:
- schaakVereniging

in localStarage:
- schaakVereniging
- seizoen
 */
const params = (new URL(document.location)).searchParams;
const schaakVereniging = params.get('schaakVereniging');
localStorage.setItem("schaakVereniging", schaakVereniging);

const api = document.location.origin + "/api";

const ranglijstKop = document.getElementById("ranglijst");
ranglijstKop.innerHTML = "Ranglijst " + schaakVereniging;

const seizoenKop = document.getElementById("seizoen");
const seizoenSelecteren = document.getElementById("seizoenSelecteren");
const geenSeizoen = seizoenSelecteren.value;
let seizoen = localStorage.getItem("seizoen");
seizoenOpties();
seizoenSelecteren.addEventListener("input", anderSeizoen);

const tabel = document.getElementById("spelers");
const naarSpeler = new URL(location.href).pathname.replace("ranglijst.html","speler.html");
ranglijst();

function seizoenOpties() {
    fetch(api + "/seizoenen") // verschillende seizoenen in Speler tabel
        .then(response => response.json())
        .then(spelerSeizoenen => {
            spelerSeizoenen.map(
                (spelerSeizoen) => {
                seizoenSelecteren.appendChild(option(spelerSeizoen.seizoen, seizoenVoluit(spelerSeizoen.seizoen)));
            });
        });
}

function seizoenVoluit(seizoen) {
    return "20" + seizoen.substring(0,2) + "-20" +  seizoen.substring(2,4);
}

function anderSeizoen() {
    geenRanglijst();
    seizoen = seizoenSelecteren.value;
    localStorage.setItem("seizoen", seizoen);
    if (seizoen !== geenSeizoen) {
        ranglijst();
    }
}

function geenRanglijst() {
    seizoenKop.innerHTML = "Seizoen";
    while (tabel.childNodes.length > 2) {
        tabel.removeChild(tabel.lastChild);
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

function ranglijst() {
    seizoenKop.innerHTML = "Seizoen " + seizoenVoluit(seizoen);
    fetch(api + "/ranglijst/" + seizoen)
        .then(response => response.json())
        .then(spelers => {
            spelers.map((speler, i) => {
                let link = `${naarSpeler}?speler=${speler.knsbNummer}&naam=${speler.naam}`;
                tabel.appendChild(rij(i+1, href(link, speler.naam), speler.totaal));
            });
        });
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

function href(link, text) {
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(text));
    a.href = link;
    return a;
}
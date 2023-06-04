/*
 * Deze module bevat alle code voor interactie met HTML
 *
 * De eerste pagina staat in index.html en start.html is de pagina, die 0-0-0 app start.
 * De bijhorende start.js verwerkt de url, vult de pagina aan en reageert op de gebruiker.
 *
 * Dit geldt voor alle vervolg pagina's. Bij agenda.html hoort agenda.js, bij api.htm hoort test.js en zo voort.
 * Daarnaast zijn er modules:
 *
 * html.js voor interactie met html
 * db.js voor interactie met de MySQL database
 * en zo voort
 */

import * as db from "./db.js";

export const pagina = new URL(location);
export const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
export const params = pagina.searchParams;

export const SCHEIDING = " \u232A ";
export const VINKJE = "\u00a0\u00a0✔\u00a0\u00a0"; // met no break spaces
export const STREEP = "___";
export const KRUISJE = "\u00a0\u00a0✖\u00a0\u00a0"; // met no break spaces
export const FOUTJE = "\u00a0\u00a0?\u00a0\u00a0"; // met no break spaces
export const ZELFDE = "\u00a0\u00a0=\u00a0\u00a0"; // met no break spaces

/*
TODO const html = {id1: , id2: } alle DOM elementen met id

https://stackoverflow.com/questions/59068548/how-to-get-all-of-the-element-ids-on-the-same-time-in-javascript

TODO cache legen indien nieuwe software versie

https://www.tutorialspoint.com/how-to-clear-cache-memory-using-javascript
https://stackoverflow.com/questions/32414/how-can-i-force-clients-to-refresh-javascript-files

https://support.mozilla.org/en-US/kb/how-clear-firefox-cache
https://help.overdrive.com/en-us/0518.html
https://support.google.com/accounts/answer/32050?hl=en&co=GENIE.Platform%3DDesktop&oco=1
 */

/**
 * menu() verwerkt een algemeen menu van de start-pagina en alle menuKeuzes tot een select-knop
 *
 * @param menuRechten mutatieRechten van gebruiker (TODO db.gebruiker.mutatieRechten?)
 * @param menuKeuzes elke keuze bestaat uit minimumRechten, tekst en bijhorende functie
 *
 * De start-pagina maakt een algemeen menu voor de startKeuzes waarin elke keuze bestaat uit minimumRechten, tekst en naarPagina.
 * menu() voegt alle menuKeuzes samen met de startKeuzes en maakt daarbij van de naarPagina de bijbehorende functie.
 * Het samenvoegen begint met de startKeuzes, bij IEDEREEN, MENU komen de menuKeuzes daarna komt de rest van de startKeuzes.
 *
 * menu() maakt opties voor select() met uitsluitend de menuKeuzes waarvoor de gebruiker voldoende menuRechten heeft.
 */
export function menu(menuRechten, ...menuKeuzes) {
    const MENU = "menu";
    const startKeuzes = JSON.parse(sessionStorage.getItem(MENU)); // algemeen menu van start pagina
    startKeuzes.push([db.IEDEREEN, MENU]);
    startKeuzes.push([db.GEREGISTREERD, "systeembeheer", "beheer.html"]);
    const HAMBURGER = "\u2630";
    const opties = [[HAMBURGER, HAMBURGER]];  // geen functie
    for (const [minimumRechten, tekst, naarPagina] of startKeuzes) {
        if (minimumRechten === db.IEDEREEN && tekst === MENU) {
            for (const [minimumRechten, tekst, functie] of menuKeuzes) {
                if (minimumRechten <= menuRechten) {
                    opties.push(["", tekst, functie]);
                }
            }
        } else if (minimumRechten <= menuRechten && !pagina.href.includes(naarPagina)) { // juiste rechten en niet naar huidige pagina
            opties.push(["", tekst, function() {
                anderePagina(naarPagina);
            }]);
        }
    }
    selectie(MENU, HAMBURGER, opties);
}

/**
 * selectie zet alle selectieOpties op een select-knop met opties en zet een eventListener klaar om een optie te verwerken.
 *
 * @param selectieId van HTML knop
 * @param selectieWaarde huidige optie
 * @param selectieOpties opties met waarde, tekst en eventueel een functie om deze waarde te verwerken
 * @param selectieFunctie functie om de geselecteerde waarde te verwerken (indien er geen functie bij de opties is gespecificeerd)
 *
 * Elke selectieOptie bestaat uit waarde, tekst en bijbehorend functie.
 * Elke optie krijgt een volgnummer en een tekst.
 * Er is een functie per optie of een functie voor alle opties (selektieFunctie).
 * Het volgnummer verwijst naar de bijbehorende functie in functies en de bijbehorende waarde in waardes.
 *
 * De eventListener krijgt het volgnummer door en start de bijbehorende functie met de bijbehorende waarde.
 */
export function selectie(selectieId, selectieWaarde, selectieOpties, selectieFunctie = function (waarde) {
    console.log(`--- selectie(${selectieId}, ${waarde} van ${selectieOpties.length} opties) ---`);
}) {
    const knop = document.getElementById(selectieId);
    const functies = [];
    const waardes = [];
    for (const [waarde, tekst, functie] of selectieOpties) {
        const volgnummer = functies.length; // optie 0, 1, 2 enz.
        functies.push(functie ? functie : selectieFunctie);
        waardes.push(waarde);
        knop.append(optie(volgnummer, tekst));
        if (waarde === selectieWaarde) {
            knop.value = volgnummer;
        }
    }
    knop.addEventListener("input",function () {
        functies[knop.value](waardes[knop.value]);
    });
}

export function optie(value, text) { // TODO zonder export?
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

export function checkbox(id, value, text) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = value;
    const label = document.createElement("label");
    label.append(input, ` ${text}`); // spatie tussen checkbox en label
    return label;
}

export function verwerkt(node, indien) {
    if (indien) {
        node.classList.add("verwerkt");
    }
}

export function rij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.append(kolom);
        tr.append(td);
    });
    return tr;
}

export function naarPaginaEnTerug(link, text) {
    const a = document.createElement("a");
    a.append(text);
    a.href = link;
    return a;
}

export function naarPagina(link, text) {
    const a = document.createElement("a");
    a.append(text);
    a.href = "";
    a.addEventListener("click", function (event) {
        event.preventDefault();
        anderePagina(link);
    });
    return a;
}

export function anderePagina(naarPagina) { // pagina en parameters
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

export function zelfdePagina(parameters) {
    location.replace(pagina.pathname + (parameters ? "?" + parameters : ""));
}

export function plaatje(bestand, percentage, breed, hoog) {
    const img = document.createElement("img");
    img.src = bestand;
    const factor = (window.innerWidth * percentage / 100) / breed; // percentage maximale breedte
    if (factor > 1.0) {
        img.width = breed;
        img.height = hoog;
    } else {
        img.width = Math.round(breed * factor);
        img.height = Math.round(hoog * factor);
    }
    return img;
}

export function tabblad(link) {
    const a = document.createElement("a");
    a.append(link);
    a.href = server + link;
    a.target = "_blank"; // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
    a.rel = "noopener noreferrer"
    return a;
}
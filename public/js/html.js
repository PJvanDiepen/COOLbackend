/*
 * Deze module bevat alle code voor interactie met HTML en CSS.
 */

import * as db from "./db.js";

export const pagina = new URL(location);
export const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
export const params = pagina.searchParams;

export const SCHEIDING = " \u232A ";
export const VINKJE = "\u00a0\u00a0✔\u00a0\u00a0"; // met no break spaces
export const STREEP = "___";
export const KRUISJE = "\u00a0\u00a0✖\u00a0\u00a0"; // met no break spaces
export const VRAAGTEKEN = "\u00a0\u00a0?\u00a0\u00a0"; // met no break spaces
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
    const startKeuzes = sessionStorage.getItem(db.MENU) ? JSON.parse(sessionStorage.getItem(db.MENU)) : []; // algemeen menu van start pagina
    const HAMBURGER = "\u2630";
    const opties = [[HAMBURGER, HAMBURGER]];  // geen functie
    for (const [minimumRechten, tekst, naarPagina] of startKeuzes) {
        if (minimumRechten === db.IEDEREEN && tekst === db.MENU) { // de menuKeuzes van een specifieke pagina tussenvoegen
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
    selectie(id(db.MENU), HAMBURGER, opties);
}

/**
 * id geeft node op huidige webpagina
 *
 * @param nodeId id van node op huidige webpagina
 * @returns {HTMLElement}
 */
export function id(nodeId) {
    return document.getElementById(nodeId);
}

/**
 * selectie zet alle opties op een select-knop en zet een eventListener klaar om een optie te verwerken.
 *
 * @param knop HTML knop
 * @param optieWaarde huidige optie
 * @param opties met waarde, tekst en eventueel een functie om deze waarde te verwerken
 * @param optieVerwerken functie om de geselecteerde waarde te verwerken (indien er geen functie bij de opties is gespecificeerd)
 *
 * Elke optie bestaat uit waarde, tekst en bijbehorend functie en krijgt een volgnummer.
 * Er is een functie per optie of een functie voor alle opties (optieVerwerken).
 * Het volgnummer verwijst naar de bijbehorende functie in functies en de bijbehorende waarde in waardes.
 *
 * De eventListener krijgt het volgnummer door en start de bijbehorende functie met de bijbehorende waarde.
 */
export function selectie(knop, optieWaarde, opties, optieVerwerken = function (waarde) {
    console.log(`--- selectie(${waarde} van ${opties.length} opties) ---`); // indien geen functie voor alle opties (optieVerwerken)
}) {
    const functies = [];
    const waardes = [];
    for (const [waarde, tekst, functie] of opties) {
        const volgnummer = functies.length; // optie 0, 1, 2 enz.
        functies.push(functie ? functie : optieVerwerken);
        waardes.push(waarde);
        knop.append(optie(volgnummer, tekst));
        if (waarde === optieWaarde) {
            knop.value = volgnummer;
        }
    }
    knop.addEventListener("input",function () {
        // TODO event.preventDefault(); toevoegen?
        functies[knop.value](waardes[knop.value]);
    });
}

export function optie(value, text) {
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

export function onzichtbaar(node, indien) {
    if (indien) {
        node.classList.add("onzichtbaar");
    }
    return indien;
}

export function tekstOverschrijven(node, tekst) {
    node.textContent = tekst;
}

export function tekstToevoegen(node, tekst) {
    node.textContent += tekst;
}

export function rij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.forEach(function (kolom) {
        const td = document.createElement("td");
        td.append(kolom);
        tr.append(td);
    });
    return tr;
}

export function bovenRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.forEach(function (kolom) {
        const th = document.createElement("th");
        th.append(kolom);
        tr.append(th);
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
        event.preventDefault(); // TODO is dit nodig?
        anderePagina(link);
    });
    return a;
}

export function anderePagina(naarPagina) { // pagina en parameters
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

export function vorigePagina(parameters) {
    location.replace(document.referrer.match(/\w+.html/) + (parameters ? "?" + parameters : ""));
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
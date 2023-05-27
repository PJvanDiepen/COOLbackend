// because this is a module, I'm strict by default

export const SCHEIDING = " \u232A ";
export const VINKJE = "\u00a0\u00a0✔\u00a0\u00a0"; // met no break spaces
export const STREEP = "___";
export const KRUISJE = "\u00a0\u00a0✖\u00a0\u00a0"; // met no break spaces
export const FOUTJE = "\u00a0\u00a0?\u00a0\u00a0"; // met no break spaces
export const ZELFDE = "\u00a0\u00a0=\u00a0\u00a0"; // met no break spaces

export const pagina = new URL(location);
export const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
export const params = pagina.searchParams;

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

export function checkbox(id, value, text) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = value;
    const label = document.createElement("label");
    label.append(input, ` ${text}`); // spatie tussen checkbox en label
    return label;
}

/**
 * selectie uit keuzes aan HTML knop koppelen en geselecteerde keuze verwerken
 *
 * @param selectieId van HTML knop
 * @param selectieKeuzes keuze / tekst paren
 * @param selectieValue huidige keuze
 * @param selectieFun om de geselecteerde keuze te verwerken
 */
export function selectie(selectieId, selectieKeuzes, selectieValue, selectieFun) {
    const knop = document.getElementById(selectieId);
    for (const [value, text] of selectieKeuzes) {
        knop.append(optie(value, text));
    }
    knop.value = selectieValue;
    knop.addEventListener("input",function () {
        selectieFun(knop.value);
    });
}

export function optie(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

export function tekst(text) { // TODO is deze nog nodig?
    return text.nodeType === Node.ELEMENT_NODE ? text : document.createTextNode(text);
}

export function fout(node, indien) {
    if (indien) {
        node.classList.add("fout");
    }
}

export function verwerkt(node, indien) {
    if (indien) {
        node.classList.add("verwerkt");
    }
}

export function vet(node, indien) {
    if (indien) {
        node.classList.add("vet");
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
        naarAnderePagina(link);
    });
    return a;
}

export function naarAnderePagina(naarPagina) { // pagina en parameters
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

export function naarZelfdePagina(parameters) {
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
/*
kopie van const.js met export, zodat zyq.js een module is
 */

// kop
export const SCHEIDING = " \u232A ";
export const VINKJE = "\u00a0\u00a0✔\u00a0\u00a0"; // met no break spaces
export const STREEP = "___";
export const KRUISJE = "\u00a0\u00a0✖\u00a0\u00a0"; // met no break spaces
export const FOUTJE = "\u00a0\u00a0?\u00a0\u00a0"; // met no break spaces
export const ZELFDE = "\u00a0\u00a0=\u00a0\u00a0"; // met no break spaces

export const pagina = new URL(location);
export const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
export const params = pagina.searchParams;

/**
 * menu() verwerkt alle menuKeuzes tot een select-menu met htmlOptie's en zet een eventListener klaar.
 *
 * Elke menuKeuze bestaat uit [ <minimumRechten>, <menuKeuze tekst>, <bijhorende functie> ].
 * Indien gebruiker niet voldoende mutatieRechten heeft, komt de menuKeuze niet in het menu.
 * Elke htmlOptie krijgt een tekst en een volgnummer.
 * Het volgnummer verwijst naar de bijbehorende functie in functies.
 *
 * De eventListener krijgt het volgnummer door en start de bijbehorende functie.
 *
 * @param menuKeuzes
 * @returns {Promise<void>}
 */
export async function menu(...menuKeuzes) {
    const acties = document.getElementById("menu");
    const startKeuzes = JSON.parse(sessionStorage.getItem("menu")); // menu van start pagina (in omgekeerde volgorde)
    for (const [minimumRechten, tekst, naarPagina] of startKeuzes) {
        if (!pagina.href.includes(naarPagina)) { // niet naar huidige pagina
            menuKeuzes.unshift([minimumRechten, tekst, function() {
                naarAnderePagina(naarPagina);
            }]);
        }
    }
    menuKeuzes.unshift([IEDEREEN, "\u2630"]); // hamburger bovenaan in het menu
    menuKeuzes.push([GEREGISTREERD, "systeembeheer", function () { // onderaan in het menu
        naarAnderePagina("beheer.html"); // TODO niet indien huidige pagina = beheer.html
    }]); // TODO naar documentatie voor deze pagina
    let functies = [];
    for (let [minimumRechten, tekst, functie] of menuKeuzes) {
        if (minimumRechten <= gebruiker.mutatieRechten) {
            acties.appendChild(htmlOptie(functies.length, tekst));
            functies.push(functie ? functie :
                function () {
                    console.log(tekst);
                });
        }
    }
    acties.addEventListener("input",
        function () {
            functies[acties.value]();
            acties.value = 0;
        });
}

/*
TODO const html = {id1: , id2: } alle DOM elementen met id

https://stackoverflow.com/questions/59068548/how-to-get-all-of-the-element-ids-on-the-same-time-in-javascript
 */

export function htmlCheckbox(id, value, tekst) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = value;
    const label = document.createElement("label");
    label.appendChild(input);
    label.appendChild(htmlTekst(` ${tekst}`)); // spatie tussen checkbox en label
    return label;
}

export function htmlOptie(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

export function htmlTekst(tekst) {
    return tekst.nodeType === Node.ELEMENT_NODE ? tekst : document.createTextNode(tekst);
}

export function htmlFout(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("fout");
    }
}

export function htmlVerwerkt(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("verwerkt");
    }
}

export function htmlVet(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("vet");
    }
}

export function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.appendChild(htmlTekst(kolom));
        tr.appendChild(td);
    });
    return tr;
}

export function htmlLinkEnTerug(link, tekst) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(tekst));
    a.href = link;
    return a;
}

export function htmlLink(link, tekst) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(tekst));
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
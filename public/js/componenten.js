/*
 * De eerste pagina van 0-0-0.nl is index.html zonder code.
 * De 0-0-0 app start op start.html met in club=<clubCode> voor een bepaalde schaakvereniging.
 * De bijhorende start.js verwerkt de url, synchroniseert met de server, vult de pagina aan en
 * reageert op de gebruiker. Dit geldt voor alle vervolg pagina's.
 * Bij agenda.html hoort agenda.js, bij bestuur.html hoort bestuur.js en zo voort.
 *
 * Deze module componenten.js bevat code voor componenten die op meer dan een pagina worden gebruikt
 * door middel van import { namen, van, componenten } from "./componenten.js";
 *
 * Daarnaast zijn er andere modules:
 *
 * html.js bevat alle code voor de interactie met HTML en CSS
 * db.js bevat alle code voor het valideren van de velden in de tabellen van de MySQL database
 * server.js bevat alle code voor de interactie met de server op 0-0-0.nl
 * enz.
 */
import * as html from "./html.js";
import * as db from "./db.js";
import * as server from "./server.js";

/*
TODO in plaats van o_o_o.js en zyq.js
 */


/**
 * debug geeft informatie over de boom naar aanleiding van object.
 *
 * Indien debug: "server" of "browser" dan alleen de server of browser boom en anders 2 bomen.
 * Indien <veld>: een waarde heeft, zoekt debug met deze waarde.
 *
 * debug vermeldt uit welke tak van de boom de informatie komt,
 * drukt de gevraagde velden per tak af en
 * drukt af waar de aanroep van debug precies staat.
 *
 * @param object specificeert welke informatie
 */
export async function debug(object) {
    if (object.debug === "server" || object.debug !== "browser") {
        console.log("--- debug: server ---");
        const debugVraag
            = server.vraag(`/tak_${Object.keys(object).length-2}`);
        console.log(debugVraag);
        await debugVraag.muteren();
    } if (object.debug === "browser" || object.debug !== "server") {
        console.log("--- debug: browser ---");
    }
    console.trace("--- debug ---");
}
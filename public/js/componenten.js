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
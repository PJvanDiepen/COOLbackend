"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

import {ranglijst} from "./o_o_o.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>

    terug naar indelen.html
 */
const rondeNummer = Number(html.params.get("ronde"));
const witSpeler   = Number(html.params.get("wit"));
const zwartSpeler = Number(html.params.get("zwart"));

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    const totDatum = zyq.o_o_o.ronde[rondeNummer].datum;
    html.id("subkop").textContent =
        `Handmatig indelen ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar({datum: totDatum})}`;
    const spelers = (await ranglijst(rondeNummer)).filter(function (speler) {
        if (speler.knsbNummer === witSpeler || speler.knsbNummer === zwartSpeler) {
            return false;
        } else {
            return speler.intern() || speler.oneven();
        }
    }).map(function (speler) {
        return [speler, speler.naam];
    });
    const partijen = html.id("partijen");
    const witKnop = await spelerSelecteren(true, spelers);
    const zwartKnop = await spelerSelecteren(false, spelers);
    partijen.append(html.rij(1, witKnop, zwartKnop, ""));
    await html.menu(zyq.gebruiker.mutatieRechten,[]);

    /*
    TODO "y" + "z" inlezen (of "i" met definitieve indeling)
    TODO klik op uitslag voor kleur wisselen, wit verwijderen, zwart verwijderen of alles verwijderen
    TODO overbodige CSS van rondenlijst verwijderen
     */

})();

async function spelerSelecteren(metWit, spelers) {
    const naam = html.params.get("naam");
    if (metWit && witSpeler) {
        return zyq.naarSpeler({naam: naam, knsbNummer: witSpeler});
    } else if (!metWit && zwartSpeler) {
        return zyq.naarSpeler({naam: naam, knsbNummer: zwartSpeler});
    }
    const knop = document.createElement("select");
    html.selectie(knop, 0, [[0,"selecteer speler"], ...spelers], async function (speler) {
        if (metWit && zwartSpeler) {
            await paarWitZwart(speler, {naam: naam, knsbNummer: zwartSpeler});
        } else if (!metWit && witSpeler) {
            await paarWitZwart({naam: naam, knsbNummer: zwartSpeler}, speler);
        } else {
            const kleur = metWit ? "wit" : "zwart";
            html.zelfdePagina(`ronde=${rondeNummer}&${kleur}=${speler.knsbNummer}&naam=${speler.naam}`);
        }
    });
    return knop;
}

async function paarWitZwart(wit, zwart) {
    const datum = zyq.datumSQL(zyq.o_o_o.ronde[rondeNummer].datum);
    const mutaties = await zyq.serverFetch(
        `/${zyq.uuidToken}/paren/${db.key(zyq.o_o_o.ronde[rondeNummer])}/${wit.knsbNummer}/${zwart.knsbNummer}`);
    html.zelfdePagina(`ronde=${rondeNummer}`);
}
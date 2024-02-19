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
console.log({witSpeler});
console.log({zwartSpeler});

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
    let bordNummer = 0;
    const paren = await zyq.serverFetch(`/${zyq.uuidToken}/paren/${db.key(zyq.o_o_o.ronde[rondeNummer])}`);
    paren.forEach(function (paar) {
       console.log(paar);
       bordNummer = paar.bordNummer;
       partijen.append(html.rij(bordNummer, paar.wit, paar.zwart));
    });
    bordNummer++;
    const witKnop = await spelerSelecteren(bordNummer,true, spelers);
    const zwartKnop = await spelerSelecteren(bordNummer, false, spelers);
    partijen.append(html.rij(bordNummer, witKnop, zwartKnop, ""));
    await html.menu(zyq.gebruiker.mutatieRechten,[]);

    /*
    TODO "y" + "z" inlezen (of "i" met definitieve indeling)
    TODO klik op uitslag voor kleur wisselen, wit verwijderen, zwart verwijderen of alles verwijderen
    TODO overbodige CSS van rondenlijst verwijderen
     */

})();

async function spelerSelecteren(bordNummer, metWit, spelers) {
    const naam = html.params.get("naam");
    if (metWit && witSpeler) {
        return zyq.naarSpeler({naam: naam, knsbNummer: witSpeler});
    } else if (!metWit && zwartSpeler) {
        return zyq.naarSpeler({naam: naam, knsbNummer: zwartSpeler});
    }
    const knop = document.createElement("select");
    html.selectie(knop, 0, [[0,"selecteer speler"], ...spelers], async function (speler) {
        if (metWit && zwartSpeler) {
            await paarWitZwart(bordNummer, speler, {naam: naam, knsbNummer: zwartSpeler});
        } else if (!metWit && witSpeler) {
            await paarWitZwart(bordNummer, {naam: naam, knsbNummer: witSpeler}, speler);
        } else {
            const kleur = metWit ? "wit" : "zwart";
            html.zelfdePagina(`ronde=${rondeNummer}&${kleur}=${speler.knsbNummer}&naam=${speler.naam}`);
        }
    });
    return knop;
}

async function paarWitZwart(bordNummer, wit, zwart) {
    console.log(wit);
    console.log(zwart);
    const mutaties = await zyq.serverFetch(
        `/${zyq.uuidToken}/paar/${db.key(zyq.o_o_o.ronde[rondeNummer])}/${bordNummer}/${wit.knsbNummer}/${zwart.knsbNummer}`);
    if (mutaties) {
        html.zelfdePagina(`ronde=${rondeNummer}`);
    } else {
        console.log(`Handmatig ${wit.knsbNummer} tegen ${zwart.knsbNummer} is mislukt.`);
    }
}
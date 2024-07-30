/*
DONE function endpoint (commando) {}
TODO zoek specificatie op de server met commando
TODO foutboodschap indien niet gevonden
TODO foutboodschappen indien meer dan 1 gevonden
TODO variabelen: <parameter> voor alle mogelijke parameters
TODO methods <parameter>Invullen om alle mogelijke parameters in te vullen
TODO methode <parameter>Invullen doet niks en geeft fout indien niet in specificatie
TODO url met commando en gespecificeerde parameters
TODO lees of wijzig?
TODO indien wijzig naar serverFetch
TODO localFetch met sessionStorage.getItem(url)
TODO indien niet gevonden naar serverFetch
TODO indien wel gevonden en revisie actueel
DONE indien gevonden sessionStorage.setItem(url)
TODO foutboodschap indien niet gevonden
TODO wijzig

TODO indien oude revisie altijd serverFetch
 */

export async function endpoint (commando) {
    console.log(await localFetch("/api"));

    function afdrukken() {
        console.log(commando);
        return this;
    }

    return Object.freeze({
        afdrukken           // ()
    });
}

const pagina = new URL(location);
const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = pagina.searchParams;

/**
 * localFetch optimaliseert de verbinding met de database op de server
 * door het antwoord van de server ook lokaal op te slaan
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
async function localFetch(url) {
    let object = JSON.parse(sessionStorage.getItem(url));
    if (!object || nietActueel(object)) {
        object = await serverFetch(url);
        sessionStorage.setItem(url, JSON.stringify(object));
    }
    return object;
}

function nietActueel(object) {
    if (object.revisie === undefined) { // object zonder revisie is actueel
        return false;
    } else {
        const revisie = Number(object.revisie);
        return revisie < 1; // object met revisie = 0 is voorlopig nietActueel
    }
}

/**
 * serverFetch maakt verbinding met de database voor actuele situatie
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
async function serverFetch(url) {
    try {
        const response = await fetch(server + url);
        if (response.ok) {
            return await response.json();
        } else {
            console.log(`--- serverFetch ---`);
            console.log(response);
            return false;
        }
    } catch (error) {
        console.log(`--- serverFetch error ---`);
        console.error(error);
    }
}
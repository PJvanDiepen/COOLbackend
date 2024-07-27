/*
DONE function endpoint (commando) {}
TODO zoek specificatie op de server met commando
TODO foutboodschap indien niet gevonden
TODO variabelen: <parameter> voor alle mogelijke parameters
TODO methods <parameter>Invullen om alle mogelijke parameters in te vullen
TODO methode <parameter>Invullen doet niks en geeft fout indien niet in specificatie
TODO url met commando en gespecificeerde parameters
TODO sessionStorage.getItem(url)
TODO indien niet gevonden of revisie niet actueel dan fetch( server + url )
TODO indien gevonden sessionStorage.setItem(url)
TODO foutboodschap indien niet gevonden
 */

export function endpoint (commando) {
    function afdrukken() {
        console.log(commando);
        return this;
    }

    return Object.freeze({
        afdrukken           // ()
    });
}

/**
 * localFetch optimaliseert de verbinding met de database op de server
 * door het antwoord van de server ook lokaal op te slaan
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
async function localFetch(url) {
    let object = JSON.parse(sessionStorage.getItem(url));
    if (!object) {
        object = await serverFetch(url);
        sessionStorage.setItem(url, JSON.stringify(object));
    }
    return object;
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
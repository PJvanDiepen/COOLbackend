"use strict";

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }],
        [BEHEERDER, "formulier van geselecteerde speler", function () {
            document.getElementById("naam").value = o_o_o.naam;
            document.getElementById("knsbNummer").value = o_o_o.speler;
            document.getElementById("status").value = "iemand anders registreren";
        }]);
    spelerSelecteren(ditSeizoen);
    gebruikerFormulier(
        document.getElementById("formulier"),
        document.getElementById("naam"),
        document.getElementById("knsbNummer"),
        document.getElementById("email"),
        document.getElementById("status"));
})();

async function spelerSelecteren(seizoen) {
    const spelers = document.getElementById("spelerSelecteren");
    spelers.appendChild(htmlOptie(0, "selecteer naam"));
    (await localFetch(`/spelers/${seizoen}`)).forEach(
        function (persoon) {
            spelers.appendChild(htmlOptie(Number(persoon.knsbNummer), persoon.naam));
        });
    spelers.value = o_o_o.speler; // werkt uitsluitend na await
    spelers.addEventListener("input",
        function () {
            const i = spelers.selectedIndex;
            sessionStorage.setItem("speler", spelers.options[i].value); // = spelers.value;
            sessionStorage.setItem("naam", spelers.options[i].text )
            naarZelfdePagina();
        });
}

// TODO voor iemand anders aanvraag doen (uitsluitend door systeembeheerder)

async function gebruikerFormulier(formulier, naam, knsbNummer, email, status) {
    if (o_o_o.speler) {
        knsbNummer.value = o_o_o.speler;
        naam.value = o_o_o.naam;
    }
    knsbNummer.value = o_o_o.speler ? o_o_o.speler : gebruiker.knsbNummer;
    naam.value = o_o_o.speler ? o_o_o.naam : gebruiker.naam;
    if (uuidToken) {
        status.value = `${gebruiker.naam} is als gebruiker geregistreerd bij ${o_o_o.vereniging}`;
    } else if (gebruiker.email) {
        email.value = gebruiker.email;
        status.value = `${gebruiker.naam} heeft al een aanvraag verstuurd`;
    } else if (!o_o_o.speler) {
        status.value = "selecteer je naam";
    }
    formulier.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (Number(knsbNummer.value)) {
            gebruiker.knsbNummer = Number(knsbNummer.value);
            gebruiker.naam = naam.value;
            gebruiker.email = email.value;
            gebruiker.mutatieRechten = 0;
            const json = JSON.stringify(gebruiker);
            sessionStorage.setItem("/gebruiker/", json); // voorlopig zonder uuidToken
            volgendeSessie(json); // overschrijf eventueel uuidToken
            status.value = "je aanvraag is verstuurd voor controle";
            const mutaties = await serverFetch(`/registreer/${knsbNummer.value}/${email.value}`);
        } else {
            status.value = "selecteer je naam";
        }
    });
}
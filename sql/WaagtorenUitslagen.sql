use waagtoren;

set @seizoen = '1819';

set @teamCode = '1';

set @rondeNummer = 23;

-- uitslagen interne competitie per ronde 
select uitslag.knsbNummer, wit.naam, uitslag.tegenstanderNummer, zwart.naam, uitslag.resultaat 
from uitslag 
join persoon as wit on uitslag.knsbNummer = wit.knsbNummer
join persoon as zwart on uitslag.tegenstanderNummer = zwart.knsbNummer 
where seizoen = @seizoen and teamCode = 'int' and rondeNummer = @rondeNummer and witZwart = 'w'
order by uitslag.seizoen, uitslag.bordNummer;

-- uitslagen externe competitie per team 
select uitslag.rondeNummer, 
	uitslag.bordNummer, 
    uitslag.witZwart, 
    uitslag.resultaat,
    uitslag.knsbNummer,
    persoon.naam,
    ronde.uithuis,
    ronde.tegenstander,
    ronde.plaats,
    ronde.datum
from uitslag 
join persoon on uitslag.knsbNummer = persoon.knsbNummer
join ronde on uitslag.seizoen = ronde.seizoen and uitslag.teamCode = ronde.teamCode and uitslag.rondeNummer = ronde.rondeNummer 
where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;
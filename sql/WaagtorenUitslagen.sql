use waagtoren;

set @seizoen = '1819';

set @rondeNummer = 23;

-- uitslagen interne competitie per ronde 
select uitslag.knsbNummer, wit.naam, uitslag.tegenstanderNummer, zwart.naam, uitslag.resultaat 
from uitslag 
join persoon as wit on uitslag.knsbNummer = wit.knsbNummer
join persoon as zwart on uitslag.tegenstanderNummer = zwart.knsbNummer 
where seizoen = @seizoen and teamCode = 'int' and rondeNummer = @rondeNummer and witZwart = 'w'
order by uitslag.seizoen, rondeNummer, bordNummer;
use waagtoren;

drop function waardeCijfer;

delimiter $$

create function waardeCijfer(seizoen char(4), knsbNummer int) returns int deterministic
begin
    declare subgroep char(1);
    select s.subgroep into subgroep from speler s where s.seizoen = seizoen and s.knsbNummer = knsbNummer;
    if subgroep = 'A' then
        return 12;
    elseif subgroep = 'B' then
        return 11;
    elseif subgroep = 'C' then
        return 10;
    elseif subgroep = 'D' then
        return 9;
    elseif subgroep = 'E' then
        return 8;
    elseif subgroep = 'F' then
        return 7;
    elseif subgroep = 'G' then
        return 6;
    elseif subgroep = 'H' then
        return 5;
    else
        return 0;
    end if;
end;
$$

delimiter ;

drop function punten;

delimiter $$

create function punten(eigenPunten int, seizoen char(4), teamCode char(3), tegenstander int, resultaat char(1))
returns int deterministic
begin
    if teamCode <> 'int' then -- niet interne competitie
        return 4; 
	elseif tegenstander = 4 then -- interne competitie: tegenstander en uitslag nog niet bekend
        return 0;
    elseif tegenstander in (1, 5, 8) then -- oneven, reglementaire winst of bye
        return eigenPunten + 12;
    elseif tegenstander in (2, 7) then -- extern of vrijgesteld
        return eigenpunten;
    elseif tegenstander = 3 then -- afgezegd
        return eigenpunten - 4; 
    elseif tegenstander = 6 then -- reglementair verlies
        return eigenPunten - 12;
    else
        begin -- interne competitie: tegenstander en uitslag wel bekend 
            declare plus int;
            if resultaat = '1' then -- winst
                set plus = 12;
            elseif resultaat = '0' then -- verlies
                set plus = -12;
            else -- remise
                set plus = 0;
            end if;
            return waardeCijfer(seizoen, tegenstander) + plus;
        end;
    end if;
end;
$$

delimiter ;

drop function totaal;

delimiter $$

create function totaal(seizoen char(4), knsbNummer int) returns int deterministic
begin
    declare eigenPunten int;
    declare totaalPunten int default 300;
    declare aftrekPunten int default 0;
    declare afzeggingen int default 0;
    declare teamCode char(3);
    declare tegenstander int;
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select u.teamCode, tegenstanderNummer, u.resultaat
        from uitslag u
        where u.seizoen = seizoen and u.knsbNummer = knsbNummer;
    declare continue handler for not found
        set found = false;
    set eigenPunten = waardeCijfer(seizoen, knsbNummer);
    open uitslagen;
    fetch uitslagen into teamCode, tegenstander, resultaat;
    while found
        do
            if tegenstander = 3 then
                set afzeggingen = afzeggingen + 1;
            end if;
            set totaalPunten =
                totaalPunten + punten(eigenPunten, seizoen, teamCode, tegenstander, resultaat);
            fetch uitslagen into teamCode, tegenstander, resultaat;
        end while;
    close uitslagen;
    if afzeggingen > 10 then
        set aftrekPunten = (afzeggingen - 10) * 8;
    end if;
    return totaalPunten - aftrekPunten;
end;
$$

delimiter ;

set @seizoen = '1819';

set @knsbNummer = 6212404; -- Peter van Diepen

-- ruwe ranglijst

select s.knsbNummer, naam, totaal(@seizoen, s.knsbNummer) as punten
from speler s
    join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by punten desc;

-- punten van alle uitslagen per speler

set @eigenPunten = waardeCijfer(@seizoen, @knsbNummer);
select u.datum, u.rondeNummer, witZwart, t.naam, resultaat, u.teamCode, tegenstander, plaats, 
	punten(@eigenPunten, u.seizoen, u.teamCode, tegenstanderNummer, resultaat) as punten
from uitslag u
    join persoon t on u.tegenstanderNummer = t.knsbNummer
    join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
where u.seizoen = @seizoen and u.knsbNummer = @knsbNummer
order by u.datum;

use waagtoren;

drop function waardeCijfer;

delimiter $$

create function waardeCijfer(seizoen char(4), knsbNummer int) returns int deterministic
begin
    declare subgroep char(1);
    select s.subgroep
    into subgroep
    from speler s
    where s.seizoen = seizoen
      and s.knsbNummer = knsbNummer;
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

create function punten(seizoen char(4), knsbNummer int, eigenWaardeCijfer int, teamCode char(3), tegenstander int, resultaat char(1))
    returns int deterministic
begin
    declare plus int default 0;
    if teamCode <> 'int' then -- niet interne competitie
        return 4;
    elseif tegenstander = 4 then -- interne competitie: tegenstander en uitslag zijn nog niet bekend
        return 0;
    elseif tegenstander > 100 then -- interne competitie: tegenstander en uitslag zijn bekend
		if resultaat = '1' then -- winst
            set plus = 12;
		elseif resultaat = '0' then -- verlies
			set plus = -12;
		end if; -- remise
        return waardeCijfer(seizoen, tegenstander) + plus;
    else
		if tegenstander in (1, 5, 8) then -- oneven, reglementaire winst of bye
			set plus = 12;
		elseif tegenstander = 3 then -- afgezegd
			set plus = - 4;
		elseif tegenstander = 6 then -- reglementair verlies
			set plus = - 12;
		end if; -- extern of vrijgesteld
            return eigenWaardeCijfer + plus;
    end if;
end;
$$

delimiter ;

drop function totaal;

delimiter $$

create function totaal(seizoen char(4), knsbNummer int) returns int deterministic
begin
    declare totaalPunten int default 300;
    declare eigenWaardeCijfer int;
    declare internePartijen int default 0;
    declare externePartijen int default 0;
    declare afzeggingen int default 0;
    declare teamCode char(3);
    declare tegenstander int;
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select u.teamCode, u.tegenstanderNummer, u.resultaat
        from uitslag u
        where u.seizoen = seizoen
            and u.knsbNummer = knsbNummer
            and u.anderTeam = 'int';
    declare continue handler for not found
    set found = false;
    set eigenWaardeCijfer = waardeCijfer(seizoen, knsbNummer);
    open uitslagen;
    fetch uitslagen into teamCode, tegenstander, resultaat;
    while found
        do
            if tegenstander > 100 then
                set internePartijen = internePartijen + 1;
            elseif tegenstander = 3 then
                set afzeggingen = afzeggingen + 1;
			elseif teamCode <> 'int' then
                set externePartijen = externePartijen + 1;
            end if;
            set totaalPunten = totaalPunten + punten(seizoen, knsbNummer, eigenWaardeCijfer, teamCode, tegenstander, resultaat);
            fetch uitslagen into teamCode, tegenstander, resultaat;
        end while;
    close uitslagen;
    if internePartijen = 0 and externePartijen = 0 then
        return 0;
	elseif internePartijen = 0 then
        return externePartijen;
    elseif afzeggingen > 10 then
        return totaalPunten - (afzeggingen - 10) * 8;
    else
        return totaalPunten;
    end if;
end;
$$

delimiter ;

set @seizoen = '1819';

set @knsbNummer = 6212404; -- Peter van Diepen

-- simpele ranglijst
select s.knsbNummer, naam, totaal(@seizoen, s.knsbNummer) as punten
from speler s
join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by punten desc;

-- punten van alle uitslagen per speler
select u.datum,
       u.rondeNummer,
       u.bordNummer,
       u.witZwart,
       u.tegenstanderNummer,
       p.naam,
       u.resultaat,
       u.teamCode,
       r.compleet,
       r.uithuis,
       r.tegenstander,
       punten(@seizoen, @knsbNummer, waardeCijfer(@seizoen, @knsbNummer), u.teamCode, u.tegenstanderNummer, u.resultaat) as punten
from uitslag u
join persoon p on u.tegenstanderNummer = p.knsbNummer
join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
where u.seizoen = @seizoen
    and u.knsbNummer = @knsbNummer
    and u.anderTeam = 'int'
order by u.datum, u.bordNummer;


set @seizoen = '1819';

set @knsbNummer = 6212404; -- Peter van Diepen

call totalen(@seizoen, @knsbNummer, @punten, @winst, @remise, @verlies, @wit, @zwart, @extern, @afzeggingen, @oneven); 
select @seizoen, @knsbNummer, @punten, @winst, @remise, @verlies, @wit, @zwart, @extern, @afzeggingen, @oneven;

-- experiment
drop procedure totalen;

delimiter //

create procedure totalen(in seizoen char(4), in knsbNummer int,
    out punten int, out winst int, out remise int, out verlies int,
    out wit int, out zwart int, out extern int, out afzeggingen int, out oneven int)
begin
    declare eigenWaardeCijfer int;
    declare teamCode char(3);
    declare witZwart char(1);
    declare tegenstander int;
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select uitslag.teamCode, uitslag.witZwart, uitslag.tegenstanderNummer, uitslag.resultaat
        from uitslag
        where uitslag.seizoen = seizoen
          and uitslag.knsbNummer = knsbNummer
          and uitslag.anderTeam = 'int';
    declare continue handler for not found
        set found = false;
    set punten = 300;
    set winst = 0;
    set remise = 0;
    set verlies = 0;
    set wit = 0;
    set zwart = 0;
    set extern = 0;
    set afzeggingen = 0;
    set oneven = 0;
    set eigenWaardeCijfer = waardeCijfer(seizoen, knsbNummer);
    open uitslagen;
    fetch uitslagen into teamCode, witZwart, tegenstander, resultaat;
    while found
        do
            if teamCode <> 'int' then -- niet interne competitie
                set extern = extern + 1;
                set punten = punten + 4;
            elseif tegenstander > 100 then -- interne partij
                if resultaat = '1' then
                    set winst = winst + 1;
                    set punten = punten + 12;
                elseif resultaat = '0' then
                    set verlies = verlies + 1;
                    set punten = punten - 12;
                else
                    set remise = remise + 1;
                end if;
                set punten = punten + waardeCijfer(seizoen, tegenstander);
                if witZwart = 'w' then
                    set wit = wit + 1;
                elseif witZwart = 'z' then
                    set zwart = zwart + 1;
                end if;
            else
                if tegenstander = 1 then -- oneven
                    set oneven = oneven + 1;
                    set punten = punten + 12;
                elseif tegenstander = 5 or tegenstander = 8 then -- reglementaire winst of bye
                    set punten = punten + 12;
                elseif tegenstander = 3 then -- afgezegd
                    set afzeggingen = afzeggingen + 1;
                    set punten = punten - 4;
                elseif tegenstander = 6 then -- reglementair verlies
                    set punten = punten - 12;
                end if; -- else extern of vrijgesteld
                set punten = punten + eigenWaardeCijfer;
            end if;
            fetch uitslagen into teamCode, witZwart, tegenstander, resultaat;
        end while;
    close uitslagen;
    if winst = 0 and remise = 0 and verlies = 0 then
        set punten = extern;
    elseif afzeggingen > 10 then
        set punten = punten - (afzeggingen - 10) * 8;
    end if;
end;
//

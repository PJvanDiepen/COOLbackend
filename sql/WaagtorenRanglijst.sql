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

create function punten(seizoen char(4), knsbNummer int, teamCode char(3), tegenstander int, resultaat char(1))
    returns int deterministic
begin
    declare plus int default 0;
    if teamCode <> 'int' then -- niet interne competitie
        return 4;
    elseif tegenstander = 4 then -- interne competitie: tegenstander en uitslag zijn nog niet bekend
        return 0;
    elseif tegenstander > 100 then -- interne competitie: tegenstander en uitslag zijn bekend
        begin
            if resultaat = '1' then -- winst
                set plus = 12;
            elseif resultaat = '0' then -- verlies
                set plus = -12;
            end if; -- remise
        end;
        return waardeCijfer(seizoen, tegenstander) + plus;
    else
        begin
            if tegenstander in (1, 5, 8) then -- oneven, reglementaire winst of bye
                set plus = 12;
            elseif tegenstander = 3 then -- afgezegd
                set plus = - 4;
            elseif tegenstander = 6 then -- reglementair verlies
                set plus = - 12;
            end if; -- extern of vrijgesteld
            return waardeCijfer(seizoen, knsbNummer) + plus;
        end;
    end if;
end;
$$

delimiter ;

drop function totaal;

delimiter $$

create function totaal(seizoen char(4), knsbNummer int) returns int deterministic
begin
    declare totaalPunten int default 300;
    declare internePartijen int default 0;
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
    open uitslagen;
    fetch uitslagen into teamCode, tegenstander, resultaat;
    while found
        do
            if tegenstander > 100 then
                set internePartijen = internePartijen + 1;
            elseif tegenstander = 3 then
                set afzeggingen = afzeggingen + 1;
            end if;
            set totaalPunten = totaalPunten + punten(seizoen, knsbNummer, teamCode, tegenstander, resultaat);
            fetch uitslagen into teamCode, tegenstander, resultaat;
        end while;
    close uitslagen;
    if internePartijen = 0 then
        return 0;
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
       u.witZwart,
       t.naam,
       u.resultaat,
       u.teamCode,
       r.tegenstander,
       r.plaats,
       punten(@seizoen, @knsbNummer, u.teamCode, u.tegenstanderNummer, u.resultaat) as punten
from uitslag u
join persoon t on u.tegenstanderNummer = t.knsbNummer
join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
where u.seizoen = @seizoen
    and u.knsbNummer = @knsbNummer
    and u.anderTeam = 'int'
order by u.datum;

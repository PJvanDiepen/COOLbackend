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
    if teamCode <> 'int' then
        return 4; -- niet interne competitie
    elseif tegenstander in (1, 4, 5) then
        return eigenPunten + 12; -- oneven, bye of reglementaire winst
    elseif tegenstander in (2, 7) then
        return eigenpunten; -- extern of vrijgesteld
    elseif tegenstander = 3 then
        return eigenpunten - 4; -- afgezegd
    elseif tegenstander = 6 then
        return eigenPunten - 12; -- reglementair verlies
    else
        begin
            declare plus int;
            if resultaat = '1' then
                set plus = 12; -- winst
            elseif resultaat = '0' then
                set plus = -12; -- verlies
            else
                set plus = 0; --  remise
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

set @seizoen = '1920';

-- ruwe ranglijst

select s.knsbNummer, naam, totaal(@seizoen, s.knsbNummer) as punten
from speler s
    join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by punten desc;
use waagtoren;

drop function waardeCijfer;

delimiter $$

create function waardeCijfer(seizoen char(4), knsbNummer int) 
returns int deterministic -- reglement artikel 10
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
    returns int deterministic -- reglement artikel 12
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
select s.knsbNummer, naam, totaal(@seizoen, s.knsbNummer) as totaal
from speler s
join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by totaal desc;

-- ranglijst
select s.knsbNummer, naam, subgroep, internTotalen(@seizoen, s.knsbNummer) as totalen
from speler s
join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by totalen desc;

drop function internTotalen;

delimiter $$

create function internTotalen(seizoen char(4), knsbNummer int) returns varchar(45) deterministic
begin
    declare totaal int default 0;
    declare startPunten int default 300; -- reglement artikel 11
    declare maximumAfzeggingen int default 10; -- reglement artikel 12
    declare aftrek int default 0;
    declare minimumInternePartijen int default 20; -- reglement artikel 2
    declare prijs int default 1; 
    declare eigenWaardeCijfer int;
	declare externePartijen int default 0;
    declare oneven int default 0;
	declare afzeggingen int default 0;
    declare winst int default 0; 
	declare remise int default 0; 
    declare verlies int default 0; 
    declare wit int default 0; 
    declare zwart int default 0;
    declare teamCode char(3);
    declare tegenstander int;
    declare witZwart char(1);
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select u.teamCode, u.tegenstanderNummer, u.witZwart, u.resultaat
        from uitslag u
        where u.seizoen = seizoen
            and u.knsbNummer = knsbNummer
            and u.anderTeam = 'int';
    declare continue handler for not found
    set found = false;
    set eigenWaardeCijfer = waardeCijfer(seizoen, knsbNummer);
    open uitslagen;
    fetch uitslagen into teamCode, tegenstander, witZwart, resultaat;
    while found
        do
            if teamCode <> 'int' then
                set externePartijen = externePartijen + 1;
            elseif tegenstander = 1  then
                set oneven = oneven + 1;
			elseif tegenstander = 3 then
                set afzeggingen = afzeggingen + 1;
            elseif tegenstander > 100 then
                if resultaat = '1' then
					set winst = winst + 1;
				elseif resultaat = '0' then
					set verlies = verlies + 1;
				else
					set remise = remise + 1;
				end if;
				if witZwart = 'w' then
					set wit = wit + 1;
				else
                    set zwart = zwart + 1;
                end if;
            end if;
            set totaal = totaal + punten(seizoen, knsbNummer, eigenWaardeCijfer, teamCode, tegenstander, resultaat);
            fetch uitslagen into teamCode, tegenstander, witZwart, resultaat;
        end while; 
    close uitslagen;
    if wit = 0 and zwart = 0 then
        if externePartijen > 9 then
			return concat('0', externePartijen);
		else
			return concat('00', externePartijen);
		end if;
	else
		if afzeggingen > maximumAfzeggingen then
			set aftrek = (afzeggingen - maximumAfzeggingen) * 8;
		end if;
        if (wit + zwart) < minimumInternePartijen then
			set prijs = 0;
		end if;
        set totaal = totaal + startPunten - aftrek;
		return concat(totaal, ' ', prijs, ' ', winst, ' ', remise, ' ', verlies, ' ', wit, ' ', zwart, ' ', oneven, ' ', afzeggingen, ' ', aftrek, ' ', startPunten);
    end if;
end;
$$

delimiter ;

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
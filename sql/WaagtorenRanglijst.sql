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

create function punten(seizoen char(4), knsbNummer int, eigenWaardeCijfer int, teamCode char(3), partij char(1), tegenstander int, resultaat char(1))
    returns int deterministic -- reglement artikel 12
begin
    if partij = 'i' and resultaat = '1' then
        return waardeCijfer(seizoen, tegenstander) + 12;
    elseif partij = 'i' and resultaat = '½' then
        return waardeCijfer(seizoen, tegenstander);
    elseif partij = 'i' and resultaat = '0' then
        return waardeCijfer(seizoen, tegenstander) - 12;
    elseif partij = 'a' then -- afwezig
        return eigenWaardeCijfer - 4;
    elseif partij = 't' then -- teamleider
        return eigenWaardeCijfer;
    elseif partij = 'o' then -- oneven
		return eigenWaardeCijfer + 12;
    elseif partij = 'w' then -- reglementaire winst
        return eigenWaardeCijfer + 12;
	elseif partij = 'v' then -- reglementair verlies
		return eigenWaardeCijfer - 12;
    elseif partij = 'e' and teamCode = 'int' then -- externe partij tijdens interne ronde
        return eigenWaardeCijfer;
	elseif partij = 'e' then -- elke externe partij
        return 4;
	else
		return 0;   
    end if;
end;
$$

delimiter ;

drop function totalen;

delimiter $$

create function totalen(seizoen char(4), knsbNummer int) returns varchar(600) deterministic
begin
    declare totaal int default 0;
    declare startPunten int default 300; -- reglement artikel 11
    declare maximumAfzeggingen int default 10; -- reglement artikel 12
    declare aftrek int default 0;
    declare minimumInternePartijen int default 20; -- reglement artikel 2
    declare reglementairGewonnen int default 0;
    declare externTijdensInterneRonde int default 0;
    declare prijs int default 1;
    declare sorteer int default 0;
    declare eigenWaardeCijfer int;
    declare oneven int default 0;
	declare afzeggingen int default 0;
    declare winstIntern int default 0;
	declare remiseIntern int default 0;
    declare verliesIntern int default 0;
    declare witIntern int default 0;
    declare zwartIntern int default 0;
    declare winstExtern int default 0;
    declare remiseExtern int default 0;
    declare verliesExtern int default 0;
    declare witExtern int default 0;
    declare zwartExtern int default 0;
    declare rondenVerschil int default 7; -- reglement artikel 3
    declare tegenstanders varchar(500) default '';
    declare teamCode char(3);
    declare rondeNummer int;
    declare partij char(1);
    declare tegenstander int;
    declare witZwart char(1);
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select u.teamCode, u.rondeNummer, u.partij, u.tegenstanderNummer, u.witZwart, u.resultaat
        from uitslag u
        where u.seizoen = seizoen
            and u.knsbNummer = knsbNummer
            and u.anderTeam = 'int';
    declare continue handler for not found
    set found = false;
    set eigenWaardeCijfer = waardeCijfer(seizoen, knsbNummer);
    open uitslagen;
    fetch uitslagen into teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
    while found
        do
            if partij = 'i' and resultaat = '1' then
                set winstIntern = winstIntern + 1;
            elseif partij = 'i' and resultaat = '½' then
                set remiseIntern = remiseIntern + 1;
            elseif partij = 'i' and resultaat = '0' then
                set verliesIntern = verliesIntern + 1;
            elseif partij = 'a' then
                set afzeggingen = afzeggingen + 1;
            elseif partij = 'o' then
                set oneven = oneven + 1;
            elseif partij = 'w' then
                set reglementairGewonnen = reglementairGewonnen + 1;
            elseif partij = 'e' and teamCode = 'int' then
                set externTijdensInterneRonde = externTijdensInterneRonde + 1;
            elseif partij = 'e' and resultaat = '1' then
                set winstExtern = winstExtern + 1;
            elseif partij = 'e' and resultaat = '½' then
                set remiseExtern = remiseExtern + 1;
            elseif partij = 'e' and resultaat = '0' then
                set verliesExtern = verliesExtern + 1;
            end if;
            if partij = 'i' and witZwart = 'w' then
                set witIntern = witIntern + 1;
                set tegenstanders = concat(tegenstanders, ' ', rondeNummer, ' 1 ', tegenstander);
            elseif partij = 'i' and witZwart = 'z' then
                set zwartIntern = zwartIntern + 1;
                set tegenstanders = concat(tegenstanders, ' ', rondeNummer, ' 0 ', tegenstander);
            elseif partij = 'e' and witZwart = 'w' then
                set witExtern = witExtern + 1;
            elseif partij = 'e' and witZwart = 'z' then
                set zwartExtern = zwartExtern + 1;
            end if;
            set totaal = totaal + punten(seizoen, knsbNummer, eigenWaardeCijfer, teamCode, partij, tegenstander, resultaat);
            fetch uitslagen into teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
        end while; 
    close uitslagen;
    if witIntern = 0 and zwartIntern = 0 then
        set prijs = 0;
        set sorteer = witExtern + zwartExtern;
	else
		if afzeggingen > maximumAfzeggingen then
			set aftrek = (afzeggingen - maximumAfzeggingen) * 8;
		end if;
        if (witIntern + zwartIntern + oneven + reglementairGewonnen + externTijdensInterneRonde) < minimumInternePartijen then
			set prijs = 0;
		end if;
        set sorteer  = startPunten + totaal - aftrek;
    end if;
    return concat(
        lpad(sorteer,3,'0'), ' ', -- 0
        prijs, ' ', -- 1
        winstIntern, ' ', -- 2
        remiseIntern, ' ', -- 3
        verliesIntern, ' ', -- 4
        witIntern, ' ', -- 5
        zwartIntern, ' ', -- 6
        oneven, ' ', -- 7
        afzeggingen, ' ', -- 8
        aftrek, ' ', -- 9
        totaal, ' ', -- 10
        startPunten, ' ', -- 11
        winstExtern, ' ', -- 12
        remiseExtern, ' ', -- 13
        verliesExtern, ' ', -- 14
        witExtern, ' ', -- 15
        zwartExtern, ' ', -- 16
        rondenverschil, -- 17
        tegenstanders);

end;
$$

delimiter ;

set @seizoen = '1819';

set @knsbNummer = 6212404; -- Peter van Diepen

-- ranglijst
select s.knsbNummer, naam, subgroep, knsbRating, totalen(@seizoen, s.knsbNummer) as totalen
from speler s
join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by totalen desc;

-- punten van alle uitslagen per speler
select u.datum,
       u.rondeNummer,
       u.bordNummer,
       u.witZwart,
       u.tegenstanderNummer,
       p.naam,
       u.resultaat,
       u.teamCode,
       u.partij,
       r.uithuis,
       r.tegenstander,
       punten(@seizoen, @knsbNummer, waardeCijfer(@seizoen, @knsbNummer), u.teamCode, u.partij, u.tegenstanderNummer, u.resultaat) as punten
from uitslag u
join persoon p on u.tegenstanderNummer = p.knsbNummer
join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
where u.seizoen = @seizoen
    and u.knsbNummer = @knsbNummer
    and u.anderTeam = 'int'
order by u.datum, u.bordNummer;

-- agenda voor alle interne en externe ronden per speler
with
  s as (select * from speler where seizoen = @seizoen and knsbNummer = @knsbNummer),
  u as (select * from uitslag where seizoen = @seizoen and knsbNummer = @knsbNummer)
select r.*, u.bordNummer, u.partij, u.witZwart, u.tegenstanderNummer, u.resultaat
  from ronde r
  join s on r.seizoen = s.seizoen
  left join u on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
where r.seizoen = @seizoen and r.teamCode in ('int', s.knsbTeam, s.nhsbTeam)
order by r.datum;
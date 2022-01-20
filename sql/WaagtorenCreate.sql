use waagtoren;

CREATE DATABASE  IF NOT EXISTS `waagtoren`;
USE `waagtoren`;

drop table if exists persoon;
create table persoon (
	knsbNummer int not null,
    naam varchar(45),
    PRIMARY KEY (knsbNummer)
);

drop table if exists gebruiker;
create table gebruiker (
	knsbNummer int not null,
    mutatieRechten int not null,
    uuidToken char(36),
    email varchar(100),
    datumEmail date,
    primary key (uuidToken)
);

alter table gebruiker
add constraint fk_gebruiker_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
drop table if exists paring;  -- TODO lezen in WaagtorenRanglijst totalen
create table paring (
	knsbNummer int not null,
    tegenstanderNummer int not null,
    voorkeur int,
    primary key (knsbNummer, tegenstanderNummer)
); 

alter table paring
add constraint fk_paring_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;   
    
alter table paring
add constraint fk_paring_tegenstander
    foreign key (tegenstanderNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;       
    
drop table if exists team;
create table team (
	seizoen char(4) not null,
    teamCode char(3) not null,
    bond char(1),
    poule char(2),
    omschrijving varchar(45),
    borden int not null,
    teamleider int not null,
    PRIMARY KEY (seizoen, teamCode)
);

alter table team
add constraint fk_team_persoon
    foreign key (teamleider)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;       

DROP TABLE IF EXISTS speler;
CREATE TABLE speler (
    seizoen char(4) not null,
	nhsbTeam char(3) not null,
    nhsbOpgegeven char(3) not null,
	knsbTeam char(3) not null,
    knsbOpgegeven char(3) not null,
    knsbNummer int not null,
    knsbRating int not null,
    datumRating date not null,
    PRIMARY KEY (seizoen, knsbNummer)
);

alter table speler
add constraint fk_speler_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
alter table speler
add CONSTRAINT fk_speler_nhsb_team
    FOREIGN KEY (seizoen, nhsbTeam)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
alter table speler
add CONSTRAINT fk_speler_vast_nhsb_team
    FOREIGN KEY (seizoen, nhsbOpgegeven)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
        
alter table speler
add CONSTRAINT fk_speler_knsb_team
    FOREIGN KEY (seizoen, knsbTeam)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE; 
    
alter table speler
add CONSTRAINT fk_speler_vast_knsb_team
    FOREIGN KEY (seizoen, knsbOpgegeven)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;        
    
DROP TABLE IF EXISTS ronde;
CREATE TABLE ronde (
    seizoen char(4) not null,
    teamCode char(3) not null,
    rondeNummer int not null,
    uithuis char(1) not null,
    tegenstander varchar(45),
    plaats varchar(45),
    datum date not null,
    PRIMARY KEY (seizoen, teamCode, rondeNummer)
);

alter table ronde
add CONSTRAINT fk_ronde_team
    FOREIGN KEY (seizoen, teamCode)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
DROP TABLE IF EXISTS uitslag;
CREATE TABLE uitslag (
    seizoen char(4) not null,
    teamCode char(3) not null,
    rondeNummer int not null,
    bordNummer int not null,
    knsbNummer int not null,
    partij char(1),
    witZwart char(1),
    tegenstanderNummer int,
    resultaat char(1),
    datum date comment 'indien op een andere datum dan ronde',
    anderTeam char(3),
    PRIMARY KEY (seizoen, teamCode, rondeNummer, knsbNummer)
);

alter table uitslag
add CONSTRAINT fk_uitslag_team
    FOREIGN KEY (seizoen, teamCode)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
alter table uitslag
add CONSTRAINT fk_uitslag_ander_team
    FOREIGN KEY (seizoen, anderTeam)
    REFERENCES team (seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
            
alter table uitslag
add constraint fk_uitslag_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
alter table uitslag
add constraint fk_uitslag_tegenstander
    foreign key (tegenstanderNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
alter table uitslag
add CONSTRAINT fk_uitslag_ronde
    FOREIGN KEY (seizoen, teamCode, rondeNummer)
    REFERENCES ronde (seizoen, teamCode, rondeNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;        

DROP TABLE IF EXISTS ranglijst;
CREATE TABLE ranglijst (
    seizoen char(4) not null,
    teamCode char(3) not null,
    versie char(1) not null comment 'a = actueel',
    startPunten int default 300 comment 'artikel 11',
    berekening varchar(300) comment 'SQL function', 
    PRIMARY KEY (seizoen, teamCode, versie)
);

drop table if exists mutatie;
create table mutatie (
    tijdstip datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP comment 'geen tijdzone conversie',
    volgNummer int not null,
	knsbNummer int not null,
    url varchar(100),
    aantal int,
    invloed int,
    primary key (tijdstip, volgNummer)
);

alter table mutatie
add constraint fk_mutatie_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

show tables;
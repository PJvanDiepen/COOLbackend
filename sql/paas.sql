use waagtoren;

select * from team where seizoen = '2122'; 
delete from team where seizoen = '2122' and teamCode = 'ipa';

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
('2122', 'ipa', 'i', 'pa', 'Paas competitie', 0, 0);

select * from ronde where seizoen = '2122' and teamCode = 'ipa'; 
delete from ronde where seizoen = '2122' and teamCode = 'ipa';

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, plaats, datum) values
('2122', 'ipa', '1', 't', '', 'Alkmaar', '2022-04-18'),
('2122', 'ipa', '2', 't', '', 'Alkmaar', '2022-04-18'),
('2122', 'ipa', '3', 't', '', 'Alkmaar', '2022-04-18'),
('2122', 'ipa', '4', 't', '', 'Alkmaar', '2022-04-19'),
('2122', 'ipa', '5', 't', '', 'Alkmaar', '2022-04-19'),
('2122', 'ipa', '6', 't', '', 'Alkmaar', '2022-04-19'),
('2122', 'ipa', '7', 't', '', 'Alkmaar', '2022-04-20'),
('2122', 'ipa', '8', 't', '', 'Alkmaar', '2022-04-20'),
('2122', 'ipa', '9', 't', '', 'Alkmaar', '2022-04-20');

select * from uitslag where seizoen = '2122' and teamCode = 'ipa'; 
delete from uitslag where seizoen = '2122' and teamCode = 'ipa';
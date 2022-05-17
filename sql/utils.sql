show databases;
use performance_schema;
show tables;
select * from users;

-- vind uitslagen zonder bijbehorende ronden (kapotte foreign key relation child: uitslag naar primary key parent: ronde)
use waagtoren;
select u.seizoen, u.teamCode, u.rondeNummer from uitslag u
where not exists (select * from ronde r where r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer); 

-- https://dataedo.com/kb/query/mysql/list-foreign-keys

select concat(fks.constraint_schema, '.', fks.table_name) as foreign_table,
       '->' as rel,
       concat(fks.unique_constraint_schema, '.', fks.referenced_table_name)
              as primary_table,
       fks.constraint_name,
       group_concat(kcu.column_name
            order by position_in_unique_constraint separator ', ') 
             as fk_columns
from information_schema.referential_constraints fks
join information_schema.key_column_usage kcu
     on fks.constraint_schema = kcu.table_schema
     and fks.table_name = kcu.table_name
     and fks.constraint_name = kcu.constraint_name
     where fks.constraint_schema = 'waagtoren'
group by fks.constraint_schema,
         fks.table_name,
         fks.unique_constraint_schema,
         fks.referenced_table_name,
         fks.constraint_name
order by fks.constraint_schema,
         fks.table_name;
         
-- https://dataedo.com/kb/query/mysql/list-all-primary-keys-in-database         
         
select tab.table_schema as database_name,
    sta.index_name as pk_name,
    group_concat(distinct sta.column_name order by sta.column_name) as 'columns',
    tab.table_name
from information_schema.tables as tab
inner join information_schema.statistics as sta
        on sta.table_schema = tab.table_schema
        and sta.table_name = tab.table_name
        and sta.index_name = 'primary'
where tab.table_schema = 'waagtoren'
    and tab.table_type = 'BASE TABLE'
group by table_name
order by table_name;         




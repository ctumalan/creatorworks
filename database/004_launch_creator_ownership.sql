-- Exact founder identity confirmed by user. Preserve existing owners. No role changes.
begin;
do $$ declare founder uuid; begin
 select id into founder from public.users where workos_user_id='user_01M1Q8HVXRTVJ7ZXSC9RDZT540';
 if founder is null then raise exception 'Confirmed founder account not found'; end if;
 update public.projects set owner_user_id=founder where owner_user_id is null and slug in ('afterschooltogether','stackscout','gamegrid','lessonlab','cartcompare','pocketbalance','dayframe','mealmap','homerhythm','packlight','briefbuilder');
end $$;
commit;

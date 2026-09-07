-- Founder-reviewed ownership correction, atomic with history. No ownership changes on apply.
begin;
create or replace function public.cw_transfer_project(p_actor uuid,p_project uuid,p_owner uuid,p_version integer,p_founder text,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare item projects%rowtype;
begin
 if not exists(select 1 from users where id=p_actor and workos_user_id=p_founder and account_status='active') then raise exception 'Not allowed'; end if;
 if not exists(select 1 from users where id=p_owner and account_status='active') then raise exception 'Active member required'; end if;
 if length(trim(p_reason)) not between 3 and 300 then raise exception 'Reason required'; end if;
 select * into item from projects where id=p_project for update;
 if not found or item.lock_version<>p_version or item.is_studio then raise exception 'Project changed or protected studio record'; end if;
 update projects set owner_user_id=p_owner,ownership_status='verified',creator_slug='',listing_status='in_review',visibility='draft',lock_version=lock_version+1,updated_at=now() where id=p_project;
 insert into operations_log(actor_id,target_id,action,reason) values(p_actor,p_project,'project.ownership_corrected',trim(p_reason));
end $$;
revoke all on function public.cw_transfer_project(uuid,uuid,uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.cw_transfer_project(uuid,uuid,uuid,integer,text,text) to service_role;
commit;

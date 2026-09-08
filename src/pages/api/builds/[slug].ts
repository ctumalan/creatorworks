import type {APIRoute} from 'astro';
import {database} from '../../../server/database';
import {json} from '../../../server/auth';
import {readBuilds} from '../../../server/builds';
export const GET:APIRoute=async context=>{
 try{const db=database(),r=await db.from('projects').select('id').eq('slug',context.params.slug||'').eq('listing_status','published').maybeSingle();
  if(r.error)throw r.error;if(!r.data)return json({error:'Project not found'},404);
  const state=await readBuilds(db,r.data.id);
  return json({active:state.active,builds:state.builds.filter(b=>state.events.some(v=>v.buildId===b.id)),events:state.events});
 }catch{return json({error:'Build updates are temporarily unavailable.'},503);}
};

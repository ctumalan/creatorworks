import type {APIRoute} from 'astro';
import {publicProfile} from '../../../server/public-profile';
import {database} from '../../../server/database';
import {origin,json} from '../../../server/auth';
export const GET:APIRoute=async context=>{
 try{const slug=context.params.slug||'',p=await publicProfile(database(),slug);if(!p)return json({error:'Public profile unavailable'},404);
 return json({name:p.display_name,description:p.bio||'Explore this creator’s published projects.',category:'Creator profile',builder:p.display_name,image:'',url:new URL('/people/'+encodeURIComponent(slug),origin(context)).href});
 }catch{return json({error:'Profile sharing unavailable'},503);}
};

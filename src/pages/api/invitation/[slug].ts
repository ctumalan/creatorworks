import type { APIRoute } from 'astro';
import { getPublishedProject } from '../../../server/catalog-db';
import { origin,json } from '../../../server/auth';
export const GET:APIRoute=async context=>{
 try{const p=await getPublishedProject(context.params.slug||'');if(!p)return json({error:'Project unavailable'},404);
 const base=origin(context);return json({name:p.name,description:p.presentation.headline,category:p.category,builder:p.creator.name,image:new URL(p.preview,base).href,url:new URL('/projects/'+encodeURIComponent(p.slug),base).href});
 }catch{return json({error:'Preview unavailable'},503);}
};

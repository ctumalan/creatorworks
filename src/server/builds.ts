import {randomUUID} from 'node:crypto';
export type Build={id:string;version:string;notes:string;createdAt:string};
export type BuildEvent={id:string;buildId:string;createdAt:string};
export type BuildState={revision:number;active:string;builds:Build[];events:BuildEvent[]};
export const buildKey=(id:string)=>'project-builds:'+id;
export const emptyBuilds=():BuildState=>({revision:0,active:'',builds:[],events:[]});
export async function readBuilds(db:any,id:string):Promise<BuildState>{
 const r=await db.from('site_settings').select('value').eq('key',buildKey(id)).maybeSingle();
 if(r.error)throw r.error;return r.data?.value||emptyBuilds();
}
export function changeBuild(state:BuildState,input:any,published:boolean,now=new Date().toISOString()):BuildState{
 if(Number(input.revision)!==state.revision)throw Error('This project changed in another window. Reload before trying again.');
 const next:BuildState=structuredClone(state);
 if(input.action==='create'){
  const version=String(input.version||'').trim(),notes=String(input.notes||'').trim();
  if(!/^[\p{L}\p{N}][\p{L}\p{N} ._+\-]{0,39}$/u.test(version))throw Error('Use a build name of 1–40 letters, numbers, spaces, dots or dashes.');
  if(notes.length<10||notes.length>300)throw Error('Describe the improvements in 10–300 characters.');
  if(next.builds.some(b=>b.version.toLowerCase()===version.toLowerCase()))throw Error('That build name already exists.');
  if(next.builds.length>=100)throw Error('This project has reached its 100-build limit. Contact support.');
  next.builds.push({id:randomUUID(),version,notes,createdAt:now});
 }else if(input.action==='activate'){
  if(!published)throw Error('Publish this project before announcing an active build.');
  if(!next.builds.some(b=>b.id===input.build))throw Error('Choose one of this project’s builds.');
  if(next.active===input.build)return state;
  if(next.events.length>=1000)throw Error('This project has reached its release-history limit. Contact support.');
  next.active=input.build;next.events.push({id:randomUUID(),buildId:input.build,createdAt:now});
 }else throw Error('Unknown build action.');
 next.revision++;return next;
}
// Active version and its notification event commit together. Compare-and-swap
// prevents two open settings pages from overwriting each other's release history.
export async function saveBuilds(db:any,id:string,before:BuildState,next:BuildState){
 if(next===before)return;
 const row={value:next,updated_at:new Date().toISOString()};
 const r=before.revision===0
  ?await db.from('site_settings').insert({key:buildKey(id),...row}).select('key')
  :await db.from('site_settings').update(row).eq('key',buildKey(id)).eq('value->>revision',String(before.revision)).select('key');
 if(r.error||!r.data?.length)throw Error('This change could not be saved. Reload and try again.');
}

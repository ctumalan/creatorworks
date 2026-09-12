// Run manually on localhost; synthetic data, no secrets, no production writes.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {workspaceFixtures} from './workspace-fixtures.mjs';
import {contentSecurityPolicy} from '../src/server/content-security-policy.mjs';
const {routes,scope,id}=workspaceFixtures(),root=new URL('../',import.meta.url);
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:4325');
  if(req.method!=='GET'){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Local preview: sending is disabled. Your text is still here.'}));return;}
  const context={url,params:{section:url.pathname.split('/').at(-1),id},cookies:{get(){}},redirect:(href,status)=>new Response(null,{status,headers:{Location:href}})};
  let response;
  if(routes[url.pathname])response=await routes[url.pathname](context);
  else if(url.pathname.startsWith('/people/'))response=scope.surface('Sample Creator','<div data-panel-content><h1>Sample Creator</h1><p>Local profile preview. All interactions remain inside TryMyBuild.</p><a href="/dashboard/profile">Edit my profile</a></div>');
  else if(url.pathname==='/api/me')response=Response.json({authenticated:true,user:{id:'fixture-user',displayName:'Sample Creator'},member:{displayName:'Sample Creator'}});
  else if(url.pathname==='/api/analytics-config')response=Response.json({measurementId:'G-LOCALTEST'});
  else if(url.pathname.startsWith('/api/'))response=Response.json({error:'Not available in the local preview'},{status:503});
  else{const path=url.pathname==='/'?'index.html':url.pathname.slice(1);if(path.includes('..')||!(/^(assets\/|projects\/)/.test(path)||/^[\w-]+\.(html|js|css)$/.test(path)))throw Error('Not found');const type=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':path.endsWith('.png')?'image/png':'text/html';response=new Response(await readFile(new URL(path,root)),{headers:{'Content-Type':type}});}
  res.writeHead(response.status,{...Object.fromEntries(response.headers),'Content-Security-Policy':contentSecurityPolicy,'Cache-Control':'no-store'});res.end(Buffer.from(await response.arrayBuffer()));
 }catch(error){console.error(error.message);res.writeHead(500);res.end('Local fixture unavailable');}
}).listen(4325,'127.0.0.1',()=>console.log('Workspace preview: http://127.0.0.1:4325/dashboard/overview'));

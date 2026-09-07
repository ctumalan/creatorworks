// Shared browser utilities; no third-party page code or CSS is executed here.
(function(root){
 const fallback={background:'#ffffff',text:'#173b30',accent:'#173b30',onAccent:'#ffffff',font:'sans-serif'};
 function rgb(value){
  if(typeof value!=='string')return null;
  if(/^#[\da-f]{6}$/i.test(value))return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
  const m=value.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*([\d.]+))?\s*\)$/);
  return m&&(!m[4]||Number(m[4])>=.95)&&m.slice(1,4).every(n=>Number(n)<=255)?m.slice(1,4).map(Number):null;
 }
 const hex=c=>'#'+c.map(n=>Math.round(Math.min(255,Math.max(0,n))).toString(16).padStart(2,'0')).join('');
 function luminance(c){return c.map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=luminance(rgb(a)||[255,255,255]),y=luminance(rgb(b)||[0,0,0]);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function readable(bg,preferred){return preferred&&contrast(bg,preferred)>=4.5?preferred:contrast(bg,'#111111')>=4.5?'#111111':'#ffffff';}
 function theme(input={}){
  const background=rgb(input.background)?hex(rgb(input.background)):fallback.background;
  const accent=rgb(input.accent)?hex(rgb(input.accent)):fallback.accent;
  const font=/mono|consolas|courier/i.test(input.font||'')?'monospace':/sans|arial|inter|helvetica|roboto|system/i.test(input.font||'')?'sans-serif':/serif|georgia|times|newsreader/i.test(input.font||'')?'serif':'sans-serif';
  return {background,text:readable(background,rgb(input.color||input.text)?hex(rgb(input.color||input.text)):null),accent,onAccent:readable(accent,null),font};
 }
 function imageData(value){return typeof value==='string'&&value.length<=900000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)?value:'';}
 function fileError(file){return !file||!['image/png','image/jpeg','image/webp'].includes(file.type)?'Choose a PNG, JPG, or WebP screenshot.':file.size>5*1024*1024?'Choose an image smaller than 5 MB.':file.size===0?'That image is empty.':'';}
 root.CWPreviewUtils={fallback,theme,contrast,imageData,fileError};
})(globalThis);

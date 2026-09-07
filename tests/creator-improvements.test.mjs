import test from 'node:test';
import assert from 'node:assert/strict';
import '../project-media.js';
import {normalizeDraft} from '../src/server/listing-policy.mjs';
import {isMaterialChange} from '../src/server/listing-service.mjs';
const {videoUrl,similarProjects} = globalThis.CWMedia;
test('video embeds accept supported sources and discard executable attributes',()=>{
 assert.equal(videoUrl('https://youtu.be/dQw4w9WgXcQ'),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
 assert.equal(videoUrl('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" onload="alert(1)"></iframe>'),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
 assert.equal(videoUrl('https://vimeo.com/123456/abcdef'),'https://player.vimeo.com/video/123456?h=abcdef');
 for(const bad of ['javascript:alert(1)','https://youtube.com.evil.org/embed/dQw4w9WgXcQ','https://evil.org','<script>alert(1)</script>','https://user:pass@vimeo.com/123']) assert.equal(videoUrl(bad),'');
 assert.ok(normalizeDraft({video:'https://evil.org'}).error);
 assert.equal(isMaterialChange({video_url:''},{video_url:'https://player.vimeo.com/video/123'}),true);
});
test('recommendations exclude current and unrelated projects, cap at three and favor interests',()=>{
 const current={slug:'a',category:'Technology',summary:'Organize prompts'};
 const others=[current,...['b','c','d','e'].map((slug,i)=>({slug,category:'Technology',recentOrder:i})),{slug:'f',category:'Travel',summary:'Beach trips'}];
 const result=similarProjects(current,others,new Set(['b']));
 assert.equal(result.length,3); assert.equal(result[0].slug,'b');assert.ok(result.every(p=>p.slug!=='a'&&p.slug!=='f'));
});

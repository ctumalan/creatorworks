import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../launch-refinements.css',import.meta.url),'utf8');
const drawer=app.slice(app.indexOf('function detailDrawer(product)'),app.indexOf("document.addEventListener('input'",app.indexOf('function detailDrawer(product)')));
test('detail view uses a real uncropped screenshot and contextual information',()=>{
 assert.match(drawer,/class="project-screenshot"/);
 assert.doesNotMatch(drawer,/--project-wallpaper|Good to know/);
 assert.match(drawer,/What saving does/);
 assert.match(drawer,/projectDestination\(product\.url\)/);
 assert.match(drawer,/No reviews yet/);
 assert.match(drawer,/videoPlayer\(product.video\)/);
 assert.match(css,/\.mealmap-detail \.project-screenshot\{[^}]*object-fit:contain/);
 assert.match(css,/\.listing-preview-card \.listing-preview-hero>img\{[^}]*object-fit:contain/);
});
test('project destination distinguishes built-in and external links',()=>{
 const source=app.slice(app.indexOf('function projectDestination'),app.indexOf('function categoryIcon'));
 const context={};
 Function('context',`${source};context.destination=projectDestination;`)(context);
 assert.equal(context.destination('projects/afterschool-together/index.html'),'Opens here on TryMyBuild');
 assert.equal(context.destination('/projects/example'),'Opens here on TryMyBuild');
 assert.equal(context.destination('https://example.com/tool'),'Opens external website');
});
test('categories wrap and violet accents apply to navigation and illustration panels',()=>{
 assert.match(css,/\.category-strip-scroll\{flex-wrap:wrap;overflow:visible/);
 assert.match(css,/\.site-header nav button:hover/);
 assert.match(css,/\.share-visual,\.share-visual-intro\{background:#493064/);
});

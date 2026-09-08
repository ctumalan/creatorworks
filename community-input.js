document.addEventListener('input',event=>{
 const field=event.target.closest('[data-community-field]');if(!field)return;
 const count=(field.value.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[]).length;
 const output=document.getElementById(field.dataset.counterId);if(output){output.textContent=`${count} / 7 words minimum`;output.classList.toggle('invalid',count>0&&count<7);}
 field.setCustomValidity(count>=7&&count<=150?'':'Write 7–150 words.');
});
document.querySelectorAll('[data-community-field]').forEach(field=>field.dispatchEvent(new Event('input',{bubbles:true})));

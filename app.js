// Año
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

// Cambiar foto local
const photoInput=document.getElementById('photoInput');
if(photoInput){
  photoInput.addEventListener('change',e=>{
    const f=e.target.files?.[0]; if(!f) return; document.getElementById('avatar').src=URL.createObjectURL(f);
  });
}

// Render de vista previa
function renderPreview(previewEl, file){
  const url = URL.createObjectURL(file);
  previewEl.innerHTML='';
  const type = (file.type||'').toLowerCase();
  if(type.startsWith('image/')){
    const img=new Image(); img.src=url; previewEl.appendChild(img);
  } else if(type==='application/pdf'){
    const iframe=document.createElement('iframe'); iframe.src=url; previewEl.appendChild(iframe);
  } else if(type.startsWith('video/')){
    const v=document.createElement('video'); v.controls=true; v.src=url; previewEl.appendChild(v);
  } else if(type.startsWith('audio/')){
    const a=document.createElement('audio'); a.controls=true; a.src=url; previewEl.appendChild(a);
  } else if(/\.(docx?|xlsx?|pptx?)$/i.test(file.name)){
    const p=document.createElement('p'); p.className='muted'; p.textContent='Vista previa no soportada en local. Usa Descargar para abrir en tu equipo.';
    const a=document.createElement('a'); a.href=url; a.textContent='Descargar archivo'; a.target='_blank';
    const box=document.createElement('div'); box.style.textAlign='center'; box.append(p,a); previewEl.appendChild(box);
  } else if(/\.(txt)$/i.test(file.name)){
    const iframe=document.createElement('iframe'); iframe.src=url; previewEl.appendChild(iframe);
  } else {
    const a=document.createElement('a'); a.href=url; a.textContent='Descargar archivo'; a.target='_blank'; previewEl.appendChild(a);
  }
  return url;
}

// Lightbox + Fullscreen
const lb=document.getElementById('lightbox');
const lbBody=document.getElementById('lightboxBody');
const btnFs=document.getElementById('btnFs');
const btnExitFs=document.getElementById('btnExitFs');
function openLightbox(node){ lbBody.innerHTML=''; lbBody.appendChild(node); lb.hidden=false; updateFsButtons(); }
function closeLightbox(){ lb.hidden=true; lbBody.innerHTML=''; }
function isFullscreen(){ return !!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement); }
function reqFs(el){ (el.requestFullscreen||el.webkitRequestFullscreen||el.mozRequestFullScreen||el.msRequestFullscreen)?.call(el); }
function exitFs(){ (document.exitFullscreen||document.webkitExitFullscreen||document.mozCancelFullScreen||document.msExitFullscreen)?.call(document); }
function updateFsButtons(){ const fs=isFullscreen(); if(btnFs) btnFs.hidden=fs; if(btnExitFs) btnExitFs.hidden=!fs; }
if(lb){ lb.addEventListener('click',(e)=>{ if(e.target.hasAttribute('data-close')) { if(isFullscreen()) exitFs(); closeLightbox(); } }); }
window.addEventListener('keydown',e=>{ if(!lb.hidden && e.key==='Escape'){ if(isFullscreen()) exitFs(); else closeLightbox(); }});
document.addEventListener('fullscreenchange',updateFsButtons);
document.addEventListener('webkitfullscreenchange',updateFsButtons);
btnFs?.addEventListener('click',()=>{ const target = lbBody.firstElementChild || lbBody; reqFs(target); });
btnExitFs?.addEventListener('click',()=>{ exitFs(); });

// Drag & Drop helpers
function bindDragDrop(slot, onFile){
  const drop = slot.querySelector('.slot__drop');
  const input = slot.querySelector('.fileInput');
  ;['dragenter','dragover'].forEach(ev=> drop.addEventListener(ev, e=>{ e.preventDefault(); e.stopPropagation(); drop.classList.add('drag'); }));
  ;['dragleave','drop'].forEach(ev=> drop.addEventListener(ev, e=>{ e.preventDefault(); e.stopPropagation(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e=>{ const f=e.dataTransfer?.files?.[0]; if(f) onFile(f); });
  drop.addEventListener('click', ()=> input.click());
}

// Manejo de slots
Array.from(document.querySelectorAll('.slot')).forEach(slot=>{
  const input=slot.querySelector('.fileInput');
  const uploadBtn=slot.querySelector('.uploadBtn');
  const delBtn=slot.querySelector('.deleteBtn');
  const viewBtn=slot.querySelector('.viewLargeBtn');
  const preview=slot.querySelector('.preview');

  let current = { file:null, url:null };

  function handleFile(file){
    if(current.url) URL.revokeObjectURL(current.url);
    current.url = renderPreview(preview, file);
    current.file = file;
    delBtn.disabled=false; viewBtn.disabled=false;
  }

  bindDragDrop(slot, handleFile);

  uploadBtn.addEventListener('click',()=>{ input.click(); });
  input.addEventListener('change',()=>{ const f=input.files?.[0]; if(f) handleFile(f); });

  delBtn.addEventListener('click',()=>{
    preview.innerHTML='<span class="muted">Vacío</span>';
    input.value=''; delBtn.disabled=true; viewBtn.disabled=true;
    if(current.url) URL.revokeObjectURL(current.url);
    current={file:null,url:null};
  });

  viewBtn.addEventListener('click',()=>{
    if(!current.file){ return; }
    const type=(current.file.type||'').toLowerCase();
    const url=current.url || URL.createObjectURL(current.file);

    let node=null;
    if(type.startsWith('image/')){
      const img=new Image(); img.src=url; img.style.maxWidth='100%'; img.style.height='auto'; node=img;
    } else if(type==='application/pdf'){
      const iframe=document.createElement('iframe'); iframe.src=url; node=iframe;
    } else if(type.startsWith('video/')){
      const v=document.createElement('video'); v.controls=true; v.src=url; v.style.width='100%'; node=v;
    } else if(type.startsWith('audio/')){
      const a=document.createElement('audio'); a.controls=true; a.src=url; a.style.width='100%'; node=a;
    } else if(/\.(txt)$/i.test(current.file.name)){
      const iframe=document.createElement('iframe'); iframe.src=url; node=iframe;
    } else {
      const wrap=document.createElement('div'); wrap.style.padding='1rem';
      const p=document.createElement('p'); p.textContent='Vista previa ampliada no disponible para este tipo en local.'; p.style.marginBottom='.75rem';
      const a=document.createElement('a'); a.href=url; a.target='_blank'; a.textContent='Descargar archivo';
      wrap.append(p,a); node=wrap;
    }
    openLightbox(node);
  });
});

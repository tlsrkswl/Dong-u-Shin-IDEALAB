/* Lightweight static JSON website. Edit content/*.json, not templates. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = s => /^(https?:\/\/|mailto:|assets\/)/i.test(String(s||'')) ? String(s) : '';
  const get = async path => {const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw Error(`${path}: ${r.status}`);return r.json();};
  const text = (id,value) => {const el=$('#'+id);if(el)el.textContent=value||'';};
  const link = (url,label) => safeUrl(url)?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
  const keywordHtml = items => `<div class="tags">${(items||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;
  function nav() {
    const b=$('.menu-toggle'), n=$('#primary-nav');
    if(b && n){b.addEventListener('click',()=>{const open=n.classList.toggle('is-open');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
      n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('is-open');b.setAttribute('aria-expanded','false');}));}
    const print=$('#print-cv');if(print)print.addEventListener('click',()=>window.print());
  }
  const authorMarkup=(authors,ownNames=[])=>{
    const variants=ownNames.filter(Boolean).map(String);
    if(!variants.length)return esc(authors);
    const escapedNames=variants.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    const rx=new RegExp('('+escapedNames.join('|')+')','gi');
    return String(authors||'').split(rx).map(piece=>variants.some(v=>v.toLowerCase()===piece.toLowerCase())?`<strong class="author-self">${esc(piece)}</strong>`:esc(piece)).join('');
  };
  const pubCard = (p,ownNames) => `<article class="pub-item"><div class="pub-year">${esc(p.year)}</div><div><div class="pub-category">${esc(p.scope||'')} · ${esc(p.status)}</div><h3 class="pub-title">${safeUrl(p.url)?`<a class="pub-title-link" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a>`:esc(p.title)}</h3><p class="pub-authors">${authorMarkup(p.authors,ownNames)}</p><p class="pub-venue">${esc(p.venue)}</p></div><div class="pub-link">${p.url?link(p.url,'DOI'):''}</div></article>`;
  function groupedPublications(pubs,container,ownNames){
    container.innerHTML=['Journal','Conference'].map(type=>{
      const id=type.toLowerCase();
      return `<section class="publication-section" id="${id}"><div class="publication-section-heading"><div><div class="section-index">${type==='Journal'?'PEER-REVIEWED RESEARCH':'ACADEMIC PRESENTATIONS'}</div><h2 class="section-heading">${type}</h2></div><span class="publication-count">${pubs.filter(p=>p.type===type).length} ITEMS</span></div>`+
       ['International','Domestic'].map(scope=>{
          const entries=pubs.filter(p=>p.type===type && p.scope===scope);
          if (!entries.length) return ''; // Leave unpopulated categories hidden until work is added.
          return `<div class="publication-category"><h3>${scope} <span>${entries.length}</span></h3><div class="publication-list">${entries.map(p=>pubCard(p,ownNames)).join('')}</div></div>`;
       }).join('')+'</section>';
    }).join('');
  }
  const educationCard=e=>`<article class="education-card"><div class="education-year">${esc(e.period)}</div><div><h3>${esc(e.school)}</h3><p>${esc(e.degree)} ${e.planned?'<span class="planned-chip">PLANNED</span>':''}</p>${e.detail?`<span>${esc(e.detail)}</span>`:''}<small>${esc(e.location)}</small></div></article>`;
  const cvRow=(a,b,c,date,extra='',trustedB=false)=>`<div class="cv-row"><div><h4>${esc(a)}</h4>${b?`<p>${trustedB?b:esc(b)}</p>`:''}${c?`<p>${esc(c)}</p>`:''}${extra}</div><span class="cv-date">${esc(date)}</span></div>`;
  const cvSection=(heading,inside)=>`<section class="cv-section"><h3>${esc(heading)}</h3>${inside}</section>`;
  const cvPubs=(pubs,type,scope,ownNames)=>{const rows=pubs.filter(p=>p.type===type && p.scope===scope);return rows.length?cvSection(`${type} — ${scope}`,rows.map(p=>cvRow(p.title,authorMarkup(p.authors,ownNames),`${p.venue} · ${p.status}`,p.year,'',true)).join('')):'';};
  function homeMotto(segments,fallback){
    const element=$('#hero-lead');
    if(!Array.isArray(segments)||!segments.length){text('hero-lead',fallback);return;}
    let index=0;
    const sentence=segments.map(part=>String(part.text||'')).join('');
    const visual=segments.map(part=>{
      const tone=['knowledge','prediction','optimization'].includes(part.tone)?` motto-${part.tone}`:'';
      const words=String(part.text||'').split(/(\s+)/).map(word=>{
        if(/^\s*$/.test(word))return esc(word);
        const letters=Array.from(word).map(char=>`<span class="motto-char" style="--reveal-delay:${180+index++*22}ms">${esc(char)}</span>`).join('');
        return `<span class="motto-word">${letters}</span>`;
      }).join('');
      return `${part.breakBefore?'<br class="motto-clause-break">':''}<span class="motto-segment${tone}">${words}</span>`;
    }).join('');
    element.innerHTML=`<span class="motto-sr-only">${esc(sentence)}</span><span class="motto-visual" aria-hidden="true">${visual}</span>`;
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)element.classList.add('is-typing');
  }
  async function home(){const [s,focus]=await Promise.all([get('content/site.json'),get('content/research.json')]);text('hero-eyebrow',s.eyebrow);homeMotto(s.homeMotto,s.motto);
    const icons={
      graph:'<path d="M6 6l12 1M6 6l5 13M18 7l-7 12M18 7l1 11M11 19l8-1"/><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="11" cy="19" r="2.5"/><circle cx="19" cy="18" r="2"/>',
      curve:'<path d="M4 4v16h17M7 16c3 0 3-8 6-8s3 5 7-3"/><circle cx="7" cy="16" r="1"/><circle cx="13" cy="8" r="1"/><circle cx="20" cy="5" r="1"/>',
      sliders:'<path d="M5 3v4m0 5v9M12 3v10m0 5v3M19 3v3m0 5v10"/><rect x="2.5" y="7" width="5" height="5" rx="1.5"/><rect x="9.5" y="13" width="5" height="5" rx="1.5"/><rect x="16.5" y="6" width="5" height="5" rx="1.5"/>'
    };
    $('#home-research-grid').innerHTML=focus.map((r,i)=>{
      const tone=['graph','curve','sliders'].includes(r.icon)?r.icon:'graph';
      const connector=i<focus.length-1?'<span class="home-focus-connector" aria-hidden="true"><svg viewBox="0 0 20 16" width="18" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h14m-4-4 4 4-4 4"/></svg></span>':'';
      return `<article class="home-focus-card" data-tone="${tone}"><div class="home-focus-title"><span class="home-focus-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false">${icons[tone]}</svg></span><h3>${esc(r.title)}</h3></div>${keywordHtml(r.keywords)}${connector}</article>`;
    }).join('');
  }
  async function about(){const [s,cv]=await Promise.all([get('content/site.json'),get('content/cv.json')]);
    text('motto',s.motto);text('about-text',s.about);text('about-detail',s.aboutDetail);text('about-lab',s.lab);text('about-location',s.aboutAddressDisplay||'Hanyang University ERICA');text('about-email',`${s.email} ↗`);$('#about-email').href='mailto:'+s.email;
    $('#education-list').innerHTML=cv.education.map(educationCard).join('');
  }
  async function research(){
    const studies=await get('content/projects.json');
    $('#research-work-grid').innerHTML=studies.map(p=>{
      const theme=['knowledge','physics','optimization'].includes(p.theme)?p.theme:'knowledge';
      return `<div class="theme-column ${theme}"><h3 class="column-heading"><span></span>${esc(p.themeLabel||p.category)}</h3><a class="work-card linked" href="study.html?id=${encodeURIComponent(p.id)}"><div class="figure"><img src="${esc(safeUrl(p.image)||'assets/images/research-knowledge-graph.svg')}" alt="Conceptual illustration of evidence connected through a knowledge graph" width="330" height="170"/></div><div class="work-copy"><div class="tile-meta">${esc(p.status)} · ${esc(p.date)}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><div class="tile-bottom"><span>${(p.documents||[]).length} public presentation${(p.documents||[]).length===1?'':'s'}</span><span>View research →</span></div></div></a></div>`;
    }).join('');
  }
  async function publications(){const [pubs,site]=await Promise.all([get('content/publications.json'),get('content/site.json')]);groupedPublications(pubs,$('#publication-groups'),site.publicationAuthorNames||[]);}
  async function news(){
    const data=await get('content/news.json');
    const ordered=data.filter(n=>String(n.label||'').toLowerCase()==='award').sort((a,b)=>b.date.localeCompare(a.date));
    $('#news-list').innerHTML=ordered.length?ordered.map(n=>{
      const details=`<div class="news-date">${esc(n.dateDisplay||n.date)}</div><div><div class="news-tag">AWARD</div><h3 class="news-title">${esc(n.title)}</h3><p>${esc(n.summary)}</p></div><span class="news-arrow" aria-hidden="true">↗</span>`;
      return n.id && n.certificateImage ? `<a class="news-item news-clickable" href="award.html?id=${encodeURIComponent(n.id)}" aria-label="View ${esc(n.title)} certificate">${details}</a>`:`<article class="news-item">${details}</article>`;
    }).join(''):'<div class="empty-subgroup">No awards listed yet.</div>';
  }
  async function award(){
    const data=await get('content/news.json');
    const id=new URLSearchParams(location.search).get('id');
    const n=data.find(item=>item.id===id && String(item.label).toLowerCase()==='award');
    const el=$('#award-details');
    if(!n){el.innerHTML='<h2>Award not found</h2><p>Please return to the News page.</p>';return;}
    text('award-title',n.title);
    text('award-date',n.dateDisplay||n.date);
    text('award-summary',n.summary);
    const img=safeUrl(n.certificateImage)?n.certificateImage:'';
    el.innerHTML=`<figure class="award-certificate">${img?`<img src="${esc(img)}" alt="Award certificate for ${esc(n.title)}" loading="eager"/>`:''}<figcaption>Certificate · ${esc(n.dateDisplay||n.date)}</figcaption></figure>`;
  }
  async function cv(){const [data,pubs,site]=await Promise.all([get('content/cv.json'),get('content/publications.json'),get('content/site.json')]);
    const edu=data.education.map(e=>cvRow(e.school,`${e.degree}${e.planned?' (Planned)':''}`,[e.detail,e.location].filter(Boolean).join(' · '),e.period)).join('');
    const exp=data.researchExperience.map(e=>cvRow(e.institution,e.role,'',e.period,`<ul class="cv-bullets">${e.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`)).join('');
    const awards=data.awards.map(a=>cvRow(a.title,a.issuer,a.detail,a.date)).join('');
    const certs=data.certifications.map(c=>cvRow(c.title,'','',c.date)).join('');
    $('#cv-content').innerHTML=`<div class="cv-profile"><div><h2>${esc(data.name)}</h2><p>${esc(data.headline)}</p></div><a class="cv-email" href="mailto:${esc(data.email)}">${esc(data.email)}</a></div>`+cvSection('Education',edu)+cvPubs(pubs,'Journal','International',site.publicationAuthorNames||[])+cvPubs(pubs,'Journal','Domestic',site.publicationAuthorNames||[])+cvPubs(pubs,'Conference','International',site.publicationAuthorNames||[])+cvPubs(pubs,'Conference','Domestic',site.publicationAuthorNames||[])+cvSection('Research Experience',exp)+cvSection('Awards',awards)+cvSection('Certification',certs);
  }
  async function study(){
    const studies=await get('content/projects.json');
    const id=new URLSearchParams(location.search).get('id')||'drone-graphrag';
    const p=studies.find(item=>item.id===id);
    if(!p){$('#study-content').innerHTML='<h1>Research not found</h1><p>Please return to the Research page.</p>';return;}
    const docs=(p.documents||[]).filter(d=>/^assets\/projects\/[a-z0-9-]+\/[a-z0-9-]+\.pdf$/.test(d.url));
    $('#study-content').innerHTML=`<div class="study-head"><div><div class="study-kicker">${esc(p.category)}</div><h1>${esc(p.title)}</h1>${keywordHtml(p.tags)}</div><dl class="study-metadata"><div><dt>PERIOD</dt><dd>${esc(p.date)}</dd></div><div><dt>STATUS</dt><dd><span class="study-status">${esc(p.status)}</span></dd></div></dl></div><section class="study-overview" aria-labelledby="study-overview-heading"><h2 id="study-overview-heading">Research Overview</h2><p>${esc(p.overview)}</p></section><section aria-labelledby="study-materials-title"><div class="study-materials-heading"><h2 id="study-materials-title">Public materials</h2><span class="study-material-count">${docs.length} PDF${docs.length===1?'':'s'}</span></div><div class="study-pdf-list">${docs.map((d,i)=>`<div class="study-pdf-row"><div class="study-pdf-info"><span class="study-pdf-mark" aria-hidden="true">PDF</span><div><strong>${esc(d.title)}</strong><small>${esc(d.pages)} pages</small></div></div><button class="study-pdf-open" type="button" data-document="${i}" aria-haspopup="dialog" aria-controls="study-pdf-dialog">View PDF →</button></div>`).join('')}</div><p class="study-materials-note">Selected presentations are shared while the research is ongoing.</p></section>`;
    const dialog=$('#study-pdf-dialog'),frame=$('#study-pdf-frame');
    document.querySelectorAll('[data-document]').forEach(button=>button.addEventListener('click',()=>{
      const d=docs[Number(button.dataset.document)];
      $('#study-pdf-title').textContent=d.title;$('#study-pdf-external').href=d.url;
      frame.src='pdf-viewer.html?file='+encodeURIComponent(d.url);frame.title=d.title;dialog.showModal();
    }));
    $('.study-pdf-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>frame.removeAttribute('src'));
  }
  async function post(){const el=$('#post-head');if(el)el.innerHTML='<h2>Research notes are not published yet.</h2>';}
  document.addEventListener('DOMContentLoaded',async()=>{nav();const page=document.body.dataset.page;try {if({home,about,research,publications,news,award,cv,study,post}[page])await {home,about,research,publications,news,award,cv,study,post}[page]();}catch(e){console.error(e);const status=$('#status-toast');if(status){status.textContent='Data failed to load. Start a local web server (see README.md).';status.classList.add('visible');}}});
})();

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
  const pubCard = (p,ownNames) => `<article class="pub-item"><div class="pub-year">${esc(p.year)}</div><div><div class="pub-category">${esc(p.scope||'')} · ${esc(p.status)}</div><h3 class="pub-title">${esc(p.title)}</h3><p class="pub-authors">${authorMarkup(p.authors,ownNames)}</p><p class="pub-venue">${esc(p.venue)}</p></div><div class="pub-link">${p.url?link(p.url,'DOI'):''}</div></article>`;
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
  const educationCard=e=>`<article class="education-card"><div class="education-year">${esc(e.period)}</div><div><h3>${esc(e.school)}</h3><p>${esc(e.degree)} ${e.planned?'<span class="planned-chip">PLANNED</span>':''}</p><span>${esc(e.detail)}</span><small>${esc(e.location)}</small></div></article>`;
  const cvRow=(a,b,c,date,extra='',trustedB=false)=>`<div class="cv-row"><div><h4>${esc(a)}</h4>${b?`<p>${trustedB?b:esc(b)}</p>`:''}${c?`<p>${esc(c)}</p>`:''}${extra}</div><span class="cv-date">${esc(date)}</span></div>`;
  const cvSection=(heading,inside)=>`<section class="cv-section"><h3>${esc(heading)}</h3>${inside}</section>`;
  const cvPubs=(pubs,type,scope,ownNames)=>{const rows=pubs.filter(p=>p.type===type && p.scope===scope);return rows.length?cvSection(`${type} — ${scope}`,rows.map(p=>cvRow(p.title,authorMarkup(p.authors,ownNames),`${p.venue} · ${p.status}`,p.year,'',true)).join('')):'';};
  async function home(){const s=await get('content/site.json');text('hero-eyebrow',s.eyebrow);text('hero-lead',s.motto);}
  async function about(){const [s,cv]=await Promise.all([get('content/site.json'),get('content/cv.json')]);
    text('motto',s.motto);text('about-text',s.about);text('about-detail',s.aboutDetail);text('about-lab',s.lab);text('about-location',s.aboutAddressDisplay||'ERICA');text('about-email',`${s.email} ↗`);$('#about-email').href='mailto:'+s.email;
    $('#education-list').innerHTML=cv.education.map(educationCard).join('');
  }
  async function research(){const data=await get('content/research.json');$('#research-grid').innerHTML=data.map((r,i)=>`<article class="research-card"><div class="card-top"><span class="card-number">${esc(r.number||String(i+1).padStart(2,'0'))}</span><span class="card-symbol">↗</span></div><div class="card-category">${esc(r.category)}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${keywordHtml(r.keywords)}</article>`).join('');}
  async function publications(){const [pubs,site]=await Promise.all([get('content/publications.json'),get('content/site.json')]);groupedPublications(pubs,$('#publication-groups'),site.publicationAuthorNames||[]);}
  async function projects(){const data=await get('content/projects.json');$('#project-grid').innerHTML=data.length?data.map((p,i)=>`<a class="project-card" href="project.html?id=${encodeURIComponent(p.id)}"><div class="project-content"><span class="project-no">PROJECT ${esc(p.number||i+1)} · ${esc(p.date)}</span><span class="project-category">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="project-arrow">VIEW PROJECT ↗</span></div></a>`).join(''):'<div class="empty-projects"><img src="assets/images/idea-symbol.png" alt="IDEA LAB emblem"/><h2>Projects coming soon.</h2><p>IDEA LAB 연구 프로젝트를 앞으로 이곳에 추가할 예정입니다.</p><span>UPDATE: content/projects.json</span></div>';}
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
    const edu=data.education.map(e=>cvRow(e.school,`${e.degree}${e.planned?' (Planned)':''}`,e.detail+' · '+e.location,e.period)).join('');
    const exp=data.researchExperience.map(e=>cvRow(e.institution,e.role,'',e.period,`<ul class="cv-bullets">${e.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`)).join('');
    const awards=data.awards.map(a=>cvRow(a.title,a.issuer,a.detail,a.date)).join('');
    const certs=data.certifications.map(c=>cvRow(c.title,'','',c.date)).join('');
    $('#cv-content').innerHTML=`<div class="cv-profile"><div><h2>${esc(data.name)}</h2><p>${esc(data.headline)}</p></div><a class="cv-email" href="mailto:${esc(data.email)}">${esc(data.email)}</a></div>`+cvSection('Education',edu)+cvPubs(pubs,'Journal','International',site.publicationAuthorNames||[])+cvPubs(pubs,'Journal','Domestic',site.publicationAuthorNames||[])+cvPubs(pubs,'Conference','International',site.publicationAuthorNames||[])+cvPubs(pubs,'Conference','Domestic',site.publicationAuthorNames||[])+cvSection('Research Experience',exp)+cvSection('Awards',awards)+cvSection('Certification',certs);
  }
  async function project(){const data=await get('content/projects.json');const id=new URLSearchParams(location.search).get('id');const p=data.find(x=>x.id===id);if(!p){$('#project-head').innerHTML='<h2>Project not found.</h2><p>Please visit the Projects page for current entries.</p>';return;}
    $('#project-head').innerHTML=`<h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p>${keywordHtml(p.tags)}`;
    $('#project-body').innerHTML=`<h2>Overview</h2><p>${esc(p.overview)}</p>${(p.sections||[]).map(s=>`<h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p>`).join('')}`;
    $('#project-aside').innerHTML=`<dl class="meta-block"><dt>DATE</dt><dd>${esc(p.date)}</dd></dl><dl class="meta-block"><dt>CATEGORY</dt><dd>${esc(p.category)}</dd></dl>`;
  }
  async function post(){const el=$('#post-head');if(el)el.innerHTML='<h2>Research notes are not published yet.</h2>';}
  document.addEventListener('DOMContentLoaded',async()=>{nav();const page=document.body.dataset.page;try {if({home,about,research,publications,projects,news,award,cv,project,post}[page])await {home,about,research,publications,projects,news,award,cv,project,post}[page]();}catch(e){console.error(e);const status=$('#status-toast');if(status){status.textContent='Data failed to load. Start a local web server (see README.md).';status.classList.add('visible');}}});
})();

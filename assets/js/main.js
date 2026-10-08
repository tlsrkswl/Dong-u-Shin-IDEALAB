/* Static site: only content/*.json and content/posts/*.md need editing. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = (input) => {
    const url = String(input || '').trim();
    return /^(https?:\/\/|mailto:|assets\/|index\.html|cv\.html)/i.test(url) ? url : '';
  };
  const files = async (path) => {
    const res = await fetch(path, {cache: 'no-cache'});
    if (!res.ok) throw new Error(`Cannot load ${path} (${res.status})`);
    return path.endsWith('.json') ? res.json() : res.text();
  };
  const toast = (message) => {
    const item = $('#status-toast');
    if (!item) return;
    item.textContent = message; item.classList.add('visible');
  };
  const asHtmlLink = (url, label, classes='') => {
    const dest = safeUrl(url);
    if (!dest) return '';
    const external = /^https?:\/\//i.test(dest);
    return `<a class="${esc(classes)}" href="${esc(dest)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a>`;
  };
  const listKeywords = values => `<div class="tags">${(values || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>`;
  const padDate = date => date || '';
  const miniInline = text => esc(text)
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label, url) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
  const markdown = text => {
    let html='', paragraph=[], items=[];
    const flush = () => { if(paragraph.length){html+=`<p>${miniInline(paragraph.join(' '))}</p>`;paragraph=[];} if(items.length){html+=`<ul>${items.map(x=>`<li>${miniInline(x)}</li>`).join('')}</ul>`;items=[];} };
    for (const row of String(text).replace(/\r/g,'').split('\n')) {
      const t = row.trim();
      if(!t){flush();continue;}
      const heading=t.match(/^(#{1,3})\s+(.+)$/);
      if(heading){flush();const level=Math.max(2,heading[1].length);html+=`<h${level}>${miniInline(heading[2])}</h${level}>`;continue;}
      const list=t.match(/^[-*]\s+(.+)$/);
      if(list){if(paragraph.length){flush();}items.push(list[1]);continue;}
      if(items.length)flush();paragraph.push(t);
    }
    flush(); return html;
  };
  function setupNav() {
    const trigger = $('.menu-toggle'); const nav = $('#primary-nav');
    if(trigger && nav){
      trigger.addEventListener('click', () => {const opened=nav.classList.toggle('is-open');trigger.setAttribute('aria-expanded', String(opened));trigger.setAttribute('aria-label', opened?'Close navigation':'Open navigation');});
      nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');}));
    }
    const print = $('#print-cv'); if(print) print.addEventListener('click',()=>window.print());
  }
  async function loadHome(){
    const [site,research,publications,projects,achievements,news] = await Promise.all([
      files('content/site.json'),files('content/research.json'),files('content/publications.json'),files('content/projects.json'),files('content/achievements.json'),files('content/news.json')
    ]);
    document.title=`${site.name} — Research Portfolio`;
    $('#hero-title').innerHTML = `${esc(site.name.split(' ')[0])}<br/><em>${esc(site.name.split(' ').slice(1).join(' '))}<span class="accent-period">.</span></em>`;
    $('#hero-eyebrow').textContent=site.eyebrow;
    $('#hero-lead').textContent=site.lead;
    $('#hero-affiliation').textContent=site.heroAffiliation;
    $('#about-text').textContent=site.about;
    $('#about-detail').textContent=site.aboutDetail;
    $('#social-links').innerHTML=(site.links || []).filter(x=>!x.hidden).map(x=>asHtmlLink(x.url,`${x.label} ↗`)).join('');
    $('#contact-email').innerHTML=`${esc(site.email)} <span>↗</span>`;
    $('#contact-email').href=`mailto:${encodeURIComponent(site.email)}`;
    $('#footer-lab').textContent=`${site.lab} · ${site.labQualification}`;
    $('#research-grid').innerHTML=research.map((r,i)=>`<article class="research-card"><div class="card-top"><span class="card-number">${esc(r.number||String(i+1).padStart(2,'0'))}</span><span class="card-symbol" aria-hidden="true">↗</span></div><div class="card-category">${esc(r.category)}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${listKeywords(r.keywords)}</article>`).join('');
    $('#publication-list').innerHTML=publications.map(p=>`<article class="pub-item"><div class="pub-year">${esc(p.year)}</div><div><div class="pub-category">${esc(p.type)} · ${esc(p.status)}</div><h3 class="pub-title">${esc(p.title)}</h3><p class="pub-authors">${esc(p.authors)}</p><p class="pub-venue">${esc(p.venue)}</p></div><div class="pub-link">${p.url && safeUrl(p.url) ? asHtmlLink(p.url,'↗') : '↗'}</div></article>`).join('');
    const artText={graph:'KG',mesh:'CAE',orbit:'DAE',wheel:'FEA'};
    $('#project-grid').innerHTML=projects.map(p=>`<a class="project-card" href="project.html?id=${encodeURIComponent(p.id)}"><div class="project-content"><span class="project-no">PROJECT ${esc(p.number)} · ${esc(p.date)}</span><span class="project-category">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="project-arrow">VIEW PROJECT ↗</span></div><div class="project-art ${esc(p.symbol)}" aria-hidden="true"><b>${esc(artText[p.symbol]||'AI')}</b></div></a>`).join('');
    $('#achievements-list').innerHTML=achievements.map(x=>`<article class="milestone"><div class="milestone-date">${esc(x.date)}</div><div class="milestone-type">${esc(x.category)}</div><div><h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p></div></article>`).join('');
    const ordered = [...news].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    $('#news-list').innerHTML=ordered.map(x=>{
      const href=x.post ? `post.html?file=${encodeURIComponent(x.post)}` : safeUrl(x.url);
      const body=`<div class="news-tag">${esc(x.label)}</div><div class="news-title">${esc(x.title)}</div><p>${esc(x.summary)}</p>`;
      return `<article class="news-item"><div class="news-date">${esc(x.dateDisplay||padDate(x.date))}</div><div>${href ? `<a href="${esc(href)}">${body}</a>` : body}</div><span class="news-arrow">${href?'↗':'·'}</span></article>`;
    }).join('');
  }
  const cvItem = (heading, main, sub, date, extra='') => `<div class="cv-row"><div><h4>${esc(heading)}</h4>${main ? `<p>${esc(main)}</p>` : ''}${sub ? `<p>${esc(sub)}</p>` : ''}${extra}</div><span class="cv-date">${esc(date)}</span></div>`;
  const cvPub = (p) => `<article class="pub-item"><div class="pub-year">${esc(p.year)}</div><div><h4 class="pub-title">${esc(p.title)}</h4><p class="pub-authors">${esc(p.authors)}</p><p class="pub-venue">${esc(p.venue)} · ${esc(p.status)}</p></div></article>`;
  function cvSection(title, contents, id){return `<section class="cv-section"${id?` id="${id}"`:''}><h3>${esc(title)}</h3>${contents}</section>`;}
  async function loadCV(){
    const [cv,pubs]=await Promise.all([files('content/cv.json'),files('content/publications.json')]);
    const school=cv.education.map(e=>cvItem(e.school,`${e.degree} · ${e.detail}`,e.location,e.period)).join('');
    const experiences=cv.researchExperience.map(e=>cvItem(e.institution,e.role,'',e.period,`<ul class="cv-bullets">${e.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`)).join('');
    const awards=cv.awards.map(e=>cvItem(e.title,e.issuer,e.detail,e.date)).join('');
    const cert=cv.certifications.map(e=>cvItem(e.title,'','',e.date)).join('');
    $('#cv-content').innerHTML=`<div class="cv-profile"><div><h2>${esc(cv.name)}</h2><p>${esc(cv.headline)}</p></div><a class="cv-email" href="mailto:${esc(cv.email)}">${esc(cv.email)}</a></div>${cvSection('Education',school)}${cvSection('Journal',pubs.filter(p=>p.type.toLowerCase()==='journal').map(cvPub).join(''),'publications')}${cvSection('Conference',pubs.filter(p=>p.type.toLowerCase()==='conference').map(cvPub).join(''))}${cvSection('Research Experience',experiences)}${cvSection('Awards',awards)}${cvSection('Certification',cert)}`;
  }
  async function loadProject(){
    const projects=await files('content/projects.json');const id=new URLSearchParams(location.search).get('id');const p=projects.find(item=>item.id===id);
    if(!p){$('#project-head').innerHTML='<h1>Project not found.</h1><p><a href="index.html#projects">Return to projects ↗</a></p>';return;}
    document.title=`${p.title} — Dong-u Shin`;
    $('#project-head').innerHTML=`<div class="section-index">PROJECT / ${esc(p.number)}</div><h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p>${listKeywords(p.tags)}`;
    $('#project-body').innerHTML=`<h2>Overview</h2><p>${esc(p.overview)}</p>${p.sections.map(s=>`<h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p>`).join('')}`;
    $('#project-aside').innerHTML=`<dl class="meta-block"><dt>DATE</dt><dd>${esc(p.date)}</dd></dl><dl class="meta-block"><dt>CATEGORY</dt><dd>${esc(p.category)}</dd></dl><dl class="meta-block"><dt>KEYWORDS</dt><dd>${(p.tags||[]).map(esc).join(' · ')}</dd></dl>${(p.links||[]).map(x=>`<dl class="meta-block"><dt>${esc(x.label)}</dt><dd>${asHtmlLink(x.url,'Open resource ↗')}</dd></dl>`).join('')}`;
  }
  async function loadPost(){
    const file=new URLSearchParams(location.search).get('file')||'';
    if(!/^[a-z0-9][a-z0-9_.-]*\.md$/i.test(file)||file.includes('..')){ $('#post-head').innerHTML='<h1>Invalid note.</h1>';return; }
    const [notes,text]=await Promise.all([files('content/news.json'),files(`content/posts/${file}`)]);
    const item=notes.find(n=>n.post===file);
    const title=item?.title||file.replace(/\.md$/,'').replace(/-/g,' ');
    document.title=`${title} — Dong-u Shin`;
    $('#post-head').innerHTML=`<div class="section-index">${esc(item?.label || 'RESEARCH NOTE')} / ${esc(item?.dateDisplay || item?.date || '')}</div><h1>${esc(title)}</h1><p>${esc(item?.summary||'')}</p>`;
    $('#post-body').innerHTML=markdown(text);
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    setupNav();
    try {const page=document.body.dataset.page;if(page==='home')await loadHome();if(page==='cv')await loadCV();if(page==='project')await loadProject();if(page==='post')await loadPost();}
    catch(e){console.error(e);toast('Content could not be loaded. Run a local web server (see README.md).');}
  });
})();

"""Validate independent-page research website data and referenced static files."""
from pathlib import Path
import json,sys,re
from html.parser import HTMLParser
BASE=Path(__file__).resolve().parents[1]
content=BASE/'content'
names=['site','research','publications','achievements','projects','news','cv']
data={}; errors=[]
for name in names:
    file=content/f'{name}.json'
    try: data[name]=json.loads(file.read_text(encoding='utf-8'))
    except Exception as e:errors.append(f'{name}: invalid JSON: {e}')

class StaticLinks(HTMLParser):
    def __init__(self):super().__init__();self.urls=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag in ('a','script','link','img'):
            u=d.get('href') or d.get('src')
            if u and not (u.startswith(('http:','https:','mailto:','data:','#'))):self.urls.append(u.split('?')[0].split('#')[0])

pages=['index.html','about.html','research.html','study.html','pdf-viewer.html','publications.html','projects.html','news.html','cv.html','project.html','post.html','award.html']
for name in pages:
    p=BASE/name
    if not p.is_file():errors.append(f'Missing page {name}');continue
    parser=StaticLinks();parser.feed(p.read_text(encoding='utf-8'))
    for url in parser.urls:
        if url and not (BASE/url).is_file():errors.append(f'{name}: broken static link {url}')

if len(data)==len(names):
    ids=[p.get('id') for p in data['projects']]
    if len(ids)!=len(set(ids)):errors.append('Duplicate project IDs')
    for i in ids:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',str(i)):errors.append('Invalid project id: '+str(i))
    published_pdfs=set()
    for project in data['projects']:
        for field in ('title','summary','overview','date','category'):
            if not project.get(field):errors.append(f'Project {project.get("id")}: missing {field}')
        docs=project.get('documents',[])
        if project.get('id')=='drone-graphrag':
            if {d.get('id') for d in docs}!={'rag-foundations'}:errors.append('Drone GraphRAG: only the approved introductory PDF may be published')
            if project.get('startDate')!='2026-09' or project.get('status')!='Ongoing':errors.append('Drone GraphRAG: research period/status is incorrect')
        doc_ids=[doc.get('id') for doc in docs]
        if len(doc_ids)!=len(set(doc_ids)):errors.append('Duplicate document IDs in '+str(project.get('id')))
        for doc in docs:
            url=doc.get('url','')
            if not re.fullmatch(r'assets/projects/[a-z0-9-]+/[a-z0-9-]+\.pdf',url):
                errors.append('Invalid project PDF path: '+url)
                continue
            file=BASE/url
            published_pdfs.add(url)
            if not file.is_file():errors.append('Missing project PDF: '+url)
            elif not file.read_bytes().startswith(b'%PDF-'):errors.append('Invalid PDF file: '+url)
            if not doc.get('id') or not doc.get('title') or not doc.get('description'):errors.append('Incomplete project PDF metadata: '+url)
            if not isinstance(doc.get('pages'),int) or doc['pages']<1:errors.append('Invalid project PDF page count: '+url)
        demo=project.get('demoUrl')
        if demo and (not re.fullmatch(r'demos/[a-z0-9-]+/index\.html',demo) or not (BASE/demo).is_file()):errors.append('Invalid project demo: '+str(demo))
    for file in (BASE/'assets/projects').rglob('*.pdf'):
        if file.relative_to(BASE).as_posix() not in published_pdfs:errors.append('Unlisted PDF would still be public: '+file.relative_to(BASE).as_posix())
    for focus in data['research']:
        if focus.get('studyId') and focus['studyId'] not in ids:errors.append('Research focus links to a missing study: '+focus['studyId'])
    for pub in data['publications']:
        if pub.get('type') not in ('Journal','Conference'):errors.append('Invalid publication type: '+str(pub.get('type')))
        if pub.get('scope') not in ('International','Domestic'):errors.append('Invalid publication scope: '+str(pub.get('scope')))
    for item in data['news']:
        if item.get('label')!='Award':errors.append('News must contain awards only')
        for field in ('certificatePdf','certificateImage'):
            url=item.get(field)
            if url and not (BASE/url).is_file():errors.append('News item missing '+field+': '+url)
    forbidden={'researchInterest','projects','scholarships','scholarship','research_interest','project'}
    if forbidden & set(data['cv']):errors.append('CV contains a forbidden section')
    if not data['cv'].get('education'):errors.append('CV education missing')
    if data['site'].get('labLocation')!='제5공학관 224호':errors.append('Lab location missing/incorrect')
for p in [BASE/'assets/js/main.js',BASE/'assets/js/pdf-viewer.mjs',BASE/'assets/css/style.css',BASE/'assets/vendor/pdfjs/pdf.min.mjs',BASE/'assets/vendor/pdfjs/pdf.worker.min.mjs',BASE/'assets/vendor/pdfjs/LICENSE',BASE/'assets/images/idea-logo-white.png',BASE/'assets/images/idea-logo-original.png',BASE/'assets/images/profile-dongu-shin.png',BASE/'assets/images/hanyang-lion.png',BASE/'assets/Dong-u_Shin_CV.pdf']:
    if not p.is_file():errors.append('Missing resource '+str(p.relative_to(BASE)))
if errors:
    for error in errors:print('ERROR:',error)
    sys.exit(1)
print('PASS: 12 pages, 7 JSON files, linked resources, PDF viewer assets, research links, approved public PDFs only, publication categories, awards only, lab room, CV exclusions')

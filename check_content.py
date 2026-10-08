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

pages=['index.html','about.html','research.html','publications.html','projects.html','news.html','cv.html','project.html','post.html']
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
    if data['projects']:errors.append('Projects must remain empty until IDEA LAB work is supplied')
    for pub in data['publications']:
        if pub.get('type') not in ('Journal','Conference'):errors.append('Invalid publication type: '+str(pub.get('type')))
        if pub.get('scope') not in ('International','Domestic'):errors.append('Invalid publication scope: '+str(pub.get('scope')))
    for item in data['news']:
        if item.get('label')!='Award':errors.append('News must contain awards only')
    forbidden={'researchInterest','projects','scholarships','scholarship','research_interest','project'}
    if forbidden & set(data['cv']):errors.append('CV contains a forbidden section')
    if not data['cv'].get('education'):errors.append('CV education missing')
    if data['site'].get('labLocation')!='제5공학관 224호':errors.append('Lab location missing/incorrect')
for p in [BASE/'assets/js/main.js',BASE/'assets/css/style.css',BASE/'assets/images/idea-logo-white.png',BASE/'assets/images/idea-logo-original.png',BASE/'assets/images/profile-dongu-shin.png',BASE/'assets/Dong-u_Shin_CV.pdf']:
    if not p.is_file():errors.append('Missing resource '+str(p.relative_to(BASE)))
if errors:
    for error in errors:print('ERROR:',error)
    sys.exit(1)
print('PASS: 9 pages, 7 JSON files, linked resources, publication categories, projects empty, awards only, lab room, CV exclusions')

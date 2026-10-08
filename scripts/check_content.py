from pathlib import Path
import json,sys,re
BASE=Path(__file__).resolve().parents[1]
content=BASE/'content'
names=['site','research','publications','achievements','projects','news','cv']
data={}
errors=[]
for name in names:
    file=content/f'{name}.json'
    try: data[name]=json.loads(file.read_text(encoding='utf-8'))
    except Exception as e: errors.append(f'{name}: invalid JSON: {e}')
if len(data)==len(names):
    ids=[p.get('id') for p in data['projects']]
    if len(ids)!=len(set(ids)): errors.append('projects.json contains duplicate IDs')
    for p in data['projects']:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',str(p.get('id',''))):errors.append(f'Invalid project id: {p.get("id")}')
    for n in data['news']:
        if n.get('post') and not (content/'posts'/n['post']).is_file():errors.append(f'Missing post: {n["post"]}')
    forbidden={'researchInterest','projects','scholarships','scholarship','research_interest','project'}
    found=forbidden & set(data['cv'])
    if found:errors.append('Disallowed CV keys: '+','.join(sorted(found)))
    if not data['cv'].get('education'):errors.append('CV missing education')
for f in [BASE/'index.html',BASE/'cv.html',BASE/'project.html',BASE/'post.html',BASE/'assets/js/main.js',BASE/'assets/css/style.css',BASE/'assets/Dong-u_Shin_CV.pdf']:
    if not f.is_file():errors.append(f'Missing site resource: {f.relative_to(BASE)}')
if errors:
    for error in errors:print('ERROR:',error)
    sys.exit(1)
print('PASS: 7 JSON files, unique project IDs, news links, CV exclusion keys, static resources')

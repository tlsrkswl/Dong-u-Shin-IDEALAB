"""Regenerate public CV PDF from content/cv.json and content/publications.json.
Install: python -m pip install reportlab
Run:     python scripts/build_cv.py
The excluded CV sections Research Interest, Project, Scholarship are never included.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import json
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, HRFlowable

BASE = Path(__file__).resolve().parents[1]
cv = json.loads((BASE/'content/cv.json').read_text(encoding='utf-8'))
pubs = json.loads((BASE/'content/publications.json').read_text(encoding='utf-8'))
output = BASE/'assets/Dong-u_Shin_CV.pdf'
output.parent.mkdir(exist_ok=True)

fonts = [
 ('/usr/share/fonts/truetype/nanum/NanumSquareR.ttf','/usr/share/fonts/truetype/nanum/NanumSquareB.ttf'),
 ('C:/Windows/Fonts/malgun.ttf','C:/Windows/Fonts/malgunbd.ttf')
]
for regular,bold in fonts:
    if Path(regular).exists() and Path(bold).exists():
        pdfmetrics.registerFont(TTFont('ResearchReg',regular))
        pdfmetrics.registerFont(TTFont('ResearchBold',bold))
        break
else:
    print('No Korean font found; falling back to Helvetica. Install NanumSquare for Korean text.')
    pdfmetrics.registerFont(TTFont('ResearchReg', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
    pdfmetrics.registerFont(TTFont('ResearchBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))

styles = {
 'name':ParagraphStyle('name',fontName='ResearchBold',fontSize=21,leading=27,textColor=colors.HexColor('#15243a'),spaceAfter=6),
 'head':ParagraphStyle('head',fontName='ResearchBold',fontSize=10,leading=16,textColor=colors.HexColor('#15243a'),spaceBefore=10,spaceAfter=5),
 'title':ParagraphStyle('title',fontName='ResearchBold',fontSize=8.6,leading=13.5,textColor=colors.HexColor('#1c2b3d'),spaceAfter=2),
 'body':ParagraphStyle('body',fontName='ResearchReg',fontSize=8.5,leading=14.3,textColor=colors.HexColor('#435467'),spaceAfter=4),
 'small':ParagraphStyle('small',fontName='ResearchReg',fontSize=8,leading=13,textColor=colors.HexColor('#5e6a79'),spaceAfter=5),
}

def par(text,style='body'):
    return Paragraph(escape(str(text)),styles[style])

def heading(title):
    return [par(title.upper(),'head'),HRFlowable(width='100%',thickness=.6,color=colors.HexColor('#c9d1d7'),spaceAfter=5)]

def item(title,detail,period=''):
    content=[par(title,'title')]
    if period: content.append(par(period,'small'))
    if detail: content.append(par(detail,'body'))
    content.append(Spacer(1,3))
    return KeepTogether(content)

story=[par(cv['name'],'name'),par(cv['headline']+'   |   '+cv['email'],'small'),Spacer(1,5),HRFlowable(width='100%',thickness=1.4,color=colors.HexColor('#15243a'))]
story.extend(heading('Education'))
for e in cv['education']:
    story.append(item(e['school']+' — '+e['degree'], e['detail']+' · '+e['location'], e['period']))
for type_,heading_ in [('Journal','Journal'),('Conference','Conference')]:
    story.extend(heading(heading_))
    for p in pubs:
        if p['type']==type_:
            story.append(item(p['title'],p['authors']+'  |  '+p['venue']+' · '+p['status'],p['year']))
story.extend(heading('Research Experience'))
for e in cv['researchExperience']:
    story.append(item(e['institution']+' — '+e['role'], ' '.join('• '+detail for detail in e['details']),e['period']))
story.extend(heading('Awards'))
for e in cv['awards']:
    story.append(item(e['title'],e['issuer']+' · '+e['detail'],e['date']))
story.extend(heading('Certification'))
for e in cv['certifications']:
    story.append(item(e['title'],'',e['date']))

def footer(canvas,doc):
    canvas.setFont('ResearchReg',7)
    canvas.setFillColor(colors.HexColor('#7b8790'))
    canvas.drawRightString(A4[0]-18*mm,11*mm,f'Dong-u Shin | {doc.page}')

doc=SimpleDocTemplate(str(output),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=19*mm,title='Dong-u Shin - Curriculum Vitae',author='Dong-u Shin')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(f'Generated: {output} ({output.stat().st_size:,} bytes)')

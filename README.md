# Dong-u Shin | IDEA LAB Research Website

**독립 페이지형 개인 연구 홈페이지**입니다. IDEA LAB의 공식 로고(사용자가 제공한 ZIP)와 증명사진을 사용하며, 선배 연구실 학생의 사이트는 메뉴 구성과 정보 표현 방식만 참고했습니다.

## 빠른 시작

```powershell
cd dongu-research-website
py -m http.server 8000
```

브라우저에서 `http://localhost:8000/`를 엽니다. JSON을 불러오는 사이트이므로 `index.html`을 파일 탐색기에서 바로 열지 마세요. 디자인 파일 수정 없이 JSON을 바꾸고 **새로고침**하면 내용이 갱신됩니다.

## 폴더 구조

```text
index.html                홈 (사진과 모토)
about.html                About / 증명사진 / 연구실 위치 / Education
research.html             Research
publications.html         Publications > Journal & Conference > International & Domestic
projects.html             Projects (현재 비어 있음)
news.html                 News (수상 기록만 표시)
cv.html                   Curriculum Vitae (금지 항목 제외)
project.html              추후 프로젝트 상세 화면 자동 템플릿
post.html                 추후 연구 기록 템플릿
content/
  site.json               이름, 모토, 자기소개, 이메일, 소속, 연구실 위치
  cv.json                 Education, 연구 경력, 수상, 자격
  research.json           연구 분야 카드
  publications.json       학술지·학술대회 + International/Domestic
  projects.json           프로젝트 (지금은 [])
  news.json               수상 소식만
  achievements.json       향후 활용할 수 있는 성과 데이터 (현재 화면 미사용)
assets/images/
  profile-dongu-shin.png  사용자 제공 증명사진
  idea-logo-white.png     제공받은 IDEA LAB 흰색 로고 (상단)
  idea-logo-original.png  제공받은 IDEA LAB 컬러 로고
  idea-symbol.png         제공받은 로고의 심볼 버전
assets/js/main.js         데이터 표시 (보통 수정 불필요)
assets/css/style.css      디자인 (보통 수정 불필요)
assets/Dong-u_Shin_CV.pdf 다운받을 수 있는 CV
scripts/build_cv.py       JSON 기반 CV PDF 다시 생성
scripts/check_content.py 검사
```

## 글 수정

- **모토/연구실 위치:** `content/site.json`의 `motto`, `labLocation`, `labLocationEnglish`를 변경하세요. **현재 연구실: 제5공학관 224호**.
- **학교 추가:** `content/cv.json`의 `education` 배열에 새 항목을 넣습니다. 미래 예정 학적은 `planned: true`로 두면 계획 상태가 표시됩니다.
- **논문 추가:** `content/publications.json`에 `type: "Journal"` 또는 `"Conference"`, `scope: "International"` 또는 `"Domestic"`을 설정합니다. 분류별 자동 표시되며 CV에도 반영됩니다.
- **프로젝트 추가:** 현재 `content/projects.json`은 `[]`입니다. 아래 객체를 배열에 추가하면 목록과 상세 페이지가 동시에 만들어집니다.

```json
[
  {
    "id": "new-idea-project",
    "number": "01",
    "date": "2027",
    "category": "AI for Engineering Design",
    "title": "Project Title",
    "summary": "Short summary of the project.",
    "overview": "Describe the background and goals.",
    "tags": ["AI", "Design"],
    "sections": [{"heading":"Method", "body":"Explain your approach."}]
  }
]
```

- **뉴스 수정:** `content/news.json`에 `label: "Award"`인 수상 소식만 표시하도록 구성했습니다. 현재 2025 KSEE 학술대회 발표 우수상 1건만 있습니다.
- **증명사진 교체:** `assets/images/profile-dongu-shin.png`를 새 이미지로 교체하면 됩니다. 파일명 유지가 편리합니다.
- **로고 교체:** `assets/images/idea-logo-white.png`(어두운 메뉴), `idea-logo-original.png`(본문) 파일을 변경하세요.
- **CV PDF 갱신:** JSON을 수정한 후 `python scripts/build_cv.py`를 실행하세요. `python -m pip install reportlab`이 필요합니다. 웹 CV만 최신화하려면 별도 재빌드는 필요 없습니다.

## 중요 분류 및 공개 정보

- Journal: **International** (1편, *Accepted 2026*) / Domestic (0편)
- Conference: International (0편) / **Domestic** (2편)
- Projects: **실제 IDEA LAB 프로젝트가 등록되기 전까지 빈 상태 유지**
- News: **수상만 표시**
- About: 공식 로고, 증명사진, 사용자 모토, `제5공학관 224호` 위치 포함
- Education: Sunmoon University (2020.03–2026.02); Hanyang University integrated M.S.–Ph.D. **2027.03 입학 예정** (Google Sites Education 기준)
- CV 공개본: **Research Interest, Project, Scholarship 포함하지 않음**

## GitHub Pages 배포

1. GitHub에 공개 저장소를 만들고 이 폴더 안의 모든 파일을 저장소의 최상위에 올립니다.
2. `Settings → Pages → Deploy from a branch`에서 `main / (root)` 선택.
3. `https://사용자명.github.io/저장소명/`에 게시됩니다.
4. 수정은 GitHub에서 `content/*.json`을 편집하고 저장(commit)하면 됩니다.

**검사:** `python scripts/check_content.py`

## 출처

- 연구실 공식 홈페이지: <https://idealab.hanyang.ac.kr/index.html#home-section>
- 학력 정보: <https://sites.google.com/view/dong-u-shin/major-career> (Education만 활용)
- 참고 개인 홈페이지: <https://broha-source.github.io/broha/>
- 학술실적 및 경력: 사용자 제공 `CV_En.pdf`
- 공식 로고/증명사진: 사용자 제공 파일

원본 자료와 사진은 개인 홈페이지에 게시하는 용도로 사용하세요. 대외 공개 전 학적·소속·수상 날짜·저널 발행 상태를 최종 확인하시기 바랍니다.

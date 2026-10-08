# Dong-u Shin — Research Website (Draft)

**개인 연구 홈페이지 초안**입니다. 같은 연구실 학생의 사이트 <https://broha-source.github.io/broha/>의 **정보 구성 흐름**(About / Research / Achievements / Project / News)을 참고하되, HTML/CSS와 그래픽은 별도로 제작했습니다.

> **공개 전 확인**: `content/site.json`에는 `IDEA LAB · Hanyang University ERICA`를 장래 희망 연구실로 표현했습니다. **현재 소속이라는 주장이 아닙니다.** 실제 입학/소속 상태에 맞춰 `lab`와 `labQualification`을 수정하세요. 사진, 전화번호, 생년월일은 공개하지 않았습니다.

## 폴더 구성

```text
dongu-research-website/
├─ index.html                 # 첫 화면 (About · Research · Publications · Project · News)
├─ cv.html                    # 별도 CV 화면 + 인쇄/PDF 저장
├─ project.html               # 프로젝트 상세 공통 템플릿
├─ post.html                  # Markdown 연구 노트 공통 템플릿
├─ content/
│  ├─ site.json               # 이름, 소개, 연락처, 향후 연구실 표기
│  ├─ research.json           # 연구 분야 카드
│  ├─ publications.json       # 논문/학술대회 (CV와 홈페이지 공통)
│  ├─ achievements.json       # 수상/자격 등 주요 성과
│  ├─ projects.json           # 프로젝트 카드와 상세 설명
│  ├─ news.json               # 최근 활동/노트 목록
│  ├─ cv.json                 # 학력/경력/수상/자격의 유일한 원본
│  └─ posts/
│     └─ first-research-note.md  # 글 작성 예시 (Markdown)
├─ assets/
│  ├─ css/style.css           # 디자인과 반응형 레이아웃
│  ├─ js/main.js              # JSON/Markdown 표시 로직 (대개 수정 불필요)
│  ├─ images/research-network.svg
│  ├─ images/favicon.svg
│  └─ Dong-u_Shin_CV.pdf      # 제외 항목을 뺀 공개용 CV PDF
├─ scripts/
│  ├─ build_cv.py             # 데이터에서 PDF CV 생성
│  └─ check_content.py       # 파일과 데이터 검증
├─ .nojekyll
└─ README.md
```

## 가장 자주 하는 수정

1. **본인 소개 / 이메일 / 연구실 상태**: `content/site.json`의 `about`, `aboutDetail`, `email`, `labQualification` 변경
2. **연구 방향 변경**: `content/research.json` 배열의 `title`, `description`, `keywords` 변경
3. **논문 추가**: `content/publications.json` 배열에 `{ "type": "Journal", "year": "2027", "authors": "...", "title": "...", "venue": "...", "status": "Published, 2027", "url": "https://..." }` 같은 항목 추가
4. **프로젝트 추가**: `content/projects.json`에 새로운 `id`(영문 소문자+하이픈), `title`, `summary`, `sections` 항목 추가. 자동으로 카드와 상세 페이지 생성
5. **뉴스 추가**: `content/news.json` 배열에 `date`, `label`, `title`, `summary` 추가. 최신 날짜순 자동 정렬
6. **긴 글 작성**: `content/posts/`에 `.md` 파일 추가하고 `news.json`에 `"post": "파일명.md"` 지정. 글에서 `#`, `##`, `-`, `**굵게**`, `[링크](https://...)` 사용 가능
7. **CV 수정**: `content/cv.json`과 `content/publications.json` 수정. 변경사항이 `cv.html`에 자동 반영. **PDF도 갱신하려면** 아래 명령 실행

## CV 구성 원칙

원본 `CV_En.pdf`에서 아래 항목만 공개용 CV에 포함했습니다.

- Education
- Journal / Conference
- Research Experience
- Awards
- Certification

**Research Interest, Project, Scholarship**은 `cv.html`과 `assets/Dong-u_Shin_CV.pdf`에서 **모두 제외**했습니다. 홈페이지의 별도 `Research` / `Projects` 콘텐츠는 포트폴리오 소개를 위해 유지합니다. 원본 CV PDF는 웹 폴더에 포함하지 않았습니다. 학술지 원고 상태는 첨부 CV 표기인 **Accepted, 2026**을 유지합니다.

## 로컬 실행

JSON 파일을 읽기 때문에 `index.html` 더블클릭보다 **로컬 웹 서버** 사용을 권장합니다.

**Windows (PowerShell / CMD):**

```bash
cd dongu-research-website
py -m http.server 8000
```

**Linux / macOS:**

```bash
cd dongu-research-website
python3 -m http.server 8000
```

브라우저에서 <http://localhost:8000> 접속합니다. 수정하고 브라우저 새로고침하면 반영됩니다. Node.js, npm, 데이터베이스는 필요하지 않습니다.

## CV PDF를 수정 후 다시 만들기

```bash
python -m pip install reportlab
python scripts/build_cv.py
```

PDF는 선택 사항입니다. `cv.html`에서 **Print / Save as PDF**를 누르면 브라우저에서 최신 CV 내용을 PDF로 저장할 수도 있습니다. Windows에서는 한국어 폰트 `맑은 고딕`을 자동 활용하고, 리눅스에서는 `NanumSquare`가 설치되어 있으면 이를 사용합니다.

## 콘텐츠 검증

```bash
python scripts/check_content.py
```

모든 JSON 파싱과 ID 중복, 글 파일 존재 여부, 금지 CV 섹션 노출 등을 검사합니다.

## GitHub Pages 배포 (무료)

1. GitHub에서 새 public repository 생성 (예: `dongu-research`).
2. 이 폴더의 **내용물**을 저장소 최상위(root)에 업로드하고 `main` 브랜치에 반영.
3. GitHub `Settings → Pages → Build and deployment → Deploy from a branch`에서 `main` / `/(root)` 선택.
4. 사이트 주소는 보통 `https://<사용자명>.github.io/dongu-research/` 형식입니다. 프로젝트 저장소 이름에 따라 마지막 경로가 달라집니다.
5. 수정은 GitHub 웹 화면에서 `content/*.json` 또는 `content/posts/*.md`를 열어 연필(편집)로 변경한 뒤 Commit하면 됩니다.

**참고:** 모든 링크는 상대경로로 작성해 하위 경로 GitHub Pages 사이트에서도 동작하도록 했습니다. 외부 호스팅 연동, 키/토큰, 백엔드는 필요하지 않습니다.

## 공개 전 체크리스트

- [ ] IDEA LAB과 Hanyang University ERICA 소속/진학 예정 문구 실제 상태에 맞게 수정
- [ ] 소개문, 키워드, 프로젝트 범위/성과 과장 여부 검토
- [ ] 논문 URL/DOI 공개되면 `publications.json`에 입력
- [ ] 연구 노트의 예시 문구 실제 연구 기록으로 대체
- [ ] 이메일 공개 동의 여부 확인
- [ ] 필요시 프로필 사진/프로젝트 그래프와 실측 결과 추가
- [ ] 배포 후 모바일에서도 확인

이 초안은 첨부 CV 및 요청하신 연구 방향을 토대로 작성되었으며, 참고 사이트의 타인 수상/연구 성과는 복사하지 않았습니다.

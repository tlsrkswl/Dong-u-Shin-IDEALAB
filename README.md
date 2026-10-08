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
award.html                수상 상세 페이지 (상장 이미지와 PDF)
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
assets/awards/            수상 이미지 및 원본 PDF
assets/images/
  hanyang-lion.png        푸터의 사자 심볼 (사용자 제공 스크린샷에서 추출)
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

- **모토/연구실 위치:** `content/site.json`의 `motto`, `labLocation`, `labLocationEnglish`를 변경하세요. **기본 데이터의 연구실 위치: 제5공학관 224호 (웹 About 주소 표시: ERICA)**.
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
- About: 공식 로고, 증명사진, 사용자 모토, 주소 표시는 `ERICA`만 노출 (연구실 방 번호는 site.json 내부에 보관)
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

## V3 수정사항 (2026-10-08)

- 상단 메뉴의 글자 크기를 늘렸고, 왼쪽 상단의 이름 텍스트는 제거했습니다. IDEA LAB 로고는 유지합니다.
- About 대제목의 마침표와 제목 위아래의 작은 문구를 제거했습니다. `Education & Training`은 `Education`으로 변경했습니다.
- **About 주소 표시에는 `ERICA`만 남겼습니다.** 예전에 입력한 연구실 방 번호는 `content/site.json`의 `labLocation`에 유지되어 있으며, 현재 페이지에는 노출되지 않습니다. 다시 표시하려면 `aboutAddressDisplay` 값을 바꾸면 됩니다.
- 대제목 끝의 장식용 점(`.`)은 제거했습니다.
- Publications 저자 목록과 웹 CV에서 본인 이름을 굵게 표시합니다. 본인 이름의 표기 변형은 `content/site.json` > `publicationAuthorNames` 배열에서 수정하세요.
- News에 남아 있는 **2025 KSEE 우수발표논문상** 항목을 클릭하면 `award.html?id=ksee-2025-best-presentation` 페이지로 이동하고 상장이 표시됩니다. 원본 PDF도 열 수 있습니다.
- 모든 페이지 하단을 사용자가 제공한 레퍼런스 이미지 형태의 밝은 푸터와 한양대 사자 심볼로 변경했습니다.

### 수상 항목 추가 및 변경 방법

`content/news.json`의 `label`이 `Award`인 항목만 News에 표시됩니다. 상세 페이지가 필요한 경우 항목에 아래 필드를 추가하세요.

```json
{
  "id": "unique-award-id",
  "date": "2025-09",
  "dateDisplay": "Sep 2025",
  "label": "Award",
  "title": "Award title",
  "summary": "Short explanation",
  "certificateImage": "assets/awards/example.webp",
  "certificatePdf": "assets/awards/example.pdf"
}
```

상장 이미지(`.webp`)와 원본(`.pdf`)을 `assets/awards/` 폴더에 저장하세요. 현재 상장은 첨부된 `포스터세션_상장.pdf`를 그대로 포함하고, 웹 미리보기 이미지는 PDF 1페이지에서 생성했습니다. `id`를 바꾸면 기존 상세 페이지 URL도 바뀝니다.

### GitHub Pages 업로드 시 주의

GitHub 저장소의 최상위에 **압축을 푼 폴더의 내부 파일과 하위 폴더를 그대로** 복사해야 합니다. 반드시 `index.html`, `about.html`, `award.html`, `assets/`, `content/`, `scripts/`가 같은 수준에 있어야 합니다. GitHub 웹의 파일 개별 업로드로 하위 폴더를 풀어버리면 이전처럼 CSS/이미지/JSON 경로가 깨집니다. GitHub Desktop에서 기존 저장소로 클론한 후 복사 및 Push하는 방법을 권장합니다.

수정 확인: `python scripts/check_content.py`를 실행하고, 웹사이트는 `python -m http.server 8000`으로 띄워 확인하세요. 배포 시 페이지가 캐시된 경우 `Ctrl+Shift+R`을 사용하세요.

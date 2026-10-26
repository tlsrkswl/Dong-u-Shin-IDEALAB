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
projects.html             기존 Projects 주소 → Research로 연결
news.html                 News (수상 기록만 표시)
award.html                수상 상세 페이지 (상장 이미지만 표시, PDF 링크 없음)
cv.html                   Curriculum Vitae (금지 항목 제외)
project.html              기존 상세 주소 → study.html로 연결
study.html                연구 개요, 기간, 승인된 공개 PDF
pdf-viewer.html           도구 모음 없는 문서 미리보기
post.html                 추후 연구 기록 템플릿
content/
  site.json               이름, 모토, 자기소개, 이메일, 소속, 연구실 위치
  cv.json                 Education, 연구 경력, 수상, 자격
  research.json           연구 분야 카드
  publications.json       학술지·학술대회 + International/Domestic
  projects.json           Research에 표시할 연구 개요와 승인된 공개 PDF 목록
  news.json               수상 소식만
  achievements.json       향후 활용할 수 있는 성과 데이터 (현재 화면 미사용)
assets/awards/            수상 이미지 (PDF 링크 없음)
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

### GraphRAG 인터랙티브 데모

Home에서는 `assets/videos/graphrag-demo.mp4` 데모 영상이 음소거 상태로 자동·반복 재생됩니다. 기본 영상 컨트롤로 일시 정지하거나 소리를 켤 수 있습니다. Home의 `Open Demo` 버튼에서 인터랙티브 데모를 열 수 있으며, Research의 데모 소개는 Home으로 통합했습니다. 파란 Hero 영역과 데모 사이에는 `content/research.json`의 제목과 `keywords` 태그로 세 연구 분야를 간단히 표시합니다. 영상을 바꿀 때는 같은 경로에 MP4를 업로드하세요.

Home 페이지의 **Inside GraphRAG** 카드에서 **Open Demo**를 누르면 새 탭에서 데모가 열립니다. 데모 파일은 `demos/graphrag/index.html`이며, 데이터와 스타일, JavaScript가 포함되어 별도 설치나 API 키 없이 실행됩니다. GitHub Pages에는 이 폴더도 함께 올리세요.

데모를 갱신할 때는 해당 HTML을 교체하고 `assets/images/graphrag-demo.png` 썸네일도 새 화면으로 갱신하세요. Home 데모 소개 문구와 링크는 `index.html`에 있습니다.

- **Home 영어 모토:** `content/site.json`의 `homeMotto` 배열을 편집하세요. 각 항목의 `text`를 순서대로 연결하며, `tone`은 `knowledge`, `prediction`, `optimization` 중 하나로 강조 색상을 정합니다. `breakBefore: true`는 데스크톱에서 문장 앞에 줄바꿈을 넣습니다. 앞 글자부터 한 번 나타나는 모션은 사용자 모션 감소 설정에서는 생략되며, JavaScript 없이도 기본 영문 문구는 표시됩니다.
- **모토/연구실 위치:** About의 모토는 `content/site.json`의 `motto`이며, 위치는 `labLocation`, `labLocationEnglish`를 변경하세요. **기본 데이터의 연구실 위치: 제5공학관 224호 (웹 About 상단 표시: Hanyang University ERICA, 하단 영문 안내: Engineering Building 5, Room 224)**.
- **학교 추가:** `content/cv.json`의 `education` 배열에 새 항목을 넣습니다. 미래 예정 학적은 `planned: true`로 두면 계획 상태가 표시됩니다.
- **논문 추가:** `content/publications.json`에 `type: "Journal"` 또는 `"Conference"`, `scope: "International"` 또는 `"Domestic"`을 설정합니다. 분류별 자동 표시되며 CV에도 반영됩니다.
- **연구 관리:** `content/projects.json`의 연구 항목은 Research 하단의 3열 목록에 표시됩니다. 현재는 **GraphRAG for Drone Design** 한 개만 있고, 기간은 **2026.09–Present**, 상태는 **Ongoing**입니다. Research 하단의 진행 중인 연구 카드에서 `study.html?id=drone-graphrag`로 이동합니다. 기존 Projects 주소는 새 Research 화면으로 연결됩니다.
- **자료 공개 범위:** **RAG Fundamentals & Knowledge Graph Integration** 한 개만 공개합니다. 나머지 네 PDF는 공개 파일과 메타데이터에서 제거했습니다. 링크를 숨기거나 `private` 플래그만 추가하는 방식은 사용하지 않습니다. 비공개 원본은 이 공개 저장소나 배포 경로에 다시 넣지 마세요. 과거 공개된 GitHub 이력과 사본은 현재 파일 삭제만으로 지워지지 않습니다.
- **자료 표시:** 상세 화면은 연구 개요와 제목·페이지 수·`View PDF` 버튼만 표시합니다. PDF는 버튼을 누를 때 모달 뷰어로 열립니다. 내부 미리보기는 PDF.js로 문서만 표시하고 페이지를 스크롤해 읽습니다. 텍스트 선택도 지원하며, 인쇄·다운로드는 상단의 새 탭 링크로 원본 PDF를 열어 사용합니다. `documents`에는 공개 승인된 자료만 넣으세요. 뷰어 배포 파일과 라이선스는 `assets/vendor/pdfjs/`에 있으며, 별도 서버나 CDN은 사용하지 않습니다.
- **새 연구 추가:** `content/projects.json` 배열에 `id`, `title`, `category`, `summary`, `overview`, `date`, `startDate`, `status`, `tags`, `documents`, `image`, `theme`, `themeLabel`을 가진 항목을 추가하면 빈 칸부터 카드가 채워집니다. `theme`은 `knowledge`, `physics`, `optimization` 중 하나입니다. `image`는 공개 도식의 `assets/` 경로입니다. Home과 Research 상단의 세 연구 분야 소개는 링크 없는 설명용 요소입니다.
- **검사:** `python3 scripts/check_content.py`는 목록에 없는 PDF가 공개 폴더에 남아 있는지와 승인된 자료만 공개되는지도 검사합니다.
- **PDF 뷰어 검증:** Playwright Python과 Chromium이 있는 개발 환경에서는 `python3 scripts/check_pdf_viewer.py`로 전체 페이지 렌더링, 한글 텍스트 선택, 스크롤, 새 탭 열기와 모바일 표시를 확인할 수 있습니다. 배포 사이트를 실행하는 데 이 도구들은 필요하지 않습니다.

- **뉴스 수정:** `content/news.json`에 `label: "Award"`인 수상 소식만 표시하도록 구성했습니다. 현재 2025 KSEE 학술대회 발표 우수상 1건만 있습니다.
- **증명사진 교체:** `assets/images/profile-dongu-shin.png`를 새 이미지로 교체하면 됩니다. 파일명 유지가 편리합니다.
- **로고 교체:** `assets/images/idea-logo-white.png`(어두운 메뉴), `idea-logo-original.png`(본문) 파일을 변경하세요.
- **CV PDF 갱신:** JSON을 수정한 후 `python scripts/build_cv.py`를 실행하세요. `python -m pip install reportlab`이 필요합니다. 웹 CV만 최신화하려면 별도 재빌드는 필요 없습니다.

## 중요 분류 및 공개 정보

- Journal: **International** (1편, *Accepted 2026*) / Domestic (0편)
- Conference: International (0편) / **Domestic** (2편)
- Research: **GraphRAG for Drone Design** 연구 한 개와 승인된 입문 발표 PDF 한 개만 공개
- News: **수상만 표시**
- About: 공식 로고, 증명사진, 사용자 모토, 연구실 위치 `Hanyang University ERICA`와 아래 영문 `Engineering Building 5, Room 224`를 표시
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
- (V3 이력) 주소 문구를 단순화했던 과거 버전의 설정입니다. **현재 V5 화면은 `Hanyang University ERICA`와 영문 호실 안내를 표시합니다.**
- 대제목 끝의 장식용 점(`.`)은 제거했습니다.
- Publications 저자 목록과 웹 CV에서 본인 이름을 굵게 표시합니다. 본인 이름의 표기 변형은 `content/site.json` > `publicationAuthorNames` 배열에서 수정하세요.
- News에 남아 있는 **2025 KSEE 우수발표논문상** 항목을 클릭하면 `award.html?id=ksee-2025-best-presentation` 페이지로 이동하고 상장이 표시됩니다. 상장 이미지가 표시됩니다.
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
  "certificateImage": "assets/awards/example.webp"
}
```

상장 이미지(`.webp`)와 원본(`.pdf`)을 `assets/awards/` 폴더에 저장하세요. 현재 상장은 첨부된 `포스터세션_상장.pdf`를 그대로 포함하고, 웹 미리보기 이미지는 PDF 1페이지에서 생성했습니다. `id`를 바꾸면 기존 상세 페이지 URL도 바뀝니다.

### GitHub Pages 업로드 시 주의

GitHub 저장소의 최상위에 **압축을 푼 폴더의 내부 파일과 하위 폴더를 그대로** 복사해야 합니다. 반드시 `index.html`, `about.html`, `award.html`, `assets/`, `content/`, `scripts/`가 같은 수준에 있어야 합니다. GitHub 웹의 파일 개별 업로드로 하위 폴더를 풀어버리면 이전처럼 CSS/이미지/JSON 경로가 깨집니다. GitHub Desktop에서 기존 저장소로 클론한 후 복사 및 Push하는 방법을 권장합니다.

수정 확인: `python scripts/check_content.py`를 실행하고, 웹사이트는 `python -m http.server 8000`으로 띄워 확인하세요. 배포 시 페이지가 캐시된 경우 `Ctrl+Shift+R`을 사용하세요.

## V4 변경 사항

- 모든 페이지의 브라우저 탭 제목: `Dong-u Shin · IDEA LAB`로 고정됩니다.
- 상단 메뉴: **Home / About / Research / Projects / Publications / News / CV**.
- About 소개 제목 위의 작은 코드 문구는 제외하고, 제목 아래 설명은 복원합니다.
- Research / Publications / Projects / News 상단 타이틀 위 코드 문구를 제거했습니다.
- 비어 있는 학술 실적 분류는 표시하지 않습니다. 국제저널 1편, 국내 학술대회 2편만 표시합니다. 새 항목이 추가되면 분류가 자동으로 나타납니다.
- News에서 수상 글을 선택하면 이미지가 있는 상세 페이지로 이동하며, PDF 다운로드 링크는 나타나지 않습니다.
- 홈 히어로 하단의 파란색 배경 내 작은 IDEA LAB 소속 문구를 제거했습니다. 공식 로고와 푸터는 유지합니다.
- 모든 페이지의 하단 푸터에 한양대학교 사자 심볼과 2줄 소개를 통일했습니다.


## V5 수정사항 (2026-10-08)

- Home 사진 라벨 `IDEA LAB / HANYANG`, 홈 소속 문구 `HANYANG UNIVERSITY · IDEA LAB`로 표시합니다.
- About AFFILIATION: `IDEA LAB · Hanyang University` (ERICA 제거).
- About LAB LOCATION 첫째 줄: `Hanyang University ERICA`. 둘째 줄: `Engineering Building 5, Room 224` (유지).
- About Education의 `Planned admission · Hanyang University ERICA` 세부 설명은 제거하지만, 2027년 입학 **예정** 상태 자체는 유지합니다.
- 푸터 및 기타 소속 표기에서도 ERICA를 제거하고, 장소를 명시하는 Lab Location에만 ERICA를 남겼습니다.
- `content/site.json`과 `content/cv.json` 파일을 수정하면 문구를 추후 손쉽게 변경할 수 있습니다.


## V6 변경 사항 (푸터 중앙 정렬)

- 푸터 저작권 문구: `© IDEA LAB, Hanyang University ERICA. All rights reserved.`로 ERICA 표기를 복원했습니다.
- 푸터의 **왼쪽 사자 이미지 + 오른쪽 두 줄 문구를 하나의 수평 묶음**으로 보고 화면 중앙에 정렬합니다. 글자만 따로 중앙 정렬하거나 이미지와 글자를 양 끝으로 벌리지 않습니다.
- 모바일에서도 좌우 배치와 전체 묶음 중앙 정렬이 유지되도록 반응형 CSS를 적용했습니다.
- 이외 페이지 내용과 About의 LAB LOCATION 정보는 V5와 동일하게 유지합니다.

## Update: DOI link / favicon / simpler pages

- The 2026 JMST journal title opens its DOI in a new tab. Edit `content/publications.json` → `url` for future links.
- Browser favicon: Hanyang University seal (source: `assets/images/hanyang-university-seal-original.png`, generated `favicon-hanyang.png`, `favicon.ico`, and `apple-touch-icon.png`).
- Publication jump buttons and the extra News placeholder sentence have been removed.
- GitHub Pages: push the unpacked project files and folders to the repository root; retain `assets/` and `content/`. A hard refresh (Ctrl+Shift+R) or closing and reopening the tab may be needed to clear the old favicon.


## Homepage layout revision (2026-10-10)

- Removed the duplicate large About heading and subtitle; the About page starts with the profile and biography.
- Removed the "RESEARCH DIRECTIONS / From Ideas to Design Solutions" heading block above Research cards.
- Removed the profile photo from the Home hero only (the About photo remains).
- Shortened the Home hero to approximately 405px on desktop. You can adjust this using the final "V10" CSS block in `assets/css/style.css`.
- All existing research data, DOI URLs, favicon, CV, footer, and navigation are unchanged.

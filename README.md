# B1-1 나를 소개하는 웹페이지 처음부터 만들기

HTML, CSS, JavaScript만으로 반응형 포트폴리오 웹사이트를 만들고 GitHub Pages에 배포했습니다. React, jQuery, Bootstrap 같은 라이브러리는 사용하지 않았고, Projects 섹션은 GitHub API로 제 공개 저장소를 받아와 화면에 그립니다.

배포 주소는 아래 배포 절에 있습니다.

## 사용 기술

- HTML5 시맨틱 태그
- CSS 변수, Flexbox, Grid, 미디어 쿼리
- JavaScript (ES6+, DOM API, fetch, Intersection Observer, localStorage)
- GitHub REST API
- GitHub Pages

## 실행 환경

```bash
$ sw_vers -productVersion
15.7.7

$ code --version
1.138.0
7debcd0e2acdea1c52de81bf9ee1620444407dda
arm64

$ code --list-extensions --show-versions | grep -i liveserver
ritwickdey.liveserver@5.7.10
```

VS Code에서 작성하고 Live Server 확장으로 띄운 로컬 서버에서 확인하면서 진행했습니다. 브라우저는 Chrome 153입니다.

## 디렉터리 구조

```
$ tree -a -I '.git'
.
├── .gitignore
├── css
│   └── style.css
├── images
│   └── profile.jpg
├── index.html
├── js
│   └── main.js
└── README.md

4 directories, 6 files
```

페이지는 `index.html` 하나이고 스타일과 스크립트는 외부 파일로 분리했습니다. 스크립트는 `defer`로 연결해 DOM이 만들어진 뒤에 실행되도록 했습니다.

```html
  <link rel="stylesheet" href="css/style.css">
  <script src="js/main.js" defer></script>
```

## 화면 구조

전체를 `div`로 감싸지 않고 역할이 드러나는 태그를 사용했습니다. 상단 고정 영역은 `header`와 `nav`, 본문은 `main` 아래 섹션 다섯 개, 하단은 `footer`입니다. 섹션마다 `id`를 두고 네비게이션에서 앵커로 연결합니다.

```html
  <header class="header" id="header">
    <nav class="nav" aria-label="주요 메뉴">
      <a class="logo" href="#home">yessjun</a>
      <ul class="nav-menu" id="nav-menu">
        <li><a href="#about">About</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="다크 모드 전환">
          <span id="theme-icon">🌙</span>
        </button>
        <button type="button" class="hamburger" id="hamburger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="nav-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  </header>
```

Skills의 그룹 카드와 Projects의 저장소 카드는 각각 떼어놓아도 의미가 유지되는 단위라 `article`로 감쌌습니다. 프로필 사진에는 누구의 사진인지 알 수 있는 `alt`를 넣었고, 폼의 `label`은 `for`와 입력 요소의 `id`를 맞춰 연결했습니다.

## 레이아웃과 반응형

색상, 폰트, 간격, 모서리 반경, 전환 시간을 `:root`에 변수로 두고, 다크 모드용 값은 `[data-theme="dark"]`에 따로 정의했습니다. 테마를 바꿀 때 이 속성만 교체하면 화면 전체가 함께 바뀝니다.

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f5f6f8;
  --color-text: #1b1b1f;
  --color-muted: #5f6368;
  --color-border: #e0e2e7;
  --color-accent: #2f6feb;
  --color-accent-text: #ffffff;
  --color-header: rgba(255, 255, 255, 0.85);
  --color-shadow: rgba(16, 24, 40, 0.08);

  --font-body: "Pretendard", "Apple SD Gothic Neo", "Segoe UI", sans-serif;
  --font-size-title: 2rem;

  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --radius: 12px;
  --transition: 0.2s ease;
}

[data-theme="dark"] {
  --color-bg: #15171c;
  --color-surface: #1d2026;
  --color-text: #e9eaee;
  --color-muted: #a0a5ae;
  --color-border: #2c3038;
  --color-accent: #6f9bff;
  --color-accent-text: #12141a;
  --color-header: rgba(21, 23, 28, 0.85);
  --color-shadow: rgba(0, 0, 0, 0.4);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
```

네비게이션은 로고, 메뉴, 버튼 묶음을 한 줄에 배치해야 해서 Flexbox를 사용했습니다. `justify-content: space-between`으로 로고를 왼쪽, 나머지를 오른쪽에 붙입니다.

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-sm);
}

.logo {
  font-weight: 700;
  font-size: 1.125rem;
}

.nav-menu {
  display: none;
}

.nav-menu.active {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
```

Projects 카드는 개수가 API 응답에 따라 달라지므로 Grid의 `auto-fit`과 `minmax`를 사용했습니다. 카드 최소 폭을 260px로 두면 화면 폭에 따라 열 개수가 알아서 정해집니다.

```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-sm);
}
```

기본 스타일은 모바일 기준으로 작성하고, 768px과 1024px에서 필요한 부분만 재정의합니다. 768px 미만에서는 메뉴가 감춰지고 햄버거 버튼이 보입니다.

```css
@media (min-width: 768px) {
  .hamburger {
    display: none;
  }

  .nav-menu {
    display: flex;
    gap: var(--space-md);
  }

  .hero-title {
    font-size: 3rem;
  }

  .caret {
    height: 2.4rem;
  }
```

## 다크 모드

테마는 `data-theme` 속성 하나로 관리합니다. 첫 진입 때는 로컬스토리지에 저장된 값을 먼저 보고, 없으면 `prefers-color-scheme`으로 시스템 설정을 따릅니다. 버튼을 누르면 상태를 바꾸고 로컬스토리지에 기록하므로 새로고침해도 유지됩니다.

```javascript
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "라이트 모드 전환" : "다크 모드 전환");
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
  const next = state.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});
```

## 네비게이션과 스크롤

햄버거 버튼은 `classList.toggle`로 메뉴에 `active` 클래스를 추가하거나 제거합니다. 버튼의 `aria-expanded`도 같이 바꿉니다.

```javascript
function toggleMenu(open) {
  state.menuOpen = open;
  navMenu.classList.toggle("active", open);
  hamburger.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", String(open));
  hamburger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
}

hamburger.addEventListener("click", () => toggleMenu(!state.menuOpen));
```

앵커 링크는 `event.preventDefault()`로 기본 이동을 막고 `scrollIntoView`로 부드럽게 옮깁니다. 모바일에서 메뉴를 열어둔 채 항목을 누르면 이동과 함께 메뉴를 닫습니다.

스크롤 이벤트에서는 두 가지를 확인합니다. 60px을 넘으면 네비게이션에 배경색과 그림자를 넣고, 300px을 넘으면 맨 위로 이동하는 버튼을 표시합니다. 섹션 등장 효과는 Intersection Observer로 처리했고 임계값은 0.2입니다.

```javascript
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > SCROLL_HEADER);
  toTop.classList.toggle("visible", y > SCROLL_TOP_BUTTON);
});

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: REVEAL_THRESHOLD }
);

document.querySelectorAll(".section").forEach((section) => {
  section.classList.add("reveal");
  observer.observe(section);
});
```

## Projects: GitHub API 연동

`https://api.github.com/users/yessjun/repos`를 `fetch`와 `async/await`로 호출합니다. 응답에서 필요한 값만 구조분해로 꺼내 화면에서 사용할 형태로 정리해 상태에 담습니다. 포크한 저장소는 직접 만든 것이 아니라 목록에서 제외했습니다.

```javascript
async function loadProjects() {
  state.status = "loading";
  filters.innerHTML = "";
  renderProjects();

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}`);
    }
    const data = await response.json();
    state.repos = data
      .filter((repo) => !repo.fork)
      .map(({ name, description, language, stargazers_count, html_url }) => ({
        name,
        description: description || "설명이 없는 저장소입니다.",
        language: language || "Other",
        stars: stargazers_count,
        url: html_url,
      }));
    state.status = "loaded";
    renderFilters();
    renderProjects();
  } catch (error) {
    state.status = "error";
    renderProjects();
  }
}
```

화면은 상태를 보고 그립니다. 로딩 중에는 안내 문구를 표시하고, 실패하면 다시 시도 버튼을 함께 표시하며, 성공했지만 표시할 항목이 없으면 빈 상태 문구를 표시합니다. 인증 없이 호출하면 시간당 60회 제한이 있어 403이 돌아오는데, 이때도 `response.ok`가 거짓이라 같은 에러 경로로 들어갑니다.

```javascript
function renderProjects() {
  const { repos, language, status } = state;

  if (status === "loading") {
    projectsState.textContent = "로딩 중...";
    projectList.innerHTML = "";
    return;
  }

  if (status === "error") {
    projectsState.innerHTML = '프로젝트를 불러올 수 없습니다. <button type="button" class="retry-button" id="retry">다시 시도</button>';
    projectList.innerHTML = "";
    document.querySelector("#retry").addEventListener("click", loadProjects);
    return;
  }

  const visible = language === "All" ? repos : repos.filter((repo) => repo.language === language);

  if (visible.length === 0) {
    projectsState.textContent = "표시할 프로젝트가 없습니다.";
    projectList.innerHTML = "";
    return;
  }

  projectsState.textContent = "";
  projectList.innerHTML = visible
    .map(({ name, description, language: repoLanguage, stars, url }) => `
```

## 문의 폼

검증 규칙을 필드 이름별 함수로 두고, 빈 값과 이메일 형식을 확인합니다. 에러 메시지는 각 입력 아래에 표시하고 입력 테두리 색도 함께 바꿉니다. 한 번 에러가 난 필드는 `input` 이벤트로 다시 검사해 고치는 즉시 메시지가 사라집니다.

```javascript
const validators = {
  name: (value) => (value.trim() === "" ? "이름을 입력해 주세요." : ""),
  email: (value) => {
    if (value.trim() === "") {
      return "이메일을 입력해 주세요.";
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "이메일 형식이 올바르지 않습니다.";
  },
  message: (value) => (value.trim() === "" ? "메시지를 입력해 주세요." : ""),
};
```

제출은 `event.preventDefault()`로 막고 직접 검사합니다. 하나라도 통과하지 못하면 제출을 중단하고, 전부 통과하면 성공 메시지를 표시한 뒤 폼을 초기화합니다.

```javascript
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const results = fields.map((field) => validateField(field));
  if (results.includes(false)) {
    formResult.textContent = "";
    return;
  }
  formResult.textContent = "메시지를 보냈습니다. 확인 후 답장드리겠습니다.";
  contactForm.reset();
});
```

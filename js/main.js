const GITHUB_USER = "yessjun";
const SCROLL_HEADER = 60;
const SCROLL_TOP_BUTTON = 300;
const REVEAL_THRESHOLD = 0.2;

const state = {
  theme: "light",
  repos: [],
  language: "All",
  status: "idle",
  menuOpen: false,
};

const header = document.querySelector("#header");
const navMenu = document.querySelector("#nav-menu");
const hamburger = document.querySelector("#hamburger");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const toTop = document.querySelector("#to-top");
const filters = document.querySelector("#filters");
const projectsState = document.querySelector("#projects-state");
const projectList = document.querySelector("#project-list");
const contactForm = document.querySelector("#contact-form");
const formResult = document.querySelector("#form-result");

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

function toggleMenu(open) {
  state.menuOpen = open;
  navMenu.classList.toggle("active", open);
  hamburger.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", String(open));
  hamburger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
}

hamburger.addEventListener("click", () => toggleMenu(!state.menuOpen));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) {
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    if (state.menuOpen) {
      toggleMenu(false);
    }
  });
});

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

const TYPING_WORDS = ["신예준입니다.", "백엔드를 만듭니다.", "인프라를 다룹니다."];
const typing = document.querySelector("#typing");

function runTyping(wordIndex, letterIndex, deleting) {
  const word = TYPING_WORDS[wordIndex];
  typing.textContent = word.slice(0, letterIndex);

  if (!deleting && letterIndex === word.length) {
    setTimeout(() => runTyping(wordIndex, letterIndex, true), 1500);
    return;
  }
  if (deleting && letterIndex === 0) {
    runTyping((wordIndex + 1) % TYPING_WORDS.length, 0, false);
    return;
  }
  const nextIndex = deleting ? letterIndex - 1 : letterIndex + 1;
  setTimeout(() => runTyping(wordIndex, nextIndex, deleting), deleting ? 60 : 120);
}

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
      <li class="project-card">
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="project-meta">
          <span>${repoLanguage}</span>
          <span>star ${stars}</span>
        </div>
        <a href="${url}" target="_blank" rel="noopener">저장소 열기</a>
      </li>
    `)
    .join("");
}

function renderFilters() {
  const languages = ["All", ...new Set(state.repos.map((repo) => repo.language))];
  filters.innerHTML = languages
    .map((language) => `<button type="button" class="filter-button" data-language="${language}">${language}</button>`)
    .join("");

  filters.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === state.language);
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      renderFilters();
      renderProjects();
    });
  });
}

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

function validateField(field) {
  const message = validators[field.id](field.value);
  document.querySelector(`#${field.id}-error`).textContent = message;
  field.classList.toggle("invalid", message !== "");
  return message === "";
}

const fields = Object.keys(validators).map((id) => document.querySelector(`#${id}`));

fields.forEach((field) => {
  field.addEventListener("input", () => {
    if (field.classList.contains("invalid")) {
      validateField(field);
    }
  });
});

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

initTheme();
runTyping(0, 0, false);
loadProjects();

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

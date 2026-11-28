export const profile = {
  name: "김은정",
  role: "백엔드 개발자",
  headline: "설계로 문제를 끝내는 개발자",
  intro:
    "실제 서비스를 2년간 개발하고 운영하면서 유지보수가 얼마나 중요한지 배웠습니다. 기능을 만들기 전에 무엇이 문제인지부터 정리하고, 동시성과 데이터 정합성까지 생각해서 오래 쓸 수 있는 구조를 고민합니다",
  email: "keunjeong613@gmail.com",
  github: "https://github.com/Kejeong",
  // 노션 스터디 노트 (사이드바 기록 메뉴 아래)
  notion: "https://almond-collar-aba.notion.site/STUDY-3328151da0e1803da0bfeff683cc9710",
  photo: "/profile.jpg",
  // public 폴더에 같은 이름으로 PDF를 넣으면 사이드바 메뉴에서 열린다
  resumePdf: "/resume.pdf",
  portfolioPdf: "/portfolio.pdf",
  // 사이드바 프로필 아래 두 줄 소개
  sideIntro: "설계로 문제를 끝내는 개발자.\n동시성과 데이터 정합성을 고민합니다.",
};

// 홈(소개) 화면: 질문과 대답. 대답 안의 **굵게**는 굵은 글씨로 보인다
export const about = {
  hello: "안녕하세요,",
  title: "백엔드 개발자 김은정입니다",
  text: "계획을 세우고 차근차근 정리하는 것을 좋아합니다! 그래서 개발할 때도 바로 만들기보다 무엇이 문제인지부터 정리하고 시작합니다.",
  qaTitle: "자주 듣는 질문",
  qa: [
    {
      q: "어떤 개발자인가요?",
      a: "기능을 만들기 전에 **무엇이 문제인지부터 정리**하는 편입니다. 실제 서비스를 2년간 운영과 유지보수를 하면서, 동시성과 데이터 정합성까지 구조적인 부분에 고민을 많이 했던 것 같습니다.",
    },
    { q: "MBTI는요?", a: "**ISTJ**입니다. 내향형이지만 친해지만 조잘조잘 말이 많아져요!" },
    {
      q: "쉬는 날엔 뭐 해요?",
      a: "**드라이브**를 가거나 좋아하는 **카페에서 카공**을 하는 편이에요! 그리고 넷플릭스를 보는걸 좋아하는데 데블스플랜, 피의게임 등 생존게임 부류를 좋아하는 것 같습니다",
    },
    { q: "요즘은요?", a: "프로젝트에서 부딪힌 문제를 **블로그에 기록**하고, 이제는 CS적인 부분이 중요해진 것 같아서 기본기를 다지는 중입니다" },
  ],
};

export const experience = [
  {
    slug: "cloudlab", // 상세 주소: /experience/cloudlab
    company: "(주)클라우드랩",
    role: "백엔드 개발, 현장관리팀",
    period: "24.06 — 26.08",
    summary:
      "건설 현장 안전관리 서비스 (한화오션 HSE 점검, 협력사 장비 안전점검, 문서관리)",
    points: [
      "HSE 점검, 장비 안전점검, 문서관리의 웹/모바일 API 42개를 요구사항 분석부터 설계, 테스트, 운영 배포까지 맡았습니다",
      "현장마다 50~100명이 쓰는 점검, 지시, 배분, 조치, 현장/본사 승인의 6단계 워크플로를 공통 결재와 연동해 구현했습니다",
      "실제 운영 중인 서비스라 사용자 오류가 들어오면 ELK로 로그를 확인하고, 개발 환경에서 재현해 원인을 찾은 뒤 수정해서 배포까지 마무리했습니다",
      "협력업체의 레거시 회계 프로그램(한국레미콘공동연합회)과 홈페이지(한국아스콘공업)를 원격으로 분석하고 수정했습니다",
    ],
    tech: ["Java", "Spring Boot", "MyBatis", "Oracle", "WebSquare", "JavaScript", "Vue.js", "TypeScript", "Nuxt.js"],
    // 숫자로 보는 핵심 (경력 페이지 상단)
    stats: [
      { value: "42개", label: "설계부터 배포까지 맡은 API" },
      { value: "50~100명", label: "현장마다 쓰는 사용자" },
      { value: "6단계", label: "점검 · 승인 워크플로" },
    ],
    // content/projects/의 설계 상세 문서 (없으면 생략)
    detail: "cloudlab",
  },
  {
    slug: "ajuqms",
    company: "아주큐엠에스(주)",
    role: "하계 방학 인턴십, 대외사업본부 RPA솔루션팀",
    period: "23.06 — 23.08",
    summary: "RPA 솔루션팀에서 UiPath 교육과 RPA 공동구현 프로젝트에 참여했습니다",
    points: [
      "UiPath Academy 강의를 이수하고, 클라이언트 현업 교육 기간 중 실습 조교 역할을 수행했습니다",
      "RPA 공동구현 프로젝트에 참여해 시세표 작성과 중대 클레임 구분 프로젝트의 설계와 개발에 참여했습니다",
    ] as string[],
    tech: ["UiPath", "RPA"] as string[],
  },
];

export const education = [
  { title: "서경대학교 소프트웨어학과", sub: "졸업, 학점 3.83 / 4.5", period: "19.03 — 24.02" },
  {
    title: "프로그래머스 백엔드 단기심화 데브코스 8기",
    sub: "MSA 기반 서비스 설계, Kafka 이벤트 기반 통신, Spring AI 활용, Kubernetes 환경 배포와 운영",
    period: "26.09 — 26.11",
  },
];

export const certificates = [
  { title: "정보처리기사", org: "한국산업인력공단", date: "26.09" },
  { title: "SQLD", org: "한국데이터산업진흥원", date: "25.09" },
  { title: "컴퓨터활용능력 1급", org: "대한상공회의소", date: "22.03" },
];

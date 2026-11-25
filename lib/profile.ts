export const profile = {
  name: "김은정",
  role: "백엔드 개발자",
  headline: "설계로 문제를 끝내는 개발자",
  intro:
    "실제 서비스를 2년간 개발하고 운영하면서 유지보수가 얼마나 중요한지 배웠습니다. 기능을 만들기 전에 무엇이 문제인지부터 정리하고, 동시성과 데이터 정합성까지 생각해서 오래 쓸 수 있는 구조를 고민합니다",
  email: "keunjeong613@gmail.com",
  github: "https://github.com/Kejeong",
  photo: "/profile.jpg",
  // public 폴더에 같은 이름으로 PDF를 넣으면 사이드바 메뉴에서 열린다
  resumePdf: "/resume.pdf",
  portfolioPdf: "/portfolio.pdf",
  // 사이드바 프로필 아래 두 줄 소개
  sideIntro: "설계로 문제를 끝내는 개발자.\n동시성과 데이터 정합성을 고민합니다.",
};

// 홈(소개) 화면
export const about = {
  hello: "안녕하세요,",
  titleBefore: "백엔드 개발자 ",
  titleName: "김은정",
  titleAfter: "입니다",
  text: "계획을 세우고 차근차근 정리하는 것을 좋아합니다! 그래서 개발할 때도 바로 만들기보다 무엇이 문제인지부터 정리하고 시작합니다 쉬는 날에는 드라이브를 가거나 좋아하는 카페에서 카공을 하는 편입니다 :)",
  mbti: {
    type: "ISTJ",
    desc: "계획하고, 정리하고, 끝까지 지키는 타입",
    letters: [
      { letter: "I", word: "내향" },
      { letter: "S", word: "감각" },
      { letter: "T", word: "사고" },
      { letter: "J", word: "판단" },
    ],
  },
  // icon: car | coffee | sparkle | list | pencil
  likes: [
    { icon: "car", value: "드라이브", desc: "창밖 풍경 보며 달리기" },
    { icon: "coffee", value: "카페", desc: "커피 한 잔과 노트북" },
    { icon: "sparkle", value: "트렌디한 것", desc: "새로 나온 것들 먼저 써보기" },
  ],
  cards: [
    { icon: "list", label: "일하는 방식", value: "문제부터 정리", desc: "기능보다 먼저 무엇이 문제인지 적어봐요" },
    { icon: "pencil", label: "요즘", value: "공부 기록 중", desc: "프로젝트에서 부딪힌 문제를 블로그에 정리해요" },
  ],
  keywords: ["ISTJ", "계획형", "드라이브", "카페투어", "트렌드", "백엔드", "기록하는_개발자"],
};

export const experience = [
  {
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
    company: "(주)아주큐엠에스",
    role: "RPA 인턴",
    period: "23.06 — 23.08",
    summary:
      "RPA 공동구현 프로젝트에 참여했고, UiPath Academy 강의를 이수한 뒤 클라이언트 현업 교육에서 조교를 맡았습니다",
    points: [] as string[],
    tech: [] as string[],
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

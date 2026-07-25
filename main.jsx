import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  calculateFourPillars,
  getHeavenlyStemElement,
  getEarthlyBranchElement
} from "manseryeok";
import "./styles.css";

const STEM_INFO = {
  갑: { element: "목", yinYang: "양", image: "큰 나무", traits: ["개척성", "곧은 추진력", "성장 욕구"] },
  을: { element: "목", yinYang: "음", image: "덩굴과 화초", traits: ["유연함", "관계 감각", "끈기"] },
  병: { element: "화", yinYang: "양", image: "태양", traits: ["표현력", "낙천성", "리더십"] },
  정: { element: "화", yinYang: "음", image: "촛불", traits: ["섬세함", "몰입", "통찰"] },
  무: { element: "토", yinYang: "양", image: "큰 산", traits: ["안정감", "책임감", "버팀"] },
  기: { element: "토", yinYang: "음", image: "논밭", traits: ["실용성", "돌봄", "관리력"] },
  경: { element: "금", yinYang: "양", image: "강철", traits: ["결단력", "직선성", "승부욕"] },
  신: { element: "금", yinYang: "음", image: "보석", traits: ["정교함", "기준", "미적 감각"] },
  임: { element: "수", yinYang: "양", image: "큰 바다", traits: ["확장성", "정보력", "자유로움"] },
  계: { element: "수", yinYang: "음", image: "비와 이슬", traits: ["직관", "관찰력", "감수성"] }
};

const ELEMENT_TEXT = {
  목: {
    strength: "성장, 기획, 확장, 교육, 관계를 새롭게 연결하는 능력",
    excess: "시작은 많지만 마무리가 느슨해지거나 자기 방식만 고집하기 쉽습니다.",
    lack: "장기 계획과 새로운 시도에 대한 자신감이 떨어질 수 있습니다.",
    work: ["교육·코칭", "브랜딩·기획", "콘텐츠 사업", "인재육성", "신규사업 개발"],
    habit: "아침 산책, 스트레칭, 나무와 자연이 있는 환경, 주간 목표 기록"
  },
  화: {
    strength: "표현력, 홍보력, 속도, 존재감, 분위기를 끌어올리는 힘",
    excess: "감정과 소비가 빠르고 성급한 결정이나 과열이 생기기 쉽습니다.",
    lack: "자기 홍보와 관계의 온도가 낮아져 기회를 놓치기 쉽습니다.",
    work: ["영업·마케팅", "영상·미디어", "서비스업", "리더십 역할", "공연·뷰티"],
    habit: "햇빛 보기, 유산소 운동, 규칙적인 수면, 감정이 올라올 때 즉답하지 않기"
  },
  토: {
    strength: "현실 감각, 신뢰, 운영, 조정, 자산을 쌓고 지키는 힘",
    excess: "걱정과 책임을 혼자 떠안고 변화에 둔감해질 수 있습니다.",
    lack: "생활 루틴과 돈 관리가 흔들리고 결정이 자주 바뀔 수 있습니다.",
    work: ["운영관리", "부동산·공간사업", "재무관리", "조직관리", "유통"],
    habit: "식사 시간 고정, 근력 운동, 가계부, 공간 정리, 한 번 정한 루틴 유지"
  },
  금: {
    strength: "판단력, 기준, 분석, 품질 관리, 결단과 정리의 힘",
    excess: "말이 날카로워지고 완벽주의나 흑백논리가 강해질 수 있습니다.",
    lack: "거절과 정리, 가격 결정, 계약 조건을 명확히 하는 데 약해질 수 있습니다.",
    work: ["재무·법무", "데이터 분석", "품질관리", "기술직", "컨설팅"],
    habit: "정리정돈, 호흡 운동, 계약 체크리스트, 불필요한 일과 관계 끊어내기"
  },
  수: {
    strength: "정보, 통찰, 소통, 유연성, 흐름을 읽고 기회를 포착하는 힘",
    excess: "생각이 너무 많아 실행이 늦고 감정이 안으로 쌓일 수 있습니다.",
    lack: "상황 변화에 대한 대처와 휴식, 정보 수집 능력이 약해질 수 있습니다.",
    work: ["상담·연구", "IT·플랫폼", "무역·유통", "기획", "커뮤니케이션"],
    habit: "충분한 수분, 수면, 기록, 수영·걷기, 정보 섭취 시간을 제한하기"
  }
};

const GENERATING = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
const CONTROLLING = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };
const GENERATED_BY = Object.fromEntries(Object.entries(GENERATING).map(([a,b]) => [b,a]));
const CONTROLLED_BY = Object.fromEntries(Object.entries(CONTROLLING).map(([a,b]) => [b,a]));

function stemOf(pillar) {
  return pillar?.heavenlyStem ?? pillar?.stem ?? "";
}
function branchOf(pillar) {
  return pillar?.earthlyBranch ?? pillar?.branch ?? "";
}
function pillarLabel(pillar) {
  return `${stemOf(pillar)}${branchOf(pillar)}`;
}
function elementOfStem(stem) {
  return STEM_INFO[stem]?.element || getHeavenlyStemElement(stem);
}
function elementOfBranch(branch) {
  return getEarthlyBranchElement(branch);
}

function countElements(chart) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  ["year", "month", "day", "hour"].forEach(key => {
    const p = chart[key];
    const se = elementOfStem(stemOf(p));
    const be = elementOfBranch(branchOf(p));
    if (counts[se] !== undefined) counts[se]++;
    if (counts[be] !== undefined) counts[be]++;
  });
  return counts;
}

function percentElements(counts) {
  const total = Object.values(counts).reduce((a,b) => a+b, 0) || 1;
  return Object.fromEntries(Object.entries(counts).map(([k,v]) => [k, Math.round(v / total * 100)]));
}

function pickByValue(counts, direction = "max") {
  const entries = Object.entries(counts);
  const target = direction === "max"
    ? Math.max(...entries.map(([,v]) => v))
    : Math.min(...entries.map(([,v]) => v));
  return entries.filter(([,v]) => v === target).map(([k]) => k);
}

function sentenceList(items) {
  if (items.length <= 1) return items[0] || "";
  return `${items.slice(0,-1).join(", ")} 그리고 ${items.at(-1)}`;
}

function buildAnalysis({ chart, form }) {
  const dayStem = stemOf(chart.day);
  const day = STEM_INFO[dayStem];
  const counts = countElements(chart);
  const percentages = percentElements(counts);
  const strongest = pickByValue(counts, "max");
  const weakest = pickByValue(counts, "min");
  const dm = day.element;
  const resource = GENERATED_BY[dm];
  const output = GENERATING[dm];
  const wealth = CONTROLLING[dm];
  const authority = CONTROLLED_BY[dm];

  const high = Object.entries(counts).filter(([,v]) => v >= 3).map(([k]) => k);
  const low = Object.entries(counts).filter(([,v]) => v <= 1).map(([k]) => k);

  const balanceNote =
    high.length && low.length
      ? `${sentenceList(high)}의 기운은 강하고 ${sentenceList(low)}의 기운은 상대적으로 약합니다. 강한 기운은 재능이지만 과하면 습관적 약점이 되므로, 부족한 기운을 생활 방식과 사람 선택으로 보완하는 것이 중요합니다.`
      : "오행 분포가 비교적 고르게 나타납니다. 특정 재능 하나에만 의존하기보다 여러 역할을 연결할 때 강점이 커집니다.";

  const personality = `${dayStem}일간은 ${day.image}에 비유됩니다. 기본적으로 ${day.traits.join(", ")}이 강하게 나타납니다. 겉으로는 상황을 이성적으로 판단하려 하지만, 실제 선택에서는 자신의 기준과 자존심이 매우 중요합니다. ${ELEMENT_TEXT[dm].strength}이 핵심 재능입니다.`;
  const conflict = counts[dm] >= 3
    ? `자기 기운이 강한 편이라 독립성과 주도권 욕구가 큽니다. 사람에게 의지하기보다 직접 해결하려 하고, 통제받는다고 느끼면 갑자기 거리를 둘 수 있습니다.`
    : `자기 기운이 과도하게 강하지 않아 환경과 상대의 반응을 많이 고려합니다. 배려가 장점이지만 결정이 늦어지거나 타인의 기대를 자기 욕구로 착각하지 않도록 주의해야 합니다.`;

  const relationshipGood = [resource, output].map(e => `${e} 기운이 건강한 사람`).join(", ");
  const relationshipBad = [authority, strongest[0]].filter(Boolean).map(e => `${e} 기운이 지나치게 강한 사람`).join(", ");

  const loveStyle = dm === "금"
    ? "신뢰와 기준이 분명한 연애를 원하며, 애매한 관계를 오래 견디지 못합니다."
    : dm === "수"
    ? "대화와 정서적 교감이 중요하고, 상대를 오래 관찰한 뒤 마음을 여는 편입니다."
    : dm === "목"
    ? "함께 성장하고 미래를 만들어가는 관계에서 사랑을 크게 느낍니다."
    : dm === "화"
    ? "표현과 반응이 분명한 연애를 좋아하며, 관계의 온도가 낮아지면 불안을 느끼기 쉽습니다."
    : "안정감과 생활의 합이 중요하며, 말보다 행동과 지속성을 통해 사랑을 확인합니다.";

  const moneyMode = counts[wealth] >= 2
    ? `재성에 해당하는 ${wealth} 기운이 살아 있어 돈의 흐름과 거래 감각을 활용하기 좋습니다. 다만 단기 매출에 집중해 무리하게 확장하지 않도록 숫자 기준을 세워야 합니다.`
    : `재성에 해당하는 ${wealth} 기운이 약하므로 돈은 운에 맡기기보다 구조로 관리해야 합니다. 자동저축, 고정비 한도, 계약서, 가격표처럼 눈에 보이는 시스템이 재물운을 보완합니다.`;

  const workIdeas = [...new Set([
    ...ELEMENT_TEXT[dm].work,
    ...ELEMENT_TEXT[output].work.slice(0,2),
    ...ELEMENT_TEXT[wealth].work.slice(0,2)
  ])].slice(0,7);

  const luck = chart.luckPillars?.pillars || [];
  const luckText = luck.length
    ? luck.slice(0,8).map(p => `${p.age}세 전후 ${p.korean || pillarLabel(p.pillar)} 대운`).join(" · ")
    : "현재 계산 결과에 대운 정보가 없습니다. 성별 입력과 라이브러리 버전을 확인하세요.";

  return {
    dayStem,
    day,
    counts,
    percentages,
    strongest,
    weakest,
    summary: `${form.name ? `${form.name}님의 ` : ""}사주의 중심은 ${dayStem}${day.yinYang}${dm}입니다. ${balanceNote}`,
    sections: [
      {
        title: "타고난 성격과 기질",
        body: `${personality}\n\n${conflict}\n\n${balanceNote}`
      },
      {
        title: "인간관계",
        body: `잘 맞는 사람은 ${relationshipGood}입니다. 이런 사람은 당신의 생각을 안정시키거나 실행으로 연결해 줍니다.\n\n갈등 가능성이 높은 유형은 ${relationshipBad}입니다. 특히 말로 우위를 점하려는 사람, 약속을 자주 바꾸는 사람, 책임은 피하면서 간섭하는 사람을 주의하세요. 당신의 장점은 사람의 능력과 상황을 빠르게 파악하는 것이며, 주의점은 실망한 뒤 설명 없이 관계를 끊어버리는 태도입니다.`
      },
      {
        title: "연애와 결혼운",
        body: `${loveStyle} 배우자는 감정 기복보다 생활 리듬이 안정되고 자기 일을 책임지는 사람이 좋습니다. ${resource} 기운의 상대는 정서적 안정과 이해를 주고, ${output} 기운의 상대는 당신의 매력과 표현력을 끌어냅니다.\n\n피해야 할 사람은 관계 초기에 과도하게 밀어붙이지만 책임지는 행동은 없는 사람, 질투와 통제로 애정을 확인하려는 사람, 돈과 약속이 불분명한 사람입니다. 결혼 후에는 역할·돈·가족 문제를 암묵적으로 넘기지 말고 문장과 숫자로 합의해야 관계가 오래갑니다.`
      },
      {
        title: "재물운과 직업운",
        body: `${moneyMode}\n\n잘 맞는 분야: ${workIdeas.join(" · ")}.\n\n일의 형태는 전문성을 쌓은 뒤 주도권을 갖는 방식이 좋습니다. 조직에서는 운영 책임자·팀 리더, 독립한다면 특정 문제를 해결해 주는 서비스형 사업이 유리합니다. 당장 시작할 수 있는 일은 ① 기존 경험을 유료 상담·코칭 상품으로 묶기 ② 지역 기반 고객을 모으는 콘텐츠 채널 만들기 ③ 반복 업무를 템플릿·프로그램·구독 상품으로 판매하기입니다.`
      },
      {
        title: "건강과 생활 관리",
        body: `강한 오행은 ${sentenceList(strongest)}, 약한 오행은 ${sentenceList(weakest)}입니다. 사주 해석상 과한 기운은 ${sentenceList(strongest.map(e => ELEMENT_TEXT[e].excess))} 부족한 기운은 ${sentenceList(weakest.map(e => ELEMENT_TEXT[e].lack))}\n\n권장 습관: ${sentenceList(weakest.map(e => ELEMENT_TEXT[e].habit))}. 이는 의학적 진단이 아니므로 증상이 있거나 건강이 걱정될 때는 검진과 의료진 상담을 우선하세요.`
      },
      {
        title: "대운 흐름",
        body: `${luckText}\n\n대운은 사건을 확정하는 예언이라기보다 약 10년 단위로 어떤 역할과 환경이 강조되는지 보는 틀입니다. 강한 오행이 반복되는 대운에는 과로와 인간관계 충돌을 조절하고, 부족한 오행이 들어오는 대운에는 새로운 직업·관계·자산 구조를 만드는 기회로 활용하세요.`
      },
      {
        title: "삶의 주요 방향",
        body: `당신에게 중요한 목표는 ${ELEMENT_TEXT[dm].strength}을 개인 능력으로만 끝내지 않고, 다른 사람이 반복해서 이용할 수 있는 시스템과 자산으로 바꾸는 것입니다. 즉흥적인 성과보다 신뢰가 누적되는 구조, 혼자 버티는 방식보다 역할과 기준이 명확한 협업을 선택할수록 운의 장점이 크게 살아납니다.`
      }
    ]
  };
}

function App() {
  const [form, setForm] = useState({
    name: "현우",
    date: "1990-03-05",
    time: "09:30",
    gender: "male",
    calendar: "solar",
    leapMonth: false,
    focus: "연애, 사업, 결혼"
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const analyze = (e) => {
    e.preventDefault();
    setError("");
    try {
      const [year, month, day] = form.date.split("-").map(Number);
      const [hour, minute] = form.time.split(":").map(Number);
      const chart = calculateFourPillars({
        year, month, day, hour, minute,
        isLunar: form.calendar === "lunar",
        isLeapMonth: form.calendar === "lunar" && form.leapMonth,
        gender: form.gender,
        dayBoundary: "midnight"
      });
      setResult({ chart, analysis: buildAnalysis({ chart, form }) });
      setTimeout(() => document.querySelector("#result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      console.error(err);
      setError(err?.message || "입력값을 확인해 주세요.");
    }
  };

  const chartRows = useMemo(() => {
    if (!result) return [];
    return [
      ["시주", result.chart.hour],
      ["일주", result.chart.day],
      ["월주", result.chart.month],
      ["년주", result.chart.year]
    ];
  }, [result]);

  return (
    <main>
      <section className="hero">
        <div className="brand">天命 <span>CHEONMYEONG</span></div>
        <div className="hero-copy">
          <p className="eyebrow">FOUR PILLARS ANALYSIS</p>
          <h1>당신의 시간을<br/><em>사주로 해석하다</em></h1>
          <p className="intro">생년월일시를 입력하면 원국, 오행, 성향, 인간관계, 연애·결혼, 재물·직업, 건강, 대운을 자동 분석합니다.</p>
        </div>

        <form className="input-card" onSubmit={analyze}>
          <div className="field two">
            <label>이름 또는 닉네임
              <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="선택 입력" />
            </label>
            <label>성별
              <select value={form.gender} onChange={e => update("gender", e.target.value)}>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </label>
          </div>

          <div className="field two">
            <label>생년월일
              <input type="date" value={form.date} min="1800-01-01" max="2100-12-31" onChange={e => update("date", e.target.value)} required />
            </label>
            <label>태어난 시간
              <input type="time" value={form.time} onChange={e => update("time", e.target.value)} required />
            </label>
          </div>

          <div className="segmented">
            <button type="button" className={form.calendar === "solar" ? "active" : ""} onClick={() => update("calendar", "solar")}>양력</button>
            <button type="button" className={form.calendar === "lunar" ? "active" : ""} onClick={() => update("calendar", "lunar")}>음력</button>
          </div>

          {form.calendar === "lunar" && (
            <label className="check">
              <input type="checkbox" checked={form.leapMonth} onChange={e => update("leapMonth", e.target.checked)} />
              윤달
            </label>
          )}

          <label>가장 궁금한 분야
            <input value={form.focus} onChange={e => update("focus", e.target.value)} placeholder="예: 연애, 사업, 결혼" />
          </label>

          {error && <div className="error">{error}</div>}
          <button className="primary" type="submit">나의 사주 분석하기 <span>→</span></button>
          <p className="notice">사주는 전통적 해석 도구이며 과학적 진단이나 미래의 확정적 예언이 아닙니다.</p>
        </form>
      </section>

      {result && (
        <section id="result" className="result">
          <div className="result-head">
            <p className="eyebrow">YOUR SAJU REPORT</p>
            <h2>{form.name || "당신"}님의 사주 분석</h2>
            <p>{result.analysis.summary}</p>
          </div>

          <div className="pillars">
            {chartRows.map(([title, p]) => (
              <div className={`pillar e-${elementOfStem(stemOf(p))}`} key={title}>
                <span>{title}</span>
                <strong>{stemOf(p)}</strong>
                <strong>{branchOf(p)}</strong>
                <small>{elementOfStem(stemOf(p))} · {elementOfBranch(branchOf(p))}</small>
              </div>
            ))}
          </div>

          <div className="element-card">
            <div>
              <p className="eyebrow">FIVE ELEMENTS</p>
              <h3>오행 분포</h3>
            </div>
            <div className="bars">
              {Object.entries(result.analysis.counts).map(([element, count]) => (
                <div className="bar-row" key={element}>
                  <span>{element}</span>
                  <div className="track"><i style={{ width: `${result.analysis.percentages[element]}%` }} /></div>
                  <b>{count}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="report-grid">
            {result.analysis.sections.map((section, idx) => (
              <article className="report-card" key={section.title}>
                <span className="number">{String(idx + 1).padStart(2, "0")}</span>
                <h3>{section.title}</h3>
                {section.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </article>
            ))}
          </div>

          <button className="secondary" onClick={() => window.print()}>분석 결과 저장·인쇄</button>
        </section>
      )}

      <footer>© 2026 CHEONMYEONG SAJU LAB</footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

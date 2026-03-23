import { useState, useEffect, useRef } from "react";

/* ================================================================
   SUPABASE CONFIG
   ================================================================ */
const SUPABASE_URL = "https://acmdvqrbdomvjgyxnwgl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbWR2cXJiZG9tdmpneXhud2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjUxNzcsImV4cCI6MjA4OTgwMTE3N30.124Ur7m3X2RCI6Y9qgViLrCMbrw8u1nmnF7M7eWGm00";

async function submitFeatureRequest(data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/feature_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return true;
}


/* ================================================================
   ANALYTICS — GA4 event helper
   Safe to call even before GA loads (queues via dataLayer)
   ================================================================ */
function trackEvent(eventName, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        app: "ai_career_playbook",
        ...params,
      });
    } else {
      // Queue for when GA loads
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, app: "ai_career_playbook", ...params });
    }
  } catch (e) { /* never break the app over analytics */ }
}

/* ================================================================
   STATIC DATA & CAREER DATABASE
   ================================================================ */
const GRADES = [
  { id: "8th", label: "8th Grade or Below", years: 5 },
  { id: "9th", label: "9th Grade (Freshman)", years: 4 },
  { id: "10th", label: "10th Grade (Sophomore)", years: 3 },
  { id: "11th", label: "11th Grade (Junior)", years: 2 },
  { id: "12th", label: "12th Grade (Senior)", years: 1 },
  { id: "college", label: "Already in College", years: 0 },
  { id: "adult", label: "Adult exploring for myself", years: 0 },
];

const INTERESTS = [
  { id: "healthcare", label: "Healthcare & Medicine", ico: "🏥", ex: "Nursing, psychiatry, surgery, therapy" },
  { id: "tech", label: "Technology & Engineering", ico: "💻", ex: "Software, cybersecurity, AI, robotics" },
  { id: "trades", label: "Skilled Trades", ico: "🔧", ex: "Electrical, plumbing, HVAC, solar" },
  { id: "creative", label: "Creative Arts & Design", ico: "🎨", ex: "Film, music, graphic design, UX" },
  { id: "business", label: "Business & Finance", ico: "📈", ex: "Management, consulting, investing" },
  { id: "law", label: "Law & Policy", ico: "⚖️", ex: "Trial law, governance, compliance" },
  { id: "science", label: "Science & Environment", ico: "🔬", ex: "Biology, climate science, research" },
  { id: "education", label: "Education", ico: "📚", ex: "Teaching, counseling, special ed" },
  { id: "public", label: "Public Service & Emergency", ico: "🚒", ex: "Fire, EMT, social work, military" },
  { id: "diplomacy", label: "Diplomacy & International", ico: "🌍", ex: "Foreign service, NGO, AI governance" },
];

const PRIORITIES = [
  { id: "security", label: "Job Security", desc: "Stable demand that won't disappear" },
  { id: "salary", label: "High Earning Potential", desc: "Strong income trajectory over 20 years" },
  { id: "purpose", label: "Purpose & Impact", desc: "Work that matters to the world" },
  { id: "flexibility", label: "Flexibility & Balance", desc: "Location and schedule freedom" },
];

const TECHC = [
  { id: "loves", label: "Loves Technology", desc: "Codes for fun, always on the latest tools" },
  { id: "comfortable", label: "Comfortable", desc: "Uses tech well but it is not a passion" },
  { id: "neutral", label: "Neutral", desc: "Can use it but prefers other activities" },
  { id: "handson", label: "Prefers Hands-On", desc: "Would rather build, create, or be outdoors" },
];

const CONCERNS = [
  { id: "entry_level", label: "Entry-level jobs are disappearing before my kid graduates" },
  { id: "ai_replace", label: "AI will make their chosen field obsolete" },
  { id: "no_direction", label: "My child has no idea what they want to do" },
  { id: "debt_roi", label: "College debt won't pay off in this economy" },
  { id: "too_late", label: "We are already behind and don't know where to start" },
];

const SUBJECTS = [
  { id: "math", label: "Math" }, { id: "english", label: "English / Writing" },
  { id: "sciences", label: "Sciences" }, { id: "history", label: "History / Social Studies" },
  { id: "languages", label: "Foreign Language" }, { id: "cs", label: "Computer Science" },
  { id: "arts", label: "Arts / Music" }, { id: "sports", label: "Sports / Physical Ed" },
];

// Keyword map: subject id → words that signal it
const SUBJECT_KEYWORDS = {
  math: ["math","algebra","calculus","geometry","statistics","stats","trigonometry","trig","numbers","equations","precalc","quantitative"],
  english: ["english","writing","essay","literature","lit","reading","poetry","grammar","language arts","journalism","creative writing","stories","books","novel","composition"],
  sciences: ["science","biology","bio","chemistry","chem","physics","anatomy","ecology","earth science","environmental","lab","research","scientific","medicine","health","nursing"],
  history: ["history","social studies","economics","econ","government","politics","political","civics","geography","world history","us history","psychology","psych","sociology","anthropology","culture"],
  languages: ["spanish","french","german","chinese","mandarin","japanese","latin","arabic","korean","italian","foreign language","language","linguistic"],
  cs: ["computer","coding","programming","code","software","technology","tech","ai","machine learning","robotics","engineering","web","app","python","javascript","java","stem","data"],
  arts: ["art","music","drawing","painting","theater","drama","film","photography","design","dance","visual","creative","sculpt","choir","band","orchestra","perform","studio"],
  sports: ["sports","fitness","physical","gym","athletic","exercise","health","nutrition","coaching","pe","football","basketball","soccer","swimming","track","running","baseball"],
};

function parseSubjectsFromText(text) {
  const lower = text.toLowerCase();
  const matched = [];
  for (const [id, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) matched.push(id);
  }
  return matched.length > 0 ? matched : ["english"]; // fallback so prompt always has something
}

function isGibberish(text) {
  const t = text.trim();
  if (t.length < 10) return "Please share a bit more — describe at least one subject or area of interest.";
  const nonAlpha = (t.match(/[^a-zA-Z\s.,!?'\-]/g) || []).length;
  if (nonAlpha / t.length > 0.3) return "That doesn't look like a real answer. Describe subjects or interests in plain English.";
  const words = t.split(/\s+/).filter(w => w.length >= 3);
  if (words.length < 2) return "Please use a few words to describe what subjects or topics interest you most.";
  const realWords = words.filter(w => /^[a-zA-Z]{3,}/.test(w));
  if (realWords.length < 2) return "That looks like random characters. Please describe subjects or topics in plain English.";
  return null;
}

// Full career database embedded in client (not sent to Claude)
const CAREER_DB = {
  "Mental Health Counselor": { score: 98, growth: "22%", salary: "$48,520", sector: "Healthcare", superpower: "Emotional Intelligence" },
  "Firefighter / EMT": { score: 97, growth: "4%", salary: "$50,700", sector: "Public Service", superpower: "Physical Dexterity" },
  "Physician / Surgeon": { score: 96, growth: "3%", salary: "$229,300+", sector: "Healthcare", superpower: "Ethical Judgment" },
  "School Counselor": { score: 96, growth: "11%", salary: "$60,140", sector: "Education", superpower: "Emotional Intelligence" },
  "Diplomat / FSO": { score: 95, growth: "Stable", salary: "$75-180K", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Special Education Teacher": { score: 95, growth: "4%", salary: "$62,950", sector: "Education", superpower: "Emotional Intelligence" },
  "Nurse Practitioner": { score: 94, growth: "45.7%", salary: "$120,680", sector: "Healthcare", superpower: "Emotional Intelligence" },
  "Electrician": { score: 94, growth: "11%", salary: "$60,240+", sector: "Trades", superpower: "Physical Dexterity" },
  "Plumber / HVAC Tech": { score: 94, growth: "12-16%", salary: "$59,880", sector: "Trades", superpower: "Physical Dexterity" },
  "Social Worker": { score: 93, growth: "7%", salary: "$55,350", sector: "Public Service", superpower: "Emotional Intelligence" },
  "Renewable Energy Tech": { score: 92, growth: "22-44%", salary: "$56,900+", sector: "Trades", superpower: "Physical Dexterity" },
  "AI Governance Diplomat": { score: 92, growth: "New field", salary: "$90-160K", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Performing Artist": { score: 91, growth: "6%", salary: "$40-80K", sector: "Creative", superpower: "Creative Vision" },
  "CEO / Executive": { score: 90, growth: "3%", salary: "$189,520+", sector: "Business", superpower: "Ethical Judgment" },
  "K-12 Teacher": { score: 89, growth: "4%", salary: "$61,690", sector: "Education", superpower: "Emotional Intelligence" },
  "Cybersecurity Professional": { score: 88, growth: "32%", salary: "$112,000", sector: "Technology", superpower: "Ethical Judgment" },
  "Military / Defense": { score: 88, growth: "Stable", salary: "$45-120K", sector: "Public Service", superpower: "Physical Dexterity" },
  "Construction Manager": { score: 87, growth: "8%", salary: "$101,480", sector: "Trades", superpower: "Physical Dexterity" },
  "Environmental Scientist": { score: 86, growth: "6%", salary: "$76,530", sector: "Science", superpower: "Creative Vision" },
  "Creative Director": { score: 85, growth: "6%", salary: "$100,000+", sector: "Creative", superpower: "Creative Vision" },
  "Robotics Engineer": { score: 85, growth: "15%", salary: "$100,000+", sector: "Technology", superpower: "Creative Vision" },
  "Biomedical Engineer": { score: 83, growth: "5%", salary: "$99,550", sector: "Science", superpower: "Creative Vision" },
  "Trial Lawyer": { score: 82, growth: "8%", salary: "$135,740", sector: "Law", superpower: "Ethical Judgment" },
  "Research Scientist": { score: 80, growth: "8%", salary: "$83,000+", sector: "Science", superpower: "Creative Vision" },
  "AI/ML Engineer": { score: 78, growth: "36%", salary: "$130,000+", sector: "Technology", superpower: "Creative Vision" },
  "UX/UI Designer": { score: 78, growth: "16%", salary: "$83,000+", sector: "Creative", superpower: "Creative Vision" },
  "Financial Advisor": { score: 76, growth: "13%", salary: "$95,390", sector: "Business", superpower: "Emotional Intelligence" },
  "Content Creator": { score: 65, growth: "Shifting", salary: "$48-80K", sector: "Creative", superpower: "Creative Vision" },
  "Software Developer": { score: 62, growth: "Variable", salary: "$127,260", sector: "Technology", superpower: "Creative Vision" },
  "Accountant / Auditor": { score: 45, growth: "Declining", salary: "$78,000", sector: "Business", superpower: "Ethical Judgment" },
  "Paralegal": { score: 35, growth: "Declining", salary: "$59,200", sector: "Law", superpower: "Ethical Judgment" },
};

const SECTOR_MAP = {
  healthcare: "Healthcare", tech: "Technology", trades: "Trades", creative: "Creative",
  business: "Business", law: "Law", science: "Science", education: "Education",
  public: "Public Service", diplomacy: "Diplomacy",
};

const TOTAL_STEPS = 9;

/* ================================================================
   COMPACT JSON PROMPT (70% cheaper than prose prompt)
   ================================================================ */
function buildPrompt(a) {
  const concernLabel = CONCERNS.find(c => c.id === a.concern)?.label || a.concern;
  const subjectLabels = a.subjectText || a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
  const interestLabels = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");

  return `Return ONLY valid JSON. No markdown. No backticks. Start with { end with }. All strings under 80 chars. No special characters in values.

Student: ${a.grade} grade, interests: ${interestLabels}, priority: ${a.priority}, subjects: ${subjectLabels}, activities: ${a.activities || "none"}, accomplishments: ${a.accomplishments || "none"}${a.specificCareer ? ", considering: " + a.specificCareer : ""}

Careers DB: Counselor 98%, Firefighter 97%, Physician 96%, Diplomat 95%, NP 94%, Electrician 94%, Social Worker 93%, Renewable Tech 92%, Cybersecurity 88%, Creative Dir 85%, Robotics 85%, Trial Lawyer 82%, AI Engineer 78%, UX 78%, Fin Advisor 76%, Software Dev 62%, Accountant 45%

{"careers":[{"n":"career name","s":88,"f":"why fits this student"}],"buildOn":[{"a":"their activity","c":"career connection","d":"deepen or add"}],"qs":["counselor question"],"concern":"response to: ${concernLabel}","aiTip":"how to combine their interests with AI skills"}

5 careers, 3 buildOn, 5 qs. Be specific to this student.`;
}

// ---- Client-side template generators (no API cost) ----
const YEAR_TEMPLATES = {
  "8th": [
    { year: "8th Grade", courses: "Honors Math and English, Intro to Computer Science if available", activities: "Join 2 clubs aligned with interests, start volunteering", summer: "Summer camp or program in area of interest", portfolio: "Start a journal of career interests and activities", aiMilestone: "Explore ChatGPT and AI tools for homework help" },
    { year: "9th Grade", courses: "Honors/AP track in strong subjects, foreign language", activities: "Deepen club involvement, seek leadership roles", summer: "Job shadow or informational interviews in fields of interest", portfolio: "Create a digital portfolio of projects and activities", aiMilestone: "Use AI tools for research projects, learn what AI can and cannot do" },
    { year: "10th Grade", courses: "AP classes in strongest subjects, consider dual enrollment", activities: "Take leadership position in primary activity, add community service", summer: "Internship, research program, or intensive summer program", portfolio: "Build 1-2 projects demonstrating skills in interest area", aiMilestone: "Learn basic data analysis or use AI in a subject-specific project" },
    { year: "11th Grade", courses: "Most rigorous schedule in strong subjects, SAT/ACT prep", activities: "Lead primary organization, mentor younger students", summer: "Competitive internship or research with a mentor", portfolio: "Complete a significant project showcasing expertise", aiMilestone: "Use AI tools professionally in internship or research" },
    { year: "12th Grade", courses: "Continue rigor, explore college-level courses", activities: "Senior leadership, capstone project", summer: "Pre-college program or continued professional experience", portfolio: "Polish portfolio for college applications", aiMilestone: "Write about AI and your field in college essays" },
    { year: "College Year 1", courses: "Declare or explore major, take intro AI/data course", activities: "Join professional clubs, seek research opportunities", summer: "Industry internship in target career field", portfolio: "Professional resume with AI skills highlighted", aiMilestone: "Complete an online AI certification relevant to your major" },
  ],
  "9th": null, "10th": null, "11th": null, "12th": null, "college": null, "adult": null,
};
// Generate year plan from templates starting at the right grade
function getYearPlan(gradeId) {
  const allYears = YEAR_TEMPLATES["8th"]; // base template
  const gradeOrder = ["8th", "9th", "10th", "11th", "12th", "college"];
  const startIdx = gradeOrder.indexOf(gradeId);
  if (startIdx === -1) return allYears.slice(-2); // adult: just college years
  return allYears.slice(startIdx);
}

const DEMO_INTEREST_TEMPLATES = {
  healthcare: [
    { action: "Volunteer at a local hospital or clinic this semester", why: "Direct healthcare exposure shows genuine commitment to admissions" },
    { action: "Start a health awareness campaign at your school", why: "Leadership in health-related initiatives demonstrates initiative" },
    { action: "Shadow a healthcare professional for a day", why: "Shows proactive career exploration beyond classroom" },
    { action: "Take a Red Cross first aid or CPR certification course", why: "Tangible credential that connects to healthcare career path" },
  ],
  tech: [
    { action: "Build a personal project and publish it on GitHub", why: "Tangible evidence of technical skills beyond coursework" },
    { action: "Enter a hackathon or coding competition this semester", why: "Competitive tech events stand out on applications" },
    { action: "Start a tech blog or YouTube channel explaining concepts", why: "Shows communication skills alongside technical knowledge" },
    { action: "Contribute to an open source project", why: "Real-world collaboration experience that colleges value" },
  ],
  trades: [
    { action: "Enroll in a vocational class or apprenticeship program", why: "Direct skill-building shows commitment to the path" },
    { action: "Volunteer for Habitat for Humanity or similar building projects", why: "Hands-on community service combining skills and service" },
    { action: "Get a part-time job in a related trade", why: "Paid experience demonstrates real-world commitment" },
    { action: "Research and visit a local trade school or union apprenticeship", why: "Shows you are serious and informed about the pathway" },
  ],
  creative: [
    { action: "Build an online portfolio showcasing your best work", why: "Creative portfolios are more powerful than transcripts for creative fields" },
    { action: "Enter a regional or national arts competition", why: "Awards and recognition validate creative talent to admissions" },
    { action: "Collaborate on a creative project with peers and document it", why: "Collaboration and documentation show professional mindset" },
    { action: "Attend a workshop or masterclass in your creative discipline", why: "Continued learning shows dedication beyond school requirements" },
  ],
  business: [
    { action: "Start a small business or side project this semester", why: "Entrepreneurial initiative is the strongest signal for business programs" },
    { action: "Join DECA, FBLA, or similar business competition club", why: "Competitive business clubs are recognized nationally by admissions" },
    { action: "Shadow a professional in your target business field", why: "Shows you understand the reality of the career, not just the theory" },
    { action: "Take an online course in financial literacy or entrepreneurship", why: "Self-directed learning demonstrates genuine intellectual curiosity" },
  ],
  law: [
    { action: "Join or start a debate team or Model UN chapter", why: "Argumentation and public speaking are core legal skills" },
    { action: "Volunteer with a legal aid organization", why: "Exposure to real legal work shows serious career interest" },
    { action: "Write an op-ed for your school paper on a policy issue", why: "Published writing on policy demonstrates analytical thinking" },
    { action: "Attend a local court session to observe proceedings", why: "Shows proactive exploration of the legal profession" },
  ],
  science: [
    { action: "Design and conduct an independent research project", why: "Original research is the gold standard for science programs" },
    { action: "Enter a science fair or research competition", why: "Competitive science achievements stand out in applications" },
    { action: "Reach out to a local university professor for mentorship", why: "University connections show initiative and research readiness" },
    { action: "Join a citizen science project in your area of interest", why: "Real-world data collection shows applied scientific thinking" },
  ],
  education: [
    { action: "Tutor younger students in your strong subjects", why: "Direct teaching experience is the strongest signal for education programs" },
    { action: "Volunteer at an after-school program or summer camp", why: "Working with youth in structured settings shows commitment" },
    { action: "Create educational content for a topic you love", why: "Content creation shows you can explain complex ideas clearly" },
    { action: "Shadow a teacher and observe different teaching styles", why: "Reflective observation shows mature interest in pedagogy" },
  ],
  public: [
    { action: "Volunteer with your local fire department or EMT squad", why: "Direct service experience is essential for public safety careers" },
    { action: "Get CPR and first aid certified", why: "Tangible credentials that demonstrate readiness and commitment" },
    { action: "Organize a community service project at your school", why: "Leadership in service shows the public service mindset" },
    { action: "Interview a first responder and write about their career", why: "Shows reflective understanding of the profession" },
  ],
  diplomacy: [
    { action: "Join Model UN or start a chapter at your school", why: "Model UN is the most recognized activity for international relations programs" },
    { action: "Study a second language and seek conversation practice", why: "Language skills are essential for diplomacy and global careers" },
    { action: "Write about a current international issue for your school paper", why: "Published analysis shows intellectual engagement with global affairs" },
    { action: "Attend a public lecture or webinar on international affairs", why: "Shows self-directed learning about global issues" },
  ],
};

function getDemoInterest(interests) {
  const primary = interests[0] || "tech";
  return DEMO_INTEREST_TEMPLATES[primary] || DEMO_INTEREST_TEMPLATES.tech;
}

const TALKING_POINTS = [
  "PwC research shows workers with AI skills earn 56% more than peers in the same role, across every industry. We want to make sure our child builds AI fluency alongside their primary interests.",
  "Entry-level jobs are being disrupted fastest. Goldman Sachs data shows tech grad roles fell 46% in the UK in one year. We want to ensure our child has demonstrable skills before graduating.",
  "The World Economic Forum projects 170 million new jobs created but 92 million displaced by 2030. We want to focus on careers that require human skills AI cannot replicate.",
];

/* ================================================================
   VISUAL COMPONENTS
   ================================================================ */

// Arc gauge for AI resistance score
function ScoreGauge({ score, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
      <path d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" fill="#fafafa"
        style={{ fontSize: size * 0.28, fontFamily: "'Tabular Nums', 'DM Mono', monospace", fontWeight: 700 }}>{score}%</text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)"
        style={{ fontSize: 9, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px" }}>AI RESISTANT</text>
    </svg>
  );
}

// Horizontal bar
function GrowthBar({ value, label }) {
  const numVal = parseFloat(value) || 0;
  const width = Math.min(Math.max(numVal * 2, 10), 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <span style={{ color: "#94a3b8", minWidth: 50 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${width}%`, background: "linear-gradient(90deg, #6366f1, #10b981)", borderRadius: 3, transition: "width 1s ease" }} />
      </div>
      <span style={{ color: "#e2e8f0", fontWeight: 600, minWidth: 45, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// Timeline node
function TimelineNode({ year, data, idx, total }) {
  const isLast = idx === total - 1;
  return (
    <div style={{ display: "flex", gap: 16, position: "relative", paddingBottom: isLast ? 0 : 24 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{idx + 1}</div>
        {!isLast && <div style={{ width: 2, flex: 1, background: "rgba(99,102,241,0.2)", marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fafafa", marginBottom: 8, fontFamily: "'Instrument Serif', serif" }}>{year}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {data.courses && <MiniCard icon="📖" title="Courses" text={data.courses} />}
          {data.activities && <MiniCard icon="🎯" title="Activities" text={data.activities} />}
          {data.summer && <MiniCard icon="☀️" title="Summer" text={data.summer} />}
          {data.portfolio && <MiniCard icon="📁" title="Build" text={data.portfolio} />}
          {data.aiMilestone && <MiniCard icon="🤖" title="AI Skill" text={data.aiMilestone} />}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon, title, text }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{icon} {title}</div>
      <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

// Brag sheet row
function BragRow({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{label}</div>
      {typeof items === "string" ? (
        <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>{items}</div>
      ) : (
        items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 14, color: "#e2e8f0" }}>
            <span style={{ color: "#6366f1", flexShrink: 0 }}>-</span>
            <span style={{ lineHeight: 1.5 }}>{item}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ================================================================
   FEATURE REQUEST FORM COMPONENT
   ================================================================ */
function FeatureRequestForm({ studentGrade }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", feature_title: "", feature_description: "",
    use_case: "", priority: "", child_grade: studentGrade || "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errMsg, setErrMsg] = useState("");

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canSubmit = form.feature_title.trim() && form.feature_description.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      await submitFeatureRequest({
        name: form.name || null,
        email: form.email || null,
        feature_title: form.feature_title.trim(),
        feature_description: form.feature_description.trim(),
        use_case: form.use_case || null,
        priority: form.priority || null,
        child_grade: form.child_grade || null,
        source: "ai-career-playbook",
      });
      setStatus("success");
      trackEvent("feature_suggestion_submitted", {
        priority: form.priority || "not_set",
        has_email: form.email.length > 0,
        grade: form.child_grade || "not_set",
      });
    } catch (e) {
      setErrMsg(e.message);
      setStatus("error");
    }
  };

  const reset = () => {
    setOpen(false);
    setStatus("idle");
    setForm({ name: "", email: "", feature_title: "", feature_description: "", use_case: "", priority: "", child_grade: studentGrade || "" });
    setErrMsg("");
  };

  return (
    <div className="frWrap no-print">
      {!open ? (
        <div className="frTeaser">
          <div className="frTeaserText">
            <div className="frTeaserTitle">Have an idea for this playbook?</div>
            <div className="frTeaserSub">We build this for parents, with parents. Tell us what would make it more useful for your family.</div>
          </div>
          <button className="frOpenBtn" onClick={() => setOpen(true)}>Suggest a Feature →</button>
        </div>
      ) : (
        <div className="frPanel">
          <div className="frPanelHead">
            <div>
              <div className="frPanelTitle">Suggest a Feature</div>
              <div className="frPanelSub">Every submission is read by Babith personally. Your idea may ship in the next update.</div>
            </div>
            <button className="frClose" onClick={reset}>✕</button>
          </div>

          {status === "success" ? (
            <div className="frSuccess">
              <div className="frSuccessIcon">✓</div>
              <div className="frSuccessTitle">Got it. Thank you.</div>
              <div className="frSuccessMsg">Your suggestion has been saved. We review every submission and prioritize based on how many parents ask for the same thing. If you left an email, we'll let you know when it ships.</div>
              <button className="frSuccessBtn" onClick={reset}>Close</button>
            </div>
          ) : (
            <div className="frForm">
              <div className="frRow">
                <div className="frField">
                  <label className="frLabel">Your name <span className="frOpt">(optional)</span></label>
                  <input className="frInput" type="text" placeholder="e.g. Sarah M." value={form.name} onChange={e => setF("name", e.target.value)} />
                </div>
                <div className="frField">
                  <label className="frLabel">Email <span className="frOpt">(optional — only if you want us to follow up)</span></label>
                  <input className="frInput" type="email" placeholder="you@email.com" value={form.email} onChange={e => setF("email", e.target.value)} />
                </div>
              </div>

              <div className="frField">
                <label className="frLabel">Feature idea <span className="frReq">*</span></label>
                <input className="frInput" type="text" placeholder="e.g. Show which colleges have strong programs for AI-resistant careers" value={form.feature_title} onChange={e => setF("feature_title", e.target.value)} maxLength={120} />
              </div>

              <div className="frField">
                <label className="frLabel">Tell us more <span className="frReq">*</span></label>
                <textarea className="frTextarea" placeholder="What problem does this solve for you? What would you do with this feature?" value={form.feature_description} onChange={e => setF("feature_description", e.target.value)} rows={4} />
              </div>

              <div className="frRow">
                <div className="frField">
                  <label className="frLabel">How important is this to you?</label>
                  <div className="frPills">
                    {[
                      { id: "nice_to_have", label: "Nice to have" },
                      { id: "would_use_often", label: "Would use often" },
                      { id: "need_this_now", label: "Need this now" },
                    ].map(p => (
                      <button key={p.id} className={`frPill ${form.priority === p.id ? "sel" : ""}`} onClick={() => setF("priority", p.id)}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div className="frField">
                  <label className="frLabel">Child's grade <span className="frOpt">(optional)</span></label>
                  <select className="frSelect" value={form.child_grade} onChange={e => setF("child_grade", e.target.value)}>
                    <option value="">Select grade</option>
                    {GRADES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
              </div>

              {status === "error" && <div className="frError">Something went wrong — {errMsg}. Please try again.</div>}

              <div className="frActions">
                <button className="frCancel" onClick={reset}>Cancel</button>
                <button
                  className={`frSubmit ${canSubmit && status !== "submitting" ? "active" : "disabled"}`}
                  onClick={handleSubmit}
                  disabled={!canSubmit || status === "submitting"}
                >
                  {status === "submitting" ? "Submitting…" : "Submit Suggestion"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ================================================================
   VOICE COMPONENTS — Web Speech API (free, no key, works in Chrome/Edge/Safari)
   VoiceCapture: free-text steps — streams transcript live into textarea
   VoiceSelect:  choice steps — listens, matches spoken answer to an option
   ================================================================ */

function useSpeechRecognition() {
  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const create = () => {
    if (!supported) return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    return r;
  };
  return { supported, create };
}

function MicIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

// Free-text steps: streams live transcript into the field as the family talks
function VoiceCapture({ onTranscript }) {
  const [state, setState] = useState("idle"); // idle | listening | done | unsupported
  const [interim, setInterim] = useState("");
  const recogRef = useRef(null);
  const finalRef = useRef("");
  const { supported, create } = useSpeechRecognition();

  const start = () => {
    if (!supported) { setState("unsupported"); return; }
    const recog = create();
    finalRef.current = "";
    recog.onstart = () => {
      setState("listening");
      trackEvent("voice_recording_started", { context: "free_text" });
    };
    recog.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current += (finalRef.current ? " " : "") + t.trim();
          onTranscript(finalRef.current);
        } else {
          interimText += t;
        }
      }
      setInterim(interimText);
    };
    recog.onerror = (e) => { if (e.error !== "no-speech") setState("idle"); };
    recog.onend = () => {
      setInterim("");
      const captured = finalRef.current.length > 0;
      setState(captured ? "done" : "idle");
      if (captured) trackEvent("voice_capture_completed", { context: "free_text", char_count: finalRef.current.length });
    };
    recogRef.current = recog;
    recog.start();
  };

  const stop = () => recogRef.current?.stop();

  const reset = () => {
    recogRef.current?.stop();
    finalRef.current = "";
    setState("idle");
    setInterim("");
    onTranscript("");
  };

  if (!supported) return null;

  return (
    <div className="vcWrap">
      {state === "idle" && (
        <button className="vcBtn idle" onClick={start}>
          <MicIcon /> <span>Tap to speak — have a family conversation</span>
        </button>
      )}
      {state === "listening" && (
        <div className="vcListening">
          <button className="vcBtn active" onClick={stop}>
            <span className="vcPulse"/><MicIcon /><span>Listening… tap to stop</span>
          </button>
          {interim && <div className="vcInterim">"{interim}"</div>}
        </div>
      )}
      {state === "done" && (
        <div className="vcDone">
          <span className="vcDoneIcon">✓</span>
          <span className="vcDoneText">Captured — edit above if needed</span>
          <button className="vcRedo" onClick={reset}>Re-record</button>
        </div>
      )}
      {state === "unsupported" && (
        <div className="vcUnsupported">Voice input requires Chrome or Edge.</div>
      )}
    </div>
  );
}

// Choice steps: listens until stopped, then matches spoken words to the closest option
function VoiceSelect({ options, onSelect, matchKey = "label" }) {
  const [state, setState] = useState("idle"); // idle | listening | matched | nomatch | unsupported
  const [interim, setInterim] = useState("");
  const [matched, setMatched] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const recogRef = useRef(null);
  const finalRef = useRef("");
  const { supported, create } = useSpeechRecognition();

  const findBestMatch = (text) => {
    const lower = text.toLowerCase();
    let found = options.find(o => lower.includes(o[matchKey].toLowerCase()));
    if (!found) {
      found = options.find(o => {
        const words = o[matchKey].toLowerCase().split(/\s+/);
        return words.some(w => w.length > 3 && lower.includes(w));
      });
    }
    return found || null;
  };

  const start = () => {
    if (!supported) { setState("unsupported"); return; }
    const recog = create();
    finalRef.current = "";
    setInterim(""); setMatched(null); setErrMsg("");
    recog.onstart = () => {
      setState("listening");
      trackEvent("voice_recording_started", { context: "choice_select" });
    };
    recog.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current += (finalRef.current ? " " : "") + t.trim();
          // Try to match as words come in
          const match = findBestMatch(finalRef.current);
          if (match) {
            recog.stop();
            setMatched(match);
            onSelect(match.id);
            setState("matched");
            trackEvent("voice_select_matched", { matched_option: match.id });
            return;
          }
        } else {
          interimText += t;
        }
      }
      setInterim(interimText);
    };
    recog.onerror = (e) => { if (e.error !== "no-speech") setState("idle"); };
    recog.onend = () => {
      setInterim("");
      if (state === "matched") return;
      if (finalRef.current) {
        const match = findBestMatch(finalRef.current);
        if (match) { setMatched(match); onSelect(match.id); setState("matched"); }
        else { setErrMsg(`Heard "${finalRef.current}" — no match. Tap an option above.`); setState("nomatch"); }
      } else {
        setState("idle");
      }
    };
    recogRef.current = recog;
    recog.start();
  };

  const stop = () => recogRef.current?.stop();
  const reset = () => { recogRef.current?.stop(); finalRef.current = ""; setState("idle"); setMatched(null); setErrMsg(""); setInterim(""); };

  if (!supported) return null;

  return (
    <div className="vcWrap">
      {state === "idle" && (
        <button className="vcBtn idle" onClick={start}>
          <MicIcon /> <span>Or speak your answer</span>
        </button>
      )}
      {state === "listening" && (
        <div className="vcListening">
          <button className="vcBtn active" onClick={stop}>
            <span className="vcPulse"/><MicIcon /><span>Listening… tap to stop</span>
          </button>
          {interim && <div className="vcInterim">"{interim}"</div>}
        </div>
      )}
      {state === "matched" && matched && (
        <div className="vcDone">
          <span className="vcDoneIcon">✓</span>
          <span className="vcDoneText">Selected: <strong>{matched[matchKey]}</strong></span>
          <button className="vcRedo" onClick={reset}>Re-record</button>
        </div>
      )}
      {state === "nomatch" && (
        <div className="vcError"><span>⚠ {errMsg}</span><button className="vcRedo" onClick={reset}>Try again</button></div>
      )}
    </div>
  );
}


/* ================================================================
   AI TOOLKIT — per-step tool recommendations
   ================================================================ */
const AI_TOOLKIT = {
  1: { // Grade
    title: "Start here: AI tools for career exploration",
    intro: "Great time to introduce your child to AI tools built for their age. These are the best places to begin.",
    tools: [
      { name: "Coach by CareerVillage", what: "Free AI career coach built for high schoolers — explores options, builds resumes, preps for interviews", tag: "Free", url: "https://www.aicareercoach.org/high-school-students" },
      { name: "O*NET Interest Profiler", what: "US Dept of Labor tool — maps interests to real career paths using the same model colleges and counselors use", tag: "Free", url: "https://www.mynextmove.org/explore/ip" },
      { name: "ChatGPT", what: "Ask it anything about a career — a typical day, what school subjects matter most, what skills employers look for", tag: "Free", url: "https://chatgpt.com" },
      { name: "Claude", what: "Great for nuanced career research — ask it to compare two careers, explain salary trajectories, or decode job postings", tag: "Free", url: "https://claude.ai" },
    ]
  },
  2: { // Interests
    title: "Explore your child's interests with AI",
    intro: "These tools go deeper on interest-to-career mapping — beyond simple quizzes.",
    tools: [
      { name: "Career Explorer (Sokanu)", what: "Takes a 15-min interest quiz and surfaces careers ranked by match — includes day-in-the-life breakdowns", tag: "Free", url: "https://www.careerexplorer.com" },
      { name: "Google Career Dreamer", what: "Google's free tool for connecting life experiences and interests to career paths — well-designed for students", tag: "Free", url: "https://grow.google/students" },
      { name: "Perplexity AI", what: "Ask 'what careers combine [interest 1] and [interest 2]?' — gives sourced, current answers unlike a basic Google search", tag: "Free", url: "https://www.perplexity.ai" },
      { name: "YouScience", what: "Aptitude-based assessment using neuroscience — uncovers natural talents beyond self-reported interests. Used by schools.", tag: "Paid (often school-provided)", url: "https://www.youscience.com" },
    ]
  },
  3: { // Priority
    title: "AI tools to research career priorities",
    intro: "Help your child ground their priorities in real data — not assumptions.",
    tools: [
      { name: "CareerOneStop (BLS)", what: "Dept of Labor tool with real salary, growth, and job outlook data for every career — searchable by priority", tag: "Free", url: "https://www.careeronestop.org" },
      { name: "LinkedIn (free tier)", what: "Search any job title — see how many postings exist, what skills are required, and what companies are hiring", tag: "Free", url: "https://www.linkedin.com/jobs" },
      { name: "Glassdoor", what: "Real salary data from real workers — helps ground salary expectations before setting priorities", tag: "Free", url: "https://www.glassdoor.com" },
      { name: "Claude or ChatGPT", what: "Ask: 'What careers have the highest job security AND salary for someone interested in [X]?' — great for priority tradeoffs", tag: "Free", url: "https://claude.ai" },
    ]
  },
  4: { // Tech comfort
    title: "Build AI fluency — free resources by level",
    intro: "AI fluency is the #1 skill premium right now (PwC: +56% wages). Here's how to build it at every comfort level.",
    tools: [
      { name: "Google's AI Essentials", what: "Free beginner course — learn how to use AI tools practically in everyday work and school tasks (no coding required)", tag: "Free", url: "https://grow.google/products/ai-essentials/" },
      { name: "Khan Academy + Khanmigo", what: "Free AI tutor for every subject — great for students who want to use AI to strengthen their weakest academic areas", tag: "Free", url: "https://www.khanacademy.org" },
      { name: "MIT OpenCourseWare (AI intro)", what: "Free MIT course materials — for students ready to go deeper into how AI actually works", tag: "Free", url: "https://ocw.mit.edu/search/?q=artificial+intelligence" },
      { name: "GitHub Copilot (student)", what: "Free for verified students — AI coding assistant that teaches while you build. Best intro for hands-on learners.", tag: "Free (students)", url: "https://github.com/features/copilot/plans" },
    ]
  },
  5: { // Concern
    title: "AI tools to address your specific career concerns",
    intro: "These tools provide data-backed answers to the questions parents and students worry about most.",
    tools: [
      { name: "World Economic Forum Future of Jobs", what: "The actual research behind AI's job impact — searchable by industry. Counters fear with data.", tag: "Free", url: "https://www.weforum.org/reports/the-future-of-jobs-report-2025/" },
      { name: "Perplexity AI", what: "Ask it your exact concern — 'Will AI replace nurses?' or 'What happens to software jobs by 2030?' — sourced answers", tag: "Free", url: "https://www.perplexity.ai" },
      { name: "ONET Online", what: "For any job: see exactly which tasks are at risk vs. which require human judgment. Data-backed, not opinion.", tag: "Free", url: "https://www.onetonline.org" },
      { name: "Burning Glass / EMSI Lightcast", what: "Real-time labor market data used by universities and employers — shows actual hiring trends by career", tag: "Free (limited)", url: "https://lightcast.io/open-skills" },
    ]
  },
  6: { // Subjects
    title: "Turn academic strengths into career signals",
    intro: "AI tools that connect what your child is good at now to where that leads professionally.",
    tools: [
      { name: "Naviance", what: "School-based platform that maps academic strengths to college programs and career paths — ask your counselor if your school uses it", tag: "Free (school-provided)", url: "https://www.naviance.com" },
      { name: "NotebookLM (Google)", what: "Upload class notes and ask 'what careers use skills from this subject?' — genuinely useful for subject-to-career bridging", tag: "Free", url: "https://notebooklm.google.com" },
      { name: "Claude", what: "Ask: 'My child excels at [subjects]. What careers use all three of these strengths?' — gets specific, ranked answers", tag: "Free", url: "https://claude.ai" },
      { name: "Wolfram Alpha", what: "For math and science students — shows how mathematical concepts directly connect to engineering, physics, and research careers", tag: "Free (basic)", url: "https://www.wolframalpha.com" },
    ]
  },
  7: { // Activities
    title: "AI tools to amplify extracurriculars",
    intro: "Help your child see the career value in what they're already doing — and find ways to deepen it.",
    tools: [
      { name: "LinkedIn (student profile)", what: "Create a student profile now — list activities, get a professional digital presence before college applications", tag: "Free", url: "https://www.linkedin.com" },
      { name: "ChatGPT", what: "Paste your activity list and ask: 'Which of these activities are most relevant to [career]? What should I add?' — instant coaching", tag: "Free", url: "https://chatgpt.com" },
      { name: "Handshake", what: "College-focused job and internship platform — students can browse to see what activities lead to which opportunities", tag: "Free", url: "https://joinhandshake.com" },
      { name: "Common App Activities Section Guide", what: "AI-assisted tool for framing activities for college apps — transforms a list into a compelling narrative", tag: "Free", url: "https://www.commonapp.org/apply/essay-prompts" },
    ]
  },
  8: { // Accomplishments
    title: "AI tools to document and showcase accomplishments",
    intro: "The brag sheet is just the start. These tools help package accomplishments for colleges and employers.",
    tools: [
      { name: "Teal (resume builder)", what: "AI-powered resume builder that helps students frame accomplishments in professional language — free for students", tag: "Free", url: "https://www.tealhq.com" },
      { name: "Grammarly", what: "Paste any accomplishment description — it helps refine the language for applications, essays, and brag sheets", tag: "Free (basic)", url: "https://www.grammarly.com" },
      { name: "ChatGPT", what: "Give it raw accomplishments and ask: 'Rewrite these as strong bullet points for a college application' — remarkable results", tag: "Free", url: "https://chatgpt.com" },
      { name: "Scoir", what: "Free college planning platform that tracks accomplishments, activities, and connects them to college applications", tag: "Free", url: "https://www.scoir.com" },
    ]
  },
  9: { // Final details
    title: "Get ready for the next step",
    intro: "Tools to prepare for college counselor meetings, college research, and what comes after this playbook.",
    tools: [
      { name: "College Board BigFuture", what: "Free college search with scholarship matching — filter by major, size, location, and financial aid", tag: "Free", url: "https://bigfuture.collegeboard.org" },
      { name: "Niche.com", what: "Student reviews of colleges and careers — real perspectives that cut through the marketing", tag: "Free", url: "https://www.niche.com" },
      { name: "FAFSA (studentaid.gov)", what: "Financial aid application — open it now to understand what to prepare. Don't wait until senior fall.", tag: "Free", url: "https://studentaid.gov/h/apply-for-aid/fafsa" },
      { name: "Claude or ChatGPT", what: "Paste your playbook results and ask: 'Help me prepare questions for my college counselor meeting focused on [career]'", tag: "Free", url: "https://claude.ai" },
    ]
  },
};

const TAG_STYLE = {
  "Free": { bg: "rgba(37,99,235,.1)", color: "#93c5fd" },
  "Freemium": { bg: "rgba(180,120,0,.12)", color: "#fbbf24" },
  "Free (basic)": { bg: "rgba(37,99,235,.1)", color: "#93c5fd" },
  "Free (students)": { bg: "rgba(37,99,235,.1)", color: "#93c5fd" },
  "Free (school-provided)": { bg: "rgba(37,99,235,.1)", color: "#93c5fd" },
  "Free (limited)": { bg: "rgba(37,99,235,.1)", color: "#93c5fd" },
  "Paid (often school-provided)": { bg: "rgba(100,100,100,.15)", color: "#94a3b8" },
  "Paid": { bg: "rgba(100,100,100,.15)", color: "#94a3b8" },
};

function AIToolkit({ step }) {
  const [open, setOpen] = useState(false);
  const data = AI_TOOLKIT[step];
  if (!data) return null;

  return (
    <div className="atkWrap no-print">
      <button className="atkToggle" onClick={() => {
        const next = !open;
        setOpen(next);
        if (next) trackEvent("ai_toolkit_opened", { step });
      }}>
        <span className="atkToggleIcon">{open ? "▾" : "▸"}</span>
        <span className="atkToggleLabel">AI Toolkit for this step</span>
        <span className="atkToggleSub">— {data.tools.filter(t => t.tag.startsWith("Free")).length} free tools</span>
      </button>
      {open && (
        <div className="atkPanel">
          <div className="atkTitle">{data.title}</div>
          <div className="atkIntro">{data.intro}</div>
          <div className="atkTools">
            {data.tools.map((tool, i) => {
              const ts = TAG_STYLE[tool.tag] || TAG_STYLE["Freemium"];
              return (
                <a key={i} className="atkTool" href={tool.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackEvent("ai_toolkit_tool_clicked", { step, tool_name: tool.name, tool_tag: tool.tag })}>
                  <div className="atkToolTop">
                    <span className="atkToolName">{tool.name}</span>
                    <span className="atkTag" style={{ background: ts.bg, color: ts.color }}>{tool.tag}</span>
                  </div>
                  <div className="atkToolWhat">{tool.what}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MAIN APP
   ================================================================ */
export default function App() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({
    grade: "", interests: [], priority: "", techComfort: "", concern: "",
    subjects: [], subjectText: "", activities: "", accomplishments: "",
    specificCareer: "", extraContext: "", studentName: "",
  });
  const [pb, setPb] = useState(null); // parsed playbook JSON
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const topRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const iv = setInterval(() => setProgress(p => p >= 93 ? (clearInterval(iv), 93) : p + Math.random() * 5), 600);
    return () => clearInterval(iv);
  }, [loading]);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); }, [step]);

  const set = (k, v) => setA(p => ({ ...p, [k]: v }));

  // Track step progression for funnel analysis
  const advanceStep = (nextStep) => {
    trackEvent("playbook_step_completed", {
      step_number: step,
      step_name: ["welcome","grade","interests","priority","tech_comfort","concern","subjects","activities","accomplishments","final_details"][step] || `step_${step}`,
      next_step: nextStep,
    });
    setStep(nextStep);
  };
  const toggleInt = (id) => setA(p => ({ ...p, interests: p.interests.includes(id) ? p.interests.filter(x => x !== id) : p.interests.length < 3 ? [...p.interests, id] : p.interests }));
  const [subjectErr, setSubjectErr] = useState("");
  const handleSubjectText = (text) => {
    set("subjectText", text);
    if (text.length > 5) {
      const err = isGibberish(text);
      setSubjectErr(err || "");
      if (!err) set("subjects", parseSubjectsFromText(text));
    } else {
      setSubjectErr("");
    }
  };

  const ok = () => {
    if (step === 1) return a.grade !== "";
    if (step === 2) return a.interests.length >= 1;
    if (step === 3) return a.priority !== "";
    if (step === 4) return a.techComfort !== "";
    if (step === 5) return a.concern !== "";
    if (step === 6) return a.subjectText.trim().length >= 10 && !isGibberish(a.subjectText);
    return true;
  };

  // Attempt to repair truncated or malformed JSON
  const repairJSON = (str) => {
    let s = str.trim();
    // Remove markdown fencing
    s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
    // Find the first { and last }
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      s = s.substring(start, end + 1);
    }
    // Try parsing as-is first
    try { return JSON.parse(s); } catch {}
    // Fix common issues: trailing commas
    s = s.replace(/,\s*([\]}])/g, "$1");
    try { return JSON.parse(s); } catch {}
    // If truncated, try to close open brackets/braces
    let opens = 0, openb = 0;
    for (const ch of s) { if (ch === "[") opens++; if (ch === "]") opens--; if (ch === "{") openb++; if (ch === "}") openb--; }
    // Remove trailing partial values
    s = s.replace(/,\s*"[^"]*$/, "");
    s = s.replace(/,\s*$/, "");
    for (let i = 0; i < opens; i++) s += "]";
    for (let i = 0; i < openb; i++) s += "}";
    s = s.replace(/,\s*([\]}])/g, "$1");
    try { return JSON.parse(s); } catch {}
    // Last resort: try to extract just careers array
    try {
      const careersMatch = s.match(/"careers"\s*:\s*(\[[\s\S]*?\])/);
      if (careersMatch) {
        return { careers: JSON.parse(careersMatch[1].replace(/,\s*([\]}])/g, "$1")) };
      }
    } catch {}
    return null;
  };

  const generate = async () => {
    trackEvent("playbook_generate_clicked", {
      grade: a.grade,
      interests: a.interests.join(","),
      priority: a.priority,
      has_activities: a.activities.length > 0,
      has_accomplishments: a.accomplishments.length > 0,
      used_voice: a.subjectText.length > 0,
    });
    setStep(10); setLoading(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: buildPrompt(a) }] }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || JSON.stringify(data.error));
        setStep(11); setLoading(false); return;
      }
      const txt = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const parsed = repairJSON(txt);
      if (!parsed) {
        setError("JSON parse failed. Raw: " + txt.substring(0, 300) + "...");
        setStep(11); setLoading(false); return;
      }
      // Merge API response with client-side templates
      const fullPb = {
        careers: (parsed.careers || []).map(c => ({
          name: c.n || c.name || "Career",
          score: c.s || c.score || 80,
          fit: c.f || c.fit || "",
          insight: CAREER_DB[c.n || c.name]?.growth ? (CAREER_DB[c.n || c.name].growth + " projected growth") : "High demand field",
        })),
        yearPlan: getYearPlan(a.grade),
        buildOn: (parsed.buildOn || []).map(b => ({
          activity: b.a || b.activity || "",
          connection: b.c || b.connection || "",
          action: b.d || b.action || "deepen",
        })),
        demoInterest: getDemoInterest(a.interests),
        counselorQs: parsed.qs || parsed.counselorQs || [],
        talkingPoints: TALKING_POINTS,
        concernResponse: {
          headline: parsed.concern || "The data shows a path forward",
          data: "PwC found workers with AI skills earn 56% more in every industry. The premium doubled in 12 months.",
          steps: ["Research the top career match from this playbook this week", "Have a conversation with your child using the talking points above", "Schedule a counselor meeting and bring this printed playbook"],
        },
        aiRule: {
          insight: parsed.aiTip || "Combining domain expertise with AI fluency is the highest-value career strategy in every field",
          action: "Start with one AI tool relevant to their primary interest area this month",
        },
      };
      setProgress(100);
      trackEvent("playbook_generated_success", {
        grade: a.grade,
        career_count: (fullPb.careers || []).length,
      });
      setTimeout(() => { setPb(fullPb); setStep(11); setLoading(false); }, 400);
    } catch (err) {
      setError("Error: " + err.message);
      setStep(11); setLoading(false);
    }
  };

  const restart = () => { setStep(0); setA({ grade: "", interests: [], priority: "", techComfort: "", concern: "", subjects: [], subjectText: "", activities: "", accomplishments: "", specificCareer: "", extraContext: "", studentName: "" }); setPb(null); setError(""); };

  const gradeLabel = GRADES.find(g => g.id === a.grade)?.label || "";
  const interestLabels = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");
  const subjectLabels = a.subjectText || a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
  const priorityLabel = PRIORITIES.find(p => p.id === a.priority)?.label || "";
  const progressPct = step >= 1 && step <= 9 ? (step / TOTAL_STEPS) * 100 : 0;

  // Print handler
  const doPrint = () => { window.print(); };

  /* ---- RENDER ---- */
  return (
    <div className="R" ref={topRef}>

      {/* ============ WELCOME ============ */}
      {step === 0 && <div className="W">
        <div className="Wo o1"/><div className="Wo o2"/><div className="Wo o3"/>
        <div className="Wc">
          <div className="Wb">Free · 17 Research Sources · 35+ Careers Scored</div>
          <h1 className="Wh">Get Your Child's<br/><span className="Wa">AI-Proof Career Playbook</span></h1>
          <p className="Ws">Answer a few questions about your child. Get a personalized, visual career strategy with a printable Student Profile you can take to your next college counselor meeting.</p>
          <div className="Wst">
            <div className="Wsi"><div className="Wn">$1.5M</div><div className="Wl">Lifetime gap: AI-fluent<br/>vs. non-AI-fluent workers</div></div>
            <div className="Wdv"/>
            <div className="Wsi"><div className="Wn">56%</div><div className="Wl">Wage premium for<br/>AI skills, every industry</div></div>
            <div className="Wdv"/>
            <div className="Wsi"><div className="Wn">46%</div><div className="Wl">Drop in UK tech grad<br/>roles in one year</div></div>
          </div>
          <button className="Cb" onClick={() => setStep(1)}>Build My Playbook <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
          <div className="Ww">
            <div className="Wwi">✓ Visual AI Resistance Gauges for career matches</div>
            <div className="Wwi">✓ Year-by-Year Timeline with specific action items</div>
            <div className="Wwi">✓ Printable Brag Sheet formatted for counselors</div>
            <div className="Wwi">✓ College Counselor Meeting Kit with tailored questions</div>
          </div>
          <p className="Wf">No login. No email. Completely free.<br/>Built by <strong>Babith Bhoopalan</strong> · Quantumleap Insights LLC</p>
        </div>
      </div>}

      {/* ============ ASSESSMENT ============ */}
      {step >= 1 && step <= 9 && <div className="A">
        <div className="Ah">
          <button className="Abk" onClick={() => { trackEvent("playbook_step_back", { from_step: step }); setStep(s => s - 1); }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          <div className="Ap"><div className="Afl" style={{ width: `${progressPct}%` }}/></div>
          <span className="Asl">{step}/{TOTAL_STEPS}</span>
        </div>
        <div className="Aby">

          {step === 1 && <div className="Q"><div className="Qn">01</div><h2 className="Qt">What grade is your child in?</h2><p className="Qd">This determines the timeline for your action plan.</p>
            <div className="Ol">{GRADES.map(g => <button key={g.id} className={`Ob ${a.grade === g.id ? "s" : ""}`} onClick={() => set("grade", g.id)}><span className="Or">{a.grade === g.id ? "◉" : "○"}</span>{g.label}</button>)}</div>
            <VoiceSelect options={GRADES} onSelect={(id) => set("grade", id)} currentValue={a.grade} />
          </div>}

          {step === 2 && <div className="Q"><div className="Qn">02</div><h2 className="Qt">What are their top interests?</h2><p className="Qd">Pick up to 3 areas, or speak them — say something like "healthcare and technology".</p>
            <div className="Ig">{INTERESTS.map(o => <button key={o.id} className={`Ic ${a.interests.includes(o.id) ? "s" : ""}`} onClick={() => toggleInt(o.id)}>
              <span className="Ii">{o.ico}</span><span className="Il">{o.label}</span><span className="Ie">{o.ex}</span>
              {a.interests.includes(o.id) && <span className="Ik">✓</span>}
            </button>)}</div>
            <p className="Qh">{a.interests.length}/3 selected</p>
            <VoiceSelect options={INTERESTS} onSelect={(id) => toggleInt(id)} currentValue={a.interests} matchKey="label" />
          </div>}

          {step === 3 && <div className="Q"><div className="Qn">03</div><h2 className="Qt">What matters most for their career?</h2><p className="Qd">Pick the single most important factor, or say it — "job security" or "earning potential".</p>
            <div className="Ol">{PRIORITIES.map(p => <button key={p.id} className={`Ob hd ${a.priority === p.id ? "s" : ""}`} onClick={() => set("priority", p.id)}>
              <span className="Or">{a.priority === p.id ? "◉" : "○"}</span><div><div className="Om">{p.label}</div><div className="Od">{p.desc}</div></div>
            </button>)}</div>
            <VoiceSelect options={PRIORITIES} onSelect={(id) => set("priority", id)} currentValue={a.priority} />
          </div>}

          {step === 4 && <div className="Q"><div className="Qn">04</div><h2 className="Qt">How does your child feel about technology?</h2><p className="Qd">This shapes how we integrate AI fluency into their path. Or just say it — "loves technology" or "prefers hands-on".</p>
            <div className="Ol">{TECHC.map(t => <button key={t.id} className={`Ob hd ${a.techComfort === t.id ? "s" : ""}`} onClick={() => set("techComfort", t.id)}>
              <span className="Or">{a.techComfort === t.id ? "◉" : "○"}</span><div><div className="Om">{t.label}</div><div className="Od">{t.desc}</div></div>
            </button>)}</div>
            <VoiceSelect options={TECHC} onSelect={(id) => set("techComfort", id)} currentValue={a.techComfort} />
          </div>}

          {step === 5 && <div className="Q"><div className="Qn">05</div><h2 className="Qt">What is your biggest career concern?</h2><p className="Qd">Your playbook will address this head-on with data. Or just say it — "AI replacing jobs" or "college debt".</p>
            <div className="Ol">{CONCERNS.map(c => <button key={c.id} className={`Ob ${a.concern === c.id ? "s" : ""}`} onClick={() => set("concern", c.id)}>
              <span className="Or">{a.concern === c.id ? "◉" : "○"}</span>{c.label}
            </button>)}</div>
            <VoiceSelect options={CONCERNS} onSelect={(id) => set("concern", id)} currentValue={a.concern} />
          </div>}

          {step === 6 && <div className="Q"><div className="Qn">06</div>
            <h2 className="Qt">What subjects or topics genuinely excite them?</h2>
            <p className="Qd">Write it however feels natural. "She loves biology and can't stop reading about genetics" is perfect. So is "he's really into coding and building things." We'll figure out the rest.</p>
            <textarea
              className={`Ta subjectTa ${subjectErr ? "err" : a.subjectText.length > 10 && !isGibberish(a.subjectText) ? "ok" : ""}`}
              placeholder={"Try something like:\n\u2022 She lights up in chemistry, loves science\n\u2022 Obsessed with coding, built apps already\n\u2022 Strong in writing and history, hates math\n\u2022 Loves performing arts and music"}
              value={a.subjectText}
              onChange={e => handleSubjectText(e.target.value)}
              rows={5}
              maxLength={500}
            />
            {subjectErr && <div className="subjectErrBox"><span className="subjectErrIcon">⚠</span>{subjectErr}</div>}
            {!subjectErr && a.subjectText.length > 10 && parseSubjectsFromText(a.subjectText).length > 0 && (
              <div className="subjectDetected">
                <span className="subjectDetectedLabel">Detected: </span>
                {parseSubjectsFromText(a.subjectText).map(id => SUBJECTS.find(s => s.id === id)?.label).filter(Boolean).join(" · ")}
              </div>
            )}
            {!subjectErr && a.subjectText.length > 10 && parseSubjectsFromText(a.subjectText).length === 0 && (
              <div className="subjectHint">Keep going — mention a specific subject, topic, or activity and we'll connect it to career paths.</div>
            )}
            <VoiceCapture onTranscript={(text, final) => { if (text) handleSubjectText(text); }} />
            <p className="Qh2">{a.subjectText.length}/500 characters</p>
          </div>}

          {step === 7 && <div className="Q"><div className="Qn">07</div><h2 className="Qt">What extracurriculars and activities are they involved in?</h2><p className="Qd">List everything: clubs, sports, volunteering, jobs, hobbies, music. Or tap the mic and just talk — we'll capture it all.</p>
            <textarea className="Ta" placeholder="e.g. Varsity soccer (3 years), robotics club president, volunteers at animal shelter, plays guitar, summer job at vet clinic, debate team..." value={a.activities} onChange={e => set("activities", e.target.value)} rows={4}/>
            <VoiceCapture onTranscript={(text, final) => { if (text) set("activities", text); }} />
            <p className="Qh2">The more you share, the more personalized your playbook will be</p>
          </div>}

          {step === 8 && <div className="Q"><div className="Qn">08</div><h2 className="Qt">Any accomplishments, awards, or milestones?</h2><p className="Qd">These will appear in your printable Brag Sheet. Ask your child directly — tap the mic and let them tell you.</p>
            <textarea className="Ta" placeholder="e.g. Honor roll 3 semesters, won regional science fair (2nd place), Eagle Scout, AP Scholar, speaks conversational Spanish, built an app for school project..." value={a.accomplishments} onChange={e => set("accomplishments", e.target.value)} rows={4}/>
            <VoiceCapture onTranscript={(text, final) => { if (text) set("accomplishments", text); }} />
            <p className="Qh2">Don't be modest. Everything counts.</p>
          </div>}

          {step === 9 && <div className="Q"><div className="Qn">09</div><h2 className="Qt">Final details</h2><p className="Qd">Optional. These make your playbook even more specific.</p>
            <div className="Tf">
              <label className="Fl">Student's first name (for the printed profile)
                <input type="text" className="Ti" placeholder="e.g. Sarah, Marcus, Thea..." value={a.studentName} onChange={e => set("studentName", e.target.value)}/>
              </label>
              <label className="Fl">Specific career they are considering?
                <input type="text" className="Ti" placeholder="e.g. Neurosurgeon, cybersecurity analyst, electrician..." value={a.specificCareer} onChange={e => set("specificCareer", e.target.value)}/>
              </label>
              <label className="Fl">Anything else? (strengths, challenges, financial situation)
                <textarea className="Ta2" placeholder="e.g. Great at math but shy. Has ADHD, thrives hands-on. First-gen college student..." value={a.extraContext} onChange={e => set("extraContext", e.target.value)} rows={3}/>
                <VoiceCapture onTranscript={(text, final) => { if (text) set("extraContext", text); }} />
              </label>
            </div>
          </div>}

          <AIToolkit step={step} />

          <div className="An">
            <button className={`Nb ${ok() ? "ac" : "di"}`} disabled={!ok()} onClick={() => step === 9 ? generate() : advanceStep(step + 1)}>
              {step === 9 ? "Generate My Playbook" : "Continue"} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            {step >= 7 && step <= 8 && <button className="Ns" onClick={() => setStep(s => s + 1)}>Skip this step</button>}
          </div>
        </div>
      </div>}

      {/* ============ GENERATING ============ */}
      {step === 10 && <div className="G">
        <div className="Gc">
          <div className="Gi"><div className="Gs"/></div>
          <h2 className="Gt">Building Your Visual Playbook</h2>
          <p className="Gu">Analyzing your child's profile against 17 research sources...</p>
          <div className="Gp"><div className="Gf" style={{ width: `${progress}%` }}/></div>
          <div className="Gl">
            {[["Matching AI-resistant careers", 8], ["Connecting activities to career paths", 25], ["Building year-by-year timeline", 42], ["Creating counselor meeting kit", 58], ["Generating brag sheet", 75], ["Rendering visual playbook", 90]].map(([t, v]) =>
              <div key={t} className={`Gx ${progress > v ? "on" : ""}`}>{progress > v ? "✓" : "○"} {t}</div>
            )}
          </div>
        </div>
      </div>}

      {/* ============ RESULTS ============ */}
      {step === 11 && <div className="RE" id="playbook-output">
        <div className="Rh no-print"><div className="Ri">
          <div>
            <h1 className="Rt">{a.studentName ? `${a.studentName}'s Career Playbook` : "Your Career Playbook"}</h1>
            <p className="Rsu">{gradeLabel} · {interestLabels} · {new Date().toLocaleDateString()}</p>
          </div>
          <div className="Ra">
            <button className="Bn" onClick={doPrint}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print / Save as PDF</button>
            <button className="Bn sc" onClick={restart}>New Playbook</button>
          </div>
        </div></div>

        {error && <div className="Rb"><div className="errBox">{error}<br/><br/>Please try again or check your API configuration.</div></div>}

        {pb && <div className="Rb">

          {/* ---- PRINT HEADER (only visible in print) ---- */}
          <div className="print-only print-header">
            <h1>{a.studentName ? `${a.studentName}'s Career Playbook` : "Career Playbook"}</h1>
            <p>Future-Proof Careers in the Age of AI · Quantumleap Insights LLC · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          {/* ---- SECTION 1: Student Profile ---- */}
          <div className="section" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
            <h2 className="secTitle">Student Profile & Accomplishment Record</h2>
            <div className="profGrid">
              {a.studentName && <div className="profRow"><span className="profK">Name</span><span className="profV">{a.studentName}</span></div>}
              <div className="profRow"><span className="profK">Grade</span><span className="profV">{gradeLabel}</span></div>
              <div className="profRow"><span className="profK">Interests</span><span className="profV">{interestLabels}</span></div>
              <div className="profRow"><span className="profK">Strong Subjects</span><span className="profV">{subjectLabels}</span></div>
              <div className="profRow"><span className="profK">Priority</span><span className="profV">{priorityLabel}</span></div>
              {a.activities && <div className="profRow"><span className="profK">Activities</span><span className="profV">{a.activities}</span></div>}
              {a.accomplishments && <div className="profRow"><span className="profK">Accomplishments</span><span className="profV">{a.accomplishments}</span></div>}
              {a.specificCareer && <div className="profRow"><span className="profK">Considering</span><span className="profV">{a.specificCareer}</span></div>}
            </div>
          </div>

          {/* ---- SECTION 2: Career Match Dashboard ---- */}
          <div className="section">
            <h2 className="secTitle">Your Top AI-Resistant Career Matches</h2>
            <p className="secDesc">Ranked by fit to {a.studentName || "your child"}'s profile. Scores from 17 cross-referenced research sources.</p>
            <div className="careerGrid">
              {pb.careers?.map((c, i) => {
                const dbEntry = CAREER_DB[c.name] || {};
                return (
                  <div key={i} className="careerCard">
                    <div className="ccRank">#{i + 1}</div>
                    <div className="ccGauge"><ScoreGauge score={c.score || dbEntry.score || 80} size={90} /></div>
                    <div className="ccName">{c.name}</div>
                    <div className="ccMeta">
                      <span className="ccTag">{dbEntry.salary || "Competitive"}</span>
                      <span className="ccTag grow">{dbEntry.growth || "Growing"} growth</span>
                    </div>
                    <div className="ccFit">{c.fit}</div>
                    <div className="ccInsight">💡 {c.insight}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- SECTION 3: Year-by-Year Timeline ---- */}
          <div className="section">
            <h2 className="secTitle">Year-by-Year Action Plan</h2>
            <p className="secDesc">Your personalized roadmap from {gradeLabel} through college.</p>
            <div className="timeline">
              {pb.yearPlan?.map((yp, i) => (
                <TimelineNode key={i} year={yp.year} data={yp} idx={i} total={pb.yearPlan.length} />
              ))}
            </div>
          </div>

          {/* ---- SECTION 4: Building on What You Have ---- */}
          {pb.buildOn && pb.buildOn.length > 0 && <div className="section">
            <h2 className="secTitle">Building on What You Already Have</h2>
            <p className="secDesc">{a.studentName || "Your child"} is NOT starting from zero. Here is how current activities connect to AI-resistant careers.</p>
            <div className="buildGrid">
              {pb.buildOn.map((b, i) => (
                <div key={i} className="buildCard">
                  <div className="buildAct">{b.activity}</div>
                  <div className="buildConn">→ {b.connection}</div>
                  <div className={`buildAction ${b.action === "deepen" ? "deep" : "add"}`}>{b.action === "deepen" ? "DEEPEN" : "ADD"}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* ---- SECTION 5: Brag Sheet ---- */}
          <div className="section bragSheet">
            <h2 className="secTitle">Printable Brag Sheet</h2>
            <p className="secDesc">Formatted for college counselors and recommendation letter writers. Print this page to bring to your next meeting.</p>
            <div className="bragBox">
              <div className="bragHeader">{a.studentName ? `${a.studentName}'s Brag Sheet` : "Student Brag Sheet"} · {gradeLabel} · {new Date().getFullYear()}</div>
              <BragRow label="Academic Strengths" items={subjectLabels} />
              {a.activities && <BragRow label="Extracurricular Activities" items={a.activities.split(",").map(s => s.trim()).filter(Boolean)} />}
              {a.accomplishments && <BragRow label="Accomplishments & Awards" items={a.accomplishments.split(",").map(s => s.trim()).filter(Boolean)} />}
              <BragRow label="Career Interests" items={interestLabels} />
              {a.specificCareer && <BragRow label="Career Direction" items={`Exploring: ${a.specificCareer}`} />}
              <BragRow label="Top AI-Resistant Matches" items={pb.careers?.map(c => `${c.name} (${c.score}% AI Resistant)`)} />
              {pb.demoInterest && <BragRow label="Demonstrated Interest Actions" items={pb.demoInterest.map(d => d.action)} />}
              <BragRow label="Priority" items={priorityLabel} />
            </div>
          </div>

          {/* ---- SECTION 6: Counselor Meeting Kit (Rich Version) ---- */}
          <div className="section">
            <h2 className="secTitle">College Counselor Meeting Kit</h2>
            <p className="secDesc">Walk in prepared. Most counselors manage 300–500 students. The parents who get the most help are the ones who come ready.</p>
            <div className="meetingKit">

              {/* BRING */}
              <div className="mkSection">
                <div className="mkLabel">📋 What to Bring</div>
                <div className="mkItems">
                  <div className="mkItem">✓ This printed playbook — student profile + career matches on top</div>
                  <div className="mkItem">✓ Unofficial transcript (counselors need to see the full grade trajectory)</div>
                  <div className="mkItem">✓ Printed Brag Sheet from above — formatted exactly how they expect it</div>
                  <div className="mkItem">✓ Any test scores: PSAT, SAT, ACT, AP exam results</div>
                  <div className="mkItem">✓ A short college list — even 5–10 early ideas shows you're serious</div>
                  <div className="mkItem">✓ One paragraph about who your child is beyond grades — written in advance</div>
                </div>
              </div>

              {/* UNDERSTANDING THE STUDENT */}
              <div className="mkSection">
                <div className="mkLabel">🎓 Questions the Counselor Will Ask You — Be Ready</div>
                <div className="mkSub">Counselors use the first meeting to build a student profile. Prepare your child for these:</div>
                <div className="mkItems">
                  <div className="mkItem question">What subjects do you genuinely enjoy — not just the ones you're good at?</div>
                  <div className="mkItem question">What do you do outside of school that you'd do even if it wasn't on a college application?</div>
                  <div className="mkItem question">Is there a college size, location, or campus culture you're drawn to — or want to avoid?</div>
                  <div className="mkItem question">Have you thought about what you want to study, or does that feel too early to decide?</div>
                  <div className="mkItem question">What does your family's financial picture look like — are we working with a budget range?</div>
                  <div className="mkItem question">Are there any learning differences, accommodations, or personal circumstances we should factor in?</div>
                  <div className="mkItem question">Where do you see yourself in 10 years — even a rough direction helps us think about majors and programs.</div>
                </div>
              </div>

              {/* TAILORED QUESTIONS FROM AI */}
              <div className="mkSection">
                <div className="mkLabel">❓ Your Questions for the Counselor — Tailored to {a.studentName || "Your Child"}</div>
                <div className="mkSub">These are smart, informed questions based on the playbook profile. Use them to lead, not just react.</div>
                <div className="mkItems">
                  {pb.counselorQs?.map((q, i) => <div key={i} className="mkItem question">{i + 1}. {q}</div>)}
                  <div className="mkItem question">{pb.careers?.[0]?.name ? `Is ${pb.careers[0].name} a path you've seen students pursue successfully? What does that pipeline look like from our high school?` : "What paths have students with similar profiles pursued successfully from our school?"}</div>
                  <div className="mkItem question">How many college counselor meetings can we expect, and what's the best way to stay in contact between them?</div>
                  <div className="mkItem question">Will you be writing the counselor recommendation letter? What helps you write a strong one — what do you need to know about my child that isn't on the transcript?</div>
                  <div className="mkItem question">Can we see the school profile that gets sent to colleges? We want to understand the context our child's application is read in.</div>
                  <div className="mkItem question">Given where my child is right now, what one thing should they do this semester that would most improve their application?</div>
                </div>
              </div>

              {/* ACADEMIC PLANNING */}
              <div className="mkSection">
                <div className="mkLabel">📚 Academic Planning — What to Settle in This Meeting</div>
                <div className="mkItems">
                  <div className="mkItem">→ Is the current course rigor (AP/IB/Honors) appropriate for the target schools? What should change next year?</div>
                  <div className="mkItem">→ What is the school's policy on Ds or Ws on the transcript — and are there any red flags to address now?</div>
                  <div className="mkItem">→ SAT or ACT — which does this counselor recommend for this student's profile? When should they test?</div>
                  <div className="mkItem">→ Are there AP exams worth taking even without the class, given the career direction?</div>
                  <div className="mkItem">→ What's the strongest senior year schedule that doesn't cause burnout before applications are due?</div>
                </div>
              </div>

              {/* AI & CAREERS TALKING POINTS */}
              <div className="mkSection">
                <div className="mkLabel">💬 Talking Points — AI & Career Planning</div>
                <div className="mkSub">Most counselors haven't had this conversation with parents yet. Lead it confidently.</div>
                <div className="mkItems">
                  {pb.talkingPoints?.map((tp, i) => <div key={i} className="mkItem tp">→ {tp}</div>)}
                  <div className="mkItem tp">→ WEF projects 170M new jobs by 2030 alongside 92M displaced — net positive, but the new jobs require different preparation than we've historically focused on.</div>
                  <div className="mkItem tp">→ PwC found a 56% wage premium for AI-fluent workers in every industry — this isn't just a tech story, it applies to healthcare, law, education, and the trades.</div>
                  <div className="mkItem tp">→ We're not trying to predict the future — we're building a student who can adapt to whatever it brings.</div>
                </div>
              </div>

              {/* RECOMMENDATION LETTER */}
              <div className="mkSection">
                <div className="mkLabel">✉️ Recommendation Letter Strategy</div>
                <div className="mkItems">
                  <div className="mkItem">→ Ask explicitly: "What information can we give you so the letter feels personal, not generic?"</div>
                  <div className="mkItem">→ Offer to complete a parent questionnaire if the counselor provides one — fill it in specific stories, not adjectives.</div>
                  <div className="mkItem">→ Identify 2–3 teacher recommenders now, even if the ask is months away. Relationships take time.</div>
                  <div className="mkItem">→ Ask how far in advance they need the recommendation request — many counselors need 6–8 weeks minimum.</div>
                </div>
              </div>

              {/* AFTER */}
              <div className="mkSection">
                <div className="mkLabel">📝 After the Meeting — Within 48 Hours</div>
                <div className="mkItems">
                  <div className="mkItem">□ Send a brief thank-you email — include your child's name and one thing you appreciated from the conversation</div>
                  <div className="mkItem">□ Write down the 3 most important action items the counselor gave you before you forget</div>
                  <div className="mkItem">□ Update the Brag Sheet with any accomplishments or activities the counselor suggested highlighting</div>
                  <div className="mkItem">□ Book the next meeting before you leave or within 24 hours — don't let scheduling drift</div>
                  <div className="mkItem">□ Share the key takeaways with your child — frame it as "here's what we learned" not "here's what you need to do"</div>
                  <div className="mkItem">□ Share this playbook with your co-parent or partner so you're aligned on next steps</div>
                </div>
              </div>

            </div>
          </div>

          {/* ---- SECTION 7: Concern + Parent as the Ally Model + 56% Rule ---- */}
          {pb.concernResponse && <div className="section">
            <h2 className="secTitle">Addressing Your Concern</h2>
            <div className="concernBox">
              <div className="concernHead">{pb.concernResponse.headline}</div>
              <div className="concernData">📊 {pb.concernResponse.data}</div>
              <div className="concernSteps">
                <div className="csLabel">Your 3 next steps this week:</div>
                {pb.concernResponse.steps?.map((s, i) => <div key={i} className="csStep"><span className="csNum">{i + 1}</span>{s}</div>)}
              </div>
            </div>
          </div>}

          {/* ---- PARENT AS THE ALLY MODEL ---- */}
          <div className="section">
            <div className="allyBox">
              <div className="allyHeader">
                <div className="allyIcon">◈</div>
                <div>
                  <div className="allyTitle">The Parent as the Ally Model</div>
                  <div className="allySub">Your role isn't to manage the process — it's to make your child capable of managing it themselves. Here's the roadmap by phase.</div>
                </div>
              </div>

              <div className="allyPhases">

                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Now → End of This School Year</span>
                    <span className="allyPhaseName">Foundation Phase — Plant the Seeds</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Have one honest conversation about AI and careers — share this playbook as a starting point, not a directive. The goal is curiosity, not pressure.</div>
                    <div className="allyItem"><span className="allyDot"/>Help them build a simple "accomplishments log" — a running Google Doc where they note anything worth remembering: awards, projects, volunteer hours, moments of pride. This becomes the brag sheet.</div>
                    <div className="allyItem"><span className="allyDot"/>Research the top 2–3 career matches together. Spend 30 minutes finding one person on LinkedIn who does that job. Read their path. Make it real.</div>
                    <div className="allyItem"><span className="allyDot"/>Get clarity on your family's financial parameters. Have the honest money conversation now — before your child falls in love with a school. Know your FAFSA situation and roughly what you can afford.</div>
                    <div className="allyItem"><span className="allyDot"/>Establish your role explicitly: "I'm here to help you think, not to do this for you." Research consistently shows students whose parents support without controlling have better outcomes and less anxiety.</div>
                  </div>
                </div>

                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">This Summer</span>
                    <span className="allyPhaseName">Exploration Phase — Build Real Exposure</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Help them find one summer experience connected to their top career match — a volunteer role, shadow opportunity, summer program, or part-time job. The experience matters less than the reflection it creates.</div>
                    <div className="allyItem"><span className="allyDot"/>Plan 2–3 college visits — even informally. Walking a campus does something a website cannot. Mix sizes: one large research university, one mid-size, one small. The contrast is instructive.</div>
                    <div className="allyItem"><span className="allyDot"/>Encourage them to start a "college notes" doc — impressions from each visit, what felt right, what didn't. Their instincts matter and this data gets useful later.</div>
                    <div className="allyItem"><span className="allyDot"/>Introduce them to one professional in a field they're considering. This doesn't require connections — a LinkedIn message to a local professional with a specific question gets a reply more often than you'd think.</div>
                  </div>
                </div>

                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Junior Year — Fall Semester</span>
                    <span className="allyPhaseName">Strategy Phase — Get Serious Without Panic</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Book the college counselor meeting. Bring this playbook. Use the Meeting Kit in this document. Most parents come empty-handed — you won't.</div>
                    <div className="allyItem"><span className="allyDot"/>Build the college list together: 3–4 reach schools, 4–5 target schools, 3–4 safety schools. A good safety school is one they'd genuinely be happy to attend — not a punishment.</div>
                    <div className="allyItem"><span className="allyDot"/>Register for the PSAT (October) and plan the SAT/ACT timeline. Most students test 2–3 times. Schedule it now so it doesn't sneak up.</div>
                    <div className="allyItem"><span className="allyDot"/>Identify teacher recommenders. These relationships take time. Encourage your child to connect genuinely with 2–3 teachers whose classes they've taken this year — not just to get a letter, but because those teachers will write better letters for students they actually know.</div>
                    <div className="allyItem"><span className="allyDot"/>Your job: logistics and calm. Handle the calendar, the reminders, the test registration. Your child's job: the academic performance and the authentic story. Don't cross the line.</div>
                  </div>
                </div>

                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Junior Year — Spring Semester</span>
                    <span className="allyPhaseName">Preparation Phase — Build the Application Foundation</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Finalize the college list. Every school on it should have a clear "why this school" answer — colleges can tell when an application is generic.</div>
                    <div className="allyItem"><span className="allyDot"/>Begin the essay brainstorm — not the writing, the thinking. The best personal statement topics often come from a 30-minute conversation where you ask: "What's something you've never put on an application but that says something true about who you are?"</div>
                    <div className="allyItem"><span className="allyDot"/>Submit the FAFSA as early as possible (opens October 1 of senior year — plan now). Many merit scholarships are first-come, first-served. Being late costs real money.</div>
                    <div className="allyItem"><span className="allyDot"/>Update and polish the Brag Sheet. This is the document that goes to teacher recommenders, the counselor, and gets referenced in every essay.</div>
                    <div className="allyItem"><span className="allyDot"/>Take the final SAT/ACT if scores still need improvement. Don't let this drag into senior fall when application pressure peaks.</div>
                  </div>
                </div>

                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Senior Year — Fall (Aug–Nov)</span>
                    <span className="allyPhaseName">Execution Phase — Ship the Applications</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Create a shared tracking doc: every school, every deadline, every required component. Make it visible. Check it weekly together — briefly, not obsessively.</div>
                    <div className="allyItem"><span className="allyDot"/>Early Decision/Early Action deadlines are typically Nov 1–15. If there's a clear first choice, ED can meaningfully improve admission odds at many schools. Understand the binding vs. non-binding distinction.</div>
                    <div className="allyItem"><span className="allyDot"/>Read essays as a supportive audience, not an editor. Your job is to ask "does this sound like you?" — not to polish their voice into yours. Admissions officers are trained to spot parental rewrites.</div>
                    <div className="allyItem"><span className="allyDot"/>Make sure recommendation requests went out 6–8 weeks before the first deadline. Follow up with a polite reminder if needed. Teachers are managing hundreds of requests.</div>
                    <div className="allyItem"><span className="allyDot"/>Protect your child's mental health. This is the highest-anxiety stretch of the process. Normalize uncertainty. Celebrate the submission of each application — not just the outcomes.</div>
                  </div>
                </div>

                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Decision Season (Dec–May)</span>
                    <span className="allyPhaseName">Perspective Phase — Keep the Long View</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>When decisions arrive: celebrate acceptances without comparisons to peers. Rejections are not verdicts on your child's worth — they are one committee's read of an incomplete picture.</div>
                    <div className="allyItem"><span className="allyDot"/>Compare financial aid packages carefully. A $20K difference in aid over 4 years is $80K — that changes the calculus on a lot of schools. Teach your child to read an offer letter, not just the acceptance.</div>
                    <div className="allyItem"><span className="allyDot"/>Visit admitted student days for the top 2–3 choices if possible. The campus that felt theoretical in a brochure often feels obvious or wrong in person.</div>
                    <div className="allyItem"><span className="allyDot"/>Let them make the final decision. Your role is to make sure they have good information and feel supported — not to steer them toward the school you would have chosen. Their ownership of the decision matters for how they show up when they get there.</div>
                    <div className="allyItem"><span className="allyDot"/>May 1 is National Decision Day. After that: housing forms, FAFSA verification, and the final transcript. You're almost done. Breathe.</div>
                  </div>
                </div>

              </div>

              <div className="allyFootnote">
                The research is consistent: students whose parents are engaged but not controlling are less anxious, more resilient when things don't go as planned, and more satisfied with their college choice. Your job is to be the calmest, best-informed person in the room. This playbook is a start.
              </div>
            </div>
          </div>

          {pb.aiRule && <div className="section">
            <div className="aiRuleBox">
              <div className="arTitle">The 56% Rule</div>
              <div className="arSub">Workers with AI skills earn 56% more in every industry (PwC, 2025)</div>
              <div className="arInsight">{pb.aiRule.insight}</div>
              <div className="arAction">→ {pb.aiRule.action}</div>
            </div>
          </div>}

          {/* ---- Footer CTA ---- */}
          <div className="Rf no-print">
            <h3>Want the full 22-page research behind this playbook?</h3>
            <p>Explore 35+ careers scored for AI resistance. Contribute your perspective and download the complete research document.</p>
            <a href="https://thriving-shortbread-3bf879.netlify.app" target="_blank" rel="noopener noreferrer" className="Rc">Explore the Full Career Guide →</a>
          </div>

          {/* ---- Feature Request Form ---- */}
          <FeatureRequestForm studentGrade={a.grade} />

          {/* ---- Print footer ---- */}
          <div className="print-only print-footer">
            <p>Research from 17 sources: WEF, Goldman Sachs, McKinsey, PwC, BLS, Stanford HAI, Anthropic, and 10 more.</p>
            <p>Generated by the Future-Proof Careers project · Quantumleap Insights LLC · Babith Bhoopalan</p>
            <p>Full interactive guide: https://thriving-shortbread-3bf879.netlify.app</p>
          </div>

          <p className="Rx no-print">Built by Babith Bhoopalan · Quantumleap Insights LLC · Research from WEF, Goldman Sachs, McKinsey, PwC, Stanford HAI, Anthropic, and 11 more.</p>
        </div>}
      </div>}

      {/* ============ STYLES ============ */}
      <style>{`
:root{--bg:#04050b;--bg-card:#07080f;--bg-elevated:#0a0b14;--blue:#2563EB;--blue-hover:#1d4ed8;--blue-glow:#3b82f6;--border:#0f172a;--border-mid:#1e293b;--text:#f1f5f9;--text-muted:#94a3b8;--text-dim:#475569}
*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--text)}#root{min-height:100vh}
.R{font-family:'Inter',sans-serif;min-height:100vh}

/* Welcome */
.W{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:40px 24px}
.Wo{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.o1{width:600px;height:600px;top:-200px;left:-100px;background:rgba(37,99,235,.07);animation:fl 20s infinite}
.o2{width:400px;height:400px;bottom:-100px;right:-50px;background:rgba(59,130,246,.05);animation:fl2 25s infinite}
.o3{width:300px;height:300px;top:40%;left:60%;background:rgba(37,99,235,.04);animation:fl 30s infinite reverse}
.Wc{position:relative;z-index:1;text-align:center;max-width:700px}
.Wb{display:inline-block;padding:7px 18px;border-radius:24px;font-size:11px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;color:#93c5fd;background:rgba(37,99,235,.1);border:1px solid rgba(37,99,235,.2);margin-bottom:28px;font-family:'DM Mono',monospace}
.Wh{font-family:'Playfair Display',serif;font-size:clamp(32px,5.5vw,52px);line-height:1.1;font-weight:800;color:var(--text);margin-bottom:18px}
.Wa{background:linear-gradient(135deg,var(--blue),var(--blue-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.Ws{font-size:16px;color:var(--text-muted);line-height:1.7;margin-bottom:32px;font-weight:400;max-width:560px;margin-left:auto;margin-right:auto}
.Wst{display:flex;align-items:center;justify-content:center;gap:28px;margin-bottom:36px;flex-wrap:wrap}
.Wsi{text-align:center}.Wn{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;color:var(--text)}
.Wl{font-size:12px;color:var(--text-dim);max-width:160px;margin-top:4px;line-height:1.4}
.Wdv{width:1px;height:40px;background:rgba(255,255,255,.08)}
.Cb{display:inline-flex;align-items:center;gap:10px;padding:16px 36px;background:var(--blue);color:#fff;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.02em;transition:all .2s;margin-bottom:28px;box-shadow:0 4px 20px rgba(37,99,235,.3)}
.Cb:hover{background:var(--blue-hover);transform:translateY(-1px);box-shadow:0 6px 28px rgba(37,99,235,.4)}
.Ww{display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:center;margin-bottom:28px}
.Wwi{font-size:13px;color:var(--text-dim);font-weight:400}
.Wf{font-size:12px;color:var(--text-dim);line-height:1.6}.Wf strong{color:var(--text-muted)}

/* Assessment */
.A{min-height:100vh;display:flex;flex-direction:column}
.Ah{display:flex;align-items:center;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border-mid);position:sticky;top:0;background:rgba(4,5,11,.95);backdrop-filter:blur(12px);z-index:10}
.Abk{background:none;border:none;color:var(--text-dim);cursor:pointer;padding:6px;border-radius:8px;display:flex}.Abk:hover{color:var(--text-muted)}
.Ap{flex:1;height:3px;background:var(--border-mid);border-radius:2px;overflow:hidden}
.Afl{height:100%;background:var(--blue);border-radius:2px;transition:width .4s}
.Asl{font-size:13px;color:var(--text-dim);font-weight:500;white-space:nowrap;font-family:'DM Mono',monospace}
.Aby{flex:1;display:flex;flex-direction:column;align-items:center;padding:40px 24px 100px}
.Q{max-width:580px;width:100%;animation:fiu .4s ease}
.Qn{font-family:'DM Mono',monospace;font-size:11px;color:var(--blue);font-weight:500;margin-bottom:10px;letter-spacing:.1em;text-transform:uppercase}
.Qt{font-family:'Playfair Display',serif;font-size:28px;color:var(--text);font-weight:700;margin-bottom:8px;line-height:1.2}
.Qd{font-size:15px;color:var(--text-muted);margin-bottom:28px;font-weight:400}
.Qh{font-size:13px;color:var(--text-dim);margin-top:12px;text-align:center}
.Qh2{font-size:13px;color:var(--text-dim);margin-top:8px;font-style:italic}

.Ol{display:flex;flex-direction:column;gap:8px}
.Ob{display:flex;align-items:center;gap:12px;padding:16px 18px;width:100%;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:8px;color:var(--text-muted);font-size:15px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;text-align:left}
.Ob:hover{border-color:rgba(37,99,235,.35);background:rgba(37,99,235,.04)}
.Ob.s{border-color:var(--blue);background:rgba(37,99,235,.08);color:var(--text)}
.Or{font-size:16px;color:var(--text-dim);flex-shrink:0}.Ob.s .Or{color:var(--blue)}
.Ob.hd{align-items:flex-start}.Om{font-weight:500}.Od{font-size:13px;color:var(--text-dim);margin-top:2px}

.Ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.Ic{display:flex;align-items:center;gap:10px;padding:14px 16px;position:relative;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:8px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;text-align:left;flex-wrap:wrap}
.Ic:hover{border-color:rgba(37,99,235,.35)}.Ic.s{border-color:var(--blue);background:rgba(37,99,235,.08)}
.Ii{font-size:22px}.Il{font-size:14px;color:var(--text-muted);font-weight:500;flex:1}
.Ie{font-size:11px;color:var(--text-dim);width:100%;padding-left:32px}
.Ik{position:absolute;top:8px;right:10px;width:22px;height:22px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:700}

.Sg{display:flex;flex-wrap:wrap;gap:8px}
.subjectTa{width:100%;padding:16px 18px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:8px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical;min-height:130px;line-height:1.7}
.subjectTa:focus{border-color:rgba(37,99,235,.5)}
.subjectTa.err{border-color:rgba(239,68,68,.6);box-shadow:0 0 0 3px rgba(239,68,68,.08)}
.subjectTa.ok{border-color:rgba(37,99,235,.5);box-shadow:0 0 0 3px rgba(37,99,235,.08)}
.subjectTa::placeholder{color:var(--text-dim);font-size:13px;line-height:1.6}
.subjectErrBox{display:flex;align-items:flex-start;gap:8px;margin-top:10px;padding:12px 14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:13px;color:#fca5a5;line-height:1.5;animation:fiu .2s ease}
.subjectErrIcon{flex-shrink:0;font-size:15px}
.subjectDetected{margin-top:10px;padding:10px 14px;background:rgba(37,99,235,.07);border:1px solid rgba(37,99,235,.2);border-radius:8px;font-size:12px;color:#93c5fd;font-family:'DM Mono',monospace;animation:fiu .2s ease}
.subjectDetectedLabel{color:var(--text-dim);margin-right:4px}
.subjectHint{margin-top:10px;font-size:13px;color:var(--text-dim);font-style:italic}
.Sc{padding:12px 20px;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:6px;color:var(--text-muted);font-size:14px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;display:flex;align-items:center;gap:8px}
.Sc:hover{border-color:rgba(37,99,235,.35)}.Sc.s{border-color:var(--blue);background:rgba(37,99,235,.08);color:var(--text)}
.Sk{color:var(--blue);font-weight:700;font-size:13px}

.Ta,.Ta2{width:100%;padding:16px 18px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:8px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;resize:vertical;min-height:100px;line-height:1.6}
.Ta:focus,.Ta2:focus{border-color:rgba(37,99,235,.5)}.Ta::placeholder,.Ta2::placeholder{color:var(--text-dim)}
.Ta2{min-height:80px}
.Tf{display:flex;flex-direction:column;gap:20px}
.Fl{font-size:14px;color:var(--text-muted);display:flex;flex-direction:column;gap:8px}
.Ti{width:100%;padding:14px 16px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:8px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s}
.Ti:focus{border-color:rgba(37,99,235,.5)}.Ti::placeholder{color:var(--text-dim)}

.An{margin-top:36px;display:flex;flex-direction:column;align-items:center;gap:12px}
.Nb{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border:none;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.02em;transition:all .2s}
.Nb.ac{background:var(--blue);color:#fff;box-shadow:0 4px 16px rgba(37,99,235,.3)}
.Nb.ac:hover{background:var(--blue-hover);transform:translateY(-1px);box-shadow:0 6px 24px rgba(37,99,235,.4)}
.Nb.di{background:rgba(255,255,255,.04);color:var(--text-dim);cursor:not-allowed}
.Ns{background:none;border:none;color:var(--text-dim);font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;text-decoration:underline;text-underline-offset:3px}.Ns:hover{color:var(--text-muted)}

/* Generating */
.G{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
.Gc{text-align:center;max-width:440px;animation:fiu .5s ease}
.Gi{margin-bottom:28px;display:flex;justify-content:center}
.Gs{width:56px;height:56px;border:3px solid rgba(37,99,235,.15);border-top-color:var(--blue);border-radius:50%;animation:spin 1s linear infinite}
.Gt{font-family:'Playfair Display',serif;font-size:26px;color:var(--text);margin-bottom:10px;font-weight:700}
.Gu{font-size:14px;color:var(--text-muted);margin-bottom:28px}
.Gp{height:3px;background:var(--border-mid);border-radius:2px;margin-bottom:28px;overflow:hidden}
.Gf{height:100%;background:var(--blue);transition:width .5s;border-radius:2px}
.Gl{text-align:left}.Gx{font-size:13px;color:var(--text-dim);padding:6px 0;transition:color .3s}.Gx.on{color:#93c5fd}

/* Results */
.RE{min-height:100vh}
.Rh{position:sticky;top:0;z-index:10;padding:16px 24px;background:rgba(4,5,11,.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--border-mid)}
.Ri{max-width:820px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.Rt{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);font-weight:700}
.Rsu{font-size:12px;color:var(--text-dim);margin-top:2px;font-family:'DM Mono',monospace}
.Ra{display:flex;gap:8px}
.Bn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--blue);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.02em;transition:all .2s}
.Bn:hover{background:var(--blue-hover);transform:translateY(-1px)}.Bn.sc{background:rgba(255,255,255,.05);color:var(--text-muted)}

.Rb{max-width:820px;margin:0 auto;padding:32px 24px 60px}
.errBox{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:20px;color:#fca5a5;font-size:14px;line-height:1.6}

/* Section headers */
.section{margin-bottom:40px}
.secTitle{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);margin-bottom:6px;font-weight:700}
.secDesc{font-size:14px;color:var(--text-muted);margin-bottom:20px}

/* Profile */
.profGrid{display:flex;flex-direction:column;gap:10px}
.profRow{display:flex;gap:12px;font-size:14px;align-items:flex-start}
.profK{color:var(--blue);font-weight:600;min-width:130px;flex-shrink:0;font-size:12px;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em;padding-top:1px}
.profV{color:var(--text-muted);line-height:1.5}

/* Career cards */
.careerGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.careerCard{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;padding:20px;position:relative;transition:border-color .2s}
.careerCard:hover{border-color:rgba(37,99,235,.4)}
.ccRank{position:absolute;top:12px;left:14px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text-dim);font-weight:500;letter-spacing:.08em;text-transform:uppercase}
.ccGauge{display:flex;justify-content:center;margin-bottom:8px}
.ccName{font-size:16px;font-weight:600;color:var(--text);text-align:center;margin-bottom:8px}
.ccMeta{display:flex;gap:6px;justify-content:center;margin-bottom:10px;flex-wrap:wrap}
.ccTag{font-size:11px;padding:3px 8px;border-radius:4px;background:rgba(255,255,255,.05);color:var(--text-muted);font-family:'DM Mono',monospace}
.ccTag.grow{background:rgba(37,99,235,.1);color:#93c5fd}
.ccFit{font-size:13px;color:var(--text-muted);line-height:1.5;margin-bottom:8px}
.ccInsight{font-size:12px;color:var(--blue);line-height:1.4;padding-top:8px;border-top:1px solid var(--border-mid)}

/* Timeline */
.timeline{padding:8px 0}

/* Build on */
.buildGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
.buildCard{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:10px;padding:16px}
.buildAct{font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px}
.buildConn{font-size:13px;color:var(--text-muted);line-height:1.5;margin-bottom:8px}
.buildAction{display:inline-block;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:4px;font-family:'DM Mono',monospace}
.buildAction.deep{background:rgba(37,99,235,.12);color:#93c5fd}
.buildAction.add{background:rgba(37,99,235,.06);color:var(--text-muted);border:1px solid var(--border-mid)}

/* Brag Sheet */
.bragBox{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;padding:24px}
.bragHeader{font-family:'Playfair Display',serif;font-size:17px;color:var(--text);padding-bottom:12px;border-bottom:1px solid var(--border-mid);margin-bottom:16px;font-weight:700}

/* Meeting Kit */
.meetingKit{display:grid;gap:16px}
.mkSection{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:10px;padding:20px}
.mkLabel{font-size:11px;font-weight:500;color:var(--blue);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;font-family:'DM Mono',monospace}
.mkItems{display:flex;flex-direction:column;gap:8px}
.mkItem{font-size:14px;color:var(--text-muted);line-height:1.5;padding-left:4px}
.mkItem.question{color:var(--text);padding:8px 12px;background:rgba(37,99,235,.04);border-radius:6px;border-left:2px solid var(--blue)}
.mkItem.tp{color:var(--text-muted)}

/* Concern */
.concernBox{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;padding:24px}
.concernHead{font-size:18px;font-weight:700;color:var(--text);margin-bottom:12px;font-family:'Playfair Display',serif}
.concernData{font-size:14px;color:#93c5fd;margin-bottom:16px;padding:12px;background:rgba(37,99,235,.06);border-radius:6px}
.concernSteps{margin-top:4px}
.csLabel{font-size:11px;color:var(--text-dim);margin-bottom:10px;font-weight:500;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em}
.csStep{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;font-size:14px;color:var(--text-muted)}
.csNum{width:22px;height:22px;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;font-family:'DM Mono',monospace}

/* Meeting kit sub-label */
.mkSub{font-size:12px;color:var(--text-dim);margin-bottom:10px;font-style:italic}

/* Parent as the Ally Model */
.allyBox{background:var(--bg-card);border:1px solid rgba(37,99,235,.25);border-radius:14px;padding:28px}
.allyHeader{display:flex;align-items:flex-start;gap:16px;margin-bottom:28px}
.allyIcon{font-size:28px;color:var(--blue);flex-shrink:0;margin-top:2px}
.allyTitle{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);font-weight:700;margin-bottom:6px}
.allySub{font-size:14px;color:var(--text-muted);line-height:1.6}
.allyPhases{display:flex;flex-direction:column;gap:0}
.allyPhase{border-top:1px solid var(--border-mid);padding:20px 0}
.allyPhase:first-child{border-top:none;padding-top:0}
.allyPhaseHead{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.allyPhaseTag{font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--blue);background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.2);padding:3px 10px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.allyPhaseName{font-size:15px;font-weight:600;color:var(--text)}
.allyPhaseItems{display:flex;flex-direction:column;gap:10px}
.allyItem{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--text-muted);line-height:1.6}
.allyDot{width:6px;height:6px;border-radius:50%;background:var(--blue);flex-shrink:0;margin-top:7px}
.allyFootnote{margin-top:24px;padding-top:20px;border-top:1px solid var(--border-mid);font-size:13px;color:var(--text-dim);line-height:1.7;font-style:italic}

/* AI Rule */{background:var(--bg-card);border:1px solid rgba(37,99,235,.25);border-radius:12px;padding:24px}
.arTitle{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);margin-bottom:4px;font-weight:700}
.arSub{font-size:12px;color:var(--blue);margin-bottom:14px;font-family:'DM Mono',monospace}
.arInsight{font-size:15px;color:var(--text-muted);line-height:1.7;margin-bottom:12px}
.arAction{font-size:14px;color:#93c5fd;font-weight:500}

/* Footer */
.Rf{margin-top:40px;padding:28px;background:rgba(37,99,235,.05);border:1px solid rgba(37,99,235,.15);border-radius:12px;text-align:center}
.Rf h3{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);margin-bottom:8px;font-weight:700}
.Rf p{font-size:14px;color:var(--text-muted);margin-bottom:16px}
.Rc{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:var(--blue);color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;font-family:'Inter',sans-serif;transition:all .2s}
.Rc:hover{background:var(--blue-hover);transform:translateY(-1px)}
.Rx{text-align:center;font-size:11px;color:var(--text-dim);margin-top:24px;line-height:1.6}

/* Print styles */
.print-only{display:none}
@media print{
  body{background:#fff!important;color:#0f172a!important}
  .no-print{display:none!important}
  .print-only{display:block!important}
  .print-header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #2563EB}
  .print-header h1{font-family:'Playfair Display',serif;font-size:24px;color:#0f172a;margin-bottom:4px}
  .print-header p{font-size:12px;color:#64748b}
  .print-footer{text-align:center;margin-top:32px;padding-top:16px;border-top:2px solid #2563EB;font-size:11px;color:#94a3b8}
  .RE,.Rb{padding:0!important}
  .section{break-inside:avoid;margin-bottom:24px!important}
  .secTitle{color:#0f172a!important;font-size:18px!important}
  .secDesc{color:#64748b!important}
  .careerGrid{grid-template-columns:repeat(2,1fr)!important}
  .careerCard{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .ccName{color:#0f172a!important}
  .ccFit,.ccInsight{color:#334155!important}
  .bragBox{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .bragHeader{color:#0f172a!important;border-color:#e2e8f0!important}
  .mkSection{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .mkItem{color:#334155!important}
  .mkItem.question{border-color:#2563EB!important;background:#eff6ff!important;color:#0f172a!important}
  .concernBox{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .concernHead{color:#0f172a!important}
  .concernData{color:#1d4ed8!important;background:#eff6ff!important}
  .csStep{color:#0f172a!important}
  .aiRuleBox{border:1px solid #bfdbfe!important;background:#eff6ff!important}
  .arTitle{color:#0f172a!important}
  .arInsight{color:#334155!important}
  .profK{color:#1d4ed8!important}
  .profV{color:#0f172a!important}
  svg text{fill:#0f172a!important}
  svg path[stroke="#10b981"],svg path[stroke="#f59e0b"],svg path[stroke="#ef4444"]{stroke:#2563EB!important}
  .allyBox{border:1px solid #bfdbfe!important;background:#f8fafc!important}
  .allyTitle{color:#0f172a!important}
  .allySub,.allyItem,.allyFootnote{color:#334155!important}
  .allyPhaseTag{background:#eff6ff!important;color:#1d4ed8!important;border-color:#bfdbfe!important}
  .allyPhaseName{color:#0f172a!important}
  .allyDot{background:#2563EB!important}
  .buildCard{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .buildAct{color:#0f172a!important}
  .buildConn{color:#475569!important}
}

/* Feature Request Form */
.frWrap{margin-top:24px}
.frTeaser{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 24px;background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;flex-wrap:wrap}
.frTeaserTitle{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}
.frTeaserSub{font-size:13px;color:var(--text-muted);line-height:1.5}
.frOpenBtn{padding:10px 20px;background:transparent;border:1px solid var(--blue);color:var(--blue);border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;white-space:nowrap;transition:all .2s}
.frOpenBtn:hover{background:var(--blue);color:#fff}
.frPanel{background:var(--bg-card);border:1px solid rgba(37,99,235,.3);border-radius:12px;padding:24px}
.frPanelHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px}
.frPanelTitle{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px}
.frPanelSub{font-size:13px;color:var(--text-muted);line-height:1.5}
.frClose{background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;padding:4px 8px;border-radius:4px;flex-shrink:0}.frClose:hover{color:var(--text-muted)}
.frForm{display:flex;flex-direction:column;gap:18px}
.frRow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.frField{display:flex;flex-direction:column;gap:6px}
.frLabel{font-size:12px;font-weight:500;color:var(--text-muted);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em}
.frOpt{font-weight:400;color:var(--text-dim);text-transform:none;letter-spacing:0}
.frReq{color:var(--blue)}
.frInput{padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:6px;color:var(--text);font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;width:100%}
.frInput:focus{border-color:rgba(37,99,235,.5)}
.frInput::placeholder{color:var(--text-dim)}
.frTextarea{padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:6px;color:var(--text);font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;resize:vertical;line-height:1.6;width:100%}
.frTextarea:focus{border-color:rgba(37,99,235,.5)}
.frTextarea::placeholder{color:var(--text-dim)}
.frSelect{padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:6px;color:var(--text);font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;width:100%;cursor:pointer}
.frSelect:focus{border-color:rgba(37,99,235,.5)}
.frPills{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}
.frPill{padding:8px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-mid);border-radius:20px;color:var(--text-muted);font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.frPill:hover{border-color:rgba(37,99,235,.4)}.frPill.sel{border-color:var(--blue);background:rgba(37,99,235,.1);color:var(--text)}
.frActions{display:flex;justify-content:flex-end;gap:10px;margin-top:4px}
.frCancel{padding:10px 20px;background:transparent;border:1px solid var(--border-mid);color:var(--text-muted);border-radius:6px;font-size:14px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.frCancel:hover{border-color:var(--text-dim);color:var(--text)}
.frSubmit{padding:10px 24px;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.frSubmit.active{background:var(--blue);color:#fff}.frSubmit.active:hover{background:var(--blue-hover)}
.frSubmit.disabled{background:rgba(255,255,255,.05);color:var(--text-dim);cursor:not-allowed}
.frError{font-size:13px;color:#fca5a5;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:6px;padding:10px 14px}
.frSuccess{text-align:center;padding:32px 24px;display:flex;flex-direction:column;align-items:center;gap:12px}
.frSuccessIcon{width:48px;height:48px;border-radius:50%;background:rgba(37,99,235,.1);border:1px solid rgba(37,99,235,.3);display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--blue)}
.frSuccessTitle{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text)}
.frSuccessMsg{font-size:14px;color:var(--text-muted);line-height:1.7;max-width:480px}
.frSuccessBtn{margin-top:8px;padding:10px 24px;background:var(--blue);color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif}
@media(max-width:600px){.frRow{grid-template-columns:1fr}.frTeaser{flex-direction:column;align-items:flex-start}.frActions{flex-direction:column}.frSubmit,.frCancel{width:100%;text-align:center}}


/* Voice Capture */
.vcWrap{margin-top:12px}
.vcBtn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid var(--border-mid);border-radius:24px;background:rgba(255,255,255,.03);color:var(--text-muted);font-size:13px;font-family:'Inter',sans-serif;cursor:pointer;transition:all .2s}
.vcBtn.idle:hover{border-color:rgba(37,99,235,.4);color:var(--text);background:rgba(37,99,235,.06)}
.vcBtn.active{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.08);color:#fca5a5;animation:vcPulseBtn 1.5s ease-in-out infinite}
@keyframes vcPulseBtn{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.15)}50%{box-shadow:0 0 0 6px rgba(239,68,68,.04)}}
.vcPulse{width:8px;height:8px;border-radius:50%;background:#ef4444;flex-shrink:0;animation:vcDot .8s ease-in-out infinite}
@keyframes vcDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
.vcDone{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.2);border-radius:8px;font-size:13px}
.vcDoneIcon{color:var(--blue);font-size:14px;flex-shrink:0}
.vcDoneText{color:var(--text-muted);flex:1}
.vcError{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:13px;color:#fca5a5}
.vcError span{flex:1}
.vcRedo{background:none;border:none;color:var(--blue);font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}

/* AI Toolkit */
.atkWrap{margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid var(--border-mid)}
.atkToggle{width:100%;display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(37,99,235,.04);border:none;cursor:pointer;font-family:'Inter',sans-serif;text-align:left;transition:background .2s}
.atkToggle:hover{background:rgba(37,99,235,.08)}
.atkToggleIcon{font-size:11px;color:var(--blue);flex-shrink:0;width:12px}
.atkToggleLabel{font-size:13px;font-weight:600;color:var(--text);font-family:'DM Mono',monospace;letter-spacing:.04em}
.atkToggleSub{font-size:12px;color:var(--text-dim)}
.atkPanel{padding:16px;background:var(--bg-card);border-top:1px solid var(--border-mid)}
.atkTitle{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px}
.atkIntro{font-size:13px;color:var(--text-muted);margin-bottom:14px;line-height:1.5}
.atkTools{display:grid;gap:8px}
.atkTool{display:block;padding:12px 14px;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:8px;text-decoration:none;transition:border-color .2s,background .2s}
.atkTool:hover{border-color:rgba(37,99,235,.4);background:rgba(37,99,235,.04)}
.atkToolTop{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:5px;flex-wrap:wrap}
.atkToolName{font-size:14px;font-weight:600;color:var(--text)}
.atkTag{font-size:10px;font-weight:500;padding:2px 8px;border-radius:20px;white-space:nowrap;font-family:'DM Mono',monospace;letter-spacing:.04em}
.atkToolWhat{font-size:12px;color:var(--text-muted);line-height:1.5}
/* Animations */
@keyframes fiu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
@keyframes fl2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,30px)}}
@keyframes spin{to{transform:rotate(360deg)}}

/* Responsive */
@media(max-width:600px){.Wst{flex-direction:column;gap:16px}.Wdv{width:40px;height:1px}.Ig{grid-template-columns:1fr}.Ri{flex-direction:column;align-items:flex-start}.careerGrid{grid-template-columns:1fr}.profRow{flex-direction:column;gap:2px}.profK{min-width:auto}}
      `}</style>
    </div>
  );
}

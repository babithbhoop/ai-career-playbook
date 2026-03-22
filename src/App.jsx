import { useState, useEffect, useRef } from "react";

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
  const subjectLabels = a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
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
   MAIN APP
   ================================================================ */
export default function App() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({
    grade: "", interests: [], priority: "", techComfort: "", concern: "",
    subjects: [], activities: "", accomplishments: "",
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
  const toggleInt = (id) => setA(p => ({ ...p, interests: p.interests.includes(id) ? p.interests.filter(x => x !== id) : p.interests.length < 3 ? [...p.interests, id] : p.interests }));
  const toggleSub = (id) => setA(p => ({ ...p, subjects: p.subjects.includes(id) ? p.subjects.filter(x => x !== id) : p.subjects.length < 4 ? [...p.subjects, id] : p.subjects }));

  const ok = () => {
    if (step === 1) return a.grade !== "";
    if (step === 2) return a.interests.length >= 1;
    if (step === 3) return a.priority !== "";
    if (step === 4) return a.techComfort !== "";
    if (step === 5) return a.concern !== "";
    if (step === 6) return a.subjects.length >= 1;
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
      setTimeout(() => { setPb(fullPb); setStep(11); setLoading(false); }, 400);
    } catch (err) {
      setError("Error: " + err.message);
      setStep(11); setLoading(false);
    }
  };

  const restart = () => { setStep(0); setA({ grade: "", interests: [], priority: "", techComfort: "", concern: "", subjects: [], activities: "", accomplishments: "", specificCareer: "", extraContext: "", studentName: "" }); setPb(null); setError(""); };

  const gradeLabel = GRADES.find(g => g.id === a.grade)?.label || "";
  const interestLabels = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");
  const subjectLabels = a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
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
          <button className="Abk" onClick={() => setStep(s => s - 1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          <div className="Ap"><div className="Afl" style={{ width: `${progressPct}%` }}/></div>
          <span className="Asl">{step}/{TOTAL_STEPS}</span>
        </div>
        <div className="Aby">

          {step === 1 && <div className="Q"><div className="Qn">01</div><h2 className="Qt">What grade is your child in?</h2><p className="Qd">This determines the timeline for your action plan.</p>
            <div className="Ol">{GRADES.map(g => <button key={g.id} className={`Ob ${a.grade === g.id ? "s" : ""}`} onClick={() => set("grade", g.id)}><span className="Or">{a.grade === g.id ? "◉" : "○"}</span>{g.label}</button>)}</div>
          </div>}

          {step === 2 && <div className="Q"><div className="Qn">02</div><h2 className="Qt">What are their top interests?</h2><p className="Qd">Pick up to 3 areas. We will find careers at the intersection.</p>
            <div className="Ig">{INTERESTS.map(o => <button key={o.id} className={`Ic ${a.interests.includes(o.id) ? "s" : ""}`} onClick={() => toggleInt(o.id)}>
              <span className="Ii">{o.ico}</span><span className="Il">{o.label}</span><span className="Ie">{o.ex}</span>
              {a.interests.includes(o.id) && <span className="Ik">✓</span>}
            </button>)}</div>
            <p className="Qh">{a.interests.length}/3 selected</p>
          </div>}

          {step === 3 && <div className="Q"><div className="Qn">03</div><h2 className="Qt">What matters most for their career?</h2><p className="Qd">Pick the single most important factor.</p>
            <div className="Ol">{PRIORITIES.map(p => <button key={p.id} className={`Ob hd ${a.priority === p.id ? "s" : ""}`} onClick={() => set("priority", p.id)}>
              <span className="Or">{a.priority === p.id ? "◉" : "○"}</span><div><div className="Om">{p.label}</div><div className="Od">{p.desc}</div></div>
            </button>)}</div>
          </div>}

          {step === 4 && <div className="Q"><div className="Qn">04</div><h2 className="Qt">How does your child feel about technology?</h2><p className="Qd">This shapes how we integrate AI fluency into their path.</p>
            <div className="Ol">{TECHC.map(t => <button key={t.id} className={`Ob hd ${a.techComfort === t.id ? "s" : ""}`} onClick={() => set("techComfort", t.id)}>
              <span className="Or">{a.techComfort === t.id ? "◉" : "○"}</span><div><div className="Om">{t.label}</div><div className="Od">{t.desc}</div></div>
            </button>)}</div>
          </div>}

          {step === 5 && <div className="Q"><div className="Qn">05</div><h2 className="Qt">What is your biggest career concern?</h2><p className="Qd">Your playbook will address this head-on with data.</p>
            <div className="Ol">{CONCERNS.map(c => <button key={c.id} className={`Ob ${a.concern === c.id ? "s" : ""}`} onClick={() => set("concern", c.id)}>
              <span className="Or">{a.concern === c.id ? "◉" : "○"}</span>{c.label}
            </button>)}</div>
          </div>}

          {step === 6 && <div className="Q"><div className="Qn">06</div><h2 className="Qt">What are their strongest subjects?</h2><p className="Qd">Pick up to 4. We will connect academic strengths to career paths.</p>
            <div className="Sg">{SUBJECTS.map(s => <button key={s.id} className={`Sc ${a.subjects.includes(s.id) ? "s" : ""}`} onClick={() => toggleSub(s.id)}>
              {a.subjects.includes(s.id) && <span className="Sk">✓</span>}{s.label}
            </button>)}</div>
            <p className="Qh">{a.subjects.length}/4 selected</p>
          </div>}

          {step === 7 && <div className="Q"><div className="Qn">07</div><h2 className="Qt">What extracurriculars and activities are they involved in?</h2><p className="Qd">List everything: clubs, sports, volunteering, jobs, hobbies, music. We will show how these connect to AI-resistant careers.</p>
            <textarea className="Ta" placeholder="e.g. Varsity soccer (3 years), robotics club president, volunteers at animal shelter, plays guitar, summer job at vet clinic, debate team..." value={a.activities} onChange={e => set("activities", e.target.value)} rows={4}/>
            <p className="Qh2">The more you share, the more personalized your playbook will be</p>
          </div>}

          {step === 8 && <div className="Q"><div className="Qn">08</div><h2 className="Qt">Any accomplishments, awards, or milestones?</h2><p className="Qd">These will appear in your printable Brag Sheet for the counselor meeting.</p>
            <textarea className="Ta" placeholder="e.g. Honor roll 3 semesters, won regional science fair (2nd place), Eagle Scout, AP Scholar, speaks conversational Spanish, built an app for school project..." value={a.accomplishments} onChange={e => set("accomplishments", e.target.value)} rows={4}/>
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
              </label>
            </div>
          </div>}

          <div className="An">
            <button className={`Nb ${ok() ? "ac" : "di"}`} disabled={!ok()} onClick={() => step === 9 ? generate() : setStep(s => s + 1)}>
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

          {/* ---- SECTION 6: Counselor Meeting Kit ---- */}
          <div className="section">
            <h2 className="secTitle">College Counselor Meeting Kit</h2>
            <p className="secDesc">Walk into your next meeting prepared. Here is your agenda.</p>
            <div className="meetingKit">
              <div className="mkSection">
                <div className="mkLabel">📋 BRING TO THE MEETING</div>
                <div className="mkItems">
                  <div className="mkItem">✓ This printed playbook with Student Profile</div>
                  <div className="mkItem">✓ Unofficial transcript / grade report</div>
                  <div className="mkItem">✓ Printed Brag Sheet (above)</div>
                  <div className="mkItem">✓ List of colleges you are considering</div>
                  <div className="mkItem">✓ Any test scores (PSAT, SAT, ACT, AP)</div>
                </div>
              </div>
              <div className="mkSection">
                <div className="mkLabel">❓ QUESTIONS TO ASK (tailored to {a.studentName || "your child"})</div>
                <div className="mkItems">
                  {pb.counselorQs?.map((q, i) => <div key={i} className="mkItem question">{i + 1}. {q}</div>)}
                </div>
              </div>
              <div className="mkSection">
                <div className="mkLabel">💬 TALKING POINTS ABOUT AI & CAREERS</div>
                <div className="mkItems">
                  {pb.talkingPoints?.map((tp, i) => <div key={i} className="mkItem tp">→ {tp}</div>)}
                </div>
              </div>
              <div className="mkSection">
                <div className="mkLabel">📝 AFTER THE MEETING</div>
                <div className="mkItems">
                  <div className="mkItem">□ Send thank-you email to counselor within 24 hours</div>
                  <div className="mkItem">□ Update brag sheet with any new recommendations</div>
                  <div className="mkItem">□ Schedule follow-up meeting for next semester</div>
                  <div className="mkItem">□ Share playbook with your partner/co-parent</div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- SECTION 7: Concern + 56% Rule ---- */}
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

/* AI Rule */
.aiRuleBox{background:var(--bg-card);border:1px solid rgba(37,99,235,.25);border-radius:12px;padding:24px}
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
  .buildCard{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .buildAct{color:#0f172a!important}
  .buildConn{color:#475569!important}
}

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

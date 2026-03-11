import { useState, useEffect, useRef } from "react";

/* ================================================================
   DATA
   ================================================================ */
const GRADES = [
  { id: "8th", label: "8th Grade or Below" },
  { id: "9th", label: "9th Grade (Freshman)" },
  { id: "10th", label: "10th Grade (Sophomore)" },
  { id: "11th", label: "11th Grade (Junior)" },
  { id: "12th", label: "12th Grade (Senior)" },
  { id: "college", label: "Already in College" },
  { id: "adult", label: "I am an adult exploring for myself" },
];

const INTERESTS = [
  { id: "healthcare", label: "Healthcare & Medicine", ico: "\u{1F3E5}", ex: "Nursing, psychiatry, surgery, therapy" },
  { id: "tech", label: "Technology & Engineering", ico: "\u{1F4BB}", ex: "Software, cybersecurity, AI, robotics" },
  { id: "trades", label: "Skilled Trades", ico: "\u{1F527}", ex: "Electrical, plumbing, HVAC, solar" },
  { id: "creative", label: "Creative Arts & Design", ico: "\u{1F3A8}", ex: "Film, music, graphic design, UX" },
  { id: "business", label: "Business & Finance", ico: "\u{1F4C8}", ex: "Management, consulting, investing" },
  { id: "law", label: "Law & Policy", ico: "\u2696\uFE0F", ex: "Trial law, governance, compliance" },
  { id: "science", label: "Science & Environment", ico: "\u{1F52C}", ex: "Biology, climate science, research" },
  { id: "education", label: "Education", ico: "\u{1F4DA}", ex: "Teaching, counseling, special ed" },
  { id: "public", label: "Public Service & Emergency", ico: "\u{1F692}", ex: "Fire, EMT, social work, military" },
  { id: "diplomacy", label: "Diplomacy & International", ico: "\u{1F30D}", ex: "Foreign service, NGO, AI governance" },
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

const TOTAL_STEPS = 9;

/* ================================================================
   PROMPT
   ================================================================ */
function buildPrompt(a) {
  const concernLabel = CONCERNS.find(c => c.id === a.concern)?.label || a.concern;
  const subjectLabels = a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
  return `You are a career strategist created by Babith Bhoopalan of Quantumleap Insights LLC. Generate a personalized career playbook for a parent to take to their child's college counselor meeting.

RESEARCH DATA (17 sources: WEF, Goldman Sachs, McKinsey, PwC, BLS, Stanford HAI, Anthropic, Microsoft/LinkedIn, UNITAR, DiploFoundation, ILO, IntuitionLabs, Adobe, ISE, Oxford, Coursera, National University):
- WEF: 170M new jobs created, 92M displaced by 2030 = net +78M
- PwC: 56% wage premium for AI skills. Every industry. Doubled from 25% in 12 months.
- Goldman Sachs: Youth unemployment in tech-exposed jobs up ~3pts. Tech grad roles -46% UK. Big Four cut grad hiring 18-29%
- Skills changing 66% faster in AI-exposed jobs. 39% core skills change by 2030
- Degree requirements: 66% to 59% for AI-augmented jobs (2019-2024)
- $1.5M lifetime earnings gap between AI-fluent and non-AI-fluent workers
- Anthropic 2026 labor study: Programmers 75% AI coverage. 30% workers zero exposure. Young-worker hiring slowing.

AI RESISTANCE SCORES: Mental Health Counselor 98%, Firefighter/EMT 97%, Physician 96%, School Counselor 96%, Diplomat 95%, Special Ed 95%, Nurse Practitioner 94% (45.7% growth $120,680), Electrician 94% (8M+ unfilled $60,240+), Plumber/HVAC 94%, Social Worker 93%, Renewable Energy Tech 92% (22-44% growth), Performing Artist 91%, CEO 90%, K-12 Teacher 89%, Cybersecurity 88% (32% growth $112K), Construction Mgr 87% ($101,480), Environmental Scientist 86%, Creative Director 85%, Robotics Engineer 85%, Biomedical Engineer 83%, Trial Lawyer 82%, Research Scientist 80%, AI/ML Engineer 78% (36% growth $130K+), UX/UI 78%, Financial Advisor 76%, Content Creator 65%, Software Developer 62%, Accountant 45%, Paralegal 35%

FOUR HUMAN SUPERPOWERS AI CANNOT REPLICATE: Emotional Intelligence, Creative Vision, Physical Dexterity & Adaptability, Ethical Judgment & Accountability

STUDENT PROFILE:
- Grade: ${a.grade}
- Interests: ${a.interests.join(", ")}
- Top priority: ${a.priority}
- Tech comfort: ${a.techComfort}
- Biggest concern: ${concernLabel}
- Strongest subjects: ${subjectLabels}
- Current extracurriculars/activities: ${a.activities || "Not specified"}
- Accomplishments/awards: ${a.accomplishments || "Not specified"}
${a.specificCareer ? `- Specific career considering: ${a.specificCareer}` : ""}
${a.extraContext ? `- Additional context: ${a.extraContext}` : ""}

Generate a PERSONALIZED CAREER PLAYBOOK. Use ## for section headers and **bold** for key terms.

## Your Top 5 AI-Resistant Career Matches
For each: career name, AI Resistance Score, projected growth, median salary, 1-2 sentences on WHY it fits this specific student (reference their subjects, activities, accomplishments where relevant), one data point. Rank by fit.

## Year-by-Year Action Plan
From current grade through first year post-graduation. For EACH year: specific courses (reference their strong subjects), extracurriculars to add or deepen (build on what they already do), summer plans, portfolio items, AI fluency milestone. Be ultra-specific. Name real programs, competitions, certifications. Connect recommendations to their existing activities and strengths.

## Building on What You Already Have
Look at their current extracurriculars and accomplishments. Show how each one connects to AI-resistant career paths. Show the parent that their child is NOT starting from zero. Identify 2-3 activities they should deepen and 1-2 they should add.

## Demonstrated Interest Strategy for College Admissions
4 specific actions THIS SEMESTER. Connect to their existing activities and accomplishments. Name competitions, project ideas, volunteer opportunities, or research that would impress admissions and build on their current profile.

## Questions for Your College Counselor
5 smart questions tailored to this student. Reference their specific profile. Plus 3 talking points about AI-resistant career planning. These should make the counselor think "this parent did their homework."

## Addressing Your Concern: ${concernLabel}
Address with data. Honest, constructive. End with 3 concrete next steps for this week.

## The 56% Rule
What the AI wage premium means for THIS student's specific interests and subjects. How to combine their domain with AI fluency.

Warm direct tone. Every sentence earns its place. Under 2000 words.

End with: "---\\nThis playbook was generated by the Future-Proof Careers project (Quantumleap Insights LLC). Explore the full interactive career guide and download the 22-page research document at https://thriving-shortbread-3bf879.netlify.app"`;
}

/* ================================================================
   APP
   ================================================================ */
export default function App() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({
    grade: "", interests: [], priority: "", techComfort: "", concern: "",
    subjects: [], activities: "", accomplishments: "",
    specificCareer: "", extraContext: "",
    studentName: "",
  });
  const [playbook, setPlaybook] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const topRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const iv = setInterval(() => setProgress(p => p >= 93 ? (clearInterval(iv), 93) : p + Math.random() * 6), 500);
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
    if (step === 7) return true; // activities optional but encouraged
    if (step === 8) return true; // accomplishments optional
    if (step === 9) return true; // extras optional
    return true;
  };

  const generate = async () => {
    setStep(10); setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: buildPrompt(a) }] }),
      });
      const data = await res.json();
      if (data.error) {
        setProgress(100);
        setTimeout(() => { setPlaybook("Error: " + (data.error.message || JSON.stringify(data.error)) + "\n\nPlease try again or contact support."); setStep(11); setLoading(false); }, 400);
        return;
      }
      const txt = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "We had trouble generating your playbook. Please refresh and try again.";
      setProgress(100);
      setTimeout(() => { setPlaybook(txt); setStep(11); setLoading(false); }, 400);
    } catch (err) {
      setProgress(100);
      setPlaybook("Connection error: " + err.message + "\n\nPlease refresh and try again.");
      setStep(11); setLoading(false);
    }
  };

  const fmt = (t) => {
    let h = t;
    h = h.replace(/^---$/gm, '<hr class="pb-hr"/>');
    h = h.replace(/^## (.+)$/gm, '<h2 class="ph2">$1</h2>');
    h = h.replace(/^### (.+)$/gm, '<h3 class="ph3">$1</h3>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/^[-\u2022\u203A]\s(.+)$/gm, '<div class="pli"><span class="pd"></span><span>$1</span></div>');
    h = h.replace(/^(\d+)\.\s(.+)$/gm, '<div class="pni"><span class="pn">$1</span><span>$2</span></div>');
    h = h.split('\n\n').map(p => (p.includes('class="p') || p.includes('<h') || p.includes('<hr')) ? p : p.trim() ? `<p>${p}</p>` : '').join('');
    h = h.replace(/\n/g, '<br/>');
    return h;
  };

  const buildProfileHTML = () => {
    const grade = GRADES.find(g => g.id === a.grade)?.label || "";
    const ints = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");
    const subs = a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
    const pri = PRIORITIES.find(p => p.id === a.priority)?.label || "";
    const tech = TECHC.find(t => t.id === a.techComfort)?.label || "";
    return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:28px;page-break-inside:avoid">
      <h2 style="font-family:'Instrument Serif',serif;font-size:18px;color:#1a1a2e;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid #e2e8f0">Student Profile & Accomplishment Record</h2>
      <table style="width:100%;font-size:13px;color:#334155;border-collapse:collapse">
        ${a.studentName ? `<tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;width:160px;color:#1a1a2e">Student Name</td><td style="padding:5px 0">${a.studentName}</td></tr>` : ''}
        <tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;width:160px;color:#1a1a2e">Grade Level</td><td style="padding:5px 0">${grade}</td></tr>
        <tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Career Interests</td><td style="padding:5px 0">${ints}</td></tr>
        <tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Strongest Subjects</td><td style="padding:5px 0">${subs}</td></tr>
        <tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Top Priority</td><td style="padding:5px 0">${pri}</td></tr>
        <tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Tech Comfort</td><td style="padding:5px 0">${tech}</td></tr>
        ${a.specificCareer ? `<tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Career Considering</td><td style="padding:5px 0">${a.specificCareer}</td></tr>` : ''}
        ${a.activities ? `<tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Extracurriculars</td><td style="padding:5px 0">${a.activities}</td></tr>` : ''}
        ${a.accomplishments ? `<tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Accomplishments</td><td style="padding:5px 0">${a.accomplishments}</td></tr>` : ''}
        ${a.extraContext ? `<tr><td style="padding:5px 12px 5px 0;font-weight:600;vertical-align:top;color:#1a1a2e">Additional Notes</td><td style="padding:5px 0">${a.extraContext}</td></tr>` : ''}
      </table>
    </div>`;
  };

  const doPrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Career Playbook - Future-Proof Careers</title>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
      body{font-family:'Outfit',sans-serif;max-width:680px;margin:40px auto;padding:0 24px;color:#1a1a2e;line-height:1.75;font-size:13.5px}
      .hdr{text-align:center;padding-bottom:24px;border-bottom:2px solid #1a1a2e;margin-bottom:28px}
      .hdr h1{font-family:'Instrument Serif',serif;font-size:26px;margin:0 0 6px;color:#1a1a2e}
      .hdr p{margin:2px 0;color:#64748b;font-size:12px}
      h2{font-family:'Instrument Serif',serif;font-size:17px;color:#1a1a2e;margin:28px 0 12px;padding:8px 0 6px;border-bottom:1px solid #e2e8f0}
      h3{font-size:15px;color:#4f46e5;margin:20px 0 8px}
      strong{color:#1a1a2e} hr{border:none;border-top:1px solid #e2e8f0;margin:32px 0}
      .ftr{margin-top:36px;padding-top:20px;border-top:2px solid #1a1a2e;text-align:center;font-size:11px;color:#94a3b8}
      @media print{body{font-size:12px}h2{font-size:15px;margin:20px 0 8px}}
    </style></head><body>
    <div class="hdr">
      <h1>Your Personalized Career Playbook</h1>
      <p>Future-Proof Careers in the Age of AI</p>
      <p>Prepared by Quantumleap Insights LLC &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    ${buildProfileHTML()}
    ${playbook.replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^---$/gm, '<hr/>').replace(/\n/g, '<br/>')}
    <div class="ftr">
      <p>Research from 17 sources: WEF, Goldman Sachs, McKinsey, PwC, BLS, Stanford HAI, Anthropic, and 10 more.<br/>
      Full interactive guide: https://thriving-shortbread-3bf879.netlify.app<br/>
      &copy; ${new Date().getFullYear()} Quantumleap Insights LLC &middot; Babith Bhoopalan</p>
    </div></body></html>`);
    w.document.close();
    w.print();
  };

  const restart = () => { setStep(0); setA({ grade: "", interests: [], priority: "", techComfort: "", concern: "", subjects: [], activities: "", accomplishments: "", specificCareer: "", extraContext: "", studentName: "" }); setPlaybook(""); };

  const progressPct = step >= 1 && step <= 9 ? (step / TOTAL_STEPS) * 100 : 0;

  return (
    <div className="R" ref={topRef}>

      {/* WELCOME */}
      {step === 0 && <div className="W">
        <div className="Wo o1"/><div className="Wo o2"/><div className="Wo o3"/>
        <div className="Wc">
          <div className="Wb">Free · 17 Research Sources · 35+ Careers Scored</div>
          <h1 className="Wh">Get Your Child's<br/><span className="Wa">AI-Proof Career Playbook</span></h1>
          <p className="Ws">Answer a few quick questions about your child. Get a personalized, data-backed career strategy with a printable Student Profile you can take to your next college counselor meeting.</p>
          <div className="Wst">
            <div className="Wsi"><div className="Wn">$1.5M</div><div className="Wl">Lifetime gap: AI-fluent<br/>vs. non-AI-fluent workers</div></div>
            <div className="Wdv"/>
            <div className="Wsi"><div className="Wn">56%</div><div className="Wl">Wage premium for<br/>AI skills, every industry</div></div>
            <div className="Wdv"/>
            <div className="Wsi"><div className="Wn">46%</div><div className="Wl">Drop in UK tech grad<br/>roles in one year</div></div>
          </div>
          <button className="Cb" onClick={() => setStep(1)}>Build My Playbook <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
          <div className="Ww">
            <div className="Wwi">✓ Printable Student Profile & Accomplishment Record</div>
            <div className="Wwi">✓ 5 AI-Resistant Career Matches with scores and salaries</div>
            <div className="Wwi">✓ Year-by-Year Action Plan through college</div>
            <div className="Wwi">✓ College Counselor Meeting Prep with 5 tailored questions</div>
          </div>
          <p className="Wf">No login. No email. Completely free.<br/>Built by <strong>Babith Bhoopalan</strong> · Quantumleap Insights LLC</p>
        </div>
      </div>}

      {/* ASSESSMENT */}
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

          {step === 8 && <div className="Q"><div className="Qn">08</div><h2 className="Qt">Any accomplishments, awards, or milestones?</h2><p className="Qd">These will appear in your printable Student Profile for the counselor meeting.</p>
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
                <textarea className="Ta2" placeholder="e.g. Great at math but shy. Has ADHD, thrives hands-on. First-gen college student. Cannot afford 4-year degree..." value={a.extraContext} onChange={e => set("extraContext", e.target.value)} rows={3}/>
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

      {/* GENERATING */}
      {step === 10 && <div className="G">
        <div className="Gc">
          <div className="Gi"><div className="Gs"/></div>
          <h2 className="Gt">Building Your Personalized Playbook</h2>
          <p className="Gu">Analyzing your child's profile against 17 research sources...</p>
          <div className="Gp"><div className="Gf" style={{ width: `${progress}%` }}/></div>
          <div className="Gl">
            {[["Matching AI-resistant careers to interests", 8], ["Connecting activities to career paths", 25], ["Building year-by-year plan", 42], ["Creating counselor talking points", 58], ["Addressing your concerns with data", 75], ["Formatting student profile and playbook", 90]].map(([t, v]) =>
              <div key={t} className={`Gx ${progress > v ? "on" : ""}`}>{progress > v ? "✓" : "○"} {t}</div>
            )}
          </div>
        </div>
      </div>}

      {/* RESULTS */}
      {step === 11 && <div className="RE">
        <div className="Rh"><div className="Ri">
          <div>
            <h1 className="Rt">{a.studentName ? `${a.studentName}'s Career Playbook` : "Your Career Playbook"}</h1>
            <p className="Rsu">{GRADES.find(g => g.id === a.grade)?.label} · {a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ")} · {new Date().toLocaleDateString()}</p>
          </div>
          <div className="Ra">
            <button className="Bn" onClick={doPrint}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print / Save as PDF</button>
            <button className="Bn sc" onClick={restart}>New Playbook</button>
          </div>
        </div></div>
        <div className="Rb">
          {/* Student Profile Card in Results */}
          <div className="Sp">
            <h3 className="Spt">Student Profile & Accomplishment Record</h3>
            <div className="Spr">
              {a.studentName && <div className="Spi"><span className="Spk">Name</span><span className="Spv">{a.studentName}</span></div>}
              <div className="Spi"><span className="Spk">Grade</span><span className="Spv">{GRADES.find(g => g.id === a.grade)?.label}</span></div>
              <div className="Spi"><span className="Spk">Interests</span><span className="Spv">{a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ")}</span></div>
              <div className="Spi"><span className="Spk">Strong Subjects</span><span className="Spv">{a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ")}</span></div>
              <div className="Spi"><span className="Spk">Priority</span><span className="Spv">{PRIORITIES.find(p => p.id === a.priority)?.label}</span></div>
              {a.activities && <div className="Spi"><span className="Spk">Activities</span><span className="Spv">{a.activities}</span></div>}
              {a.accomplishments && <div className="Spi"><span className="Spk">Accomplishments</span><span className="Spv">{a.accomplishments}</span></div>}
              {a.specificCareer && <div className="Spi"><span className="Spk">Considering</span><span className="Spv">{a.specificCareer}</span></div>}
            </div>
            <p className="Spp">This profile is included in your printed playbook for the counselor meeting.</p>
          </div>

          <div className="Pc" dangerouslySetInnerHTML={{ __html: fmt(playbook) }}/>
          <div className="Rf">
            <h3>Want the full 22-page research behind this playbook?</h3>
            <p>Explore 35+ careers scored for AI resistance. Contribute your perspective and download the complete research document.</p>
            <a href="https://thriving-shortbread-3bf879.netlify.app" target="_blank" rel="noopener noreferrer" className="Rc">Explore the Full Career Guide →</a>
          </div>
          <p className="Rx">Built by Babith Bhoopalan · Quantumleap Insights LLC · Research from WEF, Goldman Sachs, McKinsey, PwC, Stanford HAI, Anthropic, and 11 more.</p>
        </div>
      </div>}

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{background:#09090b;color:#e4e4e7}#root{min-height:100vh}
.R{font-family:'Outfit',sans-serif;min-height:100vh}

.W{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:40px 24px}
.Wo{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.o1{width:600px;height:600px;top:-200px;left:-100px;background:rgba(99,102,241,.08);animation:fl 20s infinite}
.o2{width:400px;height:400px;bottom:-100px;right:-50px;background:rgba(244,114,82,.06);animation:fl2 25s infinite}
.o3{width:300px;height:300px;top:40%;left:60%;background:rgba(16,185,129,.05);animation:fl 30s infinite reverse}
.Wc{position:relative;z-index:1;text-align:center;max-width:700px}
.Wb{display:inline-block;padding:7px 18px;border-radius:24px;font-size:11px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:#a5b4fc;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);margin-bottom:28px}
.Wh{font-family:'Instrument Serif',serif;font-size:clamp(32px,5.5vw,52px);line-height:1.1;font-weight:400;color:#fafafa;margin-bottom:18px}
.Wa{background:linear-gradient(135deg,#818cf8,#f47252);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.Ws{font-size:16px;color:#71717a;line-height:1.6;margin-bottom:32px;font-weight:300;max-width:560px;margin-left:auto;margin-right:auto}
.Wst{display:flex;align-items:center;justify-content:center;gap:28px;margin-bottom:36px;flex-wrap:wrap}
.Wsi{text-align:center}.Wn{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:500;color:#fafafa}
.Wl{font-size:12px;color:#52525b;max-width:160px;margin-top:4px;line-height:1.4}
.Wdv{width:1px;height:40px;background:rgba(255,255,255,.08)}
.Cb{display:inline-flex;align-items:center;gap:10px;padding:16px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:14px;font-size:17px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s;margin-bottom:28px;box-shadow:0 4px 24px rgba(99,102,241,.3)}
.Cb:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(99,102,241,.4)}
.Ww{display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:center;margin-bottom:28px}
.Wwi{font-size:13px;color:#71717a;font-weight:400}
.Wf{font-size:12px;color:#3f3f46;line-height:1.6}.Wf strong{color:#52525b}

.A{min-height:100vh;display:flex;flex-direction:column}
.Ah{display:flex;align-items:center;gap:16px;padding:16px 24px;border-bottom:1px solid rgba(255,255,255,.06);position:sticky;top:0;background:rgba(9,9,11,.95);backdrop-filter:blur(12px);z-index:10}
.Abk{background:none;border:none;color:#71717a;cursor:pointer;padding:6px;border-radius:8px;display:flex}.Abk:hover{color:#a1a1aa}
.Ap{flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.Afl{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;transition:width .4s}
.Asl{font-size:13px;color:#52525b;font-weight:500;white-space:nowrap}
.Aby{flex:1;display:flex;flex-direction:column;align-items:center;padding:40px 24px 100px}
.Q{max-width:580px;width:100%;animation:fiu .4s ease}
.Qn{font-family:'JetBrains Mono',monospace;font-size:13px;color:#6366f1;font-weight:500;margin-bottom:10px;letter-spacing:1px}
.Qt{font-family:'Instrument Serif',serif;font-size:28px;color:#fafafa;font-weight:400;margin-bottom:8px;line-height:1.2}
.Qd{font-size:15px;color:#71717a;margin-bottom:28px;font-weight:300}
.Qh{font-size:13px;color:#52525b;margin-top:12px;text-align:center}
.Qh2{font-size:13px;color:#52525b;margin-top:8px;font-style:italic}

.Ol{display:flex;flex-direction:column;gap:8px}
.Ob{display:flex;align-items:center;gap:12px;padding:16px 18px;width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;color:#d4d4d8;font-size:15px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;text-align:left}
.Ob:hover{border-color:rgba(99,102,241,.3);background:rgba(99,102,241,.05)}
.Ob.s{border-color:#6366f1;background:rgba(99,102,241,.1);color:#e4e4e7}
.Or{font-size:16px;color:#52525b;flex-shrink:0}.Ob.s .Or{color:#818cf8}
.Ob.hd{align-items:flex-start}.Om{font-weight:500}.Od{font-size:13px;color:#71717a;margin-top:2px}

.Ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.Ic{display:flex;align-items:center;gap:10px;padding:14px 16px;position:relative;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;text-align:left;flex-wrap:wrap}
.Ic:hover{border-color:rgba(99,102,241,.3)}.Ic.s{border-color:#6366f1;background:rgba(99,102,241,.1)}
.Ii{font-size:22px}.Il{font-size:14px;color:#d4d4d8;font-weight:500;flex:1}
.Ie{font-size:11px;color:#52525b;width:100%;padding-left:32px}
.Ik{position:absolute;top:8px;right:10px;width:22px;height:22px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:700}

.Sg{display:flex;flex-wrap:wrap;gap:8px}
.Sc{padding:12px 20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#d4d4d8;font-size:14px;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s;display:flex;align-items:center;gap:8px}
.Sc:hover{border-color:rgba(99,102,241,.3)}.Sc.s{border-color:#6366f1;background:rgba(99,102,241,.1);color:#e4e4e7}
.Sk{color:#818cf8;font-weight:700;font-size:13px}

.Ta,.Ta2{width:100%;padding:16px 18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#e4e4e7;font-size:15px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s;resize:vertical;min-height:100px;line-height:1.6}
.Ta:focus,.Ta2:focus{border-color:rgba(99,102,241,.4)}.Ta::placeholder,.Ta2::placeholder{color:#3f3f46}
.Ta2{min-height:80px}

.Tf{display:flex;flex-direction:column;gap:20px}
.Fl{font-size:14px;color:#a1a1aa;display:flex;flex-direction:column;gap:8px}
.Ti{width:100%;padding:14px 16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#e4e4e7;font-size:15px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .2s}
.Ti:focus{border-color:rgba(99,102,241,.4)}.Ti::placeholder{color:#3f3f46}

.An{margin-top:36px;display:flex;flex-direction:column;align-items:center;gap:12px}
.Nb{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .3s}
.Nb.ac{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 4px 20px rgba(99,102,241,.3)}
.Nb.ac:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(99,102,241,.4)}
.Nb.di{background:rgba(255,255,255,.05);color:#3f3f46;cursor:not-allowed}
.Ns{background:none;border:none;color:#52525b;font-size:13px;cursor:pointer;font-family:'Outfit',sans-serif;text-decoration:underline;text-underline-offset:3px}
.Ns:hover{color:#71717a}

.G{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
.Gc{text-align:center;max-width:440px;animation:fiu .5s ease}
.Gi{margin-bottom:28px;display:flex;justify-content:center}
.Gs{width:56px;height:56px;border:3px solid rgba(99,102,241,.15);border-top-color:#6366f1;border-radius:50%;animation:spin 1s linear infinite}
.Gt{font-family:'Instrument Serif',serif;font-size:26px;color:#fafafa;margin-bottom:10px}
.Gu{font-size:14px;color:#71717a;margin-bottom:28px}
.Gp{height:3px;background:rgba(255,255,255,.06);border-radius:2px;margin-bottom:28px;overflow:hidden}
.Gf{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);transition:width .5s;border-radius:2px}
.Gl{text-align:left}.Gx{font-size:13px;color:#3f3f46;padding:6px 0;transition:color .3s}.Gx.on{color:#818cf8}

.RE{min-height:100vh}
.Rh{position:sticky;top:0;z-index:10;padding:16px 24px;background:rgba(9,9,11,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06)}
.Ri{max-width:760px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.Rt{font-family:'Instrument Serif',serif;font-size:22px;color:#fafafa}
.Rsu{font-size:12px;color:#52525b;margin-top:2px}
.Ra{display:flex;gap:8px}
.Bn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .2s}
.Bn:hover{transform:translateY(-1px)}.Bn.sc{background:rgba(255,255,255,.06);color:#a1a1aa}

.Rb{max-width:760px;margin:0 auto;padding:32px 24px 60px}

.Sp{background:rgba(99,102,241,.04);border:1px solid rgba(99,102,241,.12);border-radius:16px;padding:24px;margin-bottom:32px}
.Spt{font-family:'Instrument Serif',serif;font-size:19px;color:#fafafa;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08)}
.Spr{display:flex;flex-direction:column;gap:8px}
.Spi{display:flex;gap:12px;font-size:14px;align-items:flex-start}
.Spk{color:#818cf8;font-weight:600;min-width:130px;flex-shrink:0;font-size:13px}
.Spv{color:#d4d4d8;line-height:1.5}
.Spp{font-size:12px;color:#52525b;margin-top:14px;font-style:italic}

.Pc{line-height:1.75;color:#d4d4d8}.Pc p{margin:0 0 14px;font-size:15px}.Pc strong{color:#fafafa}
.ph2{font-family:'Instrument Serif',serif;font-size:22px;color:#fafafa;margin:36px 0 16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08)}
.Pc .ph2:first-child{margin-top:0}
.ph3{font-size:17px;color:#a5b4fc;margin:24px 0 10px;font-weight:600}
.pli{display:flex;gap:10px;margin:6px 0;font-size:15px;align-items:flex-start}
.pd{width:6px;height:6px;border-radius:50%;background:#6366f1;flex-shrink:0;margin-top:9px}
.pni{display:flex;gap:12px;margin:8px 0;font-size:15px;align-items:flex-start}
.pn{font-family:'JetBrains Mono',monospace;color:#818cf8;font-weight:600;font-size:14px;flex-shrink:0;margin-top:2px}
.pb-hr{border:none;border-top:1px solid rgba(255,255,255,.08);margin:32px 0}

.Rf{margin-top:40px;padding:28px;background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);border-radius:16px;text-align:center}
.Rf h3{font-family:'Instrument Serif',serif;font-size:20px;color:#fafafa;margin-bottom:8px}
.Rf p{font-size:14px;color:#71717a;margin-bottom:16px}
.Rc{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s}
.Rc:hover{transform:translateY(-1px)}
.Rx{text-align:center;font-size:11px;color:#3f3f46;margin-top:24px;line-height:1.6}

@keyframes fiu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
@keyframes fl2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,30px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:600px){.Wst{flex-direction:column;gap:16px}.Wdv{width:40px;height:1px}.Ig{grid-template-columns:1fr}.Ri{flex-direction:column;align-items:flex-start}.Spi{flex-direction:column;gap:2px}.Spk{min-width:auto}}
      `}</style>
    </div>
  );
}

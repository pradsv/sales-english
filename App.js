import React from "react";
import { useState, useEffect, useRef } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const ALL_LESSONS = [
  { id:1, category:"Ouverture", emoji:"📞", title:"Cold call ouverture", difficulty:1,
    setup:"Un VP Sales américain décroche votre appel à froid.",
    prompt:"Il dit : \"Yeah, who's this?\" — Vous répondez ?",
    hint:"Nom + entreprise + valeur + question fermée. Max 2 phrases.",
    keywords:["hi","hello","calling","from","help","do you","we","i'm","reach"],
    model:"Hi John — it's [Prénom] from [Entreprise]. We help sales teams like yours cut ramp time by 40%. Do you have 90 seconds?",
    tip:"Ne demandez JAMAIS 'is this a good time?' — ça invite au refus direct." },
  { id:2, category:"Objection", emoji:"🛡️", title:"Send me info", difficulty:1,
    setup:"Votre prospect veut se débarrasser de vous poliment.",
    prompt:"\"Just send me some info and I'll get back to you.\" — Vous faites quoi ?",
    hint:"Acceptez, puis requalifiez avec une question.",
    keywords:["happy","send","before","quick question","what","specifically","worth","rather"],
    model:"Happy to send something. Before I do — what's the one thing you'd need to see to make a 20-min call worth it?",
    tip:"'Send me info' = objection polie. La parade : accepter + question qui requalifie l'intention." },
  { id:3, category:"Pitch", emoji:"⚡", title:"Value prop 15 secondes", difficulty:1,
    setup:"Un CTO vous croise à un événement. 15 secondes chrono.",
    prompt:"\"So what does your company actually do?\" — Votre réponse ?",
    hint:"Structure : We help [qui] [résultat chiffré] [sans quoi].",
    keywords:["help","companies","teams","reduce","increase","faster","without","so that","we"],
    model:"We help B2B sales teams close their first enterprise deal 2x faster — without adding headcount.",
    tip:"Jamais de feature. Toujours un outcome chiffré. Testez avec 'so what?' après chaque phrase." },
  { id:4, category:"Email", emoji:"📧", title:"Relance email", difficulty:2,
    setup:"Votre prospect n'a pas répondu depuis 5 jours.",
    prompt:"Écrivez une relance email percutante. Objet compris. Max 3 phrases.",
    hint:"Ajoutez un élément nouveau (news, trigger). Évitez 'just following up'.",
    keywords:["subject","re:","saw","thought","still","relevant","worth","open","quick"],
    model:"Subject: Re: [sujet]\n\nJohn — saw [leur concurrent] just announced a new product. Thought this might land differently now. Still worth a quick call this week?",
    tip:"La meilleure relance apporte un contexte nouveau. 'Just following up' = à bannir définitivement." },
  { id:5, category:"Closing", emoji:"🤝", title:"Next step closing", difficulty:2,
    setup:"La démo s'est bien passée. Prospect intéressé mais flou.",
    prompt:"\"This looks interesting, let's stay in touch.\" — Comment vous closez une next step ?",
    hint:"Objectif : une date + identifier les vrais décideurs.",
    keywords:["great","next step","schedule","calendar","who else","decision","thursday","friday","when","week"],
    model:"Glad it resonated! Who else needs to be in the room for a decision like this — and are you free Thursday for a 30-min call with them?",
    tip:"'Stay in touch' sans date = deal mort dans 80% des cas. Toujours sortir avec un nom ET une date." },
  { id:6, category:"Négociation", emoji:"💰", title:"Budget objection", difficulty:2,
    setup:"Votre prospect trouve votre offre trop chère.",
    prompt:"\"Your price is way higher than what we budgeted.\" — Vous répondez comment ?",
    hint:"Ne défendez pas le prix. Recentrez sur la valeur et qualifiez le budget réel.",
    keywords:["understand","help me","what","budget","value","roi","if","compared","based on","invest"],
    model:"I hear you. Help me understand — what were you budgeting, and what would the ROI need to look like for this to make sense?",
    tip:"Ne jamais défendre le prix en premier. Qualifier le budget réel + ROI attendu avant toute négociation." },
  { id:7, category:"Discovery", emoji:"🔍", title:"Pain point discovery", difficulty:2,
    setup:"Vous êtes en call de découverte. Le prospect est vague sur ses problèmes.",
    prompt:"\"Things are going pretty well for us right now.\" — Comment vous creusez ?",
    hint:"Demandez ce qui se passerait si le statu quo continue.",
    keywords:["what","if","imagine","happen","cost","miss","without","how","tell me","when"],
    model:"Glad to hear it. What happens if things stay exactly as they are for the next 12 months — is that okay for your targets?",
    tip:"'Things are fine' = prospect non qualifié ou non conscient. Projetez-les dans le futur pour révéler la douleur latente." },
  { id:8, category:"Ouverture", emoji:"📞", title:"Gatekeeper bypass", difficulty:3,
    setup:"L'assistante filtre vos appels avant le décideur.",
    prompt:"\"Can I ask what this is regarding?\" — Votre réponse ?",
    hint:"Soyez précis et professionnel. Pas de vente, juste un message clair.",
    keywords:["calling","regarding","message","specifically","briefly","reach","spoke","asked","mentioned"],
    model:"Of course — I'm calling about a specific project related to [their initiative]. Could you let him know [Prénom] from [Entreprise] called? I'll also send a quick email.",
    tip:"Traitez l'assistante comme une alliée, pas un obstacle. Précision + respect = meilleur taux de passage." },
  { id:9, category:"Email", emoji:"📧", title:"Cold email ouverture", difficulty:2,
    setup:"Vous envoyez un premier email à froid à un DG.",
    prompt:"Écrivez les 2 premières phrases de votre cold email. Objet compris.",
    hint:"L'objet doit générer de la curiosité. La première phrase parle d'eux, pas de vous.",
    keywords:["subject","noticed","saw","your","company","team","i","we","help","question"],
    model:"Subject: [Leur entreprise] + [résultat spécifique]\n\nNoticed you just expanded to 3 new markets — most companies at that stage struggle with consistent sales messaging across regions.",
    tip:"Règle d'or : l'objet = curiosité, la ligne 1 = eux. Ne commencez jamais par 'I' ou 'We'." },
  { id:10, category:"Closing", emoji:"🤝", title:"Multistakeholder close", difficulty:3,
    setup:"Votre champion interne vous dit qu'il doit consulter son équipe.",
    prompt:"\"I need to run this by my team before we move forward.\" — Vous répondez ?",
    hint:"Proposez d'être présent pour la présentation interne.",
    keywords:["happy","join","presentation","help","prepare","who","what","concerns","together","make it easier"],
    model:"Totally makes sense. Would it be helpful if I joined that conversation? I can address any technical questions directly and make it easier for your team to say yes.",
    tip:"Ne laissez jamais votre champion vendre seul en interne. Offrez toujours de co-pitcher avec lui." },
];

const BADGES = [
  { id:"first", label:"Premier pas", emoji:"🌱", condition: s => s.totalDone >= 1 },
  { id:"streak3", label:"3 jours de suite", emoji:"🔥", condition: s => s.streak >= 3 },
  { id:"perfect", label:"Réponse parfaite", emoji:"⭐", condition: s => s.perfectCount >= 1 },
  { id:"explorer", label:"5 situations", emoji:"🗺️", condition: s => s.totalDone >= 5 },
  { id:"streak7", label:"Semaine complète", emoji:"🏆", condition: s => s.streak >= 7 },
  { id:"master", label:"10 situations", emoji:"💎", condition: s => s.totalDone >= 10 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function loadState() {
  try {
    const raw = localStorage.getItem("salesenglish_v2");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    streak: 0,
    lastDay: null,
    totalDone: 0,
    perfectCount: 0,
    xp: 0,
    level: 1,
    doneToday: [],
    earnedBadges: [],
    history: [],
  };
}

function saveState(s) {
  try { localStorage.setItem("salesenglish_v2", JSON.stringify(s)); } catch {}
}

function getLevel(xp) {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  if (xp < 500) return 4;
  return 5;
}

function xpForLevel(lvl) {
  const thresholds = [0, 50, 150, 300, 500];
  return thresholds[Math.min(lvl - 1, thresholds.length - 1)];
}

function xpNextLevel(lvl) {
  const thresholds = [50, 150, 300, 500, 800];
  return thresholds[Math.min(lvl - 1, thresholds.length - 1)];
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StreakFlame({ count }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
      <span style={{ fontSize:"20px", filter: count > 0 ? "none" : "grayscale(1) opacity(0.4)" }}>🔥</span>
      <span style={{
        fontFamily:"'DM Mono',monospace", fontSize:"15px", fontWeight:700,
        color: count > 0 ? "#ff6b35" : "#444"
      }}>{count}</span>
    </div>
  );
}

function XPBar({ xp, level }) {
  const base = xpForLevel(level);
  const next = xpNextLevel(level);
  const pct = Math.min(100, ((xp - base) / (next - base)) * 100);
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
        <span style={{ color:"#8a8aaa", fontSize:"11px" }}>Niveau {level}</span>
        <span style={{ color:"#8a8aaa", fontSize:"11px", fontFamily:"'DM Mono',monospace" }}>{xp} XP</span>
      </div>
      <div style={{ background:"#1e1e2e", borderRadius:"4px", height:"6px", overflow:"hidden" }}>
        <div style={{
          width:`${pct}%`, height:"100%",
          background:"linear-gradient(90deg, #00e5a0, #00b4d8)",
          borderRadius:"4px",
          transition:"width 0.8s cubic-bezier(.4,0,.2,1)"
        }} />
      </div>
    </div>
  );
}

function BadgeGrid({ earned }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
      {BADGES.map(b => {
        const got = earned.includes(b.id);
        return (
          <div key={b.id} style={{
            background: got ? "#1a2a1e" : "#12121a",
            border: `1px solid ${got ? "#00e5a040" : "#1e1e2e"}`,
            borderRadius:"12px", padding:"10px 8px",
            textAlign:"center", opacity: got ? 1 : 0.4,
            transition:"all 0.3s"
          }}>
            <div style={{ fontSize:"22px", marginBottom:"4px" }}>{b.emoji}</div>
            <div style={{ color: got ? "#00e5a0" : "#4a4a6a", fontSize:"10px", fontWeight:600, lineHeight:1.3 }}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("home"); // home | chat | stats | badges
  const [gameState, setGameState] = useState(loadState);
  const [lesson, setLesson] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatStep, setChatStep] = useState("idle"); // idle | question | answered | tip
  const [showHint, setShowHint] = useState(false);
  const [xpGain, setXpGain] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { saveState(gameState); }, [gameState]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages, botTyping]);

  const pickLesson = () => {
    const available = ALL_LESSONS.filter(l => !gameState.doneToday.includes(l.id));
    if (!available.length) return ALL_LESSONS[Math.floor(Math.random() * ALL_LESSONS.length)];
    return available[Math.floor(Math.random() * available.length)];
  };

  const startLesson = () => {
    const l = pickLesson();
    setLesson(l);
    setChatMessages([]);
    setShowHint(false);
    setInput("");
    setChatStep("question");
    setBotTyping(true);
    setTab("chat");
    setTimeout(() => {
      setChatMessages([
        { from:"bot", text:`${l.emoji} *${l.category}* — ${l.title}`, meta:true },
        { from:"bot", text:l.setup },
      ]);
      setTimeout(() => {
        setChatMessages(m => [...m, { from:"bot", text:l.prompt, highlight:true }]);
        setBotTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 500);
    }, 600);
  };

  const evaluate = () => {
    if (!input.trim() || chatStep !== "question") return;
    const lower = input.toLowerCase();
    const isGood = lesson.keywords.some(k => lower.includes(k));
    const xpEarned = isGood ? 15 : 8;
    const perfect = isGood && input.length > 20;

    setChatMessages(m => [...m, { from:"user", text:input }]);
    setInput("");
    setBotTyping(true);
    setChatStep("answered");

    setTimeout(() => {
      setChatMessages(m => [...m,
        { from:"bot", text: isGood ? "✅ Bonne approche !" : "🔄 Pas mal — voici comment un top performer le dirait :", positive: isGood },
        { from:"bot", text:`📌 Modèle :\n${lesson.model}`, model:true },
      ]);
      setTimeout(() => {
        setChatMessages(m => [...m, { from:"bot", text: lesson.tip, tip:true }]);
        setBotTyping(false);
        setChatStep("tip");

        // Update state
        const today = getToday();
        setGameState(prev => {
          const newStreak = prev.lastDay === today
            ? prev.streak
            : prev.lastDay === new Date(Date.now() - 86400000).toISOString().split("T")[0]
            ? prev.streak + 1
            : 1;
          const newXp = prev.xp + xpEarned;
          const newLevel = getLevel(newXp);
          const newTotal = prev.totalDone + 1;
          const newPerfect = prev.perfectCount + (perfect ? 1 : 0);
          const newDoneToday = prev.lastDay === today
            ? [...prev.doneToday, lesson.id]
            : [lesson.id];
          const newHistory = [...(prev.history || []), { id:lesson.id, date:today, xp:xpEarned, ok:isGood }].slice(-50);

          const nextState = {
            ...prev,
            streak: newStreak,
            lastDay: today,
            xp: newXp,
            level: newLevel,
            totalDone: newTotal,
            perfectCount: newPerfect,
            doneToday: newDoneToday,
            history: newHistory,
          };

          // Check badges
          const earned = [...prev.earnedBadges];
          const fresh = [];
          BADGES.forEach(b => {
            if (!earned.includes(b.id) && b.condition(nextState)) {
              earned.push(b.id);
              fresh.push(b);
            }
          });
          nextState.earnedBadges = earned;
          if (fresh.length) setNewBadges(fresh);
          setXpGain(xpEarned);
          setTimeout(() => setXpGain(null), 2500);
          setTimeout(() => setNewBadges([]), 4000);
          return nextState;
        });
      }, 400);
    }, 700);
  };

  const difficultyDots = (d) => [1,2,3].map(i => (
    <span key={i} style={{
      display:"inline-block", width:"5px", height:"5px", borderRadius:"50%", marginRight:"2px",
      background: i <= d ? "#00e5a0" : "#2a2a3a"
    }} />
  ));

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight:"100vh", background:"#07070f",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif", padding:"16px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea,input{resize:none;}
        textarea:focus,input:focus{outline:none;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px;}
        .msg-in{animation:msgIn 0.25s ease;}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn{transition:all 0.2s;}
        .tab-btn:hover{opacity:0.8;}
        .xp-pop{animation:xpFloat 2s ease forwards;}
        @keyframes xpFloat{0%{opacity:0;transform:translateY(0)}20%{opacity:1}80%{opacity:1;transform:translateY(-40px)}100%{opacity:0;transform:translateY(-60px)}}
        .badge-pop{animation:badgePop 0.5s cubic-bezier(.175,.885,.32,1.275);}
        @keyframes badgePop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
        .streak-glow{animation:glow 2s ease-in-out infinite alternate;}
        @keyframes glow{from{text-shadow:0 0 8px #ff6b3540}to{text-shadow:0 0 20px #ff6b3580}}
        .pulse{animation:pulse 2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        .dot-bounce{display:inline-block;animation:bounce 1s ease-in-out infinite;}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      `}</style>

      {/* Phone shell */}
      <div style={{
        width:"100%", maxWidth:"390px",
        background:"#0d0d18",
        borderRadius:"32px",
        overflow:"hidden",
        boxShadow:"0 0 0 1px #1e1e30, 0 50px 100px rgba(0,0,0,0.7)",
        height:"780px",
        display:"flex", flexDirection:"column",
        position:"relative"
      }}>

        {/* XP float */}
        {xpGain && (
          <div className="xp-pop" style={{
            position:"absolute", top:"80px", right:"24px", zIndex:999,
            color:"#00e5a0", fontWeight:700, fontSize:"18px",
            fontFamily:"'DM Mono',monospace",
            pointerEvents:"none"
          }}>+{xpGain} XP</div>
        )}

        {/* Badge notification */}
        {newBadges.map((b,i) => (
          <div key={b.id} className="badge-pop" style={{
            position:"absolute", top:`${70 + i*60}px`, left:"50%",
            transform:"translateX(-50%)", zIndex:999,
            background:"#1a2a1e", border:"1px solid #00e5a0",
            borderRadius:"20px", padding:"8px 16px",
            display:"flex", alignItems:"center", gap:"8px",
            boxShadow:"0 8px 24px rgba(0,229,160,0.2)"
          }}>
            <span style={{ fontSize:"20px" }}>{b.emoji}</span>
            <div>
              <div style={{ color:"#00e5a0", fontSize:"11px", fontWeight:600 }}>Badge débloqué !</div>
              <div style={{ color:"#aaa", fontSize:"12px" }}>{b.label}</div>
            </div>
          </div>
        ))}

        {/* Status bar */}
        <div style={{
          background:"#07070f", padding:"12px 24px 8px",
          display:"flex", justifyContent:"space-between", alignItems:"center"
        }}>
          <span style={{ color:"#6a6a8a", fontSize:"12px", fontFamily:"'DM Mono',monospace" }}>
            {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
          </span>
          <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
            {[3,5,4].map((h,i) => <div key={i} style={{width:"3px",height:`${h*2}px`,background:"#6a6a8a",borderRadius:"2px"}} />)}
            <div style={{ width:"18px", height:"9px", border:"1px solid #6a6a8a", borderRadius:"2px", marginLeft:"4px", position:"relative" }}>
              <div style={{ width:"70%", height:"100%", background:"#6a6a8a", borderRadius:"1px" }} />
            </div>
          </div>
        </div>

        {/* App header */}
        <div style={{
          background:"#0d0d18", borderBottom:"1px solid #1a1a2a",
          padding:"8px 20px 12px",
          display:"flex", alignItems:"center", justifyContent:"space-between"
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
              width:"36px", height:"36px",
              background:"linear-gradient(135deg,#00e5a0,#00b4d8)",
              borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"18px"
            }}>🇬🇧</div>
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:"14px" }}>Sales English</div>
              <div style={{ color:"#4a4a6a", fontSize:"10px" }}>by Activateur Formation</div>
            </div>
          </div>
          <StreakFlame count={gameState.streak} />
        </div>

        {/* Content area */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>

          {/* ── HOME ── */}
          {tab === "home" && (
            <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>

              {/* XP Card */}
              <div style={{
                background:"linear-gradient(135deg,#0f1f1a,#0a1a28)",
                border:"1px solid #1a3a2a",
                borderRadius:"20px", padding:"20px",
                marginBottom:"12px"
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
                  <div>
                    <div style={{ color:"#6a8a7a", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"4px" }}>Progression</div>
                    <div style={{ color:"#fff", fontSize:"24px", fontWeight:700 }}>
                      {gameState.totalDone} <span style={{ color:"#4a6a5a", fontSize:"14px", fontWeight:400 }}>situations</span>
                    </div>
                  </div>
                  <div style={{
                    background:"#00e5a020", border:"1px solid #00e5a040",
                    borderRadius:"12px", padding:"6px 12px",
                    color:"#00e5a0", fontSize:"12px", fontWeight:600,
                    fontFamily:"'DM Mono',monospace"
                  }}>
                    Niv. {gameState.level}
                  </div>
                </div>
                <XPBar xp={gameState.xp} level={gameState.level} />
              </div>

              {/* Stats row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginBottom:"12px" }}>
                {[
                  { label:"Streak", value: gameState.streak > 0 ? `${gameState.streak}j` : "—", color:"#ff6b35", emoji:"🔥" },
                  { label:"XP total", value:`${gameState.xp}`, color:"#00e5a0", emoji:"⚡" },
                  { label:"Parfaits", value:`${gameState.perfectCount}`, color:"#ffd700", emoji:"⭐" },
                ].map((s,i) => (
                  <div key={i} style={{
                    background:"#12121e", border:"1px solid #1e1e2e",
                    borderRadius:"14px", padding:"12px 10px", textAlign:"center"
                  }}>
                    <div style={{ fontSize:"18px", marginBottom:"4px" }}>{s.emoji}</div>
                    <div style={{ color:s.color, fontWeight:700, fontSize:"16px", fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
                    <div style={{ color:"#4a4a6a", fontSize:"10px", marginTop:"2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="pulse" onClick={startLesson} style={{
                width:"100%", background:"linear-gradient(135deg,#00e5a0,#00c4a8)",
                border:"none", borderRadius:"18px", padding:"18px",
                color:"#07070f", fontSize:"15px", fontWeight:700,
                cursor:"pointer", marginBottom:"12px",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                fontFamily:"'DM Sans',sans-serif"
              }}>
                <span style={{ fontSize:"20px" }}>💼</span>
                Situation du jour
              </button>

              {/* Lesson list preview */}
              <div style={{ color:"#4a4a6a", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px", padding:"0 4px" }}>
                10 situations disponibles
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {ALL_LESSONS.slice(0,5).map(l => (
                  <div key={l.id} onClick={() => { setLesson(l); startLesson(); }} style={{
                    background:"#12121e", border:"1px solid #1e1e2e",
                    borderRadius:"14px", padding:"12px 14px",
                    display:"flex", alignItems:"center", gap:"10px",
                    cursor:"pointer", transition:"border-color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#2e2e4e"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#1e1e2e"}
                  >
                    <span style={{ fontSize:"20px" }}>{l.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#c8c8e8", fontSize:"13px", fontWeight:500 }}>{l.title}</div>
                      <div style={{ color:"#4a4a6a", fontSize:"11px", marginTop:"1px" }}>{l.category}</div>
                    </div>
                    <div>{difficultyDots(l.difficulty)}</div>
                    {gameState.doneToday.includes(l.id) && (
                      <span style={{ color:"#00e5a0", fontSize:"14px" }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CHAT ── */}
          {tab === "chat" && (
            <>
              <div style={{ flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:"8px" }}>
                {chatMessages.map((msg,i) => (
                  <div key={i} className="msg-in" style={{
                    display:"flex",
                    justifyContent: msg.from === "user" ? "flex-end" : "flex-start"
                  }}>
                    <div style={{
                      maxWidth:"88%",
                      padding: msg.meta ? "4px 10px" : "10px 14px",
                      borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      fontSize: msg.meta ? "11px" : "13px",
                      lineHeight:1.55,
                      whiteSpace:"pre-wrap",
                      fontStyle: msg.meta ? "italic" : "normal",
                      background: msg.from === "user"
                        ? "linear-gradient(135deg,#005f8a,#0077b6)"
                        : msg.meta ? "transparent"
                        : msg.highlight ? "#1a1a30"
                        : msg.model ? "#0f201a"
                        : msg.tip ? "#1f1a08"
                        : msg.positive ? "#0d1f12"
                        : "#1a1a26",
                      border: msg.highlight ? "1px solid #3030568a"
                        : msg.model ? "1px solid #00e5a025"
                        : msg.tip ? "1px solid #e5c00025"
                        : msg.positive ? "1px solid #00e5a035"
                        : "none",
                      color: msg.from === "user" ? "#fff"
                        : msg.meta ? "#3a3a5a"
                        : msg.positive ? "#00e5a0"
                        : msg.model ? "#a0e8c8"
                        : msg.tip ? "#d4b860"
                        : "#c0c0e0"
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {botTyping && (
                  <div className="msg-in" style={{ display:"flex", gap:"5px", padding:"14px 16px", alignItems:"center" }}>
                    {[0,1,2].map(i => (
                      <div key={i} className="dot-bounce" style={{
                        width:"7px", height:"7px", borderRadius:"50%",
                        background:"#3a3a5a",
                        animationDelay:`${i*0.15}s`
                      }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div style={{ borderTop:"1px solid #1a1a2a", padding:"10px 14px", background:"#0a0a14" }}>
                {chatStep === "tip" ? (
                  <div style={{ display:"flex", gap:"8px" }}>
                    <button onClick={startLesson} style={{
                      flex:1, background:"linear-gradient(135deg,#00e5a0,#00c4a8)",
                      border:"none", borderRadius:"14px", padding:"12px",
                      color:"#07070f", fontWeight:700, fontSize:"13px",
                      cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
                    }}>Suivante →</button>
                    <button onClick={() => setTab("home")} style={{
                      background:"#1a1a26", border:"1px solid #2a2a3a",
                      borderRadius:"14px", padding:"12px 14px",
                      color:"#8a8aaa", fontSize:"13px",
                      cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
                    }}>🏠</button>
                  </div>
                ) : (
                  <>
                    {showHint && (
                      <div style={{
                        background:"#1f1a08", border:"1px solid #e5c00030",
                        borderRadius:"10px", padding:"8px 12px", marginBottom:"8px",
                        color:"#d4b860", fontSize:"12px"
                      }}>💡 {lesson?.hint}</div>
                    )}
                    <div style={{ display:"flex", gap:"8px", alignItems:"flex-end" }}>
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();evaluate();} }}
                        placeholder="Répondez en anglais…"
                        rows={2}
                        style={{
                          flex:1, background:"#1a1a26", border:"1px solid #2a2a3a",
                          borderRadius:"12px", padding:"10px 13px",
                          color:"#e0e0f0", fontSize:"13px",
                          fontFamily:"'DM Sans',sans-serif", lineHeight:1.5
                        }}
                      />
                      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                        <button onClick={evaluate} style={{
                          background: input.trim() ? "#00e5a0" : "#1e1e30",
                          border:"none", borderRadius:"10px",
                          width:"40px", height:"40px",
                          color: input.trim() ? "#07070f" : "#4a4a6a",
                          fontSize:"16px", cursor:"pointer", transition:"all 0.2s",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontWeight:700
                        }}>→</button>
                        <button onClick={() => setShowHint(h=>!h)} style={{
                          background:"#1f1a08", border:"1px solid #e5c00030",
                          borderRadius:"10px", width:"40px", height:"40px",
                          color:"#d4b860", fontSize:"14px", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center"
                        }}>💡</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── STATS ── */}
          {tab === "stats" && (
            <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
              <div style={{ color:"#6a6a8a", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>
                Votre parcours
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"16px" }}>
                {[
                  { label:"Situations faites", value:gameState.totalDone, color:"#00e5a0" },
                  { label:"XP total", value:gameState.xp, color:"#00b4d8" },
                  { label:"Streak actuel", value:`${gameState.streak}j 🔥`, color:"#ff6b35" },
                  { label:"Parfaits", value:gameState.perfectCount, color:"#ffd700" },
                  { label:"Niveau", value:gameState.level, color:"#a78bfa" },
                  { label:"Badges", value:gameState.earnedBadges.length, color:"#f472b6" },
                ].map((s,i) => (
                  <div key={i} style={{
                    background:"#12121e", border:"1px solid #1e1e2e",
                    borderRadius:"14px", padding:"14px"
                  }}>
                    <div style={{ color:"#4a4a6a", fontSize:"11px", marginBottom:"6px" }}>{s.label}</div>
                    <div style={{ color:s.color, fontSize:"22px", fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ color:"#6a6a8a", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>
                Historique récent
              </div>
              {(gameState.history || []).slice(-10).reverse().map((h,i) => {
                const l = ALL_LESSONS.find(x => x.id === h.id);
                return (
                  <div key={i} style={{
                    background:"#12121e", border:"1px solid #1e1e2e",
                    borderRadius:"12px", padding:"10px 14px",
                    display:"flex", alignItems:"center", gap:"10px",
                    marginBottom:"6px"
                  }}>
                    <span style={{ fontSize:"16px" }}>{l?.emoji || "💼"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#c0c0e0", fontSize:"12px" }}>{l?.title || "Situation"}</div>
                      <div style={{ color:"#4a4a6a", fontSize:"10px" }}>{h.date}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ color: h.ok ? "#00e5a0" : "#ff6b35", fontSize:"12px" }}>{h.ok ? "✓" : "~"}</span>
                      <span style={{ color:"#00b4d8", fontSize:"11px", fontFamily:"'DM Mono',monospace" }}>+{h.xp}</span>
                    </div>
                  </div>
                );
              })}
              {!gameState.history?.length && (
                <div style={{ color:"#3a3a5a", fontSize:"13px", textAlign:"center", padding:"32px 0" }}>
                  Aucune session encore.<br/>Commencez votre première situation !
                </div>
              )}
            </div>
          )}

          {/* ── BADGES ── */}
          {tab === "badges" && (
            <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
              <div style={{ color:"#6a6a8a", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>
                {gameState.earnedBadges.length}/{BADGES.length} badges débloqués
              </div>
              <BadgeGrid earned={gameState.earnedBadges} />
              <div style={{
                background:"#12121e", border:"1px solid #1e1e2e",
                borderRadius:"16px", padding:"16px", marginTop:"16px"
              }}>
                <div style={{ color:"#6a6a8a", fontSize:"11px", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                  Ce dispositif dans votre OF
                </div>
                <div style={{ color:"#8a8aaa", fontSize:"13px", lineHeight:1.6 }}>
                  10 → 30 situations · Tableau de bord apprenants · White label · À partir de 290€/mois
                </div>
                <div style={{
                  marginTop:"12px", padding:"8px 14px",
                  background:"#0f1f1a", border:"1px solid #00e5a030",
                  borderRadius:"10px", color:"#00e5a0", fontSize:"12px"
                }}>
                  → activateur-formation.com
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{
          background:"#0a0a14", borderTop:"1px solid #1a1a2a",
          display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          padding:"8px 0 16px"
        }}>
          {[
            { id:"home", emoji:"🏠", label:"Accueil" },
            { id:"chat", emoji:"💬", label:"Pratiquer" },
            { id:"stats", emoji:"📊", label:"Stats" },
            { id:"badges", emoji:"🏅", label:"Badges" },
          ].map(t => (
            <button key={t.id} className="tab-btn" onClick={() => t.id === "chat" ? startLesson() : setTab(t.id)} style={{
              background:"none", border:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"3px",
              padding:"6px 0"
            }}>
              <span style={{ fontSize:"20px", filter: tab === t.id ? "none" : "grayscale(0.5) opacity(0.5)" }}>{t.emoji}</span>
              <span style={{
                color: tab === t.id ? "#00e5a0" : "#3a3a5a",
                fontSize:"10px", fontWeight: tab === t.id ? 600 : 400
              }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

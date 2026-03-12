import { useState, useEffect, useRef } from "react";

const priceDisplay = (p) => ["$", "$$", "$$$", "$$$$"][(p ?? 2) - 1] ?? "$$";

const C = {
  bg:           "#1a2e35",
  bgCard:       "#243840",
  bgInner:      "#1e333b",
  primary:      "#FFF3B0",
  accent:       "#E09F3E",
  accentHover:  "#c98a30",
  teal:         "#335C67",
  text:         "#F5F0E4",
  muted:        "#8BAAB3",
  light:        "#5a7a85",
  border:       "#2e4a54",
  pillBg:       "#2a424c",
  matchBorder:  "#3a5a65",
};

const FAKE_RESTAURANTS = [
  {
    restaurant_name: "Zavino",
    business_id: "_LOJW0XkOpj4O348GVRDeQ",
    stars: 5.0,
    price_range: 2,
    recommendation_type: "primary",
    why_it_fits: "Zavino offers a calm and intimate setting with perfectly romantic lighting, making it ideal for a date night with classic Italian comfort food that's reasonably priced.",
    highlight: "Intimate but casual — perfectly romantic lighting.",
  },
  {
    restaurant_name: "L'Angolo Ristorante",
    business_id: "dYinIkKBspHV5hSaukklFg",
    stars: 5.0,
    price_range: 2,
    recommendation_type: "primary",
    why_it_fits: "This tiny and charming BYOB spot provides an authentic Italian experience with homemade pastas, offering a wonderfully quiet and romantic ambiance perfect for a date.",
    highlight: "So tiny and charming — great for a first date!",
  },
  {
    restaurant_name: "Dante & Luigi's",
    business_id: "erz6oUEJdx787WyOlxMARw",
    stars: 5.0,
    price_range: 2,
    recommendation_type: "primary",
    why_it_fits: "For an old-world Italian experience, Dante & Luigi's offers a vintage home setting and classic dining room feel — calm, romantic, and fantastic value.",
    highlight: "A vintage Italian home setting with a classic dining room feel.",
  },
  {
    restaurant_name: "Gran Caffe L'Aquila",
    business_id: "-cEFKAznWmI0cledNOIQ7w",
    stars: 5.0,
    price_range: 2,
    recommendation_type: "wildcard",
    why_it_fits: "A fun alternative with authentic Italian cuisine — quiet and somewhat romantic, with delicious pasta, wine, and gelato.",
    highlight: "The ambiance is quiet and somewhat romantic — a great spot for a date!",
  },
  {
    restaurant_name: "Burrata",
    business_id: "oVwEPg-BADIFl2SlGma6jg",
    stars: 5.0,
    price_range: 2,
    recommendation_type: "wildcard",
    why_it_fits: "Burrata is a cozy and intimate BYOB spot known for its fresh, homemade Italian food — perfect for a romantic date night.",
    highlight: "Cozy and intimate vibes. Food is homemade, fresh, and local.",
  },
];

const FAKE_COMMUNITY = "Italian & Mediterranean";
const FAKE_CITY = "Philadelphia";

const PROMPT_SUGGESTIONS = [
  ["cozy", "Italian", "date"],
  ["lively", "group", "birthday"],
  ["cheap", "quick", "lunch"],
  ["fancy", "romantic", "dinner"],
  ["outdoor", "brunch", "chill"],
  ["late night", "divey", "casual"],
  ["vegetarian", "healthy", "fresh"],
  ["upscale", "impressive", "special"],
];

const REJECTION_REASONS = [
  "Been there before",
  "Not what I'm looking for",
  "Too expensive",
  "Too far away",
  "Not in the mood for that cuisine",
];

const bf = { fontFamily: "'Georgia', serif" };
const display = { fontFamily: "'Righteous', 'Georgia', sans-serif" };

// Unique thread ID per session — keeps LangGraph MemorySaver state separate per user
const generateThreadId = () => `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const RestaurantCard = ({ restaurant, onDismiss, onSelect, dismissed }) => {
  const [showReasons, setShowReasons] = useState(false);
  if (dismissed) return null;
  const isPrimary = restaurant.recommendation_type === "primary";

  return (
    <div style={{
      background: C.bgCard, borderRadius: 16, padding: 24, marginBottom: 16,
      border: `1px solid ${C.border}`,
      boxShadow: isPrimary ? `0 4px 24px rgba(224,159,62,0.15)` : "0 2px 12px rgba(0,0,0,0.2)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: isPrimary ? C.accent : C.muted, textTransform: "uppercase", ...bf }}>
            {isPrimary ? "Top Pick" : "Surprise Pick"}
          </span>
          <h3 style={{ margin: "4px 0 2px", fontSize: 22, ...bf, color: C.primary, fontWeight: 700 }}>
            {restaurant.restaurant_name}
          </h3>
          <p style={{ margin: 0, color: C.muted, fontSize: 13, ...bf }}>
            {priceDisplay(restaurant.price_range)} · ★ {restaurant.stars}
          </p>
        </div>
        <div style={{
          background: isPrimary ? C.accent : C.teal,
          color: "#fff", borderRadius: 99, padding: "5px 14px",
          fontSize: 11, fontWeight: 700, ...bf, whiteSpace: "nowrap",
          alignSelf: "flex-start", letterSpacing: 0.5
        }}>
          {isPrimary ? "Best Match" : "Wildcard"}
        </div>
      </div>

      <div style={{ background: C.bgInner, borderRadius: 10, padding: "14px 16px", marginBottom: 14, borderLeft: `3px solid ${isPrimary ? C.accent : C.teal}` }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: C.text, ...bf, lineHeight: 1.7 }}>
          {restaurant.why_it_fits}
        </p>
        <p style={{ margin: 0, fontSize: 12, fontStyle: "italic", color: isPrimary ? C.accent : C.muted, ...bf }}>
          ✦ "{restaurant.highlight}"
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onSelect(restaurant)} style={{
          flex: 1, padding: "13px 0", background: C.accent, color: "#1a2e35",
          border: "none", borderRadius: 10, cursor: "pointer",
          ...bf, fontSize: 14, fontWeight: 700, letterSpacing: 0.3
        }}>
          ✓ I'm going here
        </button>
        <button onClick={() => setShowReasons(v => !v)} style={{
          padding: "13px 20px", background: showReasons ? "#2e4a54" : C.bgInner,
          color: C.muted, border: `1px solid ${C.border}`,
          borderRadius: 10, cursor: "pointer", ...bf, fontSize: 16, fontWeight: 700
        }}>
          ✕
        </button>
      </div>

      {showReasons && (
        <div style={{ marginTop: 12, padding: 14, background: C.bgInner, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: C.muted, ...bf }}>
            Why not? Your feedback helps us improve
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {REJECTION_REASONS.map(r => (
              <button key={r} onClick={() => onDismiss(restaurant.business_id, r)} style={{
                padding: "7px 14px", fontSize: 12, border: `1px solid ${C.border}`,
                borderRadius: 99, background: C.bgCard, cursor: "pointer", ...bf, color: C.text,
              }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function WSWE() {
  const [phase, setPhase] = useState("home");
  const [prompt, setPrompt] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState({});
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [matchedCommunity, setMatchedCommunity] = useState("");
  const [city, setCity] = useState("Philadelphia");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unique thread per session — new ID on reset so LangGraph starts fresh
  const threadId = useRef(generateThreadId());

  useEffect(() => {
    setSuggestions([...PROMPT_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 3));
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Righteous&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // ── CORE API CALL ─────────────────────────────────────────────────────────
  // First call: sends the user's original prompt + a new thread_id
  // Follow-up calls: sends ONLY the answer — LangGraph remembers the context
  // ─────────────────────────────────────────────────────────────────────────
  const callAPI = async (userMessage) => {
    setLoading(true);
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("https://nine-parks-show.loca.lt/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({
          prompt: userMessage,
          thread_id: threadId.current,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (data.follow_up_question && (!data.restaurants || data.restaurants.length === 0)) {
        // Backend needs more info
        setFollowUpQuestion(data.follow_up_question);
        setFollowUpAnswer("");
        setPhase("followup");
      } else {
        // Backend returned restaurants
        setRestaurants(data.restaurants || []);
        setMatchedCommunity(data.matched_community || "");
        setCity(data.city || "Philadelphia");
        setFollowUpQuestion(null);
        setPhase("results");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Couldn't reach the server — showing demo results instead.");
      setRestaurants(FAKE_RESTAURANTS);
      setMatchedCommunity(FAKE_COMMUNITY);
      setCity(FAKE_CITY);
      setPhase("results");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    callAPI(prompt);
  };

  // Send ONLY the answer — backend's LangGraph thread already has the full context
  const handleFollowUpSubmit = () => {
    if (!followUpAnswer.trim()) return;
    callAPI(followUpAnswer);
  };

  const handleDismiss = (business_id, reason) => {
    setDismissed(p => ({ ...p, [business_id]: true }));
    setFeedback(p => [...p, {
      restaurant: restaurants.find(r => r.business_id === business_id)?.restaurant_name,
      reason,
    }]);
  };

  const reset = () => {
    setPhase("home");
    setPrompt("");
    setFollowUpQuestion(null);
    setFollowUpAnswer("");
    setDismissed({});
    setSelected(null);
    setFeedback([]);
    setError(null);
    setRestaurants([]);
    setMatchedCommunity("");
    threadId.current = generateThreadId(); // fresh LangGraph thread
    setSuggestions([...PROMPT_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 3));
  };

  const visibleCount = restaurants.filter(r => !dismissed[r.business_id]).length;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px" }}>

      {/* ── LOGO ── */}
      <div style={{ textAlign: "center", marginBottom: phase === "home" ? 48 : 32, cursor: "pointer" }} onClick={reset}>
        <div style={{
          fontSize: phase === "home" ? 80 : 48, fontWeight: 400,
          letterSpacing: phase === "home" ? "4px" : "2px",
          color: C.primary, ...display, textTransform: "uppercase", lineHeight: 1,
        }}>
          WSWE
        </div>
        <p style={{ ...bf, fontSize: 11, color: C.muted, letterSpacing: 5, textTransform: "uppercase", margin: "10px 0 0" }}>
          Where Should We Eat?
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 600 }}>

        {/* ── HOME ── */}
        {phase === "home" && (
          <div>
            <div style={{ background: C.bgCard, borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", border: `1px solid ${C.border}` }}>
              <label style={{ ...bf, fontSize: 13, color: C.primary, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12, fontWeight: 700 }}>
                What are you in the mood for?
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="e.g. quiet Italian date night, mid range — or cheap lively spot for a big group..."
                style={{
                  width: "100%", minHeight: 90, border: "none", outline: "none",
                  resize: "none", fontFamily: "Georgia, serif", fontSize: 16,
                  color: C.text, background: "transparent", lineHeight: 1.7, boxSizing: "border-box",
                }}
              />
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setPrompt(s.join(" · "))} style={{
                      padding: "6px 14px", fontSize: 12, border: `1px solid ${C.border}`,
                      borderRadius: 99, background: C.pillBg, cursor: "pointer", ...bf, color: C.muted
                    }}>
                      {s.join(" · ")}
                    </button>
                  ))}
                </div>
                <button onClick={handleSubmit} disabled={!prompt.trim()} style={{
                  padding: "12px 26px",
                  background: prompt.trim() ? C.accent : "#3a5a65",
                  color: prompt.trim() ? "#1a2e35" : C.light,
                  border: "none", borderRadius: 12,
                  cursor: prompt.trim() ? "pointer" : "default",
                  ...bf, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap"
                }}>
                  Find spots →
                </button>
              </div>
            </div>

            <button
              onClick={() => callAPI("Surprise me with something really good tonight")}
              style={{
                width: "100%", marginTop: 12, padding: "15px",
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: 14, cursor: "pointer", ...bf, fontSize: 14,
                color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
              ✨ Surprise me
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: 60, ...bf, color: C.muted, fontSize: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🍽️</div>
            Finding the best spots for you...
          </div>
        )}

        {/* ── FOLLOW-UP — question comes from backend ── */}
        {phase === "followup" && (
          <div style={{ background: C.bgCard, borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", border: `1px solid ${C.border}` }}>
            <p style={{ ...bf, fontSize: 11, color: C.light, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 16px" }}>
              Just one more thing
            </p>
            <h3 style={{ ...bf, fontSize: 22, fontWeight: 700, margin: "0 0 24px", color: C.primary }}>
              {followUpQuestion}
            </h3>
            <textarea
              autoFocus
              value={followUpAnswer}
              onChange={e => setFollowUpAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFollowUpSubmit(); } }}
              placeholder="Type your answer..."
              style={{
                width: "100%", minHeight: 70, border: `1px solid ${C.border}`,
                borderRadius: 10, outline: "none", resize: "none",
                fontFamily: "Georgia, serif", fontSize: 15,
                color: C.text, background: C.bgInner, lineHeight: 1.6,
                boxSizing: "border-box", padding: "12px 14px", marginBottom: 14
              }}
            />
            <button onClick={handleFollowUpSubmit} disabled={!followUpAnswer.trim()} style={{
              width: "100%", padding: "13px",
              background: followUpAnswer.trim() ? C.accent : "#3a5a65",
              color: followUpAnswer.trim() ? "#1a2e35" : C.light,
              border: "none", borderRadius: 12,
              cursor: followUpAnswer.trim() ? "pointer" : "default",
              ...bf, fontSize: 14, fontWeight: 700
            }}>
              Continue →
            </button>
            <button onClick={() => callAPI("no preference")} style={{
              marginTop: 10, background: "none", border: "none", cursor: "pointer",
              ...bf, color: C.light, fontSize: 13, width: "100%", textAlign: "center"
            }}>
              Skip — just show me results
            </button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === "results" && (
          <div>
            {error && (
              <div style={{ marginBottom: 16, padding: "10px 16px", background: "#2a1a1a", borderRadius: 10, border: "1px solid #5a2a2a" }}>
                <p style={{ margin: 0, ...bf, fontSize: 12, color: C.accent }}>⚠️ {error}</p>
              </div>
            )}

            <div style={{
              marginBottom: 20, padding: "12px 18px", background: C.bgCard,
              borderRadius: 12, border: `1px solid ${C.matchBorder}`,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <p style={{ margin: 0, ...bf, fontSize: 11, color: C.accent, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>
                📍 Matched: {matchedCommunity}
              </p>
              <p style={{ margin: 0, ...bf, fontSize: 11, color: C.light }}>
                {city} · {visibleCount} results
              </p>
            </div>

            {restaurants.map(r => (
              <RestaurantCard
                key={r.business_id}
                restaurant={r}
                onDismiss={handleDismiss}
                onSelect={setSelected}
                dismissed={!!dismissed[r.business_id]}
              />
            ))}

            {feedback.length > 0 && (
              <div style={{ padding: "10px 16px", background: C.bgCard, borderRadius: 12, border: `1px solid ${C.border}`, marginTop: 4 }}>
                <p style={{ margin: 0, ...bf, fontSize: 11, color: C.light }}>
                  📝 Feedback noted: {feedback.map(f => `${f.restaurant} (${f.reason})`).join(" · ")}
                </p>
              </div>
            )}

            <button onClick={reset} style={{
              width: "100%", marginTop: 20, padding: "16px",
              background: "transparent", border: `2px solid ${C.accent}`,
              borderRadius: 14, cursor: "pointer", ...bf, fontSize: 14,
              fontWeight: 700, color: C.accent, letterSpacing: 1, textTransform: "uppercase"
            }}>
              ← Start Over
            </button>
          </div>
        )}

        {/* ── SELECTED MODAL ── */}
        {selected && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20
          }}>
            <div style={{
              background: C.bgCard, borderRadius: 24, padding: 40, maxWidth: 400, width: "100%",
              textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>
              <h2 style={{ ...display, fontSize: 28, margin: "0 0 12px", color: C.primary, fontWeight: 400 }}>
                Enjoy {selected.restaurant_name}!
              </h2>
              <p style={{ ...bf, color: C.muted, fontSize: 14, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 16px" }}>
                "{selected.highlight}"
              </p>
              <p style={{ ...bf, color: C.light, fontSize: 13, margin: "0 0 32px" }}>
                {priceDisplay(selected.price_range)} · ★ {selected.stars}
              </p>
              <button onClick={reset} style={{
                padding: "14px 32px", background: C.accent, color: "#1a2e35",
                border: "none", borderRadius: 14, cursor: "pointer",
                ...bf, fontSize: 15, fontWeight: 700, width: "100%"
              }}>
                Find somewhere else
              </button>
              <button onClick={() => setSelected(null)} style={{
                marginTop: 10, padding: "10px", background: "none", border: "none",
                cursor: "pointer", ...bf, color: C.light, fontSize: 13, width: "100%"
              }}>
                ← Back to results
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');
        textarea::placeholder { color: #4a7080; }
        button { transition: all 0.2s; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}

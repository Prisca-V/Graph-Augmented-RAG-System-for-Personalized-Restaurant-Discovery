# Graph-Augmented-RAG-System-for-Personalized-Restaurant-Discovery
# 🍽️ WSWE — Conversational Restaurant Discovery Agent

> A natural language restaurant recommendation system that understands what you're *actually* looking for — not just keywords.

Built as part of a Network Analytics course project using the Yelp Academic Dataset (Philadelphia).

---

## The Problem

When you want to go out for dinner, no existing app answers the question well:

- **OpenTable / Resy** — great for booking, but you already need to know where you're going
- **Yelp** — keyword search only, doesn't understand context or intent
- **Google Maps** — shows everything nearby, no conversational understanding
- **ChatGPT / Gemini** — not grounded in live, verified restaurant data; hallucinates places that don't exist

None of them can answer:
> *"Find me something calm and romantic for a first date, not too spicy, mid-range price"*

in a single conversational turn — and follow up intelligently if something's missing.

**WSWE fills that gap.**

---

## How It Works

```
User types natural language query
          ↓
    [LangGraph Agent]
    Parses intent → checks completeness → asks follow-up if needed
          ↓
    [Knowledge Graph + Community Detection]
    Narrows search to the most relevant restaurant cluster
          ↓
    [RAG Pipeline]
    Semantic search over real customer reviews using ChromaDB
          ↓
    [LLM Synthesis — Gemini]
    Generates human-readable recommendations with reasons
          ↓
    Top restaurant picks with "why it fits" explanations
```

### Example

**User:** *"Something calm and not too spicy for a date night, mid range"*

**Agent:** *(if cuisine missing)* → *"What kind of cuisine are you in the mood for?"*

**User:** *"Italian"*

**Agent:**
```
🍽️ Top Picks:
1. L'Angolo Ristorante ($$) — ⭐ 5.0
   Tiny, charming BYOB with homemade pastas. Wonderfully quiet and romantic.
   💬 "So tiny and charming, great for a first date!!"

2. Zavino ($$) — ⭐ 5.0
   Intimate setting with perfectly romantic lighting and classic Italian comfort food.
   💬 "Intimate but casual — perfectly romantic lighting"

✨ Wildcard Pick:
1. Gran Caffe L'Aquila ($$) — ⭐ 5.0
   If you want a fun alternative — authentic Italian with a quiet, romantic ambiance.
   💬 "The ambiance is quiet and somewhat romantic too"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Streamlit Frontend                 │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              LangGraph Orchestration                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Parse   │→ │  Check    │→ │  Ask Follow-Up   │  │
│  │  Input   │  │ Complete  │  │  (HITL / loop)   │  │
│  └──────────┘  └─────┬─────┘  └──────────────────┘  │
│                      │ complete                      │
│               ┌──────▼──────┐                        │
│               │  Retrieve   │                        │
│               └──────┬──────┘                        │
│                      │                               │
│               ┌──────▼──────┐                        │
│               │   Format    │                        │
│               │  Response   │                        │
│               └─────────────┘                        │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  RAG Pipeline                        │
│                                                      │
│  Community Detection → ChromaDB Filter               │
│  → Embed Raw Query → Semantic Search                 │
│  → Group by Restaurant → Rerank                      │
│  → LLM Synthesis (Gemini)                            │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Knowledge Graph Layer                   │
│                                                      │
│  NetworkX Graph: Restaurants ↔ Features              │
│  Louvain Community Detection (11 communities)        │
│  Modularity Score: ~0.54                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Component | Technology |
|---|---|
| Orchestration | LangGraph |
| LLM | Gemini 3.1 Flash (Google AI) |
| Vector Database | ChromaDB |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Knowledge Graph | NetworkX |
| Community Detection | Louvain Algorithm |
| Frontend | Streamlit |
| Data | Yelp Academic Dataset (Philadelphia) |
| Language | Python 3.11+ |

---

## Project Structure

```
Graph-Augmented-RAG-System-for-Personalized-Restaurant-Discover/
│
├── knowledge_graph/
│   ├── build_graph.py               # builds NetworkX graph from Yelp data
│   └── community_detection.py       # Louvain community detection
│
├── embeddings/
│   ├── embed_reviews.py             # embeds review text, stores in ChromaDB
│   └── chroma_db/                   # local ChromaDB storage (gitignored)
│
├── retrieval/
│   └── retrieval.py                 # RAG pipeline — main retrieve_and_synthesize()
│
├── langgraph_orchestration/
│   └── langgraph_orchestration.py   # LangGraph graph, nodes, routing, HITL
│
├── frontend/
│   └── app.py                       # Streamlit chat UI
│
├── data/
│   ├── restaurant_communities_manual.csv      # business_id → community_id mapping
│   └── restaurant_community_summary_manual.csv # community tags + examples
│
├── .env.example                     # environment variable template
├── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Google AI API key (Gemini)
- Yelp Academic Dataset (Philadelphia subset)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/Graph-Augmented-RAG-System-for-Personalized-Restaurant-Discover.git
cd Graph-Augmented-RAG-System-for-Personalized-Restaurant-Discover
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Add your Gemini API key to .env
```

`.env` should contain:
```
GEMINI_API_KEY=your_key_here
```

### 4. Prepare the data
Download the Yelp Academic Dataset and place the following files in a `/raw_data` folder:
- `yelp_academic_dataset_business.json`
- `yelp_academic_dataset_review.json`
- `yelp_academic_dataset_user.json`

### 5. Build the knowledge graph and community detection
```bash
python knowledge_graph/build_graph.py
python knowledge_graph/community_detection.py
```

### 6. Generate embeddings and populate ChromaDB
```bash
python embeddings/embed_reviews.py
```

### 7. Run the app
```bash
streamlit run frontend/app.py
```

---

## Key Design Decisions

**Why community detection before RAG?**
Searching semantically across all 400+ restaurants is noisy and slow. Community detection (Louvain algorithm) groups restaurants by cuisine and ambience similarity, narrowing the search space to ~30–70 restaurants before semantic search runs. This makes retrieval more precise and faster.

**Why embed the raw user query instead of a synthetic sentence?**
Converting *"something calm for a first date, not too spicy"* into *"quiet romantic Italian mid-range"* loses emotional intent. Embedding the raw query preserves nuance that structured attributes miss. Attributes (cuisine, price, vibe) are used for metadata filtering — the raw query is used for semantic matching.

**Why two-step retrieval (primary + wildcard)?**
Primary results come from the community that matches the user's cuisine — safe, on-target picks. Wildcard results come from outside that community — semantically similar restaurants the user might not have considered. This mirrors how a good friend gives recommendations: *"here's the obvious answer, and here's something you might not have thought of."*

**Why LangGraph for orchestration?**
A simple prompt → response flow breaks down when user input is incomplete. LangGraph's stateful graph with `interrupt()` enables true Human-in-the-Loop behavior — the graph pauses mid-execution, asks one focused question, and resumes exactly where it left off. State persists across turns via `MemorySaver` so nothing is lost between messages.

**Why price excluded from community detection?**
Including price caused over-connectivity in the graph — too many restaurants sharing a price tier ended up in the same community regardless of cuisine or ambience. Price is applied as a hard metadata filter at retrieval time instead, so no information is lost.

---

## Dataset

**Yelp Academic Dataset** — Philadelphia subset

| File | Records Used |
|---|---|
| `business.json` | ~400 restaurants |
| `review.json` | ~50,000+ reviews |
| `user.json` | Used for graph edges |

Community detection results:
- **11 communities** detected
- **Modularity score: ~0.54** (strong clustering)
- Communities correspond to: Italian/Pizza, Chinese/Asian, Mexican/Tacos, Sushi/Japanese, Cheesesteaks, Vegan/Vegetarian, Gastropubs, Coffee/Dessert, and more

---

## Future Scope

- **Live data integration** — connect to OpenTable or Yelp Fusion API for real-time availability and current reviews
- **Personalization** — use order/visit history to bias community selection per user
- **Location awareness** — filter by delivery radius or walking distance
- **Booking integration** — add OpenTable reservation flow directly in the agent
- **Multi-city support** — currently scoped to Philadelphia; extend to any Yelp dataset city

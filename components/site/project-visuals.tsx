/**
 * One compact architecture diagram per project. Static SVG, no client JS.
 * Every label names something that appears in the project's own description.
 */

const LABEL = "var(--muted)"
const INK = "var(--ink-2)"
const LINE = "var(--line-strong)"
const ACCENT = "var(--accent)"

function Frame({ slug, caption, children }: { slug: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface-2">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
        </span>
        <span className="truncate font-mono text-[10px] text-muted">{slug}</span>
      </div>
      <div className="p-4">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{caption}</div>
        {children}
      </div>
    </div>
  )
}

function Box({
  x,
  y,
  w,
  h,
  label,
  accent = false,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  accent?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="4"
        fill={accent ? "var(--accent-soft)" : "var(--surface)"}
        stroke={accent ? ACCENT : LINE}
        strokeWidth="1"
        strokeOpacity={accent ? 0.45 : 1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 2.6}
        textAnchor="middle"
        fontSize="7.5"
        className="font-mono"
        fill={accent ? ACCENT : INK}
      >
        {label}
      </text>
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, dashed = false }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={LINE}
      strokeWidth="1"
      strokeDasharray={dashed ? "3 2.5" : undefined}
      markerEnd="url(#ah)"
    />
  )
}

function Defs() {
  return (
    <defs>
      <marker id="ah" markerWidth="5" markerHeight="5" refX="4.4" refY="2" orient="auto">
        <path d="M0,0 L4.4,2 L0,4" fill="none" stroke={LINE} strokeWidth="0.9" />
      </marker>
    </defs>
  )
}

/* 01 medrag-toolkit: hybrid retrieval with a grounding gate on the way out. */
export function MedragViz() {
  return (
    <Frame
      slug="medrag-toolkit / hybrid retrieval to citation gate"
      caption="Retrieval, grounding, hallucination check"
    >
      <svg
        viewBox="0 0 340 150"
        className="w-full"
        role="img"
        aria-label="medrag-toolkit architecture: a query fans out to dense FAISS and sparse BM25 retrieval over PubMed, RxNorm and OpenFDA, is reranked, sent to an LLM, then passed through a citation grounding and hallucination check before the answer is returned"
      >
        <Defs />
        <text x="0" y="8" fontSize="7" className="font-mono" fill={LABEL}>
          KNOWLEDGE SOURCES
        </text>
        {["PubMed 36M+", "RxNorm", "OpenFDA"].map((s, i) => (
          <Box key={s} x={0} y={16 + i * 24} w={78} h={18} label={s} />
        ))}

        <Arrow x1={80} y1={43} x2={96} y2={38} />
        <Arrow x1={80} y1={67} x2={96} y2={66} />
        <Arrow x1={80} y1={91} x2={96} y2={94} />

        <text x="98" y="8" fontSize="7" className="font-mono" fill={LABEL}>
          RETRIEVAL
        </text>
        <Box x={98} y={28} w={80} h={20} label="dense FAISS" accent />
        <Box x={98} y={56} w={80} h={20} label="sparse BM25" accent />
        <Box x={98} y={84} w={80} h={20} label="query refine" />
        <text x="138" y="116" textAnchor="middle" fontSize="6.5" className="font-mono" fill={LABEL}>
          over Qdrant
        </text>

        <Arrow x1={180} y1={38} x2={198} y2={56} />
        <Arrow x1={180} y1={66} x2={198} y2={66} />
        <Arrow x1={180} y1={94} x2={198} y2={76} />

        <Box x={200} y={56} w={56} h={20} label="rerank" />
        <Arrow x1={258} y1={66} x2={274} y2={66} />
        <Box x={276} y={56} w={56} h={20} label="LLM" />

        <Arrow x1={304} y1={78} x2={304} y2={92} />
        <Box x={240} y={94} w={92} h={20} label="citation gate" accent />
        <Arrow x1={240} y1={104} x2={224} y2={104} dashed />
        <text x="220" y="107" textAnchor="end" fontSize="6.5" className="font-mono" fill={LABEL}>
          hallucination check
        </text>

        <text x="286" y="130" textAnchor="middle" fontSize="7" className="font-mono" fill={ACCENT}>
          grounded answer
        </text>
      </svg>
    </Frame>
  )
}

/* 02 Clinical RAG Evaluation: measured deltas against a GPT-4 baseline. */
export function ClinragViz() {
  const bars = [
    { k: "response relevance", v: 91 },
    { k: "hallucination reduction", v: 38 },
    { k: "verification time saved", v: 45 },
  ]

  return (
    <Frame slug="clinical-rag / RAGAS benchmark vs. GPT-4" caption="Evaluated against a GPT-4 baseline">
      <svg
        viewBox="0 0 340 150"
        className="w-full"
        role="img"
        aria-label="Clinical RAG evaluation results: 91 percent response relevance, 38 percent hallucination reduction, and 45 percent clinician verification time saved, measured with RAGAS against a GPT-4 baseline"
      >
        <Defs />
        <text x="0" y="8" fontSize="7" className="font-mono" fill={LABEL}>
          CORPUS
        </text>
        <Box x={0} y={14} w={104} h={18} label="5,000+ guidelines" />
        <text x="0" y="44" fontSize="6.5" className="font-mono" fill={LABEL}>
          WHO, NIMH, semantic chunking
        </text>

        {bars.map((b, i) => {
          const y = 62 + i * 28
          return (
            <g key={b.k}>
              <text x="0" y={y - 4} fontSize="7" className="font-mono" fill={INK}>
                {b.k}
              </text>
              <rect x="0" y={y} width="280" height="7" rx="3.5" fill="var(--surface)" stroke={LINE} strokeWidth="0.8" />
              <rect x="0" y={y} width={280 * (b.v / 100)} height="7" rx="3.5" fill={ACCENT} opacity="0.85" />
              <text x="288" y={y + 6.5} fontSize="8" className="font-mono" fill={ACCENT}>
                {b.v}%
              </text>
            </g>
          )
        })}

        <text x="0" y="146" fontSize="6.5" className="font-mono" fill={LABEL}>
          LangChain, Pinecone, FastAPI on AWS Lambda, LangSmith
        </text>
      </svg>
    </Frame>
  )
}

/* 03 Buildify: a gating network routing constraint graphs to experts. */
export function BuildifyViz() {
  const experts = ["bedroom", "kitchen", "bath", "living"]
  return (
    <Frame slug="buildify / room-constraint graph to layout" caption="Mixture of Experts routing">
      <svg
        viewBox="0 0 340 150"
        className="w-full"
        role="img"
        aria-label="Buildify architecture: a room-constraint graph passes through a 3-layer GCN encoder into a learned gating network, which routes to room-type experts feeding a transposed-convolution mask decoder that emits the floor plan"
      >
        <Defs />
        <text x="0" y="8" fontSize="7" className="font-mono" fill={LABEL}>
          CONSTRAINT GRAPH
        </text>
        {[
          [16, 32],
          [46, 20],
          [46, 48],
          [76, 34],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="var(--surface)" stroke={LINE} strokeWidth="1.2" />
        ))}
        <path d="M20,32 L42,20 M20,32 L42,48 M50,20 L72,34 M50,48 L72,34" stroke={LINE} strokeWidth="0.9" fill="none" />

        <Arrow x1={82} y1={34} x2={94} y2={34} />
        <Box x={96} y={24} w={52} h={20} label="GCN x3" />
        <Arrow x1={150} y1={34} x2={162} y2={34} />
        <Box x={164} y={24} w={48} h={20} label="gating" accent />

        {experts.map((e, i) => {
          const y = 56 + i * 20
          return (
            <g key={e}>
              <line x1={188} y1={46} x2={188} y2={y + 7} stroke={LINE} strokeWidth="0.8" strokeDasharray="2 2" />
              <Arrow x1={188} y1={y + 7} x2={202} y2={y + 7} />
              <Box x={204} y={y} w={52} h={14} label={e} accent={i === 1} />
            </g>
          )
        })}

        <text x="230" y="142" textAnchor="middle" fontSize="6.5" className="font-mono" fill={LABEL}>
          room-type experts
        </text>

        <Arrow x1={258} y1={63} x2={278} y2={76} />
        <Box x={280} y={66} w={54} h={20} label="decoder" />
        <text x="307" y="102" textAnchor="middle" fontSize="7.5" className="font-mono" fill={ACCENT}>
          floor plan
        </text>
        <text x="0" y="142" fontSize="6.5" className="font-mono" fill={LABEL}>
          INT8 quantized, single GPU
        </text>
      </svg>
    </Frame>
  )
}

/* 04 Mental Health AI Prediction: two input modes into one ensemble. */
export function MhapsViz() {
  return (
    <Frame slug="mh-predict / multi-modal ensemble" caption="Free text plus structured records">
      <svg
        viewBox="0 0 340 150"
        className="w-full"
        role="img"
        aria-label="Mental health prediction architecture: free-text intake through TF-IDF features and structured screening records feed an ensemble classifier predicting three diagnostic categories, alongside a sequence-to-sequence response model"
      >
        <Defs />
        <text x="0" y="8" fontSize="7" className="font-mono" fill={LABEL}>
          INPUTS
        </text>
        <Box x={0} y={16} w={92} h={20} label="free-text intake" />
        <Box x={0} y={44} w={92} h={20} label="screening records" />
        <text x="0" y="78" fontSize="6.5" className="font-mono" fill={LABEL}>
          10K+ clinical records
        </text>

        <Arrow x1={94} y1={26} x2={108} y2={32} />
        <Arrow x1={94} y1={54} x2={108} y2={48} />
        <Box x={110} y={30} w={60} h={20} label="TF-IDF" />
        <Arrow x1={172} y1={40} x2={188} y2={40} />
        <Box x={190} y={30} w={66} h={20} label="ensemble" accent />

        {["cat 1", "cat 2", "cat 3"].map((c, i) => (
          <g key={c}>
            <Arrow x1={258} y1={40} x2={274} y2={22 + i * 20} />
            <Box x={276} y={14 + i * 20} w={54} h={16} label={c} />
          </g>
        ))}
        <text x="303" y="88" textAnchor="middle" fontSize="7.5" className="font-mono" fill={ACCENT}>
          94% accuracy
        </text>

        <line x1="0" y1="100" x2="340" y2="100" stroke={LINE} strokeWidth="0.8" strokeDasharray="3 3" />
        <text x="0" y="116" fontSize="7" className="font-mono" fill={LABEL}>
          RESPONSE MODEL
        </text>
        <Box x={0} y={124} w={78} h={18} label="seq2seq" />
        <Arrow x1={80} y1={133} x2={96} y2={133} />
        <Box x={98} y={124} w={110} h={18} label="therapeutic reply" accent />
      </svg>
    </Frame>
  )
}

/* 05 Recommender and churn sharing one subscriber representation. */
export function NetflixViz() {
  const viewers = [22, 54, 86]
  const titles = [32, 64]
  return (
    <Frame slug="streaming-rec / 10M+ viewer records" caption="Shared subscriber representation">
      <svg
        viewBox="0 0 340 150"
        className="w-full"
        role="img"
        aria-label="Recommendation architecture: a viewer-title interaction graph produces GNN embeddings that feed both a collaborative filtering recommender and an XGBoost plus LSTM churn model"
      >
        <Defs />
        <text x="0" y="8" fontSize="7" className="font-mono" fill={LABEL}>
          INTERACTION GRAPH
        </text>

        {viewers.map((cy, i) => (
          <circle key={`v${i}`} cx="16" cy={cy} r="5" fill="var(--surface)" stroke={LINE} strokeWidth="1.2" />
        ))}
        {titles.map((cy, i) => (
          <circle key={`t${i}`} cx="72" cy={cy} r="4" fill={ACCENT} opacity="0.7" />
        ))}
        {viewers.map((vy) =>
          titles.map((ty, j) => (
            <line key={`${vy}-${j}`} x1="21" y1={vy} x2="68" y2={ty} stroke={LINE} strokeWidth="0.7" />
          )),
        )}
        <text x="0" y="118" fontSize="6.5" className="font-mono" fill={LABEL}>
          10M+ viewer records
        </text>

        <Arrow x1={78} y1={54} x2={94} y2={54} />
        <Box x={96} y={44} w={72} h={20} label="GNN embed" accent />

        <Arrow x1={170} y1={50} x2={186} y2={32} />
        <Arrow x1={170} y1={58} x2={186} y2={84} />
        <Box x={188} y={22} w={82} h={20} label="recommender" />
        <Box x={188} y={74} w={82} h={20} label="churn model" />

        <text x="276" y="36" fontSize="7.5" className="font-mono" fill={ACCENT}>
          +35%
        </text>
        <text x="276" y="46" fontSize="6" className="font-mono" fill={LABEL}>
          engagement
        </text>
        <text x="276" y="88" fontSize="7.5" className="font-mono" fill={ACCENT}>
          92%
        </text>
        <text x="276" y="98" fontSize="6" className="font-mono" fill={LABEL}>
          accuracy
        </text>

        <text x="188" y="118" fontSize="6.5" className="font-mono" fill={LABEL}>
          XGBoost, LSTM / ANN
        </text>
      </svg>
    </Frame>
  )
}

export const VISUALS = {
  medrag: MedragViz,
  clinrag: ClinragViz,
  buildify: BuildifyViz,
  mhaps: MhapsViz,
  netflix: NetflixViz,
} as const

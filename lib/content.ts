/**
 * Single source of truth for every word on the site.
 *
 * Content comes from Nikhil_Obuleni_AI_Engineer.pdf and
 * Nikhil_Obuleni_Data_Scientist.pdf. If a number is not in one of those two
 * resumes, it does not appear on the page.
 */

export const profile = {
  name: "Nikhil Obuleni",
  monogram: "NO",
  role: "AI Engineer",
  badge: "AI Engineer & Data Scientist",
  location: "Washington, DC",
  email: "nikhil.obuleni@gwu.edu",
  phone: "(571) 478-2007",
  github: "https://github.com/nik-hill-323",
  linkedin: "https://www.linkedin.com/in/nikhil-obuleni",
  resume: "/Nikhil_Obuleni_AI_Engineer.pdf",
  resumeDs: "/Nikhil_Obuleni_Data_Scientist.pdf",
  status: "Currently building AI & research systems at CGMHE",
  tags: ["AI Research Engineer", "LLMs / RAG", "M.S. Data Science / GW", "Washington, DC"],
  headline: {
    lead: "AI Engineer building",
    accent: "production-grade AI systems",
  },
  summary:
    "I build LLM and retrieval systems that run in production. At GW's Center for Global Mental Health Equity I work on agent pipelines that score clinical transcripts across 25 countries, RAG grounded in clinical rubrics, and the Airflow and AWS pipelines underneath them. Before that, NLP and forecasting at Data Science for Sustainable Development and computer vision at Asteria Aerospace.",
}

export const impact = [
  {
    label: "Clinical transcripts scored",
    value: 26000,
    suffix: "+",
    blurb: "Multilingual competency scoring across 25 countries, replacing a fully manual WHO/UNICEF review process.",
  },
  {
    label: "Patient records in production",
    value: 500000,
    suffix: "+",
    blurb: "Airflow and AWS pipelines into PostgreSQL across 25+ countries, on a $2.9M NIMH grant.",
  },
  {
    label: "Lower factual error rate",
    value: 40,
    suffix: "%",
    blurb: "Production RAG grounding LLM output in EQUIP/ENACT clinical rubrics, on held-out multilingual benchmarks.",
  },
  {
    label: "Weighted F1, disaster forecasting",
    value: 78,
    suffix: "%",
    blurb: "ARIMA, LSTM and XGBoost ensemble over 200K humanitarian records across 18 countries.",
  },
]

export const about = {
  paragraphs: [
    "I work on the engineering side of applied AI: agent pipelines, retrieval systems, evaluation, and the data infrastructure that feeds them. Most of what I build runs against real clinical and humanitarian data, so accuracy and traceability matter more than benchmark scores.",
    "At GW's Center for Global Mental Health Equity I build LLM systems for WHO and UNICEF evaluation programs. That covers automating counselor competency scoring that used to be done by hand, grounding model output in clinical rubrics, and running the evaluations that show whether results hold across 14 languages.",
    "Before that I built NLP and LLM-assisted extraction pipelines for NGO reporting at Data Science for Sustainable Development, forecasting models on humanitarian records across 18 countries, and computer vision models for drone systems at Asteria Aerospace.",
  ],
  facts: [
    { k: "Now", v: "AI Research Engineer, CGMHE" },
    { k: "Based in", v: "Washington, DC" },
    { k: "Program", v: "M.S. Data Science, GWU, GPA 3.75" },
    { k: "Working on", v: "LLM evaluation, RAG, agent systems" },
  ],
}

export type Job = {
  kind: string
  period: string
  title: string
  org: string
  place: string
  blurb: string
  points: string[]
  stack: string[]
  featured?: boolean
}

export const jobs: Job[] = [
  {
    kind: "Current",
    period: "May 2026 to Present",
    title: "AI Research Engineer",
    org: "Center for Global Mental Health Equity (CGMHE)",
    place: "Washington, DC",
    featured: true,
    blurb:
      "LLM agent pipelines, retrieval systems, and evaluation for WHO and UNICEF mental health programs, plus the data platform they run on.",
    points: [
      "Shipped an LLM agent pipeline (LangChain, OpenAI API) that automates counselor competency scoring across 26K+ multilingual clinical transcripts in 25 countries, cutting per-session review time from 45 minutes to 4 and replacing a fully manual WHO/UNICEF evaluation process.",
      "Designed a production RAG system (FAISS, LangChain, FastAPI) grounding LLM output in EQUIP/ENACT clinical rubrics through chunking, reranking, and a hallucination-flagging layer, reducing factual error rate by roughly 40% on held-out multilingual benchmarks.",
      "Ran LLM evaluation experiments (RAGAS, DeepEval) comparing GPT-4 and Claude against human-annotated ground truth across 14 languages, identifying a 23% calibration gap on low-resource languages that fed into a joint OpenAI collaboration on clinical LLM deployment.",
      "Built Airflow and AWS (S3, EC2) pipelines ingesting 500K+ patient records into PostgreSQL across 25+ countries on a $2.9M NIMH grant, cutting integration latency 83% and reporting time 60%.",
    ],
    stack: ["LangChain", "OpenAI API", "Claude API", "FAISS", "FastAPI", "RAGAS", "Airflow", "AWS"],
  },
  {
    kind: "Part-time",
    period: "Feb 2025 to May 2026",
    title: "ML Engineer",
    org: "Data Science for Sustainable Development",
    place: "Washington, DC",
    featured: true,
    blurb:
      "NLP and LLM-assisted extraction for NGO reporting, plus forecasting models for field teams working with limited data infrastructure.",
    points: [
      "Automated ingestion and structuring of unstructured sustainability reports using NLP pipelines (spaCy, Hugging Face) and LLM-assisted extraction (OpenAI API, LangChain) for NGO clients, cutting manual data prep time by roughly 60% per project cycle.",
      "Developed open-source REST APIs (FastAPI, Python) and modular data pipelines for nonprofit and government partners, integrating third-party data feeds with automated schema validation to improve reliability of SDG-aligned reporting tools.",
      "Deployed ARIMA, LSTM, and XGBoost ensemble models on 200K+ humanitarian records across 18 countries, reaching 78% weighted F1 on disaster impact forecasting.",
    ],
    stack: ["spaCy", "Hugging Face", "LangChain", "FastAPI", "XGBoost", "LSTM", "Airflow", "BigQuery"],
  },
  {
    kind: "Industry",
    period: "May 2023 to Aug 2023",
    title: "Data Science Intern",
    org: "Asteria Aerospace",
    place: "Bangalore, India",
    blurb: "Computer vision and predictive maintenance for a commercial drone fleet.",
    points: [
      "Built computer vision models (YOLOv5, Faster R-CNN) for real-time drone object detection, improving surveillance efficiency 30%, and added anomaly detection with Autoencoders and Isolation Forest that improved fault detection 40%.",
      "Deployed predictive maintenance models (LSTM, Random Forest) forecasting equipment failures, reducing unexpected breakdowns 25%.",
      "Ran geospatial analysis on GIS, LiDAR, and satellite imagery, improving drone navigation accuracy 20%.",
    ],
    stack: ["PyTorch", "YOLOv5", "Faster R-CNN", "LSTM", "Random Forest", "GIS", "LiDAR"],
  },
]

export type Project = {
  id: "medrag" | "clinrag" | "buildify" | "mhaps" | "netflix"
  index: string
  name: string
  subtitle: string
  categories: string[]
  slug: string
  blurb: string
  results: { k: string; v: string }[]
  stack: string[]
  href?: string
  note?: string
}

export const projects: Project[] = [
  {
    id: "medrag",
    index: "01",
    name: "medrag-toolkit",
    subtitle: "modular RAG for medical QA",
    categories: ["RAG", "LLM Infrastructure"],
    slug: "medrag-toolkit / pubmed, rxnorm, openfda",
    blurb:
      "A modular RAG framework for medical question answering with pre-built connectors to PubMed (36M+ abstracts), RxNorm, and OpenFDA. Every response enforces citation grounding and passes an automated hallucination-detection layer. Hybrid retrieval combines dense FAISS with sparse BM25 over Qdrant, and a streaming FastAPI layer supports local backends (Ollama, vLLM) as well as cloud LLMs.",
    results: [
      { k: "Sources", v: "PubMed, RxNorm, OpenFDA" },
      { k: "Retrieval", v: "Dense + sparse hybrid" },
      { k: "Benchmarks", v: "MedQA, MedMCQA" },
    ],
    stack: ["LangChain", "LlamaIndex", "FAISS", "Qdrant", "vLLM", "Ollama", "FastAPI", "Docker"],
    note: "Repo not yet public",
  },
  {
    id: "clinrag",
    index: "02",
    name: "Clinical RAG Evaluation System",
    subtitle: "retrieval over clinical guidelines",
    categories: ["RAG", "Evaluation"],
    slug: "clinical-rag / 5,000+ who and nimh guidelines",
    blurb:
      "A RAG pipeline over 5,000+ WHO and NIMH clinical guidelines using semantic chunking, deployed on AWS Lambda behind FastAPI. LangChain and Pinecone handle retrieval, prompt-injection guardrails sit on the input path, and evaluation logging runs through LangSmith. Benchmarked with RAGAS against GPT-4, then tested with 3 clinical reviewers.",
    results: [
      { k: "Response relevance", v: "91%" },
      { k: "Hallucination reduction", v: "38%" },
      { k: "Verification time", v: "45% faster" },
    ],
    stack: ["LangChain", "Pinecone", "GPT-4", "FastAPI", "AWS Lambda", "RAGAS", "LangSmith"],
    note: "Repo not yet public",
  },
  {
    id: "buildify",
    index: "03",
    name: "Buildify",
    subtitle: "generative floor plan designer",
    categories: ["Generative AI", "Deep Learning"],
    slug: "buildify / room-constraint graph to layout",
    blurb:
      "A custom Mixture of Experts with a 3-layer GCN encoder and a transposed-convolution MaskDecoder. Each expert specializes in one room-type layout, and a learned gating network routes room-constraint graphs to the right expert at inference. Deployed as a HuggingFace Space with a FastAPI backend, with INT8 post-training quantization bringing inference inside a real-time budget.",
    results: [
      { k: "Inference latency", v: "52% lower" },
      { k: "Serving", v: "Single GPU, real time" },
      { k: "Routing", v: "Learned gating network" },
    ],
    stack: ["PyTorch", "Mixture of Experts", "GCN", "HouseGAN++", "FastAPI", "HuggingFace Spaces"],
    note: "Repo not yet public",
  },
  {
    id: "mhaps",
    index: "04",
    name: "Mental Health AI Prediction System",
    subtitle: "multi-modal NLP and ML",
    categories: ["NLP", "Healthcare"],
    slug: "mh-predict / 10k+ clinical screening records",
    blurb:
      "A multi-modal NLP and ML pipeline predicting across 3 diagnostic categories, trained on 10K+ clinical screening records with TF-IDF feature extraction and ensemble classification. Paired with an emotionally-aware chatbot built on TensorFlow and sequence-to-sequence modeling, informed by clinical ground truth from GWU's mental health research program.",
    results: [
      { k: "Accuracy", v: "94%" },
      { k: "Diagnostic categories", v: "3" },
      { k: "Training records", v: "10K+" },
    ],
    stack: ["Python", "TensorFlow", "NLP", "scikit-learn", "Flask"],
    note: "Repo not yet public",
  },
  {
    id: "netflix",
    index: "05",
    name: "Content Recommendation",
    subtitle: "& churn prediction",
    categories: ["Deep Learning", "Recommenders"],
    slug: "streaming-rec / 10M+ viewer records",
    blurb:
      "A graph neural network and collaborative filtering recommendation engine over 10M+ viewer records, with an XGBoost and LSTM/ANN churn model built on the same subscriber features. GNN embeddings over the viewer-title interaction graph feed the recommender, so retention strategy and recommendation stay consistent.",
    results: [
      { k: "Engagement lift", v: "35%" },
      { k: "Churn accuracy", v: "92%" },
      { k: "Churn reduction", v: "20%" },
    ],
    stack: ["Python", "PyTorch", "GNN", "XGBoost", "LSTM"],
    href: "https://github.com/nik-hill-323/Netflix-Recommendation-Churn",
  },
]

/** Public repositories, described as the repos describe themselves. */
export const moreRepos = [
  {
    name: "sepsis-prediction",
    blurb: "Early sepsis prediction in ICU patients using a bidirectional LSTM, flagging at-risk patients ahead of clinical diagnosis.",
    href: "https://github.com/nik-hill-323/sepsis-prediction",
  },
  {
    name: "Traffic-Accident-Prediction",
    blurb: "LSTM and Prophet time-series models with geospatial analysis to find high-risk hotspots across city regions.",
    href: "https://github.com/nik-hill-323/Traffic-Accident-Prediction",
  },
  {
    name: "Retail-Demand-Forecasting",
    blurb: "Demand forecasting with XGBoost and PySpark, plus a markdown optimization step.",
    href: "https://github.com/nik-hill-323/Retail-Demand-Forecasting",
  },
  {
    name: "Telecom-Churn-Analysis",
    blurb: "Churn modeling and customer segmentation with logistic regression, random forest, and K-means.",
    href: "https://github.com/nik-hill-323/Telecom-Churn-Analysis",
  },
]

export const skills = [
  {
    title: "AI / Machine Learning",
    blurb: "Model building, from classical ML through deep learning and computer vision.",
    items: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "XGBoost",
      "LightGBM",
      "BERT",
      "spaCy",
      "Hugging Face",
      "GNN",
      "LSTM",
      "YOLOv5",
      "Faster R-CNN",
    ],
  },
  {
    title: "Generative AI",
    blurb: "LLM application work: agents, retrieval, and the prompting layer around them.",
    items: [
      "OpenAI API",
      "Anthropic (Claude) API",
      "LangChain",
      "LangGraph",
      "RAG",
      "Embeddings",
      "Vector Search",
      "Prompt Engineering",
      "Multi-Agent Systems",
    ],
  },
  {
    title: "RAG Infrastructure & Evaluation",
    blurb: "Vector stores, serving, and the tooling that shows whether a system actually works.",
    items: ["FAISS", "Pinecone", "Qdrant", "pgvector", "vLLM", "Ollama", "RAGAS", "DeepEval", "LangSmith", "MLflow"],
  },
  {
    title: "Data Engineering",
    blurb: "Pipelines and storage, so models run on a schedule instead of on my laptop.",
    items: [
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "Apache Airflow",
      "BigQuery",
      "PySpark",
      "Pandas",
      "ETL Pipelines",
      "REST APIs",
    ],
  },
  {
    title: "Cloud / Engineering",
    blurb: "Deployment, containers, and CI.",
    items: ["AWS (Lambda, EC2, S3, SageMaker)", "GCP", "Docker", "FastAPI", "GitHub Actions", "Git", "CI/CD"],
  },
  {
    title: "Analytics / Visualization",
    blurb: "Statistical methods and the reporting layer stakeholders actually read.",
    items: [
      "Statistical Modeling",
      "Time Series Forecasting",
      "Anomaly Detection",
      "SHAP Explainability",
      "A/B Testing",
      "Causal Inference",
      "Tableau",
      "Power BI",
      "Matplotlib",
      "Plotly",
    ],
  },
]

export const education = [
  {
    degree: "M.S. Data Science",
    school: "George Washington University",
    period: "Jan 2025 to Dec 2026",
    detail: "GPA 3.75. Global Leaders (CCAS) Fellowship, $17,100 (2025). Washington, DC.",
    coursework: [
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Statistical Modeling",
      "Data Mining",
      "Data Visualization",
      "Database Management",
      "GIS",
    ],
  },
]

export const sections = [
  { id: "about", n: "01", label: "About" },
  { id: "projects", n: "02", label: "Projects" },
  { id: "experience", n: "03", label: "Experience" },
  { id: "skills", n: "04", label: "Skills" },
  { id: "education", n: "05", label: "Education" },
  { id: "contact", n: "06", label: "Contact" },
]

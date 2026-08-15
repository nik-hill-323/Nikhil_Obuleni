export const profile = {
  name: "Nikhil Obuleni",
  monogram: "NO",
  role: "Data Scientist",
  location: "Washington, DC",
  email: "nikhil.obuleni@gwu.edu",
  phone: "(571) 478-2007",
  github: "https://github.com/nik-hill-323",
  linkedin: "https://www.linkedin.com/in/nikhil-obuleni",
  resume: "/Nikhil_Obuleni_Resume.pdf",
  tags: ["Data Scientist", "ML · Deep Learning", "M.S. Data Science · GW", "Open to DMV / remote"],
  headline: {
    lead: "Turning messy data into decisions that",
    accent: "hold up",
  },
  summary:
    "I build machine learning models, deep learning systems, and ETL pipelines that survive contact with real operations — humanitarian field data, aerospace imagery, and noisy text at scale. Three years of it, across research and industry.",
}

export const impact = [
  {
    label: "CCAS Global Leaders Fellowship",
    value: 17100,
    prefix: "$",
    blurb: "Awarded 2025 at the George Washington University while completing my M.S. in Data Science.",
  },
  {
    label: "Weighted F1 · disaster impact forecasting",
    value: 78,
    suffix: "%",
    blurb: "ARIMA + LSTM + XGBoost ensemble over 200K humanitarian records spanning 18 countries.",
  },
  {
    label: "NGO data integration time",
    value: 48,
    suffix: " hrs",
    blurb: "Down from 14 days across 6 partner NGOs, using Apache Airflow DAGs on BigQuery.",
  },
  {
    label: "Surveillance efficiency gain",
    value: 30,
    suffix: "%",
    blurb: "YOLOv5 and Faster R-CNN object detection for real-time drone imagery at Asteria Aerospace.",
  },
]

export const about = {
  paragraphs: [
    "I work where modeling meets plumbing. The interesting part of a project is rarely the algorithm — it's the 200K rows arriving in six incompatible schemas, the field constraint nobody documented, and the stakeholder who needs the answer to be interpretable before it can be useful.",
    "Right now I'm an M.S. Data Science candidate at GW (GPA 3.75), running Salesforce data and reporting systems for GW Libraries & Academic Innovation, and consulting on humanitarian forecasting with Data Science for Sustainable Development. Earlier: computer vision and predictive maintenance for drones at Asteria Aerospace, and NLP at scale at Blackoffer.",
    "The through-line is honest data work — models that are evaluated the way they'll actually be used, and pipelines that hold up when nobody's watching them.",
  ],
  facts: [
    { k: "Based in", v: "Washington, DC" },
    { k: "Program", v: "M.S. Data Science, GWU · GPA 3.75" },
    { k: "Focus", v: "Forecasting, deep learning, ETL" },
    { k: "Open to", v: "DMV & remote roles" },
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
    period: "Aug 2025 — Present",
    title: "Student Data & Systems Analyst",
    org: "GW Libraries & Academic Innovation",
    place: "Washington, DC",
    featured: true,
    blurb:
      "Own the operational data layer behind facility access and maintenance across the libraries — the records, the reports, and the automation that keeps both current.",
    points: [
      "Maintain Salesforce CRM records for 500+ weekly facility access requests and maintenance ticket lifecycles, keeping data integrity and consistency across university building systems.",
      "Designed custom Salesforce reports and dashboards for space-utilization KPIs; automated workflows with Salesforce Flow, cutting manual entry time 30% and moving reporting from weekly to daily.",
      "Reconciled 200+ data discrepancies across Salesforce and university building management systems.",
    ],
    stack: ["Salesforce CRM", "Salesforce Flow", "SQL", "Dashboards"],
  },
  {
    kind: "Consulting",
    period: "Feb 2025 — Dec 2026",
    title: "Data Science Consultant",
    org: "Data Science for Sustainable Development",
    place: "Washington, DC · Part-time",
    featured: true,
    blurb:
      "Forecasting disaster impact for humanitarian field teams, and building the pipeline that lets six NGOs share data without a two-week handshake.",
    points: [
      "Developed ARIMA, LSTM, and XGBoost ensemble models on 200K+ humanitarian records spanning 18 countries, reaching 78% weighted F1 on disaster impact forecasting.",
      "Standardized data sharing across 6 partner NGOs with Apache Airflow DAGs on BigQuery — integration time fell from 14 days to 48 hours, enabling near-real-time reporting.",
      "Designed evaluation metrics aligned with field deployment constraints so outputs stayed interpretable for non-technical stakeholders.",
    ],
    stack: ["Python", "ARIMA", "LSTM", "XGBoost", "Airflow", "BigQuery"],
  },
  {
    kind: "Industry",
    period: "May 2023 — Aug 2023",
    title: "Data Science Intern",
    org: "Asteria Aerospace",
    place: "Bangalore, India",
    blurb: "Computer vision and predictive maintenance for a commercial drone fleet.",
    points: [
      "Built YOLOv5 and Faster R-CNN models for real-time drone object detection, improving surveillance efficiency 30% and target recognition accuracy across varied environmental conditions.",
      "Deployed LSTM and Random Forest predictive maintenance models forecasting drone failures — unexpected breakdowns down 25%; an Autoencoder + Isolation Forest anomaly system lifted fault detection 40%.",
      "Ran geospatial analysis on GIS, LiDAR, and satellite imagery, improving navigation accuracy 20% and reducing collision risk 15%.",
    ],
    stack: ["YOLOv5", "Faster R-CNN", "PyTorch", "LiDAR", "GIS"],
  },
  {
    kind: "Industry",
    period: "Sep 2022 — Nov 2022",
    title: "Data Science Intern",
    org: "Blackoffer",
    place: "Remote",
    blurb: "NLP at scale on client text corpora, plus the scraping pipeline that fed it.",
    points: [
      "Applied sentiment analysis, keyword extraction, and topic modeling across 50,000+ text records, improving client campaign targeting accuracy 18%.",
      "Automated large-scale text collection with BeautifulSoup and Scrapy, cutting processing time 40% versus the manual process it replaced.",
      "Built ML models for text classification and clustering, and tuned ETL pipelines for data quality across multiple client projects.",
    ],
    stack: ["Python", "NLTK", "BeautifulSoup", "Scrapy", "ETL"],
  },
]

export type Project = {
  id: "retail" | "netflix" | "traffic"
  index: string
  name: string
  subtitle: string
  categories: string[]
  slug: string
  blurb: string
  results: { k: string; v: string }[]
  stack: string[]
  href?: string
}

export const projects: Project[] = [
  {
    id: "retail",
    index: "01",
    name: "Retail Demand Forecasting",
    subtitle: "& price optimization",
    categories: ["Forecasting", "Optimization"],
    slug: "retail-forecasting / multi-store chain",
    blurb:
      "An end-to-end demand forecasting system across a multi-store retail chain, paired with a markdown optimization algorithm that was A/B tested before it touched a price tag. Forecasts drive the markdown; the markdown gets validated on its own terms.",
    results: [
      { k: "Forecast accuracy", v: "93%" },
      { k: "Stockout reduction", v: "35%" },
      { k: "Profitability lift", v: "12%" },
    ],
    stack: ["Python", "PySpark", "XGBoost", "A/B Testing"],
  },
  {
    id: "netflix",
    index: "02",
    name: "Content Recommendation",
    subtitle: "& churn prediction",
    categories: ["Deep Learning", "Recommenders"],
    slug: "streaming-rec / 10M+ viewer records",
    blurb:
      "A graph neural network and collaborative filtering engine over 10M+ viewer records, boosting engagement 35% — and an XGBoost + LSTM/ANN churn model sitting next to it, so retention strategy and recommendation share the same view of a subscriber.",
    results: [
      { k: "Engagement lift", v: "35%" },
      { k: "Churn accuracy", v: "92%" },
      { k: "Churn reduction", v: "20%" },
    ],
    stack: ["GNN", "Collaborative Filtering", "XGBoost", "LSTM", "ANN"],
  },
  {
    id: "traffic",
    index: "03",
    name: "Traffic Accident Prediction",
    subtitle: "real-time, city-scale",
    categories: ["Forecasting", "Deep Learning", "Geospatial"],
    slug: "traffic-risk / hourly city grid",
    blurb:
      "LSTM and Prophet time-series models predicting congestion and accident frequency across city regions, with geospatial analysis on GIS, Folium, and Plotly surfacing the high-risk hotspots from live public datasets.",
    results: [
      { k: "Horizon", v: "Hourly" },
      { k: "Models", v: "LSTM + Prophet" },
      { k: "Output", v: "Hotspot map" },
    ],
    stack: ["LSTM", "Prophet", "GIS", "Folium", "Plotly"],
  },
]

export const skills = [
  {
    title: "Languages & ML",
    blurb: "The core toolkit — what I reach for first when a problem has a modeling shape.",
    items: [
      "Python",
      "R",
      "SQL",
      "scikit-learn",
      "PyTorch",
      "TensorFlow",
      "XGBoost",
      "LightGBM",
      "ARIMA",
      "LSTM",
      "Random Forest",
      "GNN",
      "YOLOv5",
      "Faster R-CNN",
      "Autoencoders",
      "Isolation Forest",
    ],
  },
  {
    title: "Data & Visualization",
    blurb: "Getting from raw rows to something a stakeholder can act on without a translator.",
    items: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Apache Spark (PySpark)", "Power BI", "Tableau", "Excel"],
  },
  {
    title: "NLP, CV & Methods",
    blurb: "Text, imagery, and the statistical methods that keep results honest.",
    items: [
      "NLP",
      "Computer Vision",
      "Sentiment Analysis",
      "Topic Modeling",
      "Statistical Modeling",
      "Time Series Forecasting",
      "Geospatial Analysis",
    ],
  },
  {
    title: "Cloud & Engineering",
    blurb: "Pipelines and infrastructure so models run on a schedule, not on my laptop.",
    items: [
      "ETL Pipelines",
      "Apache Airflow",
      "BigQuery",
      "AWS (EC2, Lambda, S3)",
      "Salesforce CRM",
      "Salesforce Flow",
      "MongoDB",
      "Docker",
      "Git",
      "REST APIs",
      "GIS",
      "LiDAR",
    ],
  },
]

export const education = [
  {
    degree: "M.S. Data Science",
    school: "The George Washington University",
    period: "Jan 2025 — Present",
    detail: "GPA 3.75 · CCAS Global Leaders Fellowship ($17,100, 2025) · Washington, D.C.",
    coursework: [
      "Machine Learning",
      "Data Visualization",
      "Data Mining",
      "Database Management",
      "GIS",
      "Natural Language Processing",
    ],
  },
]

export const sections = [
  { id: "about", n: "01", label: "About" },
  { id: "experience", n: "02", label: "Experience" },
  { id: "projects", n: "03", label: "Projects" },
  { id: "skills", n: "04", label: "Skills" },
  { id: "education", n: "05", label: "Education" },
  { id: "contact", n: "06", label: "Contact" },
]

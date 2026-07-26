// main.js - Interactivity & SVG Node Inspector for Sabrina Picari's Portfolio

// Node database containing technical details for each workflow step (in English)
const nodeDatabase = {
  // Workflow 1: Web Review Scraping & Catalog Match Engine
  "trigger": {
    title: "Cron / Webhook Trigger",
    type: "Trigger Node",
    desc: "Starts the workflow execution on a scheduled basis (e.g., weekly sitemap checks) or manually via webhook triggers.",
    meta: {
      "Frequency": "5-6 times per month",
      "Timeout": "None (Instant)",
      "Input": "Scheduled cron or single URL payload"
    },
    schema: `{
  "timestamp": "2026-07-26T15:00:00Z",
  "source": "cron_scheduler",
  "executionMode": "automated"
}`
  },
  "http-discover": {
    title: "Discover Review URLs",
    type: "HTTP Request Node",
    desc: "Performs an HTTP GET request to download sitemaps or RSS feeds from supported review portals, identifying links for recently published articles.",
    meta: {
      "Method": "GET",
      "Auth": "None (Public Scraping)",
      "Output Format": "XML / RSS Feed"
    },
    schema: `{
  "urls": [
    "https://www.outdoorgear-example.com/reviews/backpack-2026",
    "https://www.outdoorgear-example.com/reviews/sleeping-bag-pro"
  ]
}`
  },
  "crawler": {
    title: "HTTP Review Crawler",
    type: "HTTP Request Node",
    desc: "Downloads the raw HTML source code of the target review page for downstream data extraction.",
    meta: {
      "Method": "GET",
      "Headers": "Realistic User-Agent (Anti-Bot bypass)",
      "Status": "Work in Progress"
    },
    schema: `{
  "statusCode": 200,
  "htmlLength": 145028,
  "contentType": "text/html; charset=utf-8"
}`
  },
  "strategy-split": {
    title: "Strategy Router",
    type: "Code Node (JavaScript)",
    desc: "Parses the downloaded HTML layout to detect if valid JSON-LD metadata is present. If found, it routes to the JSON-LD Parser; otherwise, it triggers the fallback CSS scraper and AI extractor.",
    meta: {
      "Language": "JavaScript (ES6)",
      "Execution Time": "~15ms",
      "Condition": "Presence of script[type='application/ld+json']"
    },
    schema: `{
  "hasJsonLd": true,
  "targetRoute": "json-ld-path"
}`
  },
  "jsonld-extract": {
    title: "JSON-LD Extractor",
    type: "HTML Node",
    desc: "Extracts and decodes the JSON-LD metadata block to immediately retrieve structured fields such as product name, original rating, author, and publish date.",
    meta: {
      "CSS Selector": "script[type='application/ld+json']",
      "Format": "JSON Parsing",
      "Accuracy": "Highest (Native Data)"
    },
    schema: `{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "Trekking Backpack Aero 45"
  },
  "reviewRating": {
    "ratingValue": "4.5",
    "bestRating": "5"
  }
}`
  },
  "html-extract": {
    title: "HTML Scraper (Fallback)",
    type: "HTML Node",
    desc: "A fallback CSS selector node that reads the page visual layout elements (headings, rating divs, meta tags) when structured JSON-LD is missing.",
    meta: {
      "Selectors": "h1.title, .rating-score, time.entry-date",
      "Fallback": "Active when JSON-LD is absent",
      "Robustness": "HTML-layout dependent"
    },
    schema: `{
  "scrapedTitle": "In-Depth Review: Aero 45 Backpack",
  "scrapedRating": "Rating: 9 out of 10",
  "scrapedDate": "26 July 2026"
}`
  },
  "ai-extraction": {
    title: "AI Metadata Extraction",
    type: "OpenAI Agent Node",
    desc: "An LLM agent that processes the cleaned HTML text to extract product details, rating values, and review highlights, filling in missing catalog fields.",
    meta: {
      "AI Model": "GPT-4o-mini",
      "Avg Cost": "< $0.005 per run",
      "Prompt": "Structured JSON schema extraction"
    },
    schema: `{
  "extractedProduct": "Aero 45 Backpack",
  "extractedRating": 4.5,
  "confidenceScore": 0.95
}`
  },
  "normalize": {
    title: "Data Normalizer",
    type: "Code Node (JavaScript)",
    desc: "Unifies and cleanses raw data from both scraping branches. Formats review dates to ISO standard and normalizes ratings to a standardized decimal scale.",
    meta: {
      "Language": "JavaScript",
      "Output": "Canonical Review Schema",
      "Error Handling": "Required Fields Validation"
    },
    schema: `{
  "productName": "Aero 45 Backpack",
  "ratingNormalized": 9.0,
  "publishDate": "2026-07-26",
  "author": "Sabri P."
}`
  },
  "opensearch-match": {
    title: "Catalog Lookup",
    type: "OpenSearch Query Node",
    desc: "Queries the central product catalog using a fuzzy match on the product name. Returns the top 3 candidate matches with their catalog IDs, prices, and categories.",
    meta: {
      "Database": "OpenSearch (Fuzzy Match)",
      "Query Params": "Fuzziness: AUTO, Min_score: 1.2",
      "Results": "Top 3 candidates"
    },
    schema: `{
  "candidates": [
    { "id": "cat-88902", "name": "Aero 45 Trekking Backpack Black", "score": 24.5 },
    { "id": "cat-88903", "name": "Aero 35 Light Backpack Blue", "score": 12.1 }
  ]
}`
  },
  "ai-verify": {
    title: "Semantic AI Verification",
    type: "OpenAI Agent Node",
    desc: "An LLM agent that compares the scraped review name and matched catalog candidates to semantically confirm if they represent the same item, resolving naming differences and model codes.",
    meta: {
      "AI Model": "GPT-4o-mini",
      "Input": "Review Name + Catalog Matches",
      "Decision": "Boolean Match + Explanation"
    },
    schema: `{
  "isMatch": true,
  "matchedId": "cat-88902",
  "reason": "The review mentions 'Aero 45' and the candidate 'Aero 45 Trekking Backpack Black' is the same model, differentiated only by color in the catalog database."
}`
  },
  "ai-fazit": {
    title: "AI Fazit Generation (WIP)",
    type: "OpenAI Agent Node",
    desc: "Analyzes the review text to generate a concise, editorial-style summary (Fazit) and extract pros/cons. An automated multi-language translation feature (IT, EN, ES, FR) is currently in development.",
    meta: {
      "AI Model": "GPT-4o-mini (Structured Output)",
      "Projected Savings": "Additional 2 hours manual work",
      "Translation Frequency": "1-2 times per month"
    },
    schema: `{
  "verdict": "An outstanding lightweight, ergonomic hiking backpack. Highly durable construction. Main drawback is the delicate top zipper.",
  "pros": ["Lightweight", "Breathable back padding"],
  "cons": ["Fragile top zipper"]
}`
  },
  "sharepoint-upload": {
    title: "SharePoint Exporter",
    type: "SharePoint Node",
    desc: "Collects the fully matched review object, serializes it to a CSV row, and appends it to SharePoint for access by marketing and sales teams.",
    meta: {
      "Target": "SharePoint Document Library",
      "Format": "CSV (Append)",
      "Status": "Ready"
    },
    schema: `{
  "status": "success",
  "filePath": "/Shared Documents/Reviews/Scraped_Reviews_2026_07.csv",
  "recordsAppended": 1
}`
  },

  // Workflow 2: Product Test PDF Extraction & Ingestion Pipeline
  "pdf-trigger": {
    title: "Weekly Scheduler",
    type: "Schedule Trigger",
    desc: "Launches the automation weekly to scan and process the queue of newly uploaded test reports.",
    meta: {
      "Frequency": "Once a week (4-5/month)",
      "Type": "Scheduled Cron",
      "Manual Savings": "~2 hours per week"
    },
    schema: `{
  "cronExpression": "0 8 * * 1",
  "timezone": "Europe/Berlin"
}`
  },
  "pdf-list": {
    title: "List SharePoint Files",
    type: "SharePoint Node",
    desc: "Scans the incoming test reports folder on SharePoint to fetch the list of unprocessed PDF files.",
    meta: {
      "Method": "List Folder",
      "Extension Filter": ".pdf",
      "Path": "/Shared Documents/Incoming_PDF_Tests/"
    },
    schema: `[
  { "name": "Satvision_Test_Report_06_2026.pdf", "size": 345237, "id": "sp-file-991" },
  { "name": "AudioVision_Test_06_2026.pdf", "size": 197327, "id": "sp-file-992" }
]`
  },
  "pdf-filter": {
    title: "Filter Unprocessed Files",
    type: "Filter Node",
    desc: "Cross-references the file list against the historical database of processed reports to prevent duplicate runs.",
    meta: {
      "Condition": "fileName NOT IN processedHistory",
      "Input": "SharePoint file list",
      "Output": "Unprocessed files list"
    },
    schema: `{
  "unprocessedFiles": [
    { "name": "Satvision_Test_Report_06_2026.pdf", "id": "sp-file-991" }
  ]
}`
  },
  "pdf-loop": {
    title: "Batch File Loop",
    type: "Loop Node",
    desc: "Iterates through unprocessed PDF files one-by-one, pacing the execution flow to prevent API rate limits and execution timeouts.",
    meta: {
      "Type": "Loop Over Items",
      "Batch Size": 1,
      "Status": "Active"
    },
    schema: `{
  "currentIndex": 0,
  "totalItems": 1,
  "currentItem": { "name": "Satvision_Test_Report_06_2026.pdf" }
}`
  },
  "pdf-download": {
    title: "Download SharePoint PDF",
    type: "SharePoint Node",
    desc: "Downloads the binary PDF file stream from SharePoint into n8n local memory.",
    meta: {
      "Method": "Get File Content",
      "Output Type": "Binary Stream",
      "Buffer Size": "345 KB"
    },
    schema: `{
  "binaryKey": "data",
  "fileName": "Satvision_Test_Report_06_2026.pdf",
  "mimeType": "application/pdf"
}`
  },
  "pdf-ai-extract": {
    title: "AI PDF Test Extractor",
    type: "OpenAI Agent Node",
    desc: "Reads the PDF document to extract structured data: brand, model, final rating, pros/cons, and the original German editorial verdict (Fazit).",
    meta: {
      "AI Model": "GPT-4o (Vision/Structured Parsing)",
      "Prompt": "JSON Schema Extraction",
      "Accuracy": "Validated on visual PDF templates"
    },
    schema: `{
  "brand": "Satvision",
  "product": "Model X-Smart TV",
  "score": "92%",
  "verdict_de": "Ein hervorragender Fernseher mit exzellentem Bild und einfacher Bedienung.",
  "pros": ["Gorgeous OLED display", "Responsive user interface"],
  "cons": ["Premium price point"]
}`
  },
  "pdf-catalog-match": {
    title: "OpenSearch Catalog Match",
    type: "OpenSearch Query Node",
    desc: "Queries the central product catalog using OpenSearch fuzzy query to associate the review PDF with the correct product ID.",
    meta: {
      "Query Method": "Fuzzy Match on Brand/Name",
      "Database": "Central Catalog",
      "Result": "Returns Unique Catalog Product ID"
    },
    schema: `{
  "catalogProductId": "prod-109283",
  "officialName": "X-Smart TV OLED 55",
  "matchingScore": 98.4
}`
  },
  "pdf-split-route": {
    title: "Master / Multilingual Router",
    type: "Split Node",
    desc: "Splits the data path: exports the original German master to SharePoint, and triggers the localization loop for foreign markets.",
    meta: {
      "Branches": "2 (DE Master vs Localizer)",
      "Output": "Duplicated payload to both branches"
    },
    schema: `{
  "masterChannel": "export-de",
  "multilingualChannel": "start-localization"
}`
  },
  "pdf-lang-versions": {
    title: "Create Language Matrix",
    type: "Code Node (JavaScript)",
    desc: "Creates localized translation task objects for English, Italian, Spanish, and French, initializing language configurations.",
    meta: {
      "Language": "JavaScript",
      "Target Languages": "IT, EN, ES, FR",
      "Output": "Array of 4 translation tasks"
    },
    schema: `[
  { "lang": "it", "prefix": "Recensione", "rating_text": "Ottimo" },
  { "lang": "en", "prefix": "Review", "rating_text": "Excellent" }
]`
  },
  "pdf-ai-translate": {
    title: "AI Multilingual Localizer",
    type: "OpenAI Agent Node",
    desc: "Translates and localizes the German summary verdict (Fazit). Adapts technical vocabulary, category prefixes, and rating texts for each target market.",
    meta: {
      "AI Model": "GPT-4o-mini",
      "Task": "Translation + Adaptability",
      "Concurrency": "Parallel Execution"
    },
    schema: `{
  "lang": "it",
  "verdict_localized": "Un televisore eccezionale con una qualita dell immagine superba e un interfaccia molto reattiva.",
  "rating_text_localized": "Eccellente",
  "category_prefix": "TV OLED"
}`
  },
  "pdf-export": {
    title: "CSV Exporter & SharePoint Upload",
    type: "SharePoint Node",
    desc: "Compiles localized CSV files and uploads them to language-specific SharePoint folders, ready for human review before publishing.",
    meta: {
      "SharePoint Target": "/Shared Documents/Editorial_Feeds/{lang}/",
      "Formats": "IT, EN, ES, FR, DE CSVs",
      "Outcome": "Zero-touch localized publications"
    },
    schema: `{
  "uploadStatus": "success",
  "writtenFiles": [
    "Satvision_TV_Report_IT.csv",
    "Satvision_TV_Report_EN.csv"
  ]
}`
  }
};

// Initialize interactive SVGs
document.addEventListener("DOMContentLoaded", () => {
  // Setup theme toggle buttons
  setupThemeToggle();

  // Select all SVG flow nodes
  const nodes = document.querySelectorAll(".svg-flow-node");
  
  if (nodes.length > 0) {
    // Add hover and click event listeners
    nodes.forEach(node => {
      node.addEventListener("click", (e) => {
        const nodeId = node.getAttribute("data-node");
        selectNode(nodeId, node);
      });

      node.addEventListener("mouseover", (e) => {
        node.classList.add("hovered");
      });

      node.addEventListener("mouseout", (e) => {
        node.classList.remove("hovered");
      });
    });

    // Auto-select first node in the workflow on load
    const firstNode = nodes[0];
    if (firstNode) {
      const nodeId = firstNode.getAttribute("data-node");
      selectNode(nodeId, firstNode);
    }
  }

  // Scroll observer to reveal items smoothly
  setupScrollAnimations();
});

// Select a node and populate the inspector panel
function selectNode(nodeId, nodeElement) {
  const data = nodeDatabase[nodeId];
  if (!data) return;

  // Update active class on SVG nodes
  document.querySelectorAll(".svg-flow-node").forEach(n => {
    n.classList.remove("active");
  });
  nodeElement.classList.add("active");

  // Update active class on connector paths if present
  document.querySelectorAll("path.flow-connector").forEach(path => {
    path.classList.remove("active");
    // If the path's data-connection matches the nodeId, highlight it
    const connection = path.getAttribute("data-connection");
    if (connection && connection.split(",").includes(nodeId)) {
      path.classList.add("active");
    }
  });

  // Populate Inspector Panel
  const panel = document.getElementById("inspector");
  if (!panel) return;

  // Map node type to style indicator classes
  let typeClass = "trigger";
  if (data.type.toLowerCase().includes("code")) {
    typeClass = "code";
  } else if (data.type.toLowerCase().includes("openai") || data.type.toLowerCase().includes("ai")) {
    typeClass = "ai";
  } else if (data.type.toLowerCase().includes("wip")) {
    typeClass = "wip";
  }

  // Generate metadata HTML
  let metaHtml = "";
  if (data.meta) {
    metaHtml = '<div class="inspector-meta">';
    for (const [key, val] of Object.entries(data.meta)) {
      metaHtml += `
        <div class="meta-row">
          <span class="meta-label">${key}:</span>
          <span class="meta-val">${val}</span>
        </div>
      `;
    }
    metaHtml += "</div>";
  }

  // Generate schema HTML
  let schemaHtml = "";
  if (data.schema) {
    // Escape HTML tags to prevent breaking syntax display
    const escapedSchema = data.schema
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt bridge;");
    
    schemaHtml = `
      <div style="margin-top: 1.5rem;">
        <span class="meta-label">Data Output Schema:</span>
        <pre class="schema-block"><code>${escapedSchema}</code></pre>
      </div>
    `;
  }

  // Set the content with smooth transition (fade out, change content, fade in)
  panel.style.opacity = 0;
  panel.style.transform = "translateY(5px)";
  
  setTimeout(() => {
    panel.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-node-type ${typeClass}">${data.type}</div>
        <h3 class="inspector-title">${data.title}</h3>
      </div>
      <div class="inspector-body">
        <p>${data.desc}</p>
        ${metaHtml}
        ${schemaHtml}
      </div>
    `;
    panel.style.opacity = 1;
    panel.style.transform = "translateY(0)";
  }, 150);
}

// Fade in elements as they enter the screen
function setupScrollAnimations() {
  const options = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Add scroll-reveal transition to index cards
  const cards = document.querySelectorAll(".glass");
  cards.forEach(card => {
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    observer.observe(card);
  });

  // Inject dynamic styles for activation
  const style = document.createElement("style");
  style.innerHTML = `
    .glass.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

// Setup theme toggle logic (system preference + local storage overrides)
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Also listen for system theme changes if no local preference is set
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark");
    }
  });
}

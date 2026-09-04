const projects = [
  { slug: "stackscout", name: "StackScout", category: "Technology", icon: "S", color: "teal", summary: "Compare technology choices without drowning in technical language.", purpose: "Helps you narrow down the right tools for a project by comparing what matters most.", audience: "People choosing technology for a new idea", stage: "New", price: "Free", url: "https://stack-scout-cw.tumalanct.chatgpt.site", outcome: "Choose a practical technology direction", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "gamegrid", name: "GameGrid", category: "Sports & teams", icon: "G", color: "blue", summary: "Turn scattered game details into one clear team schedule.", purpose: "Keeps practices, games, locations, and team plans together so fewer details get lost.", audience: "Coaches, players, and team organizers", stage: "New", price: "Free", url: "https://game-grid-cw.tumalanct.chatgpt.site", outcome: "Build and review a sports schedule", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "lessonlab", name: "LessonLab", category: "Teaching & learning", icon: "L", color: "gold", summary: "Build a balanced lesson around the time you actually have.", purpose: "Helps teachers shape a lesson with a clear beginning, activity, and close.", audience: "Teachers, tutors, and workshop leaders", stage: "New", price: "Free", url: "https://lesson-lab-cw.tumalanct.chatgpt.site", outcome: "Create a timed lesson plan", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "cartcompare", name: "CartCompare", category: "Shopping", icon: "C", color: "coral", summary: "Compare what purchases really cost before you decide.", purpose: "Places prices and practical differences side by side for a calmer buying decision.", audience: "Anyone comparing products or shopping options", stage: "New", price: "Free", url: "https://cart-compare-cw.tumalanct.chatgpt.site", outcome: "Compare the true cost of several choices", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "pocketbalance", name: "PocketBalance", category: "Money", icon: "P", color: "green", summary: "See your month clearly without building a complicated budget.", purpose: "Creates a simple snapshot of money coming in, going out, and remaining.", audience: "People who want a gentler view of monthly finances", stage: "New", price: "Free", url: "https://pocket-balance-cw.tumalanct.chatgpt.site", outcome: "Create a monthly financial snapshot", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "dayframe", name: "DayFrame", category: "Personal planning", icon: "D", color: "violet", summary: "Plan a day that respects your actual time and energy.", purpose: "Turns a long task list into a realistic daily plan with room to breathe.", audience: "Busy people who want a more realistic day", stage: "New", price: "Free", url: "https://day-frame-cw.tumalanct.chatgpt.site", outcome: "Shape a realistic plan for today", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "mealmap", name: "MealMap", category: "Food & home", icon: "M", color: "coral", summary: "Make a practical weeknight meal plan from what works for you.", purpose: "Reduces the daily question of what to cook by mapping meals across the week.", audience: "Households planning everyday meals", stage: "New", price: "Free", url: "https://meal-map-cw.tumalanct.chatgpt.site", outcome: "Create a weeknight meal plan", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "homerhythm", name: "HomeRhythm", category: "Food & home", icon: "H", color: "gold", summary: "Keep small home-maintenance jobs from becoming big surprises.", purpose: "Organizes recurring household care into a schedule you can actually follow.", audience: "Renters and homeowners managing a household", stage: "New", price: "Free", url: "https://home-rhythm-cw.tumalanct.chatgpt.site", outcome: "Build a home-maintenance rhythm", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "packlight", name: "PackLight", category: "Travel", icon: "P", color: "blue", summary: "Pack for a trip without carrying your whole closet.", purpose: "Builds a focused carry-on list around the trip, weather, and activities.", audience: "Travelers who want to pack lighter", stage: "New", price: "Free", url: "https://pack-light-cw.tumalanct.chatgpt.site", outcome: "Create a practical carry-on list", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
  { slug: "briefbuilder", name: "BriefBuilder", category: "Creative work", icon: "B", color: "teal", summary: "Turn a loose idea into a brief another person can understand.", purpose: "Guides creative thoughts into a clear purpose, audience, and direction.", audience: "Creators, freelancers, and small teams", stage: "New", price: "Free", url: "https://brief-builder-cw.tumalanct.chatgpt.site", outcome: "Create a focused creative brief", note: "This is a new CreatorWorks listing. Community evidence has not been collected yet." },
];

projects.forEach((project, index) => {
  project.preview = `assets/previews/${project.slug}.png`;
  project.reviewCount = 0;
  project.recentOrder = projects.length - index;
});

const productBenefits = {
  stackscout: ["Compare choices side by side", "Focus on the tradeoffs that matter", "Leave with a practical direction"],
  gamegrid: ["Keep games and practices together", "Make locations easier to find", "Give the whole team one clear schedule"],
  lessonlab: ["Plan around the time you have", "Balance the lesson from start to finish", "Leave with a timed lesson plan"],
  cartcompare: ["See options side by side", "Compare the true cost", "Make a calmer buying decision"],
  pocketbalance: ["See money in and money out", "Understand what remains this month", "Get a simple financial snapshot"],
  dayframe: ["Turn tasks into a realistic day", "Plan around your available energy", "Leave room to breathe"],
  mealmap: ["Map meals across the week", "Reduce daily dinner decisions", "Build a practical weeknight plan"],
  homerhythm: ["Organize recurring home care", "See what needs attention next", "Keep small jobs from becoming surprises"],
  packlight: ["Plan around your trip and weather", "Pack for the activities ahead", "Build a focused carry-on list"],
  briefbuilder: ["Clarify the purpose of your idea", "Name the audience it should reach", "Create a brief others can understand"],
};

projects.forEach(project => { project.benefits = productBenefits[project.slug]; });

const categories = [
  { name: "Technology", icon: "⌘", prompt: "Choose tools with more confidence", color: "teal" },
  { name: "Sports & teams", icon: "◉", prompt: "Keep the whole team in sync", color: "blue" },
  { name: "Teaching & learning", icon: "✎", prompt: "Make learning easier to shape", color: "gold" },
  { name: "Shopping", icon: "◇", prompt: "Make a clearer buying decision", color: "coral" },
  { name: "Money", icon: "$", prompt: "Understand where things stand", color: "green" },
  { name: "Personal planning", icon: "✓", prompt: "Make room for what matters", color: "violet" },
  { name: "Food & home", icon: "⌂", prompt: "Make everyday home life lighter", color: "gold" },
  { name: "Travel", icon: "↗", prompt: "Prepare without overthinking", color: "blue" },
  { name: "Creative work", icon: "✦", prompt: "Give an idea a clearer shape", color: "teal" },
];

const state = {
  route: "discover",
  selected: null,
  category: "All",
  sort: "recent",
  query: "",
  saved: new Set(JSON.parse(localStorage.getItem("creatorworks-saved") || "[]")),
  creatorStep: 0,
  creator: { url: "", stage: "Someone can try it", audience: "", benefit: "", participant: "" },
};

const app = document.querySelector("#app");
const nav = document.querySelector(".site-nav");
const menu = document.querySelector(".menu-toggle");
let detailReturnFocus = null;
let detailScrollY = 0;
const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

function categoryIcon(category) {
  const paths = {
    "Technology": '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    "Sports & teams": '<circle cx="12" cy="12" r="9"/><path d="M12 3c2.3 2.2 3.5 5.2 3.5 9S14.3 18.8 12 21M3.5 9h17M3.5 15h17"/>',
    "Teaching & learning": '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z"/>',
    "Shopping": '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/>',
    "Money": '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h5M7 10h5M7 14h3"/>',
    "Personal planning": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 5 2 2 4-4"/>',
    "Food & home": '<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3V11Z"/>',
    "Travel": '<path d="m22 2-7 20-4-9-9-4 20-7Z"/>',
    "Creative work": '<path d="m12 3 1.7 4.6L18 9.3 13.7 11 12 16l-1.7-5L6 9.3l4.3-1.7L12 3Zm7 11 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[category] || paths.Technology}</svg>`;
}

function productCard(product, compact = false) {
  const saved = state.saved.has(product.slug);
  return `<article class="product-card ${compact ? "compact" : ""}">
    <button class="save-button ${saved ? "is-saved" : ""}" data-save="${product.slug}" aria-label="${saved ? "Remove" : "Save"} ${product.name}">${saved ? "♥" : "♡"}</button>
    <button class="product-card-main" data-product="${product.slug}">
      <span class="product-preview"><img src="${product.preview}" alt="Preview of the ${product.name} website" loading="lazy" /></span>
      <span class="product-icon ${product.color}">${categoryIcon(product.category)}</span>
      <span class="product-meta"><span>${product.category}</span><span>${product.stage}</span></span>
      <strong>${product.name}</strong>
      <p>${product.summary}</p>
      <span class="product-outcome">You can: ${product.outcome}</span>
    </button>
    <div class="product-card-foot"><span>${product.price}</span><button data-product="${product.slug}">See how it helps <span>→</span></button></div>
  </article>`;
}

function discover() {
  const filtered = projects.filter(product => {
    const categoryMatch = state.category === "All" || product.category === state.category;
    const text = `${product.name} ${product.category} ${product.summary} ${product.purpose} ${product.audience}`.toLowerCase();
    return categoryMatch && text.includes(state.query.toLowerCase());
  }).sort((a, b) => state.sort === "reviewed" ? b.reviewCount - a.reviewCount || b.recentOrder - a.recentOrder : b.recentOrder - a.recentOrder);
  return `<section class="page-shell discover-page">
    <div class="page-intro"><p class="eyebrow">Discover</p><h1>Find solutions others have already made.</h1><p>Ten independent tools. Each one solves a specific, everyday problem.</p></div>
    <div class="catalog-controls">
      <label class="catalog-search"><span>⌕</span><input data-catalog-search value="${esc(state.query)}" placeholder="Search by problem or tool" /></label>
      <label class="sort-control">Sort by <select data-sort-select><option value="recent" ${state.sort === "recent" ? "selected" : ""}>Most recent</option><option value="reviewed" ${state.sort === "reviewed" ? "selected" : ""}>Most reviewed</option></select></label>
    </div>
    <div class="catalog-layout">
      <aside class="filter-panel"><div><strong>Filter by category</strong><button data-category-filter="All" class="${state.category === "All" ? "is-selected" : ""}"><span>All tools</span><b>${projects.length}</b></button>${categories.map(category => { const count = projects.filter(product => product.category === category.name).length; return `<button data-category-filter="${category.name}" class="${state.category === category.name ? "is-selected" : ""}">${categoryIcon(category.name)}<span>${category.name}</span><b>${count}</b></button>`; }).join("")}</div><div class="filter-trust"><strong>Nothing paid its way here.</strong><p>Position follows the sorting choice above—not advertising.</p></div></aside>
      <div class="catalog-results"><div class="results-heading"><strong>${filtered.length} ${filtered.length === 1 ? "solution" : "solutions"}</strong><span>${state.sort === "reviewed" ? "No reviews have been collected yet." : "Newest listings first."}</span></div><div class="catalog-list">${filtered.length ? filtered.map(product => catalogRow(product)).join("") : `<div class="empty-state"><h2>Nothing matched that search.</h2><p>Try fewer words or explore another category.</p><button class="secondary-button" data-clear-search>Clear search</button></div>`}</div></div>
    </div>
  </section>`;
}

function catalogRow(product) {
  const saved = state.saved.has(product.slug);
  return `<article class="catalog-row"><button class="row-preview" data-product="${product.slug}"><img src="${product.preview}" alt="Preview of the ${product.name} website" loading="lazy" /></button><div class="row-copy"><div class="product-meta"><span>${product.category}</span><span>${product.stage}</span></div><button class="row-title" data-product="${product.slug}">${product.name}</button><p>${product.summary}</p><strong>${product.price}</strong><small>${product.reviewCount} reviews · Added recently</small></div><div class="row-actions"><button class="save-button-row ${saved ? "is-saved" : ""}" data-save="${product.slug}">${saved ? "♥ Saved" : "♡ Save"}</button><button class="secondary-button" data-product="${product.slug}">View details</button></div></article>`;
}

function detailDrawer(product) {
  const saved = state.saved.has(product.slug);
  return `<div class="detail-overlay" data-detail-overlay>
    <button class="detail-backdrop" data-detail-close aria-label="Close product details"></button>
    <section class="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title-${product.slug}" tabindex="-1">
      <div class="detail-scroll">
        <header class="detail-product-header">
          <div class="detail-heading-copy"><div class="product-meta"><span>${product.category}</span><span>${product.stage}</span></div><h2 id="detail-title-${product.slug}">${product.name}</h2><p>${product.summary}</p></div>
          <div class="detail-header-controls"><button class="detail-save ${saved ? "is-saved" : ""}" data-save="${product.slug}">${saved ? "♥ Saved" : "♡ Save"}</button><button class="detail-close" data-detail-close aria-label="Close ${product.name} details">×</button></div>
        </header>
        <figure class="detail-preview"><img src="${product.preview}" alt="Preview of the ${product.name} website" /><figcaption>Actual product preview</figcaption></figure>
        <div class="detail-try-bar"><a class="primary-button" href="${product.url}" target="_blank" rel="noopener">Try ${product.name} <span>↗</span></a><div><strong>${product.price}</strong><span>Opens the creator’s site</span></div></div>
        <div class="detail-evaluation">
          <p class="detail-description">${product.purpose}</p>
          <ul class="benefit-list">${product.benefits.map(benefit => `<li><span>✓</span><strong>${benefit}</strong></li>`).join("")}</ul>
          <div class="detail-trust-row"><span>New listing</span><span>${product.reviewCount} reviews</span><span>Listed on CreatorWorks</span></div>
          <details class="detail-more"><summary>More about this project <span aria-hidden="true">＋</span></summary><div><dl><div><dt>Made for</dt><dd>${product.audience}</dd></div><div><dt>What you can do</dt><dd>${product.outcome}</dd></div><div><dt>Current stage</dt><dd>${product.stage}</dd></div></dl><p>${product.note}</p></div></details>
          <div class="detail-return"><p><strong>Come back after you try it.</strong> Your place in the catalog will be waiting.</p><button class="text-button" data-feedback="${product.slug}">Share what happened →</button></div>
        </div>
      </div>
    </section>
  </div>`;
}

function openProductDetail(product, trigger) {
  closeProductDetail(false);
  state.selected = product;
  detailReturnFocus = trigger || document.activeElement;
  detailScrollY = window.scrollY;
  document.body.insertAdjacentHTML("beforeend", detailDrawer(product));
  document.body.classList.add("is-dialog-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${detailScrollY}px`;
  document.body.style.width = "100%";
  document.querySelector(".detail-close")?.focus();
}

function closeProductDetail(restoreFocus = true) {
  const wasOpen = Boolean(document.querySelector(".detail-overlay"));
  document.querySelector(".detail-overlay")?.remove();
  document.body.classList.remove("is-dialog-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  if (restoreFocus && detailReturnFocus?.isConnected) detailReturnFocus.focus({ preventScroll: true });
  if (wasOpen) window.scrollTo({ top: detailScrollY, behavior: "auto" });
  detailReturnFocus = null;
}

function feedbackPage() {
  const product = state.selected || projects[0];
  return `<section class="page-shell feedback-page"><div class="feedback-card"><span class="product-icon ${product.color}">${categoryIcon(product.category)}</span><p class="eyebrow">Your experience with ${product.name}</p><h1>What happened when you tried it?</h1><p>Honest observations help more than compliments. This prototype keeps your response in this browser only.</p><div class="feedback-choices"><button>It helped me finish the task</button><button>I understood how it worked</button><button>I got stuck somewhere</button><button>I would use it again</button></div><label>What should the creator understand?<textarea placeholder="Tell them what worked or what got in your way."></textarea></label><div class="form-actions"><button class="secondary-button" data-product="${product.slug}">Not now</button><button class="primary-button" data-feedback-submit>Save my response</button></div></div></section>`;
}

function sharePage() {
  const steps = [shareStart, shareStage, shareAudience, shareBenefit, shareInvitation, shareComplete];
  return `<section class="share-page page-shell">${steps[state.creatorStep]()}</section>`;
}

function shareFrame(title, copy, body, nextLabel = "Continue") {
  const progress = ((state.creatorStep + 1) / 6) * 100;
  return `<div class="share-layout"><aside class="share-visual"><div class="share-visual-copy"><p class="eyebrow">For people who make things</p><h2>You do not have to sell it yet.</h2><p>Share it with a few people. Learn what truly helps. Improve it with confidence.</p></div><img src="assets/illustrations/creatorworks-creator-benefit-v2.png" alt="A creator shares an early product, learns from trusted people, and improves it before selling." /></aside><div class="share-work"><div class="share-progress"><span style="width:${progress}%"></span></div><p class="eyebrow">Your private workspace · ${state.creatorStep + 1} of 6</p><h1>${title}</h1><p class="share-copy">${copy}</p>${body}<div class="form-actions">${state.creatorStep > 0 ? `<button class="secondary-button" data-share-back>Back</button>` : `<button class="secondary-button" data-route="discover">Not now</button>`}<button class="primary-button" data-share-next>${nextLabel}</button></div><p class="privacy-note">🔒 Private until you choose otherwise. Your work remains yours.</p></div></div>`;
}

function shareStart() {
  return shareFrame("What are you making?", "Start with the place where someone can experience it.", `<label class="big-input">Project link<input data-creator-field="url" value="${esc(state.creator.url)}" placeholder="https://your-project.com" /></label><button class="drop-zone" data-demo-drop><span>＋</span><strong>Or add a safe preview</strong><small>Screenshot, short video, or public description</small></button>`, "I’m ready");
}
function shareStage() {
  const options = ["I’m still shaping it", "Someone can try it", "People already use it"];
  return shareFrame("What describes you today?", "There is no impressive answer. Choose what is true.", optionButtons(options, state.creator.stage, "stage"), "That feels right");
}
function shareAudience() {
  return shareFrame("Who is most likely to use it?", "Pick the kind of person you want to help first.", `<label class="big-input">The person I have in mind<input data-creator-field="audience" value="${esc(state.creator.audience)}" placeholder="For example: busy parents" /></label>`, "That’s who it’s for");
}
function shareBenefit() {
  const options = ["Save them time", "Make something easier", "Help them create", "Keep them organized", "Help them decide"];
  return shareFrame("How could it help them?", "Choose the main difference you hope it makes.", optionButtons(options, state.creator.benefit, "benefit"), "Prepare an invitation");
}
function shareInvitation() {
  return shareFrame("Who could try it first?", "Begin with one honest conversation—not a public launch.", `<label class="big-input">First person<input data-creator-field="participant" value="${esc(state.creator.participant)}" placeholder="Their first name" /></label><div class="invitation-preview"><span>Private invitation</span><p>“I made something and thought of you. Would you try it and tell me what happened?”</p><small>One person · private link · not searchable</small></div>`, "Create my private invitation");
}
function shareComplete() {
  const name = state.creator.participant || "someone you trust";
  return shareFrame("You are ready for one honest conversation.", `Your work does not need to compete yet. Let ${esc(name)} experience it and tell you what is true.`, `<div class="completion-mark">✓</div><div class="completion-summary"><span>What happens next</span><strong>Share privately → Listen → Improve → Decide when you are ready</strong></div>`, "Return to the catalog");
}

function optionButtons(options, selected, field) {
  return `<div class="choice-grid">${options.map(option => `<button class="choice-button ${option === selected ? "is-selected" : ""}" data-creator-choice="${field}" data-value="${option}"><span>${option === selected ? "✓" : ""}</span>${option}</button>`).join("")}</div>`;
}

function accountPage() {
  const saved = projects.filter(product => state.saved.has(product.slug));
  return `<section class="page-shell account-page"><div class="account-hero"><p class="eyebrow">My CreatorWorks</p><h1>Use things. Make things. Or both.</h1><p>One identity follows every way you take part.</p><div class="account-actions"><button class="primary-button">Create my account</button><button class="secondary-button">Sign in</button></div><p>This prototype does not create a real account yet.</p></div><div class="account-benefits"><article><strong>For you</strong><p>Save tools, return after trying them, and keep your feedback together.</p></article><article><strong>For what you make</strong><p>Invite people, collect honest observations, and build evidence before selling.</p></article></div><section class="saved-section"><div class="section-heading"><h2>Saved for later</h2></div>${saved.length ? `<div class="product-grid">${saved.map(product => productCard(product, true)).join("")}</div>` : `<div class="empty-saved"><p>You have not saved anything yet.</p><button class="text-button" data-route="discover">Explore the catalog →</button></div>`}</section></section>`;
}

function render() {
  closeProductDetail(false);
  const routes = { discover, feedback: feedbackPage, share: sharePage, account: accountPage };
  app.innerHTML = (routes[state.route] || discover)();
  document.querySelectorAll(".site-nav [data-route]").forEach(button => button.classList.toggle("is-active", button.dataset.route === state.route));
  nav.classList.remove("is-open");
  menu.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  if (event.target.closest("[data-detail-close]")) { closeProductDetail(); return; }
  const route = event.target.closest("[data-route]");
  if (route) { state.route = route.dataset.route; if (state.route === "share" && route.dataset.route === "share") state.creatorStep = 0; render(); return; }
  const productButton = event.target.closest("[data-product]");
  if (productButton) {
    const product = projects.find(item => item.slug === productButton.dataset.product);
    if (state.route !== "discover") { state.route = "discover"; state.category = "All"; state.query = ""; render(); }
    openProductDetail(product, productButton);
    return;
  }
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) { state.category = categoryButton.dataset.category; state.query = ""; state.route = "discover"; render(); return; }
  const categoryFilter = event.target.closest("[data-category-filter]");
  if (categoryFilter) { state.category = categoryFilter.dataset.categoryFilter; render(); return; }
  const save = event.target.closest("[data-save]");
  if (save) {
    state.saved.has(save.dataset.save) ? state.saved.delete(save.dataset.save) : state.saved.add(save.dataset.save);
    localStorage.setItem("creatorworks-saved", JSON.stringify([...state.saved]));
    if (save.closest(".detail-dialog")) {
      const isSaved = state.saved.has(save.dataset.save);
      save.textContent = isSaved ? "♥ Saved" : "♡ Save for later";
      save.classList.toggle("is-saved", isSaved);
      document.querySelectorAll(`[data-save="${save.dataset.save}"]:not(.detail-dialog *)`).forEach(button => {
        button.classList.toggle("is-saved", isSaved);
        button.textContent = button.classList.contains("save-button") ? (isSaved ? "♥" : "♡") : (isSaved ? "♥ Saved" : "♡ Save");
      });
    } else render();
    return;
  }
  if (event.target.closest("[data-clear-search]")) { state.query = ""; state.category = "All"; render(); return; }
  const feedback = event.target.closest("[data-feedback]");
  if (feedback) { state.selected = projects.find(product => product.slug === feedback.dataset.feedback); state.route = "feedback"; render(); return; }
  if (event.target.closest("[data-feedback-submit]")) { event.target.closest(".feedback-card").innerHTML = `<div class="thank-you"><span>✓</span><h1>Thank you for being honest.</h1><p>Your experience is what helps useful work grow.</p><button class="primary-button" data-route="discover">Keep discovering</button></div>`; return; }
  const creatorChoice = event.target.closest("[data-creator-choice]");
  if (creatorChoice) { state.creator[creatorChoice.dataset.creatorChoice] = creatorChoice.dataset.value; render(); return; }
  if (event.target.closest("[data-share-back]")) { state.creatorStep = Math.max(0, state.creatorStep - 1); render(); return; }
  if (event.target.closest("[data-share-next]")) { if (state.creatorStep === 5) { state.route = "discover"; state.creatorStep = 0; } else state.creatorStep += 1; render(); return; }
  const choice = event.target.closest(".feedback-choices button");
  if (choice) choice.classList.toggle("is-selected");
  if (event.target.closest("[data-demo-drop]")) { const zone = event.target.closest("[data-demo-drop]"); zone.innerHTML = `<span>✓</span><strong>Safe preview ready</strong><small>Nothing is public yet</small>`; }
});

document.addEventListener("keydown", event => {
  const dialog = document.querySelector(".detail-dialog");
  if (!dialog) return;
  if (event.key === "Escape") { event.preventDefault(); closeProductDetail(); return; }
  if (event.key !== "Tab") return;
  const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

document.addEventListener("input", event => {
  if (event.target.matches("[data-catalog-search]")) { state.query = event.target.value; render(); document.querySelector("[data-catalog-search]")?.focus(); }
  if (event.target.matches("[data-creator-field]")) state.creator[event.target.dataset.creatorField] = event.target.value;
});

document.addEventListener("change", event => {
  if (event.target.matches("[data-category-select]")) { state.category = event.target.value; render(); }
  if (event.target.matches("[data-sort-select]")) { state.sort = event.target.value; render(); }
});

menu.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menu.setAttribute("aria-expanded", String(open));
});

render();

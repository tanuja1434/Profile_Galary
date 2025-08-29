// ========== DATA ==========
const IMAGES = [
  { src: "https://picsum.photos/seed/forest/1000/750",   alt: "Forest in mist",        caption: "Misty Forest",     favorite: true  },
  { src: "https://picsum.photos/seed/mountain/1000/750", alt: "Mountain at sunrise",   caption: "Alpenglow Peak",   favorite: false },
  { src: "https://picsum.photos/seed/lake/1000/750",     alt: "Lake reflections",      caption: "Mirror Lake",      favorite: true  },
  { src: "https://picsum.photos/seed/city/1000/750",     alt: "City skyline",          caption: "Evening Skyline",  favorite: false },
  { src: "https://picsum.photos/seed/road/1000/750",     alt: "Road through fields",   caption: "Open Road",        favorite: false },
  { src: "https://picsum.photos/seed/beach/1000/750",    alt: "Beach and sea",         caption: "Quiet Beach",      favorite: true  },
  { src: "https://picsum.photos/seed/bridge/1000/750",   alt: "Bridge over water",     caption: "Old Bridge",       favorite: false },
  { src: "https://picsum.photos/seed/desert/1000/750",   alt: "Desert dunes",          caption: "Golden Dunes",     favorite: true  },
];

const DESCRIPTIONS = {
  "https://picsum.photos/seed/forest/1000/750":
    "A foggy morning among tall pines. The soft mist wraps the trees and dampens sound — a calm, quiet forest mood.",
  "https://picsum.photos/seed/mountain/1000/750":
    "First light catching a high peak. The warm alpenglow contrasts with the cool shadows below.",
  "https://picsum.photos/seed/lake/1000/750":
    "A glass-still lake reflecting the sky and shoreline, creating a perfect mirror image.",
  "https://picsum.photos/seed/city/1000/750":
    "City skyline at dusk — windows start to glow as the last daylight fades.",
  "https://picsum.photos/seed/road/1000/750":
    "A single road stretches through open fields. Simple composition that feels like a journey beginning.",
  "https://picsum.photos/seed/beach/1000/750":
    "A quiet shoreline with gentle waves. Minimal, relaxing, and a bit nostalgic.",
  "https://picsum.photos/seed/bridge/1000/750":
    "An old bridge spanning a river. Strong leading lines draw the eye across the frame.",
  "https://picsum.photos/seed/desert/1000/750":
    "Golden dunes shaped by wind. Curves and shadows create a natural pattern."
};

// ========== STATE ==========
let showFavoritesOnly = false;
let theme = "light";
let currentIndex = 0;
let searchQuery = "";

// ========== DOM ==========
const galleryEl   = document.getElementById("gallery");
const favToggle   = document.getElementById("favToggle");
const modeBtn     = document.getElementById("modeBtn"); // keep dark mode behavior
const countBadge  = document.getElementById("countBadge");
const navToggle   = document.getElementById("navToggle");
const navMenu     = document.getElementById("navMenu");
const searchBtn   = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// Lightbox (injected by JS)
let lbRoot, lbViewer, lbImg, lbCaption, lbInfo, lbDims, lbFav, lbOpen, lbPrev, lbNext, lbClose;

// ========== LIGHTBOX INJECTION ==========
function injectLightboxStyles() {
  if (document.getElementById("pg-lightbox-styles")) return;
  const css = `
  .pg-hidden{display:none!important}
  .pg-lightbox{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.55)}
  .pg-viewer{background:#0f172a;color:#e5e7eb;width:min(1000px,95vw);max-height:90vh;border-radius:16px;overflow:hidden;display:grid;grid-template-columns:2fr 1fr;box-shadow:0 10px 30px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.06);position:relative}
  .pg-left{background:#000;display:grid;place-items:center;min-height:320px}
  .pg-left img{max-width:100%;max-height:80vh;object-fit:contain;background:#000;display:block}
  .pg-right{padding:16px;display:grid;gap:10px;align-content:start}
  .pg-title{margin:0;font-size:1.1rem}
  .pg-desc{margin:0;color:#aab4c3;white-space:pre-wrap}
  .pg-dl{display:grid;gap:6px;margin:6px 0}
  .pg-dl dt{font-size:.85rem;color:#94a3b8}
  .pg-dl dd{margin:0;font-weight:700}
  .pg-actions .pg-btn{display:inline-block}
  .pg-btn{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e5e7eb;padding:.55rem .8rem;border-radius:10px;cursor:pointer;transition:transform .06s ease,background .2s ease}
  .pg-btn:hover{transform:translateY(-1px);background:rgba(255,255,255,.12)}
  .pg-close{position:absolute;top:8px;right:10px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:#0b1220;color:#e5e7eb;font-size:22px;line-height:0;display:grid;place-items:center;cursor:pointer}
  .pg-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.45);color:#fff;font-size:26px;line-height:0;display:grid;place-items:center;cursor:pointer}
  .pg-prev{left:10px}.pg-next{right:10px}
  @media (max-width:760px){.pg-viewer{grid-template-columns:1fr;max-height:92vh}.pg-left img{max-height:60vh}}
  `;
  const style = document.createElement("style");
  style.id = "pg-lightbox-styles";
  style.textContent = css;
  document.head.appendChild(style);
}

function injectLightboxDOM() {
  if (document.getElementById("pg-lightbox-root")) return;

  lbRoot = document.createElement("div");
  lbRoot.id = "pg-lightbox-root";
  lbRoot.className = "pg-lightbox pg-hidden";
  lbRoot.setAttribute("role", "dialog");
  lbRoot.setAttribute("aria-modal", "true");
  lbRoot.setAttribute("aria-hidden", "true");

  lbRoot.innerHTML = `
    <div class="pg-viewer" id="pg-viewer" role="document">
      <button class="pg-close" id="pg-close" aria-label="Close">×</button>
      <div class="pg-left">
        <button class="pg-nav pg-prev" id="pg-prev" aria-label="Previous">‹</button>
        <img id="pg-img" alt="" />
        <button class="pg-nav pg-next" id="pg-next" aria-label="Next">›</button>
      </div>
      <aside class="pg-right">
        <h3 class="pg-title" id="pg-caption">Caption</h3>
        <p class="pg-desc" id="pg-info">Description</p>
        <dl class="pg-dl">
          <div><dt>Dimensions</dt><dd id="pg-dims">—</dd></div>
          <div><dt>Favorite</dt><dd id="pg-fav">—</dd></div>
        </dl>
        <div class="pg-actions">
          <a id="pg-open" class="pg-btn" href="#" target="_blank" rel="noopener">Open original</a>
        </div>
      </aside>
    </div>
  `;
  document.body.appendChild(lbRoot);

  lbViewer  = document.getElementById("pg-viewer");
  lbImg     = document.getElementById("pg-img");
  lbCaption = document.getElementById("pg-caption");
  lbInfo    = document.getElementById("pg-info");
  lbDims    = document.getElementById("pg-dims");
  lbFav     = document.getElementById("pg-fav");
  lbOpen    = document.getElementById("pg-open");
  lbPrev    = document.getElementById("pg-prev");
  lbNext    = document.getElementById("pg-next");
  lbClose   = document.getElementById("pg-close");

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", showPrev);
  lbNext.addEventListener("click", showNext);
  lbRoot.addEventListener("click", (e) => { if (e.target === lbRoot) closeLightbox(); });
  lbViewer.addEventListener("click", (e) => e.stopPropagation());
}

// Helpers to get current filtered dataset
function getFilteredData(){
  const base = showFavoritesOnly ? IMAGES.filter(item => item.favorite) : IMAGES;
  if (!searchQuery) return base;
  const q = searchQuery.toLowerCase();
  return base.filter(item =>
    (item.caption && item.caption.toLowerCase().includes(q)) ||
    (item.alt && item.alt.toLowerCase().includes(q)) ||
    (DESCRIPTIONS[item.src] && DESCRIPTIONS[item.src].toLowerCase().includes(q))
  );
}

// Open/close/update lightbox
function openLightbox(indexInFiltered){
  const data = getFilteredData();
  if (!data.length) return;

  currentIndex = Math.max(0, Math.min(indexInFiltered, data.length - 1));
  const item = data[currentIndex];

  lbCaption.textContent = item.caption || "Untitled";

  const about =
    (item.info && String(item.info).trim()) ||
    DESCRIPTIONS[item.src] ||
    item.alt ||
    item.caption ||
    "";
  lbInfo.textContent = about;

  lbFav.textContent  = item.favorite ? "Yes" : "No";
  lbDims.textContent = "Loading…";
  lbOpen.href        = item.src;

  lbImg.src = item.src;
  lbImg.alt = item.alt || item.caption || "";
  lbImg.onload = () => { lbDims.textContent = `${lbImg.naturalWidth} × ${lbImg.naturalHeight}px`; };
  lbImg.onerror = () => { lbDims.textContent = "—"; };

  lbRoot.classList.remove("pg-hidden");
  lbRoot.setAttribute("aria-hidden", "false");
  document.addEventListener("keydown", onKeyNav);
}
function closeLightbox(){
  lbRoot.classList.add("pg-hidden");
  lbRoot.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", onKeyNav);
}
function showPrev(){
  const data = getFilteredData();
  if (!data.length) return;
  currentIndex = (currentIndex - 1 + data.length) % data.length;
  openLightbox(currentIndex);
}
function showNext(){
  const data = getFilteredData();
  if (!data.length) return;
  currentIndex = (currentIndex + 1) % data.length;
  openLightbox(currentIndex);
}
function onKeyNav(e){
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft")  showPrev();
  if (e.key === "ArrowRight") showNext();
}

// ========== RENDER ==========
function renderGallery() {
  galleryEl.innerHTML = "";

  const data = getFilteredData();
  const frag = document.createDocumentFragment();

  data.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "card";
    li.setAttribute("role", "listitem");
    li.dataset.index = String(idx);

    const fig = document.createElement("figure");

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;

    const cap = document.createElement("figcaption");
    cap.textContent = item.caption;

    fig.append(img, cap);
    li.append(fig);
    frag.append(li);
  });

  galleryEl.appendChild(frag);

  const n = data.length;
  countBadge.textContent = `${n} photo${n === 1 ? "" : "s"}`;
}

// ========== EVENTS ==========
// Favorites filter
favToggle.addEventListener("change", (e) => {
  showFavoritesOnly = e.target.checked;
  renderGallery();
});

// Mode toggle (unchanged behavior/labeling)
modeBtn.addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  modeBtn.setAttribute("aria-pressed", String(dark));
  modeBtn.textContent = dark ? "☀️ Light mode" : "🌙 Dark mode";
});

// Open lightbox on card click
galleryEl.addEventListener("click", (e) => {
  const li = e.target.closest("li.card");
  if (!li) return;
  const idx = Number(li.dataset.index);
  if (Number.isFinite(idx)) openLightbox(idx);
});

// Mobile nav toggle (hamburger) — menu opens from START
navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", String(open));
});

// Icon-only search button focuses the search input
searchBtn.addEventListener("click", () => {
  searchInput.focus();
  searchInput.select();
});

// Live search filtering
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value || "";
  renderGallery();
});

// ========== INIT ==========
injectLightboxStyles();
injectLightboxDOM();
renderGallery();

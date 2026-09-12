// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");
navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ===== Elements =====
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const resultsSection = document.getElementById("results");
const resultsGrid = document.getElementById("resultsGrid");

// ===== Load the recommendation data =====
let travelData = null;

async function loadTravelData() {
  try {
    const response = await fetch("travel_recommendation_api.json");
    travelData = await response.json();
  } catch (error) {
    console.error("Could not load travel_recommendation_api.json:", error);
    travelData = { countries: [], temples: [], beaches: [] };
  }
}

loadTravelData();

// ===== Flatten every destination into one list =====
// Each item: { name, imageUrl, description, category, countryName }
function getAllDestinations() {
  if (!travelData) return [];

  const beaches = (travelData.beaches || []).map((item) => ({
    ...item,
    category: "beach",
  }));

  const temples = (travelData.temples || []).map((item) => ({
    ...item,
    category: "temple",
  }));

  const cities = [];
  (travelData.countries || []).forEach((country) => {
    (country.cities || []).forEach((city) => {
      cities.push({ ...city, category: "city", countryName: country.name });
    });
  });

  return [...beaches, ...temples, ...cities];
}

// ===== Search logic =====
function searchDestinations(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  const all = getAllDestinations();

  if (query === "") return [];

  // Category keywords: "beach" / "beaches", "temple" / "temples", "country" / "countries"
  if (query.includes("beach")) {
    return all.filter((item) => item.category === "beach");
  }

  if (query.includes("temple")) {
    return all.filter((item) => item.category === "temple");
  }

  if (query.includes("countr")) {
    return all.filter((item) => item.category === "city");
  }

  // Otherwise match a country name or a destination name directly
  return all.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const country = (item.countryName || "").toLowerCase();
    return name.includes(query) || country.includes(query);
  });
}

// ===== Render results as cards =====
function renderResults(items) {
  resultsGrid.innerHTML = "";

  if (items.length === 0) {
    resultsGrid.innerHTML =
      '<p class="no-results">No recommendations found. Try "beach", "temple", or a country/city name.</p>';
  } else {
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}" />
        <div class="result-body">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <a href="#book" class="btn btn-primary">Book Now</a>
        </div>
      `;
      resultsGrid.appendChild(card);
    });
  }

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth" });
}

// ===== Search button =====
searchForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Make sure the data has finished loading before searching
  if (!travelData) {
    await loadTravelData();
  }

  const results = searchDestinations(searchInput.value);
  renderResults(results);
});

// ===== Clear button =====
clearBtn.addEventListener("click", function () {
  searchInput.value = "";
  resultsGrid.innerHTML = "";
  resultsSection.hidden = true;
  searchInput.focus();
});

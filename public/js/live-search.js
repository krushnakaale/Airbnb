// public/js/live-search.js
const searchInput = document.getElementById("live-search");
const resultsDiv = document.getElementById("search-results");

// Debounce helper
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

searchInput.addEventListener(
  "input",
  debounce(async function () {
    const query = this.value.trim();

    // ❌ empty input → hide dropdown
    if (!query) {
      resultsDiv.innerHTML = "";
      resultsDiv.style.display = "none";
      searchInput.classList.remove("open");
      return;
    }

    try {
      const res = await fetch(
        `/listings/api/search?q=${encodeURIComponent(query)}`,
      );

      const listings = await res.json();

      // ❌ no results
      if (!listings.length) {
        resultsDiv.innerHTML = `
          <div class="p-2 text-muted">No results found</div>
        `;
      } else {
        resultsDiv.innerHTML = listings
          .map(
            (listing) => `
              <a href="/listings/${listing._id}">
                ${listing.title} – ${listing.location}, ${listing.country}
              </a>
            `,
          )
          .join("");
      }

      // ✅ SHOW dropdown
      resultsDiv.style.display = "block";
      searchInput.classList.add("open");
    } catch (err) {
      console.error(err);
      resultsDiv.style.display = "none";
      searchInput.classList.remove("open");
    }
  }, 300),
);

// ✅ click outside → close dropdown
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    resultsDiv.style.display = "none";
    searchInput.classList.remove("open");
  }
});

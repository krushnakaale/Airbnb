// public/js/live-search.js
const searchInput = document.getElementById("live-search");
const resultsDiv = document.getElementById("search-results");

// Debounce
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
    if (!query) {
      resultsDiv.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(
        `/listings/api/search?q=${encodeURIComponent(query)}`
      );
      const listings = await res.json();

      resultsDiv.innerHTML = listings
        .map(
          (listing) => `
        <a href="/listings/${listing._id}" class="d-block p-2 text-decoration-none text-dark border-bottom">
          ${listing.title} - ${listing.location}, ${listing.country}
        </a>
      `
        )
        .join("");
    } catch (err) {
      console.error(err);
    }
  }, 300)
);

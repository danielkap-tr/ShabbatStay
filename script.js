const STORAGE_KEY = 'shabbatstay-listings';

const defaultListings = [
  {
    name: 'Levant House',
    address: 'Herzl 12, ירושלים',
    owner: 'אורי כהן, 050-1234567',
    country: 'Israel',
    city: 'ירושלים',
    overallRating: 5,
    kosherRating: 5,
    shabbatReady: 'yes',
    description: 'דירה קרובה לשכונה דתית, בעלים מוכנים לספק כיריים מוגבהים ולפנות מקום לשבת.',
  },
  {
    name: 'Shabbat Stay Berlin',
    address: 'Unter den Linden 3, Berlin',
    owner: 'Rachel Adler, rachel@example.com',
    country: 'Germany',
    city: 'Berlin',
    overallRating: 4,
    kosherRating: 4,
    shabbatReady: 'yes',
    description: 'דירה מודרנית בעיר יהודית, יש מקרר ייעודי, בעלים גמישים לשבת.',
  },
  {
    name: 'Hostel Haifa Corner',
    address: 'Viali HaPais 7, Haifa',
    owner: 'Ami Mansour',
    country: 'Israel',
    city: 'חיפה',
    overallRating: 3,
    kosherRating: 3,
    shabbatReady: 'no',
    description: 'מיקום נוח, אך נכון לעכשיו אין התאמה מלאה לשבת. ניתן לדבר עם המקום מראש.',
  },
  {
    name: 'Kosher Nest Tel Aviv',
    address: 'Allenby 25, תל אביב',
    owner: 'Eliora Shtern',
    country: 'Israel',
    city: 'תל אביב',
    overallRating: 4,
    kosherRating: 5,
    shabbatReady: 'yes',
    description: 'דירה בסביבה חילונית אך בעלת מטבח כשר וציוד לשבת. בעלים ערוכים לארח משפחות.',
  },
  {
    name: 'Prague Shabbat Spot',
    address: 'Staroměstské nám. 1, Prague',
    owner: 'Miriam Katz',
    country: 'Czech Republic',
    city: 'Prague',
    overallRating: 4,
    kosherRating: 4,
    shabbatReady: 'yes',
    description: 'דירה יפה במרכז העיר, בעלים מסייעים להזמין אוכל כשר ולארגן הגעה לקהילה.',
  },
];

function isValidListing(item) {
  return item &&
    typeof item.name === 'string' &&
    typeof item.address === 'string' &&
    typeof item.owner === 'string' &&
    typeof item.country === 'string' &&
    typeof item.city === 'string' &&
    typeof item.description === 'string' &&
    Number.isFinite(item.overallRating) &&
    Number.isFinite(item.kosherRating) &&
    (item.shabbatReady === 'yes' || item.shabbatReady === 'no');
}

function loadListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(isValidListing);
        if (valid.length) return valid;
      }
    }
  } catch (error) {
    console.warn('ShabbatStay: failed to load listings from localStorage', error);
  }
  return [...defaultListings];
}

function saveListings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (error) {
    console.warn('ShabbatStay: failed to save listings to localStorage', error);
  }
}

const listings = loadListings();

const searchInput = document.getElementById('searchInput');
const countrySelect = document.getElementById('countrySelect');
const citySelect = document.getElementById('citySelect');
const kosherSelect = document.getElementById('kosherSelect');
const ratingSelect = document.getElementById('ratingSelect');
const shabbatSelect = document.getElementById('shabbatSelect');
const listingContainer = document.getElementById('listingContainer');
const reviewForm = document.getElementById('reviewForm');

function getUniqueValues(key) {
  return [...new Set(listings.map(item => item[key]).sort((a, b) => a.localeCompare(b)))]
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function createOption(value) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  return option;
}

function updateFilters() {
  const countries = getUniqueValues('country');
  countrySelect.innerHTML = '<option value="">הכל</option>';
  countries.forEach(country => countrySelect.appendChild(createOption(country)));
  updateCityOptions();
}

function updateCityOptions() {
  const selectedCountry = countrySelect.value;
  const cities = selectedCountry
    ? [...new Set(listings.filter(item => item.country === selectedCountry).map(item => item.city))]
    : getUniqueValues('city');

  citySelect.innerHTML = '<option value="">הכל</option>';
  cities.sort((a, b) => a.localeCompare(b)).forEach(city => citySelect.appendChild(createOption(city)));
}

function renderListings(items) {
  listingContainer.innerHTML = '';
  if (!items.length) {
    listingContainer.innerHTML = '<p>לא נמצאו המלצות התואמות את הסינון.</p>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.address)}</p>
      <div class="badge-row">
        <span class="badge">${escapeHtml(item.country)}</span>
        <span class="badge">${escapeHtml(item.city)}</span>
        <span class="badge">${escapeHtml(item.owner)}</span>
      </div>
      <div class="rating-row">
        <span class="rating-chip">ציון כללי: ${item.overallRating}</span>
        <span class="rating-chip">כשרות: ${item.kosherRating}</span>
        <span class="rating-chip ${item.shabbatReady === 'yes' ? 'shabbat-yes' : 'shabbat-no'}">שבת: ${item.shabbatReady === 'yes' ? 'כן' : 'לא'}</span>
      </div>
      <p>${escapeHtml(item.description)}</p>
    `;

    listingContainer.appendChild(card);
  });
}

function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();
  const country = countrySelect.value;
  const city = citySelect.value;
  const kosherMin = Number(kosherSelect.value);
  const ratingMin = Number(ratingSelect.value);
  const shabbat = shabbatSelect.value;

  const filtered = listings.filter(item => {
    const matchesSearch = searchText === '' || [item.name, item.address, item.description, item.owner].some(field => field.toLowerCase().includes(searchText));
    const matchesCountry = !country || item.country === country;
    const matchesCity = !city || item.city === city;
    const matchesKosher = item.kosherRating >= kosherMin;
    const matchesRating = item.overallRating >= ratingMin;
    const matchesShabbat = !shabbat || item.shabbatReady === shabbat;
    return matchesSearch && matchesCountry && matchesCity && matchesKosher && matchesRating && matchesShabbat;
  });

  renderListings(filtered);
}

function addListing(event) {
  event.preventDefault();

  const newListing = {
    name: document.getElementById('nameInput').value.trim(),
    address: document.getElementById('addressInput').value.trim(),
    owner: document.getElementById('ownerInput').value.trim() || 'לא צויין',
    country: document.getElementById('countryInput').value.trim(),
    city: document.getElementById('cityInput').value.trim(),
    overallRating: Number(document.getElementById('ratingInput').value),
    kosherRating: Number(document.getElementById('kosherInput').value),
    shabbatReady: document.getElementById('shabbatInput').value,
    description: document.getElementById('descriptionInput').value.trim(),
  };

  listings.unshift(newListing);
  saveListings();
  updateFilters();
  applyFilters();
  reviewForm.reset();
}

searchInput.addEventListener('input', applyFilters);
countrySelect.addEventListener('change', () => {
  updateCityOptions();
  applyFilters();
});
citySelect.addEventListener('change', applyFilters);
kosherSelect.addEventListener('change', applyFilters);
ratingSelect.addEventListener('change', applyFilters);
shabbatSelect.addEventListener('change', applyFilters);
reviewForm.addEventListener('submit', addListing);

updateFilters();
renderListings(listings);

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get references to the button and gallery
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA API key (use 'DEMO_KEY' for testing)
const API_KEY = 'DEMO_KEY';

// Listen for button click to fetch images
button.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }

  // Show loading message before fetching
  gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🔄</div><p>Loading space photos…</p></div>';

  // Build the NASA APOD API URL
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from the NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery
      gallery.innerHTML = '';

      // Make sure data is always an array
      const images = Array.isArray(data) ? data : [data];

      // Loop through each image object
      images.forEach(item => {
        if (item.media_type === 'image') {
          const div = document.createElement('div');
          div.className = 'gallery-item';
          div.innerHTML = `
            <img src="${item.url}" alt="${item.title}" />
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          `;
          // Add click event to open modal
          div.addEventListener('click', () => openModal(item));
          gallery.appendChild(div);
        } else if (item.media_type === 'video') {
          const div = document.createElement('div');
          div.className = 'gallery-item';
          let videoEmbed = '';
          // Fix: Use embed URL for YouTube videos, handle both youtube.com and youtu.be
          let embedUrl = '';
          if (item.url.includes('youtube.com')) {
            // Convert https://www.youtube.com/watch?v=VIDEO_ID to https://www.youtube.com/embed/VIDEO_ID
            const videoId = item.url.split('v=')[1]?.split('&')[0];
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          } else if (item.url.includes('youtu.be')) {
            // Convert https://youtu.be/VIDEO_ID to https://www.youtube.com/embed/VIDEO_ID
            const videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          }
          if (embedUrl) {
            videoEmbed = `<div class="video-wrapper"><iframe src="${embedUrl}" title="${item.title}" frameborder="0" allowfullscreen></iframe></div>`;
          } else {
            videoEmbed = `<a href="${item.url}" target="_blank" rel="noopener" class="video-link">Watch Video</a>`;
          }
          div.innerHTML = `
            ${videoEmbed}
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          `;
          div.addEventListener('click', () => openModal(item));
          gallery.appendChild(div);
        }
      });

      // If no images found, show a message
      if (gallery.innerHTML === '') {
        gallery.innerHTML = '<div class="placeholder"><p>No images found for this date range.</p></div>';
      }
    })
    .catch(error => {
      // Show error message in the gallery
      gallery.innerHTML = '<div class="placeholder"><p>Error loading images. Please try again later.</p></div>';
      console.error('Error:', error);
    });
});

// Create a modal element and add it to the page (only once)
let modal = document.getElementById('image-modal');
if (!modal) {
  modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <img class="modal-img" src="" alt="" />
      <div class="modal-info">
        <h2 class="modal-title"></h2>
        <p class="modal-date"></p>
        <p class="modal-desc"></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Function to open the modal with image data
function openModal(item) {
  if (item.media_type === 'image') {
    modal.querySelector('.modal-img').style.display = '';
    modal.querySelector('.modal-img').src = item.hdurl || item.url;
    modal.querySelector('.modal-img').alt = item.title;
    modal.querySelector('.modal-info').innerHTML = `
      <h2 class="modal-title">${item.title}</h2>
      <p class="modal-date">${item.date}</p>
      <p class="modal-desc">${item.explanation}</p>
    `;
  } else if (item.media_type === 'video') {
    modal.querySelector('.modal-img').style.display = 'none';
    let videoContent = '';
    let embedUrl = '';
    if (item.url.includes('youtube.com')) {
      const videoId = item.url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (item.url.includes('youtu.be')) {
      const videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (embedUrl) {
      videoContent = `<div class="video-wrapper-modal"><iframe src="${embedUrl}" title="${item.title}" frameborder="0" allowfullscreen></iframe></div>`;
    } else {
      videoContent = `<a href="${item.url}" target="_blank" rel="noopener" class="video-link">Watch Video</a>`;
    }
    modal.querySelector('.modal-info').innerHTML = `
      <h2 class="modal-title">${item.title}</h2>
      <p class="modal-date">${item.date}</p>
      ${videoContent}
      <p class="modal-desc">${item.explanation}</p>
    `;
  }
  modal.classList.add('open');
}

// Close modal on close button or backdrop click
modal.querySelector('.modal-close').onclick = () => modal.classList.remove('open');
modal.querySelector('.modal-backdrop').onclick = () => modal.classList.remove('open');

// Fun space facts array
const spaceFacts = [
  "A day on Venus is longer than a year on Venus!",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "There are more trees on Earth than stars in the Milky Way.",
  "Jupiter's Great Red Spot is a giant storm bigger than Earth.",
  "A spoonful of a neutron star would weigh about 6 billion tons!",
  "The footprints on the Moon will be there for millions of years.",
  "Saturn could float in water because it’s mostly gas.",
  "Space is completely silent—there’s no air for sound to travel.",
  "The Sun makes up 99.8% of the mass in our solar system.",
  "One million Earths could fit inside the Sun!",
  "Mars has the tallest volcano in the solar system: Olympus Mons.",
  "A year on Mercury is just 88 days long.",
  "The hottest planet in our solar system is Venus.",
  "There are more stars in the universe than grains of sand on Earth.",
  "A comet’s tail always points away from the Sun."
];

// Pick a random fact and display it
const funFactText = document.querySelector('.fun-fact-text');
if (funFactText) {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  funFactText.textContent = spaceFacts[randomIndex];
}

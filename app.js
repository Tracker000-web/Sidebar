const layout = document.querySelector('.app-layout');
const btn = document.getElementById('menu-toggle');
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

/* SIDEBAR TOGGLE */
btn.addEventListener('click', () => {
  appLayout.classList.toggle("sidebar-hidden");
});

/* PAGE SWITCHING */
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    // show correct page
    pages.forEach(page => {
      page.classList.toggle(
        "active",
        page.dataset.page === target
      );
    });

    // highlight active button
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // load data per page
    if (target === "users") loadUsers();
  });
});

/* FAKE DATA LOADER */
function loadUsers() {
  const container = document.getElementById("usersContent");
  container.textContent = "Loading...";

  setTimeout(() => {
    container.innerHTML = `
      <ul>
        <li>John Doe</li>
        <li>Jane Smith</li>
        <li>Alex Cruz</li>
      </ul>
    `;
  }, 300);
}

// Function to show/hide the modal
function toggleModal() {
    const modal = document.getElementById('trackerModal');
    modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'flex' : 'none';
}

// Function to add the tracker to the bottom
function saveTracker(event) {
    event.preventDefault(); // Prevents the page from refreshing

    const input = document.getElementById('trackerInput');
    const list = document.getElementById('trackerList');

    if (input.value.trim() !== "") {
        // Create a new element for the tracker
        const newTracker = document.createElement('div');
        newTracker.className = 'tracker-item';

        // Basic styling for the tracker row
        newTracker.style.padding = "15px";
        newTracker.style.background = "#f4f4f4";
        newTracker.style.border = "1px solid #ddd";
        newTracker.style.borderRadius = "5px";
        newTracker.innerText = input.value;

        // Append to the list (this puts it at the bottom)
        list.appendChild(newTracker);

        // Clear and close
        input.value = "";
        toggleModal();
    }
}

async function saveTracker(event) {
    event.preventDefault();
    const input = document.getElementById('trackerInput');
    const name = input.value.trim();

    if (name) {
        // Send to Python API
        const response = await fetch('/api/trackers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracker_name: name })
        });
        
        const result = await response.json();
        if (result.success) {
            renderTracker(name, result.id); // Add to UI
            input.value = "";
            toggleModal();
        }
    }
}

async function removeTrackerFromDB(id, element) {
    const response = await fetch(`/api/trackers/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        element.closest('.tracker-item').remove();
    }
}

window.onload = async () => {
    const response = await fetch('/api/trackers'); // You'd need a GET route in Python
    const trackers = await response.json();
    trackers.forEach(t => renderTracker(t.name, t.id));
};
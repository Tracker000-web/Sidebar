const appLayout = document.querySelector('.app-layout');
const btn = document.getElementById('menu-toggle');
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

/* SIDEBAR & PAGE LOGIC */
btn.addEventListener('click', () => {
    appLayout.classList.toggle("sidebar-hidden");
});

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        pages.forEach(p => p.classList.toggle("active", p.dataset.page === target));
        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

/* TRACKER LOGIC */
function toggleModal() {
    const modal = document.getElementById('trackerModal');
    modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'flex' : 'none';
}

// 1. Save to Database
async function saveTracker(event) {
    event.preventDefault();
    const input = document.getElementById('trackerInput');
    const name = input.value.trim();

    if (name) {
        const response = await fetch('http://localhost:3000/api/trackers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracker_name: name })
        });
        const result = await response.json();
        if (result.success) {
            renderTracker(name, result.id);
            input.value = "";
            toggleModal();
        }
    }
}

// 2. Render to UI
function renderTracker(name, id) {
    const list = document.getElementById('trackerList');
    const div = document.createElement('div');
    div.className = 'tracker-item';
    div.style = "padding:15px; background:#f4f4f4; border:1px solid #ddd; border-radius:5px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;";
    
    div.innerHTML = `
        <span>${name}</span>
        <button class="delete-btn" onclick="removeTrackerFromDB(${id}, this)">Delete</button>
    `;
    list.appendChild(div);
}

// 3. Delete from Database
async function removeTrackerFromDB(id, element) {
    const response = await fetch(`http://localhost:3000/api/trackers/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        element.closest('.tracker-item').remove();
    }
}

// 4. Load initial data
window.onload = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/trackers');
        const trackers = await response.json();
        trackers.forEach(t => renderTracker(t.name, t.id));
    } catch (e) { console.log("Server not started?"); }
};
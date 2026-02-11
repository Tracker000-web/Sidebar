const appLayout = document.querySelector('.app-layout');
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const socket = io("http://localhost:3000"); // Make sure you included Socket.io in your HTML for real-time updates

// -------------------
// SIDEBAR NAVIGATION
// -------------------
document.getElementById('menu-toggle').addEventListener('click', () => {
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

// -------------------
// MODALS
// -------------------
function toggleModal() {
    const modal = document.getElementById('trackerModal');
    modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'flex' : 'none';
}

function closeViewModal() {
    document.getElementById('viewTrackerModal').style.display = 'none';
}

// -------------------
// TRACKER LOGIC
// -------------------

// 1. Admin: Save tracker and push to users
async function saveTracker(event) {
    event.preventDefault();
    const input = document.getElementById('trackerInput');
    const name = input.value.trim();
    if (!name) return alert("Enter manager name");

    try {
        const response = await fetch('http://localhost:3000/api/trackers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracker_name: name })
        });
        const tracker = await response.json();
        renderTracker(tracker);
        input.value = "";
        toggleModal();
    } catch (err) {
        console.error("Error saving tracker:", err);
    }
}

// 2. Render tracker in Admin list
function renderTracker(tracker) {
    const list = document.getElementById('trackerList');
    const div = document.createElement('div');
    div.className = 'tracker-item';
    div.style = `
        padding:15px; background:#f4f4f4; border:1px solid #ddd;
        border-radius:5px; margin-bottom:10px; display:flex;
        justify-content:space-between; align-items:center;
    `;

    // Tracker name clickable
    const nameSpan = document.createElement('span');
    nameSpan.innerText = tracker.name;
    nameSpan.style.cursor = "pointer";
    nameSpan.onclick = () => viewTracker(tracker.id, tracker.name);

    div.appendChild(nameSpan);
    list.appendChild(div);
}

// 3. Admin: view all user tracker copies
async function viewTracker(tracker_id, tracker_name) {
    const modal = document.getElementById('viewTrackerModal');
    const container = document.getElementById('userTrackerContainer');
    document.getElementById('viewTrackerTitle').innerText = `Manager: ${tracker_name}`;

    // Fetch user tracker entries
    const response = await fetch(`http://localhost:3000/api/manager/${tracker_id}/entries`);
    const entries = await response.json();

    // Group entries by user
    const users = {};
    entries.forEach(e => {
        if (!users[e.user_name]) users[e.user_name] = [];
        users[e.user_name].push(e);
    });

    container.innerHTML = "";

    Object.keys(users).forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.style.marginBottom = "20px";
        userDiv.innerHTML = `<h4>User: ${user}</h4>`;

        // Build table for each user
        const table = document.createElement('table');
        table.className = "sheet";
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background:#eee;">
                <th>#</th><th>Phone</th><th>No Answer</th><th>Voicemail</th>
                <th>Left Message</th><th>Call Backs</th><th>Appointments</th>
                <th>Preset</th><th>Confirmed Preset</th><th>Status</th><th>Comment</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        users[user].forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index+1}</td>
                <td contenteditable="true">${row.phone || ''}</td>
                <td><input type="checkbox" ${row.no_answer ? 'checked':''}></td>
                <td><input type="checkbox" ${row.voicemail ? 'checked':''}></td>
                <td><input type="checkbox" ${row.left_message ? 'checked':''}></td>
                <td><input type="checkbox" ${row.call_backs ? 'checked':''}></td>
                <td><input type="checkbox" ${row.appointments ? 'checked':''}></td>
                <td><input type="checkbox" ${row.preset ? 'checked':''}></td>
                <td><input type="checkbox" ${row.confirmed_preset ? 'checked':''}></td>
                <td>
                    <select>
                        <option value="">Select Status</option>
                        <option value="Pending" ${row.status==='Pending'?'selected':''}>Pending</option>
                        <option value="Completed" ${row.status==='Completed'?'selected':''}>Completed</option>
                        <option value="Failed" ${row.status==='Failed'?'selected':''}>Failed</option>
                    </select>
                </td>
                <td contenteditable="true">${row.comment || ''}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        userDiv.appendChild(table);
        container.appendChild(userDiv);
    });

    modal.style.display = "flex";
}

// 4. Load all trackers for Admin on page load
async function loadTrackers() {
    const response = await fetch('http://localhost:3000/api/trackers');
    const trackers = await response.json();
    trackers.forEach(tr => renderTracker(tr));
}

// 5. Real-time updates via Socket.io
socket.on('trackerCreated', tracker => {
    renderTracker(tracker);
});

// 6. Initialize
window.onload = () => {
    loadTrackers();
};

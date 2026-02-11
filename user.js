// ==========================
// USER DASHBOARD SCRIPT
// ==========================

const socket = io("http://localhost:3000");
const userName = localStorage.getItem("user_name") || prompt("Enter your name");

// Register as USER role
socket.emit("registerRole", "user");

// Containers
const trackerList = document.getElementById("userTrackerList");
const trackerSheetContainer = document.getElementById("trackerSheetContainer");

// ==========================
// LOAD EXISTING TRACKERS
// ==========================
async function loadTrackers() {
    try {
        const response = await fetch("http://localhost:3000/api/trackers");
        const trackers = await response.json();

        trackerList.innerHTML = "";
        trackers.forEach(tracker => renderTracker(tracker));
    } catch (err) {
        console.error("Error loading trackers:", err);
    }
}

window.onload = loadTrackers;


// ==========================
// REAL-TIME TRACKER RECEIVE
// ==========================
socket.on("trackerCreated", tracker => {
    renderTracker(tracker);
    alert(`New Tracker Assigned: ${tracker.name}`);
});


// ==========================
// RENDER TRACKER CARD
// ==========================
function renderTracker(tracker) {
    const div = document.createElement("div");
    div.className = "tracker-card";
    div.style = `
        padding:15px;
        background:#f4f4f4;
        border-radius:6px;
        margin-bottom:10px;
        display:flex;
        justify-content:space-between;
        align-items:center;
    `;

    div.innerHTML = `
        <span>${tracker.name}</span>
        <button onclick="openTracker(${tracker.id}, '${tracker.name}')">
            Open
        </button>
    `;

    trackerList.appendChild(div);
}


// ==========================
// OPEN TRACKER
// ==========================
async function openTracker(trackerId, trackerName) {
    try {
        // Create user copy if not existing
        const response = await fetch("http://localhost:3000/api/user_tracker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tracker_id: trackerId,
                user_name: userName
            })
        });

        const userTracker = await response.json();

        renderSheet(userTracker.id, trackerName);

    } catch (err) {
        console.error("Error opening tracker:", err);
    }
}


// ==========================
// RENDER TRACKER SHEET
// ==========================
function renderSheet(userTrackerId, trackerName) {

    trackerSheetContainer.innerHTML = `
        <h2>${trackerName}</h2>
        <table class="sheet">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Phone</th>
                    <th>No Answer</th>
                    <th>Voicemail</th>
                    <th>Left Message</th>
                    <th>Call Backs</th>
                    <th>Appointments</th>
                    <th>Preset</th>
                    <th>Confirmed</th>
                    <th>Status</th>
                    <th>Comment</th>
                    <th>Save</th>
                </tr>
            </thead>
            <tbody id="sheetBody"></tbody>
        </table>
    `;

    addNewRow(userTrackerId);
}


// ==========================
// ADD NEW ROW
// ==========================
function addNewRow(userTrackerId) {
    const tbody = document.getElementById("sheetBody");

    const rowIndex = tbody.children.length + 1;

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${rowIndex}</td>
        <td contenteditable="true"></td>
        <td><input type="checkbox"></td>
        <td><input type="checkbox"></td>
        <td><input type="checkbox"></td>
        <td><input type="checkbox"></td>
        <td><input type="checkbox"></td>
        <td><input type="checkbox"></td>
        <td><input type="checkbox"></td>
        <td>
            <select>
                <option value="">Select</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Failed</option>
            </select>
        </td>
        <td contenteditable="true"></td>
        <td><button>Save</button></td>
    `;

    tr.querySelector("button").onclick = () =>
        saveRow(userTrackerId, tr);

    tbody.appendChild(tr);
}


// ==========================
// SAVE TRACKER ENTRY
// ==========================
async function saveRow(userTrackerId, row) {
    const cells = row.children;

    const data = {
        user_tracker_id: userTrackerId,
        phone: cells[1].innerText.trim(),
        no_answer: cells[2].querySelector("input").checked,
        voicemail: cells[3].querySelector("input").checked,
        left_message: cells[4].querySelector("input").checked,
        call_backs: cells[5].querySelector("input").checked,
        appointments: cells[6].querySelector("input").checked,
        preset: cells[7].querySelector("input").checked,
        confirmed_preset: cells[8].querySelector("input").checked,
        status: cells[9].querySelector("select").value,
        comment: cells[10].innerText.trim()
    };

    try {
        const response = await fetch("http://localhost:3000/api/tracker_entry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert("Saved successfully!");
            addNewRow(userTrackerId);
        }

    } catch (err) {
        console.error("Save error:", err);
    }
}

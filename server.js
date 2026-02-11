const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// -------------------
// MySQL connection
// -------------------
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Benito1997!',
    database: 'my_crm_db'
});

db.connect(err => {
    if (err) console.error('❌ MySQL Connection Failed:', err.message);
    else console.log('✅ Connected to MySQL!');
});

// -------------------
// 1. Admin: Add new manager tracker
// -------------------
app.post('/api/trackers', (req, res) => {
    const { tracker_name } = req.body;
    db.query('INSERT INTO trackers (name) VALUES (?)', [tracker_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const newTracker = { id: result.insertId, name: tracker_name };
        io.emit('trackerCreated', newTracker); // push to users in real-time
        res.json(newTracker);
    });
});

// -------------------
// 2. Get all managers (for users & admin)
// -------------------
app.get('/api/trackers', (req, res) => {
    db.query('SELECT * FROM trackers ORDER BY id ASC', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// -------------------
// 3. Users: create own tracker copy
// -------------------
app.post('/api/user_tracker', (req, res) => {
    const { tracker_id, user_name } = req.body;

    // check if user already has a copy
    db.query(
        'SELECT * FROM user_trackers WHERE tracker_id = ? AND user_name = ?',
        [tracker_id, user_name],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) return res.json(results[0]); // already exists

            db.query(
                'INSERT INTO user_trackers (tracker_id, user_name) VALUES (?, ?)',
                [tracker_id, user_name],
                (err2, result2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json({ id: result2.insertId, tracker_id, user_name });
                }
            );
        }
    );
});

// -------------------
// 4. Get all user tracker entries for a manager (Admin view)
// -------------------
app.get('/api/manager/:tracker_id/entries', (req, res) => {
    const tracker_id = req.params.tracker_id;

    const sql = `
        SELECT ut.id AS user_tracker_id, ut.user_name, te.*
        FROM user_trackers ut
        LEFT JOIN tracker_entries te ON te.user_tracker_id = ut.id
        WHERE ut.tracker_id = ?
        ORDER BY ut.user_name, te.created_at
    `;
    db.query(sql, [tracker_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// -------------------
// 5. Save tracker entry (User updates spreadsheet)
// -------------------
app.post('/api/tracker_entry', (req, res) => {
    const {
        user_tracker_id, phone, no_answer, voicemail, left_message,
        call_backs, appointments, preset, confirmed_preset,
        status, comment
    } = req.body;

    const sql = `
        INSERT INTO tracker_entries 
        (user_tracker_id, phone, no_answer, voicemail, left_message, call_backs, appointments, preset, confirmed_preset, status, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        user_tracker_id, phone, no_answer, voicemail, left_message, call_backs,
        appointments, preset, confirmed_preset, status, comment
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// -------------------
// Socket.io connection
// -------------------
io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('registerRole', role => {
        socket.join(role); // "admin" or "user"
        console.log(`Socket ${socket.id} joined ${role}`);
    });
});


server.listen(3000, () => console.log('Server running on http://localhost:3000'));

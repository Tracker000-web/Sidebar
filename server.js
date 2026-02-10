const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'your_password', 
    database: 'your_crm_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// GET all trackers
app.get('/api/trackers', (req, res) => {
    db.query('SELECT * FROM trackers ORDER BY id ASC', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST a new tracker
app.post('/api/trackers', (req, res) => {
    const { tracker_name } = req.body;
    db.query('INSERT INTO trackers (name) VALUES (?)', [tracker_name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, id: result.insertId });
    });
});

// DELETE a tracker
app.delete('/api/trackers/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM trackers WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
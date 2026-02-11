const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Setup the configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // your mysql username
  password: 'Benito1997!',           // your mysql password
  database: 'my_crm_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL!');
  }
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
    
    // Using 'name' here because that's what we defined in the CREATE TABLE command
    db.query('INSERT INTO trackers (name) VALUES (?)', [tracker_name], (err, result) => {
        if (err) {
            console.error("Error saving tracker:", err);
            return res.status(500).json({ error: err.message });
        }
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
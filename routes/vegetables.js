const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Set up your MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ssundee',
    database: 'datanamfyp'
});

router.get('/testing', (req, res) => {
    res.json({message: "testing message"});
})

// Fetch all vegetables
router.get('/api/vegetables', (req, res) => {
    db.query('SELECT * FROM Vegetables', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add a new vegetable
router.post('/api/vegetables/add', (req, res) => {
    const { name, price_per_unit } = req.body;
    const sql = 'INSERT INTO Vegetables (name, price_per_unit) VALUES (?, ?)';

    db.query(sql, [name, price_per_unit], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Vegetable added successfully', VegetableName: result.insertId });
    });
});

// Delete a vegetable
router.delete('/delete/:name', (req, res) => {
    const name = req.params.name;
    const sql = 'DELETE FROM Vegetables WHERE VegetableName = ?';

    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Vegetable removed successfully' });
    });
});

module.exports = router;
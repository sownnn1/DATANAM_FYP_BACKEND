const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
const port = 3001;


// Middleware to handle JSON data
app.use(express.json());
app.use(cors());

// Set up your MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ssundee',
    database: 'datanamfyp'
});

db.connect((err) => {
    if (err) {
        console.log('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// A simple route to check if the server is running
app.get('/', (req, res) => {
    res.send('Express server is running!');
});

app.get('/testing', (req, res) => {
    res.json({message: "testing message"});
})

app.get('/api/vegetable', (req, res) => {
    db.query('SELECT * FROM Vegetables', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
})

app.get('/api/customer', (req, res) => {
    db.query('SELECT * FROM customers', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
})

app.get('/api/customer/:cid', (req, res) => {
    const customerId = req.params.cid;

    db.query(
        'SELECT * FROM customers WHERE CID = ?',
        [customerId],
        (error, results) => {
            if (error) {
                console.log(results)
                console.error('Error fetching customer:', error);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: 'Customer not found'
                });
            }

            res.json(results[0]);
        }
    );
});

app.post('/api/vegetable/add', (req, res) => {
    const { VegetableName, Price } = req.body;
    const sql = 'INSERT INTO Vegetables (VegetableName, Price) VALUES (?, ?)';

    db.query(sql, [VegetableName, Price], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Vegetable added successfully'});
    });
});

app.post('/api/customer/add', (req, res) => {
    // First, get the latest CID from the database
    db.query(
        'SELECT CID FROM customers ORDER BY CID DESC LIMIT 1',
        (error, results) => {
            if (error) {
                console.error('Error fetching last CID:', error);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            // Generate new CID
            let newCID;
            if (results.length === 0) {
                newCID = 'C001'; // First customer
            } else {
                const lastCID = results[0].CID;
                const lastNumber = parseInt(lastCID.substring(1));
                newCID = `C${String(lastNumber + 1).padStart(3, '0')}`;
            }

            // Extract customer data from request body
            const {
                CompanyName,
                FirstName,
                LastName,
                Email,
                ContactNumber,
                Address,
                City,
                Postcode,
                State,
                Country
            } = req.body;

            // Insert new customer
            db.query(
                'INSERT INTO customers (CID, CompanyName, FirstName, LastName, Email, ContactNumber, Address, City, Postcode, State, Country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newCID, CompanyName, FirstName, LastName, Email, ContactNumber, Address, City, Postcode, State, Country],
                (error, result) => {
                    if (error) {
                        console.error('Error creating customer:', error);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    res.status(201).json({
                        message: 'Customer created successfully',
                        customerId: newCID
                    });
                }
            );
        }
    );
});

app.put('/api/customer/update/:cid', (req, res) => {
    const customerId = req.params.cid;
    const {
        CompanyName,
        FirstName,
        LastName,
        Email,
        ContactNumber,
        Address,
        City,
        Postcode,
        State,
        Country
    } = req.body;

    // First check if customer exists
    db.query(
        'SELECT * FROM customers WHERE CID = ?',
        [customerId],
        (error, results) => {
            if (error) {
                console.error('Error checking customer:', error);
                return res.status(500).json({
                    error: 'Internal server error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: 'Customer not found'
                });
            }

            // Update customer record
            db.query(
                `UPDATE customers 
         SET CompanyName = ?, 
             FirstName = ?, 
             LastName = ?, 
             Email = ?, 
             ContactNumber = ?, 
             Address = ?, 
             City = ?, 
             Postcode = ?, 
             State = ?, 
             Country = ?
         WHERE CID = ?`,
                [
                    CompanyName,
                    FirstName,
                    LastName,
                    Email,
                    ContactNumber,
                    Address,
                    City,
                    Postcode,
                    State,
                    Country,
                    customerId
                ],
                (error, result) => {
                    if (error) {
                        console.error('Error updating customer:', error);
                        return res.status(500).json({
                            error: 'Internal server error'
                        });
                    }

                    res.json({
                        message: 'Customer updated successfully',
                        customerId: customerId
                    });
                }
            );
        }
    );
});

app.delete('/api/vegetable/delete/:name', (req, res) => {
    const vegetablename = req.params.name; // Extract the ID from the request parameters

    const query = 'DELETE FROM vegetables WHERE VegetableName = ?';

    db.query(query, [vegetablename], (error, results) => {
        if (error) {
            console.error('Error deleting vegetable:', error);
            res.status(500).json({ error: 'Failed to delete the vegetable' });
        } else {
            res.status(200).json({ message: 'Vegetable deleted successfully' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const vegetablesRouter = require('./routes/vegetables');
app.use('/api/vegetable', vegetablesRouter);

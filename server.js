const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Initialize data.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ projects: null, gallery: null }), 'utf8');
}

// Get data
app.get('/api/data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.json({ projects: null, gallery: null });
        }
    });
});

// Update data
app.post('/api/data', (req, res) => {
    const { type, items } = req.body;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });
        let currentData = { projects: null, gallery: null };
        try {
            currentData = JSON.parse(data);
        } catch (e) {
            // ignore
        }
        
        if (type === 'projects') {
            currentData.projects = items;
        } else if (type === 'gallery') {
            currentData.gallery = items;
        }
        
        fs.writeFile(DATA_FILE, JSON.stringify(currentData), 'utf8', (err) => {
            if (err) return res.status(500).json({ error: 'Failed to write data' });
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

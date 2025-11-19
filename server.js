// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// --- File Path Configuration ---
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors(
   { 
    origin: '*'  
    }
));
app.use(bodyParser.json());

// --- Initial Data Load ---
let users = [];
let nextUserId = 1;

try {
  // Load existing users from file
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    
    // Determine the next ID
    if (users.length > 0) {
        const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
        nextUserId = maxId + 1;
    }
    console.log(`Successfully loaded ${users.length} users.`);
  }
} catch (error) {
  console.error('Error loading users file:', error);
}

// --- Function to Save Users to File ---
const saveUsers = () => {
    try {
        const data = JSON.stringify(users, null, 2); 
        fs.writeFileSync(USERS_FILE, data, 'utf8');
        console.log('User data saved successfully.');
    } catch (error) {
        console.error('Error saving users file:', error);
    }
};

// --- API Endpoint for Registration ---
app.post('https://https-github-com-monukushawaha987.onrender.com/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  // NOTE: Password should be hashed in a real application
  const newUser = { id: nextUserId++, username, password, score: 0 };
  users.push(newUser);
  
  saveUsers(); // Save the updated list

  res.status(201).json({ 
    message: 'Registration successful!', 
    user: { id: newUser.id, username: newUser.username }
  });
});

// --- API Endpoint for Login (NEW) ---
app.post('https://https-github-com-monukushawaha987.onrender.com/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // 1. Find the user
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Authentication failed. Invalid username or password.' });
    }

    // 2. Check the password
    // NOTE: In a real app, you would use bcrypt.compare(password, user.hashedPassword)
    if (user.password !== password) {
        return res.status(401).json({ message: 'Authentication failed. Invalid username or password.' });
    }
    
    // 3. Successful login
    console.log(`User logged in: ${username}`);
    res.json({ 
        message: 'Login successful!',
        user: { id: user.id, username: user.username, score: user.score }
        // In a real app, you would generate and return a JWT token here
    });
});


// --- API Endpoint to get Scores (Leaderboard) ---
app.get('https://https-github-com-monukushawaha987.onrender.com/api/scores', (req, res) => {
    const leaderboard = users.sort((a, b) => b.score - a.score).map(u => ({ username: u.username, score: u.score }));
    res.json(leaderboard);
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
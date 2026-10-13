import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('game.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    hero_class TEXT,
    silver INTEGER DEFAULT 100,
    gold INTEGER DEFAULT 10,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    text TEXT,
    channel TEXT DEFAULT 'global',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/api/register', (req, res) => {
  const { username, password, heroClass } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (username, password, hero_class) VALUES (?, ?, ?)');
    stmt.run(username, password, heroClass);
    res.json({ success: true, message: 'Персонажа успішно створено!' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Імʼя вже зайняте!' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, message: 'Невірний логін або пароль' });
  }
});

app.get('/api/chat', (req, res) => {
  const msgs = db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 30').all();
  res.json(msgs.reverse());
});

app.post('/api/chat', (req, res) => {
  const { sender, text, channel } = req.body;
  db.prepare('INSERT INTO messages (sender, text, channel) VALUES (?, ?, ?)').run(sender, text, channel || 'global');
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер гри запущено на порту ${PORT}`));

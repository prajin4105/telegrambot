import { nanoid } from 'nanoid';
import fs from 'fs';

const dbFile = './db.json';

const readDB = () => JSON.parse(fs.readFileSync(dbFile, 'utf8') || '{}');
const writeDB = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

export function getUserData(userId) {
  const db = readDB();
  return db[userId];
}

export function saveToken(userId, token) {
  const db = readDB();
  db[userId] = {
    token,
    createdAt: Date.now()
  };
  writeDB(db);
}

export function hasValidToken(userId) {
  const user = getUserData(userId);
  if (!user) return false;
  const tokenAge = Date.now() - user.createdAt;
  return tokenAge < 24 * 60 * 60 * 1000;
}

export function generateToken() {
  return nanoid(16);
}

export function invalidateToken(userId) {
  const db = readDB();
  delete db[userId];
  writeDB(db);
}
b
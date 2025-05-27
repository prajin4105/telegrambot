const recentCommands = {};

export function isSpamming(userId) {
  const now = Date.now();
  if (!recentCommands[userId]) {
    recentCommands[userId] = now;
    return false;
  }
  if (now - recentCommands[userId] < 5000) {
    return true;
  }
  recentCommands[userId] = now;
  return false;
}

export function generateShortLink(userId) {
  return `https://shrinkme.ink/O3h5gM9/`;
}

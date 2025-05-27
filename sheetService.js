import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function appendRow(spreadsheetId, range, values) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [values],
    },
  });
}

export async function checkExistingToken(spreadsheetId, userId) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:C',
  });

  const rows = response.data.values || [];
  const userRow = rows.find(row => row[0] === userId.toString());
  
  // Return null if no token exists (row not found)
  return userRow ? { token: userRow[1], timestamp: userRow[2] } : null;
}

// NEW FUNCTION: Remove user's token from sheet
export async function removeToken(spreadsheetId, userId) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:C',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === userId.toString());
  
  if (rowIndex === -1) return false;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: 0, // Assuming Sheet1 is the first sheet
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1
          }
        }
      }]
    }
  });
  
  return true;
}
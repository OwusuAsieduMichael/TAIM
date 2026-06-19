/**
 * TAIM — Google Apps Script + Google Sheets backend
 * Deploy as Web App (Execute as: Me, Who has access: Anyone)
 */

function doGet(e) {
  return handleHttp_(e);
}

function doPost(e) {
  return handleHttp_(e);
}

/**
 * Run once from the Apps Script editor after creating your spreadsheet.
 * Menu: Run → initializeTaimBackend
 */
function initializeTaimBackend() {
  ensureSpreadsheet_();
  seedDemoData_();
  Logger.log('TAIM backend ready. Set Script Property SPREADSHEET_ID if you created a new sheet.');
  Logger.log('Deploy → New deployment → Web app → copy the /exec URL into apps/web/.env');
}

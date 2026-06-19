var CONFIG = {
  JWT_EXPIRES_SECONDS: 24 * 60 * 60,
  OTP_EXPIRY_MINUTES: 5,
  MAX_OTP_ATTEMPTS: 5,
  TEACHER_WORKFORCE_DISABLED: true,
  /** Demo quick login: accept this OTP for teacher/parent without SMS. */
  DEMO_OTP_CODE: '000000',
};

function getJwtSecret_() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('JWT_SECRET');
  if (!secret || secret.length < 32) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('JWT_SECRET', secret);
  }
  return secret;
}

function getSpreadsheetId_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    return id;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    id = ss.getId();
    props.setProperty('SPREADSHEET_ID', id);
    return id;
  }
  throw new Error('Set Script Property SPREADSHEET_ID or run initializeTaimBackend from a bound spreadsheet.');
}

function ensureSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  var ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('TAIM Database');
    props.setProperty('SPREADSHEET_ID', ss.getId());
    Logger.log('Created spreadsheet: ' + ss.getUrl());
  }
  initSheets_(ss);
  return ss;
}

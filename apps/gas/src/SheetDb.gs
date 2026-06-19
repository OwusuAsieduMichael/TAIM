function ss_() {
  return SpreadsheetApp.openById(getSpreadsheetId_());
}

function sheet_(name) {
  return ss_().getSheetByName(name);
}

function headers_(name) {
  return SHEET_SCHEMAS[name];
}

function rows_(name) {
  var sh = sheet_(name);
  var data = sh.getDataRange().getValues();
  if (data.length <= 1) {
    return [];
  }
  var headers = data[0];
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var c = 0; c < headers.length; c++) {
      var raw = data[i][c] === '' ? null : data[i][c];
      if (headers[c] === 'phone' && raw !== null) {
        raw = String(raw);
      }
      row[headers[c]] = raw;
    }
    if (row.id) {
      out.push(row);
    }
  }
  return out;
}

function findAll_(name, predicate) {
  var all = rows_(name);
  if (!predicate) {
    return all;
  }
  return all.filter(predicate);
}

function findOne_(name, predicate) {
  var all = findAll_(name, predicate);
  return all.length ? all[0] : null;
}

function insert_(name, record) {
  var sh = sheet_(name);
  var headers = headers_(name);
  var now = new Date().toISOString();
  if (!record.id) {
    record.id = 'id_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  }
  if (headers.indexOf('createdAt') >= 0 && !record.createdAt) {
    record.createdAt = now;
  }
  if (headers.indexOf('updatedAt') >= 0 && !record.updatedAt) {
    record.updatedAt = now;
  }
  var line = headers.map(function (h) {
    return record[h] === undefined || record[h] === null ? '' : record[h];
  });
  sh.appendRow(line);
  return record;
}

function updateById_(name, id, patch) {
  var sh = sheet_(name);
  var data = sh.getDataRange().getValues();
  if (data.length <= 1) {
    return null;
  }
  var headers = data[0];
  var idCol = headers.indexOf('id');
  if (headers.indexOf('updatedAt') >= 0 && patch.updatedAt === undefined) {
    patch.updatedAt = new Date().toISOString();
  }
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(id)) {
      headers.forEach(function (h, c) {
        if (patch[h] !== undefined) {
          data[r][c] = patch[h] === null ? '' : patch[h];
        }
      });
      sh.getRange(r + 1, 1, r + 1, headers.length).setValues([data[r]]);
      return rowToObj_(headers, data[r]);
    }
  }
  return null;
}

function upsertByUnique_(name, matchFn, record) {
  var existing = findOne_(name, matchFn);
  if (existing) {
    return updateById_(name, existing.id, record);
  }
  return insert_(name, record);
}

function rowToObj_(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i] === '' ? null : row[i];
  }
  return obj;
}

function clearSheetData_(name) {
  var sh = sheet_(name);
  var last = sh.getLastRow();
  if (last > 1) {
    sh.deleteRows(2, last - 1);
  }
}

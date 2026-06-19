function httpError_(status, message, details) {
  var err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

function jsonResponse_(status, body) {
  var output = ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
  // GAS Web Apps cannot set arbitrary CORS headers; use the Vite proxy in local dev.
  return output;
}

function ok_(body) {
  return jsonResponse_(200, body);
}

function fail_(err) {
  var status = err.status || 500;
  var body = { error: err.message || 'Internal server error' };
  if (err.details) {
    body.details = err.details;
  }
  if (status >= 500) {
    Logger.log(err.stack || err.message);
  }
  return jsonResponse_(status, body);
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function handleHttp_(e) {
  try {
    var envelope = parseBody_(e);
    var route = envelope.route || (e && e.parameter && e.parameter.route) || '/health';
    var method = (envelope.method || (e && e.parameter && e.parameter.method) || 'GET').toUpperCase();
    var token = envelope.token || (e && e.parameter && e.parameter.token) || null;
    var body = envelope.body || envelope.payload || {};

    if (route === '/health' || route === '/api/health') {
      return ok_({ status: 'ok', service: 'taim-gas' });
    }

    var ctx = {
      route: normalizeRoute_(route),
      method: method,
      token: token,
      body: body,
      auth: null,
    };

    if (ctx.route !== '/api/v1/auth/admin/login' &&
        ctx.route !== '/api/v1/auth/teacher/otp/request' &&
        ctx.route !== '/api/v1/auth/teacher/otp/verify' &&
        ctx.route !== '/api/v1/auth/parent/otp/request' &&
        ctx.route !== '/api/v1/auth/parent/otp/verify' &&
        ctx.route !== '/api/v1/auth/student/login' &&
        ctx.route !== '/health') {
      if (!token) {
        throw httpError_(401, 'Unauthorized');
      }
      ctx.auth = verifyJwt_(token);
    }

    return ok_(dispatchRoute_(ctx));
  } catch (err) {
    return fail_(err);
  }
}

function normalizeRoute_(route) {
  var r = String(route || '').trim();
  if (!r.startsWith('/')) {
    r = '/' + r;
  }
  if (!r.startsWith('/api/v1') && r !== '/health') {
    if (r.indexOf('/auth/') === 0 || r.indexOf('/schools') === 0) {
      r = '/api/v1' + r;
    }
  }
  return r.replace(/\/+$/, '') || '/health';
}

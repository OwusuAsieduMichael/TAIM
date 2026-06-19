function hashSecret_(value, salt) {
  var raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ':' + value,
    Utilities.Charset.UTF_8,
  );
  return Utilities.base64Encode(raw);
}

function hashPassword_(password) {
  return hashSecret_(password, 'taim-pw-v1');
}

function verifyPassword_(password, hash) {
  return hashPassword_(password) === hash;
}

function hashOtp_(code) {
  return hashSecret_(code, 'taim-otp-v1');
}

function verifyOtp_(code, hash) {
  return hashOtp_(code) === hash;
}

function generateOtpCode_() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signJwt_(payload) {
  var header = { alg: 'HS256', typ: 'JWT' };
  var now = Math.floor(Date.now() / 1000);
  var body = {
    sub: payload.sub,
    role: payload.role,
    schoolId: payload.schoolId,
    iat: now,
    exp: now + CONFIG.JWT_EXPIRES_SECONDS,
  };
  var encodedHeader = base64UrlEncode_(JSON.stringify(header));
  var encodedBody = base64UrlEncode_(JSON.stringify(body));
  var signingInput = encodedHeader + '.' + encodedBody;
  var sig = Utilities.computeHmacSha256Signature(signingInput, getJwtSecret_());
  return signingInput + '.' + base64UrlEncodeBytes_(sig);
}

function verifyJwt_(token) {
  var parts = token.split('.');
  if (parts.length !== 3) {
    throw httpError_(401, 'Invalid token');
  }
  var signingInput = parts[0] + '.' + parts[1];
  var sig = Utilities.computeHmacSha256Signature(signingInput, getJwtSecret_());
  if (base64UrlEncodeBytes_(sig) !== parts[2]) {
    throw httpError_(401, 'Invalid token');
  }
  var payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(parts[1].replace(/-/g, '+').replace(/_/g, '/'))).getDataAsString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw httpError_(401, 'Token expired');
  }
  return {
    sub: String(payload.sub),
    role: String(payload.role),
    schoolId: payload.schoolId === null || payload.schoolId === undefined ? null : String(payload.schoolId),
  };
}

function base64UrlEncode_(str) {
  return Utilities.base64EncodeWebSafe(str).replace(/=+$/, '');
}

function base64UrlEncodeBytes_(bytes) {
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function normalizePhone_(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.indexOf('0') === 0 && digits.length === 10) {
    return '233' + digits.slice(1);
  }
  if (digits.indexOf('233') === 0) {
    return digits;
  }
  return digits;
}

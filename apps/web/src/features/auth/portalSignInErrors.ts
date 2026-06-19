/** Map API / backend messages to user-facing portal sign-in errors. */
export function portalSignInErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const lower = message.toLowerCase();

  if (lower.includes('no account for this phone') || lower.includes('user not found')) {
    return 'No matching account was found for this portal. Contact your school office for assistance.';
  }
  if (lower.includes('school not found')) {
    return 'This school code is not recognised. Check with your school and try again.';
  }
  if (lower.includes('invalid credentials') || lower.includes('invalid admission') || lower.includes('invalid otp')) {
    return 'Those credentials could not be verified. Try again or sign in manually below.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  return message || 'Sign-in could not be completed. Please try again.';
}

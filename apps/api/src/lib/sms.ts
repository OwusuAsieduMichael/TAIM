/**
 * Hubtel / other SMS providers — stub logs in development.
 */
export async function sendSms(to: string, message: string): Promise<void> {
  const { NODE_ENV } = process.env;
  if (NODE_ENV !== 'production') {
    console.info(`[SMS stub] to=${to} msg=${message}`);
    return;
  }
  // Integrate Hubtel when credentials are present
  if (!process.env.HUBTEL_CLIENT_ID) {
    console.warn('[SMS] Production send skipped: HUBTEL_CLIENT_ID not set');
    return;
  }
  console.info(`[SMS] to=${to} (Hubtel integration placeholder)`);
}

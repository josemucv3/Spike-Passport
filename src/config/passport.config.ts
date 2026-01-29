export default () => ({
  passport: {
    apiUrl: process.env.PASSPORT_API_URL,
    clientId: process.env.PASSPORT_CLIENT_ID,
    clientSecret: process.env.PASSPORT_CLIENT_SECRET,
    apiKey: process.env.PASSPORT_API_KEY,
    secretApiKey: process.env.SECRET_API_KEY,
    webhookSecret: process.env.PASSPORT_WEBHOOK_SECRET,
  },
});


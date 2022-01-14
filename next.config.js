module.exports = {
  serverRuntimeConfig: {
    // Will only be available on the server side
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    COOKIE_NAME: process.env.COOKIE_NAME,
    COOKIE_SECRET_CURRENT: process.env.COOKIE_SECRET_CURRENT,
    COOKIE_SECRET_PREVIOUS: process.env.COOKIE_SECRET_PREVIOUS,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    BACKEND_URL: process.env.BACKEND_URL,
    DEFAULT_USER_IMAGE_URL: process.env.DEFAULT_USER_IMAGE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_API_KEY: process.env.FIREBASE_CLIENT_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  },
};

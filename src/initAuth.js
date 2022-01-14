import { init } from "next-firebase-auth";
import getConfig from "next/config";

export default function initAuth() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  init({
    authPageURL: "/auth",
    appPageURL: "/",
    loginAPIEndpoint: "/api/login",
    logoutAPIEndpoint: "/api/logout",
    // firebaseAuthEmulatorHost: 'localhost:9099',
    firebaseAdminInitConfig: {
      credential: {
        projectId: serverRuntimeConfig.FIREBASE_PROJECT_ID,
        clientEmail: serverRuntimeConfig.FIREBASE_CLIENT_EMAIL,
        // The private key must not be accesssible on the client side.
        privateKey: serverRuntimeConfig.FIREBASE_PRIVATE_KEY,
      },
      // databaseURL: 'https://my-example-app.firebaseio.com',
    },
    firebaseClientInitConfig: {
      apiKey: publicRuntimeConfig.FIREBASE_CLIENT_API_KEY,
      authDomain: publicRuntimeConfig.FIREBASE_AUTH_DOMAIN,
      // databaseURL: 'https://my-example-app.firebaseio.com',
      projectId: publicRuntimeConfig.FIREBASE_PROJECT_ID,
    },
    cookies: {
      name: serverRuntimeConfig.COOKIE_NAME, // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [
        serverRuntimeConfig.COOKIE_SECRET_CURRENT,
        serverRuntimeConfig.COOKIE_SECRET_PREVIOUS,
      ],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      secure: false, // set this to false in local (non-HTTPS) development
      signed: true,
    },
  });
}

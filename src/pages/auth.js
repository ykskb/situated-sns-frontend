import { useState, useEffect } from "react";
import firebase from "firebase";
import {
  withAuthUser,
  AuthAction,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import MainHeader from "../components/mainheader";
import { useRouter } from "next/router";
import { getAuthUserInfo } from "../lib/api";

const firebaseAuthConfig = {
  signInFlow: "popup",
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
    },
  ],
  signInSuccessUrl: "/auth",
  credentialHelper: "none",
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

function SignupPage() {
  const [renderAuth, setRenderAuth] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRenderAuth(true);
    }
  }, []);

  return (
    <>
      <MainHeader
        title="Signin"
        onBackClick={(e) => {
          router.back();
        }}
      />
      <div>
        {renderAuth ? (
          <StyledFirebaseAuth
            uiConfig={firebaseAuthConfig}
            firebaseAuth={firebase.auth()}
          />
        ) : null}
      </div>
    </>
  );
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.RENDER,
})(async ({ AuthUser, req }) => {
  const token = await AuthUser.getIdToken();
  const userInfo = token ? await getAuthUserInfo(token) : null;
  if (userInfo && !userInfo.is_valid) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }
});

export default withAuthUser()(SignupPage);

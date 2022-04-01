// components/layout.js
import React, { useEffect } from "react";
import Sidebar from "./sidebar";
import Mainside from "./mainside";
import { Context } from "../lib/context";
import { useAuthUser } from "next-firebase-auth";
import { login, register } from "../lib/api";
import firebase from "firebase";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const router = useRouter();
  const authUser = useAuthUser();
  const [context, setContext] = React.useState(null);
  const [authInProgress, setAuthInProgress] = React.useState(false);
  const [authEventSet, setAuthEventSet] = React.useState(false);
  useEffect(() => {
    if (!authEventSet) {
      setAuthEventSet(true);
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user && !authInProgress) {
          setAuthInProgress(true);
          user.getIdToken().then(async (token) => {
            try {
              const loginRes = await login(token);
              setContext({ authUserInfo: loginRes.authUser });
              // Valid user login
              if (loginRes.authUser && loginRes.authUser.is_valid) {
                router.push("/");
              } else {
                // Registered, but registration is not done
                router.push("/profile");
              }
            } catch (e) {
              console.log(e);
              try {
                const registerRes = await register(token);
                setContext({ authUserInfo: registerRes.authUser });
                router.push("/profile");
              } catch (e) {
                console.log(e);
                console.log("Received not authenticated from backend");
              }
            }
            setAuthInProgress(false);
          });
        } else {
          setContext(null);
          router.push("/");
        }
      });
    }
  });
  return (
    <Context.Provider value={[context, setContext]}>
      <div className="main-grid">
        <Sidebar signOut={authUser.signOut} />
        <main className="main-content">{children}</main>
        <Mainside />
      </div>
    </Context.Provider>
  );
};

export default Layout;

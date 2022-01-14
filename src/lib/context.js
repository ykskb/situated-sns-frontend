import React from "react";
import { useContext } from "react";

// Workaround since layout is not a page component in Next.js.
// It seems tough to get Firebase token & query backend for user
// information in layout. So pages update this context
// which has states of layout.

export const Context = React.createContext();

export const authUserInfoContext = () => {
  const [context, _setContext] = useContext(Context);
  return context && context.authUserInfo;
};

export const setAuthUserInfoContext = (authUserInfo) => {
  const [_context, setContext] = useContext(Context);
  setContext({ authUserInfo: authUserInfo });
};

import React from "react";
import { useContext } from "react";

// Layout can't make server-side props.
// For sharing & updating auth state from both layout and pages.

export const Context = React.createContext();

export const authUserInfoContext = () => {
  const [context, _setContext] = useContext(Context);
  return context && context.authUserInfo;
};

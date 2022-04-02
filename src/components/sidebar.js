import Link from "next/link";
import { useContext } from "react";
import { Context } from "../lib/context";
import firebase from "firebase";
import getConfig from "next/config";

const Sidebar = ({ signOut }) => {
  const [context, _setContext] = useContext(Context);
  const authUserInfo = context && context.authUserInfo;
  const isValidUser = authUserInfo && authUserInfo.is_valid;
  const logoutClicked = (_e) => {
    firebase.auth().signOut();
  };
  const { publicRuntimeConfig } = getConfig();
  return (
    <div className="main-nav">
      <ul className="main-nav-list">
        <li className="main-nav-item">
          <Link href="/">
            <a className="menu-item is-selected js-home">
              <span className="icon">🏠</span>
              <span className="text">Home</span>
            </a>
          </Link>
        </li>
        {authUserInfo ? (
          <>
            <Link href={"/message"}>
              <a>
                <li className="main-nav-item">
                  <a className="menu-item">
                    <span className="icon">💬</span>
                    <span className="text">Message</span>
                  </a>
                </li>
              </a>
            </Link>
            <Link
              href={isValidUser ? "/user/" + authUserInfo.slug : "/profile"}
            >
              <a>
                <li className="main-nav-item">
                  <a className="menu-item">
                    <span className="icon">👤</span>
                    <span className="text">Profile</span>
                  </a>
                </li>
              </a>
            </Link>
            <li className="main-nav-item">
              <a className="menu-item" onClick={logoutClicked}>
                <span className="icon">👤</span>
                <span className="text">Logout</span>
              </a>
            </li>
          </>
        ) : (
          <li className="main-nav-item">
            <Link href="/auth">
              <a className="menu-item">
                <span className="icon">👤</span>
                <span className="text">Signin / up</span>
              </a>
            </Link>
          </li>
        )}
        <li className="main-nav-item">
          <Link href="/post/create">
            <a className="menu-item">
              <span className="icon">✏️</span>
              <span className="text">Create a Post</span>
            </a>
          </Link>
        </li>
        <li className="main-nav-item">
          <a
            className="menu-item"
            href={publicRuntimeConfig.BACKEND_URL + "/graphiql"}
            target="_blank"
          >
            <span className="icon">📖</span>
            <span className="text">GraphiQL</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

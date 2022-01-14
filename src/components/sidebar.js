import Link from "next/link";
import { useContext } from "react";
import { Context } from "../lib/context";
import firebase from "firebase";

const Sidebar = ({ signOut }) => {
  const [context, _setContext] = useContext(Context);
  const authUserInfo = context && context.authUserInfo;
  const isValidUser = authUserInfo && authUserInfo.is_valid;
  const logoutClicked = (_e) => {
    firebase.auth().signOut();
  };
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
            <Link href={isValidUser ? "/user/" + authUserInfo.slug : "/auth"}>
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
          <a className="menu-item">
            <span className="icon">🔖</span>
            <span className="text">Bookmarks</span>
          </a>
        </li>
        <li className="main-nav-item">
          <Link href="/post/create">
            <a className="menu-item">
              <span className="icon">✏️</span>
              <span className="text">Create a Post</span>
            </a>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

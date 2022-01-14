import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { authUserInfoContext } from "../lib/context";

const RegisterModal = ({ show, onClose }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const authUserInfo = authUserInfoContext();
  const isInvalidUser = authUserInfo && authUserInfo.is_valid === false;

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const modalContent = show ? (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <a href="#" onClick={handleCloseClick}>
            x
          </a>
        </div>
        <div className="modal-body">
          {isInvalidUser ? (
            <div style={{ textAlign: "center", paddingTop: "48px" }}>
              <p>Please finish registration.</p>
              <br />
              <Link href="/profile">
                <a>
                  <button className="big-green-button">Profile</button>
                </a>
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: "center", paddingTop: "48px" }}>
              <p>Signin/up for more!</p>
              <br />
              <Link href="/auth">
                <a>
                  <button className="big-green-button">Signin/up</button>
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root")
    );
  } else {
    return null;
  }
};

export default RegisterModal;

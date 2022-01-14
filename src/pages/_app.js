import React from "react";
import initAuth from "../initAuth";
import "../styles.scss";
import Layout from "../components/layout";

initAuth();

const MyApp = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
      <div id="modal-root"></div>
    </Layout>
  );
};

export default MyApp;

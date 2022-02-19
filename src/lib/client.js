import getConfig from "next/config";
import firebase from "firebase";

export const request = async (method, url, body, headers, authToken) => {
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  const opts = {
    headers: headers,
    body: body,
    method: method,
    // credentials: 'include'
  };
  if (authToken) {
    opts.headers["Authorization"] = authToken;
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    throw new Error(
      `Data fetching failed with status ${res.status}: 
      ${JSON.stringify(res.json())}`
    );
  }
  return await res.json();
};

export const requestWithIdToken = async (url, method, body, headers) => {
  const user = firebase.auth().currentUser;
  if (user) {
    return user.getIdToken(true).then(async function (idToken) {
      return await request(method, url, body, headers, idToken);
    });
  }
};

export const graphql = async (query, variables, authToken) => {
  const { publicRuntimeConfig } = getConfig();
  return await request(
    "POST",
    publicRuntimeConfig.BACKEND_URL + "/graphql",
    JSON.stringify({ query, variables }),
    {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    authToken
  );
};

export const graphqlWithIdToken = async (query, variables) => {
  const user = firebase.auth().currentUser;
  if (user) {
    return user.getIdToken().then(async function (idToken) {
      return await graphql(query, variables, idToken);
    });
  }
};

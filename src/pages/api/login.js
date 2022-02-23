import { setAuthCookies } from "next-firebase-auth";
import initAuth from "../../initAuth"; // the module you created above
import { getAuthUserInfo } from "../../lib/api";
import { graphql } from "../../lib/client";

initAuth();

const createEndUser = async (token) => {
  return await graphql(
    `
      mutation createEnduserMutation($email: String!, $username: String!) {
        createEnduser(email: $email, username: $username) {
          id
        }
      }
    `,
    { email: "", username: "" },
    token
  );
};

const handler = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(400).json({ success: false });
  }
  let userInfo;
  userInfo = await getAuthUserInfo(req.headers.authorization);
  if (userInfo) {
    await setAuthCookies(req, res);
  } else {
    // Not authenticated: user is not in DB => register user with token
    try {
      const res = await createEndUser(req.headers.authorization);
      userInfo = await getAuthUserInfo(req.headers.authorization);
    } catch (e) {
      console.log(res);
      console.log(userInfo);
      return res.status(500).json({ error: "User creation failed." });
    }
  }
  return res.status(200).json({ success: true, authUser: userInfo });
};

export default handler;

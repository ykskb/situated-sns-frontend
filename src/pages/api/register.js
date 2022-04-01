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
  try {
    await createEndUser(req.headers.authorization);
    const userInfo = await getAuthUserInfo(req.headers.authorization);
    await setAuthCookies(req, res);
    return res.status(200).json({ success: true, authUser: userInfo });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "User creation failed." });
  }
};

export default handler;

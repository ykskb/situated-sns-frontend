import { setAuthCookies } from "next-firebase-auth";
import initAuth from "../../initAuth"; // the module you created above
import { getAuthUserInfo } from "../../lib/api";

initAuth();

const handler = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(400).json({ success: false });
  }
  let userInfo;
  try {
    userInfo = await getAuthUserInfo(req.headers.authorization);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false });
  }
  if (userInfo) {
    await setAuthCookies(req, res);
    return res.status(200).json({ success: true, authUser: userInfo });
  } else {
    console.log("no userinfo");
    return res.status(400).json({ success: false });
  }
};

export default handler;

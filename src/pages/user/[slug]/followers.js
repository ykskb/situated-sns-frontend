import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { useRouter } from "next/router";
import MainHeader from "../../../components/mainheader";
import { UserFeedList } from "../../../components/user/user-feed";
import { getAuthUserInfo } from "../../../lib/api";
import {
  queryEndUserWithFollowers,
  queryEndUserWithFollowing,
} from "../../../lib/graphql";

const Followers = ({ enduser }) => {
  const router = useRouter();
  console.log(enduser);
  return (
    <>
      <MainHeader
        title={enduser.username + " followers"}
        onBackClick={router.back}
      />
      <section className="feed">
        <UserFeedList
          enduserFollows={enduser.enduser_follows_on_enduser_id || []}
          enduserKey="created_by_enduser"
        />
      </section>
    </>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.RENDER,
})(async ({ AuthUser, params, req }) => {
  const token = await AuthUser.getIdToken();
  const userInfo = token ? await getAuthUserInfo(token) : null;
  if (!userInfo || !userInfo.is_valid) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  const res = await queryEndUserWithFollowers(params.slug);
  return {
    props: {
      enduser: res.data["endusers"][0],
    },
  };
});

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Followers);
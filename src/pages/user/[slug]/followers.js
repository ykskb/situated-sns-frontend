import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { useRouter } from "next/router";
import MainHeader from "../../../components/mainheader";
import { UserFeedList } from "../../../components/user/user-feed";
import { getAuthUserInfo } from "../../../lib/api";
import { graphql } from "../../../lib/client";

const Followers = ({ enduser }) => {
  const router = useRouter();
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

const queryEndUserWithFollowers = async (slug) => {
  return await graphql(
    `
      query endUserWithFollowers($slug: String!) {
        endusers(where: { slug: { eq: $slug } }) {
          slug
          username
          bio
          enduser_follows_on_enduser_id_aggregate {
            count
          }
          enduser_follows_on_enduser_id {
            enduser_id
            created_by_enduser {
              slug
              username
              bio
              profile_image_url
            }
          }
        }
      }
    `,
    { slug },
    null
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  whenAuthed: AuthAction.RENDER,
})(async ({ AuthUser, params, req }) => {
  const token = await AuthUser.getIdToken();
  const userInfo = token ? await getAuthUserInfo(token) : null;
  if (!userInfo || !userInfo.is_valid) {
    return { notFound: true };
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

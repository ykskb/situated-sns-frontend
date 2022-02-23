import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import MainHeader from "../../../components/mainheader";
import { UserFeedList } from "../../../components/user/user-feed";
import { getAuthUserInfo } from "../../../lib/api";
import { graphql } from "../../../lib/client";

const followerNumPerPage = 15;

const queryEndUserFollows = async (slug, page) => {
  return await graphql(
    `
      query endUserFollows($enduser_id: Int!, $limit: Int!, $offset: Int!) {
        enduser_follows(
          where: { enduser_id: { eq: $enduser_id } }
          limit: $limit
          offset: $offset
          sort: { created_at: asc }
        ) {
          enduser_id
          created_by_enduser {
            slug
            username
            bio
            profile_image_url
          }
        }
      }
    `,
    {
      slug,
      limit: followerNumPerPage,
      offset: followerNumPerPage * (page - 1),
    },
    null
  );
};

const Followers = ({ enduser }) => {
  const router = useRouter();
  const [endUserFollows, setEndUserFollows] = useState(
    enduser.enduser_follows_on_enduser_id || []
  );
  return (
    <>
      <MainHeader
        title={enduser.username + " followers"}
        onBackClick={router.back}
      />
      <section className="feed">
        <UserFeedList
          enduserSlug={enduser.slug}
          enduserFollows={endUserFollows}
          setEndUserFollows={setEndUserFollows}
          getMoreUserFollows={queryEndUserFollows}
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
          enduser_follows_on_enduser_id(sort: { created_at: asc }, limit: 15) {
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

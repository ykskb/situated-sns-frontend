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

const followerNumPerPage = 20;

const queryEndUserFollows = async (slug, page) => {
  return await graphql(
    `
      query endUserFollows($enduser_id: Int!, $limit: Int!, $offset: Int!) {
        enduser_follows(
          where: { created_by: { eq: $enduser_id } }
          limit: $limit
          offset: $offset
          sort: { created_at: asc }
        ) {
          enduser_id
          enduser {
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

const Following = ({ enduser }) => {
  const router = useRouter();
  const [endUserFollows, setEndUserFollows] = useState(
    enduser.enduser_follows_on_created_by || []
  );
  return (
    <>
      <MainHeader
        title={enduser.username + " following"}
        onBackClick={router.back}
      />
      <section className="feed">
        <UserFeedList
          enduserSlug={enduser.slug}
          enduserFollows={endUserFollows}
          setEndUserFollows={setEndUserFollows}
          getMoreUserFollows={queryEndUserFollows}
        />
      </section>
    </>
  );
};

const queryEndUserWithFollowing = async (slug) => {
  return await graphql(
    `
      query endUserWithFollowing($slug: String!) {
        endusers(where: { slug: { eq: $slug } }) {
          slug
          username
          bio
          enduser_follows_on_created_by_aggregate {
            count
          }
          enduser_follows_on_created_by(sort: { created_at: asc }, limit: 20) {
            enduser_id
            enduser {
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
  const res = await queryEndUserWithFollowing(params.slug);
  return {
    props: {
      enduser: res.data["endusers"][0],
    },
  };
});

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Following);

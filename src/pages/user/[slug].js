import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  withAuthUserTokenSSR,
  AuthAction,
  withAuthUser,
} from "next-firebase-auth";
import MainHeader from "../../components/mainheader";
import { PostFeedList } from "../../components/post/post-feed";
import FeedCommentModal from "../../components/post/comment-modal";
import { getAuthUserInfo } from "../../lib/api";
import { UserProfile } from "../../components/user/user-profile";
import RegisterModal from "../../components/register-modal";
import { graphql, graphqlWithIdToken } from "../../lib/client";
import { authedPostListObj, postListObj } from "../../lib/graphql";

const createUserFollow = async (userId) => {
  const q = `mutation createEnduserFollowMutation($created_by: Int!, $enduser_id: Int!) {
  createEnduserFollow(created_by: $created_by, enduser_id: $enduser_id) { created_by enduser_id }}`;
  return await graphqlWithIdToken(q, {
    created_by: 0,
    enduser_id: userId,
  });
};

const deleteUserFollow = async (userId) => {
  const q = `mutation deleteEnduserFollowMutation($pk_columns: EnduserFollowPkColumns!) {
  deleteEnduserFollow(pk_columns: $pk_columns) { result }}`;
  return await graphqlWithIdToken(q, {
    pk_columns: { created_by: 0, enduser_id: userId },
  });
};

const postNumPerPage = 5;

const queryPostListByUserAuthed = async (
  createdBySlug,
  token = null,
  page = 1
) => {
  const vars = {
    limit: postNumPerPage,
    offset: postNumPerPage * (page - 1),
    slug: createdBySlug,
  };
  const q = `
      query postList($authuser_id: Int!, $limit: Int!, $offset: Int!, $enduser_id: Int!) {
        posts(sort: { created_at: desc }, where: {created_by: {eq: $enduser_id}},
		limit: $limit, offset: $offset) ${authedPostListObj} 
      }
    `;
  if (token) {
    return await graphql(q, vars, token);
  } else {
    return await graphqlWithIdToken(q, vars);
  }
};

const queryPostListByUser = async (createdBySlug, page = 1) => {
  const vars = {
    limit: postNumPerPage,
    offset: postNumPerPage * (page - 1),
    slug: createdBySlug,
  };
  return await graphql(
    `
      query queryPostList($limit: Int!, $offset: Int!, $enduser_id) {
        posts(sort: { created_at: desc }, where: {created_by: {eq: $enduser_id}},
		limit: $limit, offset: $offset) ${postListObj}
      }
    `,
    vars,
    null
  );
};

const UserPage = ({ enduser, authUser }) => {
  const router = useRouter();
  const [postFeeds, setPostFeeds] = useState(enduser.posts || []);
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [showRegisterModal, setRegisterModalShown] = useState(false);
  const [postId, setPostId] = useState(null);
  const [followingCount, _setFollowingCount] = useState(
    enduser.enduser_follows_on_created_by_aggregate.count || 0
  );
  const [followedCount, setFollowedCount] = useState(
    enduser.enduser_follows_on_enduser_id_aggregate.count || 0
  );
  const [isFollowing, setIsFollowing] = useState(
    authUser ? enduser.enduser_follows_on_enduser_id.length > 0 : false
  );
  const [isFollowed, _setIsFollowed] = useState(
    authUser ? enduser.enduser_follows_on_created_by.length > 0 : false
  );
  const isValidUser = authUser && authUser.is_valid;
  const isOwnPage = authUser && enduser.slug == authUser.slug;
  const followButtonClicked = async (e) => {
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      await createUserFollow(enduser.id);
      setIsFollowing(true);
      setFollowedCount(followedCount + 1);
    }
  };
  const unfollowButtonClicked = async (e) => {
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      await deleteUserFollow(enduser.id);
      setIsFollowing(false);
      setFollowedCount(followedCount - 1);
    }
  };
  const getMoreFeeds = async (page) => {
    return authUser
      ? await queryPostListByUserAuthed(enduser.slug, null, page)
      : await queryPostListByUser(enduser.slug, page);
  };

  useEffect(() => {
    setPostFeeds(enduser.posts);
  }, [enduser]);

  return (
    <>
      <MainHeader title={enduser.username} onBackClick={router.back} />
      <UserProfile
        enduser={enduser}
        isOwnPage={isOwnPage}
        isFollowing={isFollowing}
        isFollowed={isFollowed}
        followingCount={followingCount}
        followedCount={followedCount}
        followButtonClicked={followButtonClicked}
        unfollowButtonClicked={unfollowButtonClicked}
      />
      <section className="feed">
        <PostFeedList
          postFeeds={postFeeds}
          getMoreFeeds={getMoreFeeds}
          setPostFeeds={setPostFeeds}
          setPostId={setPostId}
          setCommentModalShown={setCommentModalShown}
          setRegisterModalShown={setRegisterModalShown}
        />
      </section>
      <FeedCommentModal
        show={showCommentModal}
        postId={postId}
        onClose={() => {
          setCommentModalShown(false);
        }}
        afterSubmit={(postId) => {
          router.push(`/post/${postId}`);
        }}
      />
      <RegisterModal
        show={showRegisterModal}
        onClose={() => {
          setRegisterModalShown(false);
        }}
      />
    </>
  );
};

export const queryEndUserWithPostsAuthed = async (slug, token) => {
  return await graphql(
    `
      query endUserWithPosts($slug: String!, $authuser_id: Int!) {
        endusers(where: { slug: { eq: $slug } }) {
          id
          email
          username
          slug
          profile_image_url
          bio
          enduser_follows_on_enduser_id_aggregate {
            count
          }
          enduser_follows_on_enduser_id(
            where: { created_by: { eq: $authuser_id } }
          ) {
            created_by
          }
          enduser_follows_on_created_by_aggregate {
            count
          }
          enduser_follows_on_created_by(
            where: { enduser_id: { eq: $authuser_id } }
          ) {
            enduser_id
          }
          posts(sort: { created_at: desc }) ${authedPostListObj}
        }
      }
    `,
    { slug },
    token
  );
};

const queryEndUserWithPosts = async (slug) => {
  return await graphql(
    `
      query endUserWithPosts($slug: String!) {
        endusers(where: { slug: { eq: $slug } }) {
          id
          email
          username
          slug
          profile_image_url
          bio
          enduser_follows_on_enduser_id_aggregate {
            count
          }
          enduser_follows_on_created_by_aggregate {
            count
          }
          posts(sort: { created_at: desc }) ${postListObj}
        }
      }
    `,
    { slug },
    null
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req, params }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;

  const userInfoRes = authUserInfo
    ? await queryEndUserWithPostsAuthed(params.slug, token)
    : await queryEndUserWithPosts(params.slug);
  if (
    !userInfoRes.data ||
    !userInfoRes.data["endusers"] ||
    userInfoRes.data["endusers"].length < 1
  ) {
    return { notFound: true };
  }
  const enduser = userInfoRes.data["endusers"][0];

  return {
    props: {
      enduser: enduser,
      authUser: authUserInfo || null,
    },
  };
});

export default withAuthUser()(UserPage);

import { useState } from "react";
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import { PostFeedList } from "../components/post/post-feed";
import MainHeader from "../components/mainheader";
import FeedCommentModal from "../components/post/comment-modal";
import { useRouter } from "next/router";
import { getAuthUserInfo } from "../lib/api";
import { postListObj, authedPostListObj } from "../lib/graphql";
import RegisterModal from "../components/register-modal";
import { graphql, graphqlWithIdToken } from "../lib/client";

const postNumPerPage = 5;

const queryPostListAuthed = async (token = null, page = 1) => {
  const vars = {
    limit: postNumPerPage,
    offset: postNumPerPage * (page - 1),
  };
  const q = `
      query postList($authuser_id: Int!, $limit: Int!, $offset: Int!) {
        posts(sort: { created_at: desc }, limit: $limit, offset: $offset) ${authedPostListObj} 
      }
    `;
  if (token) {
    return await graphql(q, vars, token);
  } else {
    return await graphqlWithIdToken(q, vars);
  }
};

const queryPostList = async (page = 1) => {
  return await graphql(
    `
      query queryPostList($limit: Int!, $offset: Int!) {
        posts(sort: { created_at: desc }, limit: $limit, offset: $offset) ${postListObj}
      }
    `,
    { limit: postNumPerPage, offset: postNumPerPage * (page - 1) },
    null
  );
};

const HomePage = ({ authUserInfo, feeds }) => {
  const [postFeeds, setPostFeeds] = useState(feeds);
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [showRegisterModal, setRegisterModalShown] = useState(false);
  const [postId, setPostId] = useState(null);
  const router = useRouter();
  const getMoreFeeds = async (page) => {
    return authUserInfo
      ? await queryPostListAuthed(null, page)
      : await queryPostList(page);
  };
  return (
    <>
      <MainHeader title="Home" />
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

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req }) => {
  let authUserInfo;
  const token = await AuthUser.getIdToken();
  authUserInfo = token ? await getAuthUserInfo(token) : null;
  const res = authUserInfo
    ? await queryPostListAuthed(token)
    : await queryPostList();
  return {
    props: {
      feeds: res ? res.data["posts"] : [],
      authUserInfo: authUserInfo || null,
    },
  };
});

export default withAuthUser()(HomePage);

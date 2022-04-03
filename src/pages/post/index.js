import { useState } from "react";
import Link from "next/dist/client/link";
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import { PostFeedList } from "../../components/post/post-feed";
import MainHeader from "../../components/mainheader";
import FeedCommentModal from "../../components/post/comment-modal";
import { useRouter } from "next/router";
import { getAuthUserInfo } from "../../lib/api";
import { postListObj, authedPostListObj } from "../../lib/graphql";
import RegisterModal from "../../components/register-modal";
import { graphql, graphqlWithIdToken } from "../../lib/client";

const postNumPerPage = 5;

const queryPostList = async (authed, token = null, page = 1) => {
  const vars = {
    limit: postNumPerPage,
    offset: postNumPerPage * (page - 1),
  };
  const queryArgs = "$authuser_id: Int!, $limit: Int!, $offset: Int!";
  const queryFilter =
    "sort: { created_at: desc }, limit: $limit, offset: $offset";
  const q = `
      query postList(${queryArgs}) {
        posts(${queryFilter}) ${authed ? authedPostListObj : postListObj} 
      }
    `;
  if (!authed || token) {
    return await graphql(q, vars, token);
  } else {
    return await graphqlWithIdToken(q, vars);
  }
};

const PostsPage = ({ authUserInfo, feeds, query }) => {
  const [postFeeds, setPostFeeds] = useState(feeds);
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [showRegisterModal, setRegisterModalShown] = useState(false);
  const [postId, setPostId] = useState(null);
  const router = useRouter();
  const getMoreFeeds = async (page) => {
    return await queryPostList(authUserInfo, null, page);
  };
  const headerChildElems =
    query["type"] === "new-user" ? null : (
      <Link href="/">
        <a>→ Posts by Following Users</a>
      </Link>
    );
  return (
    <>
      <MainHeader title="Posts by All Users" childElements={headerChildElems} />
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
})(async ({ AuthUser, req, query }) => {
  let authUserInfo;
  const token = await AuthUser.getIdToken();
  authUserInfo = token ? await getAuthUserInfo(token) : null;
  const res = await queryPostList(authUserInfo, token, 1);
  return {
    props: {
      feeds: res ? res.data["posts"] : [],
      authUserInfo: authUserInfo || null,
      query,
    },
  };
});

export default withAuthUser()(PostsPage);

import { useState } from "react";
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import Link from "next/dist/client/link";
import { PostFeedList } from "../components/post/post-feed";
import MainHeader from "../components/mainheader";
import FeedCommentModal from "../components/post/comment-modal";
import { useRouter } from "next/router";
import { getAuthUserInfo } from "../lib/api";
import { authedPostListObj } from "../lib/graphql";
import RegisterModal from "../components/register-modal";
import { graphql, graphqlWithIdToken } from "../lib/client";

const postNumPerPage = 5;

const queryFollowingUserIds = async (userId, token = null) => {
  const vars = { user_id: userId };
  const q = `query followingUserIds($user_id: Int!) {
	  enduser_follows(where: { created_by: { eq: $user_id }}) { enduser_id }
	}`;
  let res;
  if (token) {
    res = await graphql(q, vars, token);
  } else {
    res = await graphqlWithIdToken(q, vars);
  }
  if (res && res.data && res.data["enduser_follows"]) {
    return res.data["enduser_follows"].map((e) => e["enduser_id"]);
  } else {
    return null;
  }
};

const queryPostList = async (userIds, token = null, page = 1) => {
  const vars = {
    limit: postNumPerPage,
    offset: postNumPerPage * (page - 1),
    user_ids: userIds,
  };
  const queryArgs = `$authuser_id: Int!, $limit: Int!, $offset: Int!, $user_ids: [Int]`;
  const queryFilter = `sort: { created_at: desc }, limit: $limit, offset: $offset,
    where:{created_by:{in: $user_ids}}`;
  const q = `
      query postList(${queryArgs}) {
        posts(${queryFilter}) ${authedPostListObj} 
      }
    `;
  if (token) {
    return await graphql(q, vars, token);
  } else {
    return await graphqlWithIdToken(q, vars);
  }
};

const FollowingPostPage = ({ followingUserIds, authUserInfo, feeds }) => {
  const [postFeeds, setPostFeeds] = useState(feeds);
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [showRegisterModal, setRegisterModalShown] = useState(false);
  const [postId, setPostId] = useState(null);
  const router = useRouter();
  const getMoreFeeds = async (page) => {
    return await queryPostList(followingUserIds, null, page);
  };
  const headerChildElems = (
    <Link href="/post">
      <a>→ Posts by All Users</a>
    </Link>
  );
  return (
    <>
      <MainHeader
        title="Posts by Following Users"
        childElements={headerChildElems}
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

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req }) => {
  const redirectRes = {
    redirect: {
      destination: "/post",
      permanent: false,
    },
  };
  const token = await AuthUser.getIdToken();
  if (!token) return redirectRes;

  let authUserInfo;
  authUserInfo = await getAuthUserInfo(token);
  const followingUserIds = await queryFollowingUserIds(authUserInfo.id, token);

  if (!followingUserIds) return redirectRes;
  const res = await queryPostList(followingUserIds, token, 1);
  if (!res || !res.data["posts"]) return redirectRes;
  return {
    props: {
      followingUserIds,
      feeds: res ? res.data["posts"] : [],
      authUserInfo: authUserInfo || null,
    },
  };
});

export default withAuthUser()(FollowingPostPage);

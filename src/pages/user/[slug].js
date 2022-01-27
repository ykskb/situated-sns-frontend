import { useState } from "react";
import { useRouter } from "next/router";
import {
  withAuthUserTokenSSR,
  AuthAction,
  withAuthUser,
} from "next-firebase-auth";
import MainHeader from "../../components/mainheader";
import { PostFeedList } from "../../components/post/post-feed";
import FeedCommentModal from "../../components/post/comment-modal";
import {
  createUserFollow,
  deleteUserFollow,
  queryEndUserWithPosts,
  queryEndUserWithPostsAuthed,
} from "../../lib/graphql";
import { getAuthUserInfo } from "../../lib/api";
import { UserProfile } from "../../components/user/user-profile";

const UserPage = ({ enduser, authUser }) => {
  const router = useRouter();
  const [showCommentModal, setCommentModalShown] = useState(false);
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
  const isOwnPage = authUser && enduser.slug == authUser.slug;
  const followButtonClicked = async (e) => {
    await createUserFollow(enduser.id);
    setIsFollowing(true);
    setFollowedCount(followedCount + 1);
  };
  const unfollowButtonClicked = async (e) => {
    await deleteUserFollow(enduser.id);
    setIsFollowing(false);
    setFollowedCount(followedCount - 1);
  };
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
          data={enduser.posts || []}
          setPostId={setPostId}
          setCommentModalShown={setCommentModalShown}
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
    </>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req, params }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;

  const userInfoRes = authUserInfo
    ? await queryEndUserWithPostsAuthed(params.slug, authUserInfo.id)
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

import { useState } from "react";
import { useRouter } from "next/router";
import getConfig from "next/config";
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
} from "../../lib/graphql";
import { getAuthUserInfo } from "../../lib/api";
import Link from "next/link";

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
      <MainHeader
        title={enduser.username}
        onBackClick={(e) => {
          router.back();
        }}
      />
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

const UserProfile = ({
  enduser,
  isOwnPage,
  isFollowing,
  isFollowed,
  followingCount,
  followedCount,
  followButtonClicked,
  unfollowButtonClicked,
}) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  return (
    <article className="user-profile">
      <img
        className="profile-image"
        src={enduser.profile_image_url || defaultUserImage}
        alt={enduser.username}
      />
      <header className="user-name u-flex">
        <span className="common-title">{enduser.username}</span>
        <span className="usercode">
          @{enduser.slug ? enduser.slug : "slug"}
          {isFollowed ? (
            <span style={{ opacity: 0.6, paddingLeft: "0.5em" }}>
              Follows you
            </span>
          ) : (
            ""
          )}
        </span>
      </header>
      <div className="user-bio" style={{ paddingTop: "20px" }}>
        <p>{enduser.bio}</p>
        <br />
        <p>
          {followedCount}&nbsp;Followers&nbsp;&nbsp;&nbsp;&nbsp;
          {followingCount}&nbsp;Following
        </p>
      </div>
      <ul className="user-options u-flex u-flex-end">
        {isOwnPage ? (
          <Link href="/profile">
            <a>
              <li className="message-options-item">
                <button className="big-green-button">Edit Profile</button>
              </li>
            </a>
          </Link>
        ) : (
          <>
            <li className="message-options-item">
              <button className="big-green-button">Message</button>
            </li>
            &nbsp;
            {isFollowing ? (
              <li>
                <button
                  className="big-green-button"
                  onClick={unfollowButtonClicked}
                >
                  Following
                </button>
              </li>
            ) : (
              <li>
                <button
                  className="big-green-button"
                  onClick={followButtonClicked}
                >
                  Follow
                </button>
              </li>
            )}
          </>
        )}
      </ul>
    </article>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req, params }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;

  const userInfoRes = await queryEndUserWithPosts(
    params.slug,
    authUserInfo ? authUserInfo.id : null
  );
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

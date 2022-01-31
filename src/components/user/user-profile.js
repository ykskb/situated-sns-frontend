import Link from "next/link";
import getConfig from "next/config";

export const UserProfile = ({
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
          <Link href={"/user/" + enduser.slug + "/followers"}>
            <a>{followedCount}&nbsp;Followers</a>
          </Link>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Link href={"/user/" + enduser.slug + "/following"}>
            <a>{followingCount}&nbsp;Following</a>
          </Link>
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
            <Link href={`/message/${enduser.id}`}>
              <a>
                <li className="message-options-item">
                  <button className="big-green-button">Message</button>
                </li>
              </a>
            </Link>
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

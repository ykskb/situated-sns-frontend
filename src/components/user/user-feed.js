import Link from "next/link";
import getConfig from "next/config";

export const UserFeedList = ({ enduserFollows, enduserKey = "enduser" }) => {
  return (
    <ul className="feed-list">
      {enduserFollows.map((enduserFollow) => (
        <UserFeed
          key={"user-" + enduserFollow[enduserKey].slug}
          enduser={enduserFollow[enduserKey]}
        />
      ))}
    </ul>
  );
};

export const UserFeed = ({ enduser }) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  return (
    <li className="feed-item">
      <article className="tweet-item" style={{ padding: "10px 15px" }}>
        <Link href={`/user/${encodeURIComponent(enduser.slug)}`}>
          <a className="profile-image">
            <img
              src={enduser.profile_image_url || defaultUserImage}
              alt={enduser.username}
            />
          </a>
        </Link>
        <header className="tweet-item-info u-flex">
          <Link href={`/user/${encodeURIComponent(enduser.slug)}`}>
            <a className="tweet-item-info-user">
              <span className="common-title">{enduser.username}</span>
              <span className="usercode">
                @{enduser.slug ? enduser.slug : "slug"}
              </span>
            </a>
          </Link>
        </header>
        {enduser.bio}
      </article>
    </li>
  );
};

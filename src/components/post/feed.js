import Link from "next/link";
import getConfig from "next/config";

export const FeedHeader = ({ enduser, createdAt }) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  return (
    <>
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
        <time dateTime="">{createdAt}</time>
        <button
          className="icon-button u-flex u-margin-start-auto"
          style={{ "--icon-button-size": "27px" }}
        >
          <span className="icon icon-arrow-down u-margin-auto"></span>
        </button>
      </header>
    </>
  );
};

export const Feed = ({
  enduser,
  createdAt,
  content,
  engage,
  articleStyle = { padding: "10px 15px" },
}) => {
  return (
    <li className="feed-item">
      <article className="tweet-item" style={articleStyle}>
        <FeedHeader enduser={enduser} createdAt={createdAt} />
        {content}
        {engage}
      </article>
    </li>
  );
};

export const CommentButton = ({
  commentButtonClicked,
  commentCount,
  showCount = true,
}) => {
  return (
    <li className="message-options-item">
      <label>
        <button
          className="icon-button"
          onClick={(e) => {
            commentButtonClicked(e);
          }}
        >
          <span className="icon">💬</span>
        </button>
        {showCount ? (
          <span className="text">&nbsp;{commentCount || 0}</span>
        ) : null}
      </label>
    </li>
  );
};

export const RepostButton = ({ repostCount }) => {
  return (
    <li className="message-options-item">
      <label>
        <button className="icon-button">
          <span className="icon">🔃</span>
        </button>
        <span className="text">&nbsp;{repostCount || 0}</span>
      </label>
    </li>
  );
};

export const LikeButton = ({ liked, likeButtonClicked, likeCount }) => {
  return (
    <li className="message-options-item">
      <label>
        <button
          className="icon-button"
          onClick={(e) => {
            likeButtonClicked(e);
          }}
        >
          <span className={liked ? "icon-active" : "icon"}>❤</span>
        </button>
        <span className="text">&nbsp;{likeCount || 0}</span>
      </label>
    </li>
  );
};

export const ShareButton = () => {
  return (
    <li className="message-options-item">
      <label>
        <button className="icon-button">
          <span className="icon">📤</span>
        </button>
        <span className="text"></span>
      </label>
    </li>
  );
};

import getConfig from "next/config";
import Link from "next/link";

export const ChatFeedList = ({ authUserId, chats }) => {
  return (
    <ul className="feed-list">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <ChatFeed
            key={"chat-" + chat.id}
            authUserId={authUserId}
            chat={chat}
          />
        ))
      ) : (
        <li>
          <span>There is no message yet.</span>
        </li>
      )}
    </ul>
  );
};

export const ChatFeed = ({ authUserId, chat }) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  const chatUser =
    authUserId === chat.created_by ? chat.enduser : chat.created_by_enduser;
  return (
    <li className="feed-item">
      <Link href={`/message/${chatUser.id}`}>
        <a>
          <article className="tweet-item" style={{ padding: "10px 15px" }}>
            <div className="profile-image">
              <img
                src={chatUser.profile_image_url || defaultUserImage}
                alt={chatUser.slug}
              />
            </div>
            <div className="tweet-item-info-user">
              <span className="common-title">{chatUser.username}</span>
              <span className="usercode">
                @{chatUser.slug ? chatUser.slug : "slug"}
              </span>
            </div>
            {chat.enduser_messages.length > 0
              ? chat.enduser_messages[0].message
              : "No message yet"}
          </article>
        </a>
      </Link>
    </li>
  );
};

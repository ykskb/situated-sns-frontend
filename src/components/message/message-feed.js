import getConfig from "next/config";
import { createEndUserMessage } from "../../lib/graphql";

export const MessageFeedList = ({ messages, authUser, chatUser }) => {
  messages.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
  return (
    <ul className="feed-list">
      {messages.length > 0 ? (
        messages.map((msg) => (
          <MessageFeed
            key={"message-" + msg.id}
            message={msg}
            authUser={authUser}
            chatUser={chatUser}
          />
        ))
      ) : (
        <li>
          <span>There is no message sent yet.</span>
        </li>
      )}
    </ul>
  );
};

export const MessageFeed = ({ message, authUser, chatUser }) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  const isMyMessage = authUser.id === message.created_by;
  const msgImageSrc = isMyMessage
    ? authUser.profile_image_url
    : chatUser.profile_image_url;
  const articleStyle = isMyMessage
    ? { padding: "10px 15px", justifyContent: "right" }
    : { padding: "10px 15px" };
  return (
    <li>
      <article className="tweet-item" style={articleStyle}>
        <div className="profile-image">
          <img src={msgImageSrc || defaultUserImage} alt="chat-user" />
        </div>
        <span style={{ fontSize: "small", color: "gray" }}>
          {message.created_at}
        </span>
        {message.message}
      </article>
    </li>
  );
};

export const MessageForm = ({ authUserId, chatId, messages, setMessages }) => {
  const sendClicked = async (e) => {
    e.preventDefault();
    const msg = e.target.message.value;
    const res = await createEndUserMessage(chatId, msg);
    messages.push({
      id: res.id,
      message: msg,
      created_by: authUserId,
      created_at: new Date().toLocaleString(),
    });
    setMessages(messages);
    e.target.message.value = "";
  };
  return (
    <form className="message-form" onSubmit={sendClicked}>
      <input id="message" name="message" type="text" autoComplete="" required />
      <button className="big-green-button" type="submit">
        Send
      </button>
    </form>
  );
};

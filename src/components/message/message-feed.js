import getConfig from "next/config";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { graphqlWithIdToken } from "../../lib/client";

const messageNumPerPage = 10;

const queryMoreMessages = async (chatId, page) => {
  return await graphqlWithIdToken(
    `
    query queryMessages($chat_id: Int!, $limit: Int!, $offset: Int!) {
      enduser_messages (sort: {created_at: desc}, where:{chat_id: {eq: $chat_id}}, limit: $limit, offset: $offset) {
        message
        created_by
        created_at
      }}`,
    {
      chat_id: chatId,
      limit: messageNumPerPage,
      offset: messageNumPerPage * (page - 1),
    }
  );
};

export const MessageFeedList = ({
  chatId,
  messages,
  setMessages,
  authUser,
  chatUser,
}) => {
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(messages.length === messageNumPerPage);
  // messages.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
  const getNextPage = async () => {
    if (hasMore && page > 1) {
      const moreFeeds = await queryMoreMessages(chatId, page);
      if (!moreFeeds || !moreFeeds.data || !moreFeeds.data.enduser_messages)
        return;
      setMessages((prev) => {
        return [...prev, ...moreFeeds.data.enduser_messages];
      });
      setPage((prev) => prev + 1);
      if (moreFeeds.data.enduser_messages.length < messageNumPerPage)
        setHasMore(false);
    }
  };
  return (
    <ul className="feed-list">
      <div
        id="msg-container"
        style={{
          height: 500,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={getNextPage}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          inverse={true}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          scrollableTarget="msg-container"
        >
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <MessageFeed
                key={i}
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
        </InfiniteScroll>
      </div>
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

const createEndUserMessage = async (chatId, msg) => {
  return await graphqlWithIdToken(
    `mutation createEnduserMessageMutation($chat_id: Int!, $message: String!) {
  createEnduserMessage(chat_id: $chat_id, message: $message, enduser_id: 0, created_by: 0) { chat_id created_at created_by }}`,
    { chat_id: chatId, message: msg }
  );
};

export const MessageForm = ({ authUserId, chatId, setMessages }) => {
  const sendClicked = async (e) => {
    e.preventDefault();
    const msg = e.target.message.value;
    await createEndUserMessage(chatId, msg);
    setMessages((prev) => {
      return [
        {
          message: msg,
          created_by: authUserId,
          created_at: new Date(
            new Date().toString().split("GMT")[0] + " UTC"
          ).toISOString(),
        },
        ...prev,
      ];
    });
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

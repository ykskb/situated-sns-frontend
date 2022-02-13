import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { useRouter } from "next/router";
import MainHeader from "../../components/mainheader";
import { getAuthUserInfo } from "../../lib/api";
import {
  MessageFeedList,
  MessageForm,
} from "../../components/message/message-feed";
import { useState } from "react";
import { graphql } from "../../lib/client";

const ChatMessages = ({ authUser, chat }) => {
  const router = useRouter();
  const [messages, setMessages] = useState(chat.enduser_messages || []);
  const chatUser =
    authUser.id === chat.created_by ? chat.enduser : chat.created_by_enduser;
  return (
    <>
      <MainHeader title={chatUser.slug} onBackClick={router.back} />
      <section className="feed">
        <MessageFeedList
          messages={messages}
          authUser={authUser}
          chatUser={chatUser}
        />
      </section>
      <MessageForm
        authUserId={authUser.id}
        chatId={chat.id}
        messages={messages}
        setMessages={setMessages}
      />
    </>
  );
};

const createUserChat = async (userId, token) => {
  const q = `mutation createEnduserChatMutation($created_by: Int!, $enduser_id: Int!) {
  createEnduserChat(created_by: $created_by, enduser_id: $enduser_id) { id }}`;
  return await graphql(
    q,
    {
      created_by: 0,
      enduser_id: userId,
    },
    token
  );
};

const queryChatWithMessages = async (chatUserId, idToken) => {
  return await graphql(
    `
      query queryEnduserChats($enduser_id: Int!) {
        enduser_chats(
          where: {
            or: [
              { enduser_id: { eq: $enduser_id } }
              { created_by: { eq: $enduser_id } }
            ]
          }
        ) {
          id
          created_by
          enduser {
            slug
            profile_image_url
          }
          created_by_enduser {
            slug
            profile_image_url
          }
          enduser_messages(sort: { created_at: desc }) {
            message
            created_by
            created_at
          }
        }
      }
    `,
    { enduser_id: chatUserId },
    idToken
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  whenAuthed: AuthAction.RENDER,
})(async ({ AuthUser, params, req }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;
  const userId = parseInt(params.slug); // TODO: change with slug
  const chatResponse = await queryChatWithMessages(userId, token);
  let chat = chatResponse.data["enduser_chats"]
    ? chatResponse.data["enduser_chats"][0]
    : null;
  if (!chat) {
    await createUserChat(userId, token);
    const chatResponse = await queryChatWithMessages(userId, token);
    chat = chatResponse.data["enduser_chats"]
      ? chatResponse.data["enduser_chats"][0]
      : null;
  }
  return {
    props: {
      chat: chat,
      authUser: authUserInfo,
    },
  };
});

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(ChatMessages);

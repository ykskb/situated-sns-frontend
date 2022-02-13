import Select from "react-select";
import { getAuthUserInfo, postPostImage } from "../../lib/api";
import Router, { useRouter } from "next/router";
import MainHeader from "../../components/mainheader";
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import { graphql, graphqlWithIdToken } from "../../lib/client";

const PostCreatePage = ({ postTypes }) => {
  const router = useRouter();
  const submitPost = async (event) => {
    event.preventDefault();
    var imageId = null;
    if (event.target.image.files.length > 0) {
      // Submit image
      const imageRes = await postPostImage(event.target.image.files[0]);
      imageId = imageRes.id;
    }
    // Submit post
    await createPost(
      imageId,
      parseInt(event.target.type.value),
      event.target.title.value,
      event.target.content.value
    );
    Router.push("/");
  };
  const typeOptions = postTypes
    ? postTypes.map((v) => ({ value: v.id, label: v.name }))
    : [];
  return (
    <>
      <MainHeader
        title="Create a Post"
        onBackClick={(e) => {
          router.back();
        }}
      />
      <form className="create-form" onSubmit={submitPost}>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" autoComplete="" required />
        <label htmlFor="type">Type</label>
        <Select options={typeOptions} name="type" className="select-input" />
        <label htmlFor="image">Image</label>
        <br />
        <input type="file" id="image" name="image" />
        <br />
        <label htmlFor="content">Content</label>
        <input id="content" name="content" type="textarea" rows="10" required />
        <button className="big-green-button" type="submit">
          Post
        </button>
      </form>
    </>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.RENDER,
})(async ({ AuthUser, req }) => {
  const token = await AuthUser.getIdToken();
  const userInfo = token ? await getAuthUserInfo(token) : null;
  if (!userInfo || !userInfo.is_valid) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }
  const res = await queryPostTypes();
  return {
    props: {
      postTypes: res.data["post_types"],
    },
  };
});

const queryPostTypes = async () => {
  return await graphql(
    `
      query {
        post_types {
          id
          name
        }
      }
    `,
    {},
    null
  );
};

const createPost = async (postImageId, postTypeId, title, content) => {
  const q = `mutation createPostMutation($postTypeId: Int!, $title: String!, $content: String!, $postImageId: Int) {
			createPost(post_type_id: $postTypeId, title: $title, content: $content, post_image_id: $postImageId) { id } }`;
  return await graphqlWithIdToken(q, {
    postTypeId,
    title,
    content,
    postImageId,
  });
};

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(PostCreatePage);

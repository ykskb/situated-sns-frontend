import { withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import Router, { useRouter } from "next/router";
import { getAuthUserInfo, postProfileImage } from "../lib/api";
import MainHeader from "../components/mainheader";
import { updateEndUser } from "../lib/graphql";
import { useContext, useState } from "react";
import { Context } from "../lib/context";

function Profile({ authUserInfo }) {
  const router = useRouter();
  const [context, setContext] = useContext(Context);
  // Input handling
  const [slug, setSlug] = useState(authUserInfo.slug);
  const [username, setUsername] = useState(authUserInfo.username);
  const [bio, setBio] = useState(authUserInfo.bio);
  const updateButtonClicked = async (event) => {
    event.preventDefault();
    // Submit image
    if (event.target.image.files && event.target.image.files.length > 0) {
      const imageFile = event.target.image.files[0];
      await postProfileImage(imageFile);
    }
    // Submit post
    await updateEndUser(slug, username, bio);
    // If is_valid becomes valid, update context
    const authUserInfo = context && context.authUserInfo;
    if (authUserInfo && !authUserInfo.is_valid) {
      authUserInfo.is_valid = true;
      setContext({ authUserInfo: authUserInfo });
    }
    Router.push(`/user/${event.target.slug.value}`);
  };
  return (
    <>
      <MainHeader
        title="Profile"
        onBackClick={(e) => {
          router.back();
        }}
      />
      <form className="create-form" onSubmit={updateButtonClicked}>
        <p>Email: {authUserInfo.email}</p>
        <label htmlFor="title">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete=""
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={authUserInfo.is_valid ? "disabled" : ""}
          required
        />
        <label htmlFor="image">Profile Image</label>
        <br />
        <img
          src={authUserInfo.profile_image_url}
          style={{ maxWidth: "240px" }}
        />
        <input type="file" id="image" name="image" />
        <br />
        <label htmlFor="bio">Bio</label>
        <input
          id="bio"
          name="content"
          type="textarea"
          rows="10"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
        <button className="big-green-button" type="submit">
          Update
        </button>
      </form>
    </>
  );
}

export const getServerSideProps = withAuthUserTokenSSR()(
  async ({ AuthUser, req }) => {
    const token = await AuthUser.getIdToken();
    if (!token) {
      return {
        redirect: {
          destination: "/auth",
          permanent: false,
        },
      };
    }
    const authUserInfo = await getAuthUserInfo(token);
    return { props: { authUserInfo } };
  }
);

export default withAuthUser()(Profile);

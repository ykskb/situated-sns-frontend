export const authedPostListObj = `
{
  id
  title
  content
  created_at
  comment_count
  like_count
  repost_count
  post_type {
    id
    name
  }
  post_image {
    id
    name
    url
  }
  created_by_enduser {
    id
    username
    slug
    profile_image_url
  }
  post_likes(where: { created_by: { eq: $authuser_id } }) {
    created_by_enduser {
      id
    }
  }
}`;

export const postListObj = `
{
  id
  title
  content
  created_at
  comment_count
  like_count
  repost_count
  post_type {
    id
    name
  }
  post_image {
    id
    name
    url
  }
  created_by_enduser {
    id
    username
    slug
    profile_image_url
  }
}`;

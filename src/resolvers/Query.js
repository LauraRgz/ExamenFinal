import { ObjectID } from "mongodb";
const Query = {
  getPosts: async (parent, args, ctx, info) => {
    const { client } = ctx;

    const db = client.db("blog");
    const collection = db.collection("posts");

    const result = await collection.find({}).toArray();
    return result;
  },

  getPost: async (parent, args, ctx, info) => {
    const { postID } = args;
    const { client } = ctx;

    const db = client.db("blog");
    const collection = db.collection("posts");

    const result = await collection.findOne({ _id: ObjectID(postID) });
    return result;
  },

  getPostsByAuthor: async (parent, args, ctx, info) => {
    const { authorID } = args;
    const { client } = ctx;

    const db = client.db("blog");
    const collectionPosts = db.collection("posts");

    const result = await collectionPosts
      .find({ author: ObjectID(authorID) })
      .toArray();
    return result;
  }
};
export { Query as default };

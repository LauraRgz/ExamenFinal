import { ObjectID } from "mongodb";
const Post = {
  author: async (parent, args, ctx, info) => {
    const authorID = ObjectID(parent.author);
    const { client } = ctx;

    const db = client.db("blog");
    const collectionAuthors = db.collection("authors");

    const result = await collectionAuthors.findOne({ _id: authorID });
    return result;
  }
};
export { Post as default };

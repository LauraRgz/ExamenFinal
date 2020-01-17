import { ObjectID } from "mongodb";
const User = {
  posts: async (parent, args, ctx, info) => {
    const authorID = ObjectID(parent._id);
    const { client } = ctx;

    const db = client.db("blog");
    const collectionPosts = db.collection("posts");

    const result = await collectionPosts.find({ author: authorID }).toArray();
    return result;
  },
  authorType:  async (parent, args, ctx, info) => {
    const type = parent.authorType;
    if(type === 0){
      return "Author";
    }

    if (type === 1){
      return "Reader";
    }
  }
};
export { User as default };

import {ObjectID } from "mongodb";
const User = {
    posts: async (parent, args, ctx, info) => {
        const authorID = ObjectID(parent._id);
        const { client } = ctx;
        
        const db = client.db("blog");
        const collectionPosts = db.collection("posts");

        const result = await collectionPosts.find({ author: authorID }).toArray();
        return result;
    }
};export { User as default };
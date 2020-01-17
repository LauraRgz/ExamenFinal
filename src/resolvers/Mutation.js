import { ObjectID } from "mongodb";
import * as uuid from "uuid";
const Mutation = {
  addUser: async (parent, args, ctx, info) => {
    const { mail, password, authorType } = args;
    const { client } = ctx;

    const db = client.db("blog");
    const collection = db.collection("authors");

    const notOk = await collection.findOne({ mail });
    if (!notOk) {
      const token = null;
      const result = await collection.insertOne({
        mail,
        password,
        authorType,
        token
      });
      return result.ops[0];
    } else {
      return new Error("Mail already in use");
    }
  },
  login: async (parent, args, ctx, info) => {
    const { mail, password } = args;
    const { client } = ctx;

    const db = client.db("blog");
    const collection = db.collection("authors");

    const ok = await collection.findOne({ mail, password });

    if (ok) {
      const token = uuid.v4();
      await collection.updateOne(
        { mail: mail },
        { $set: { token: token } },
        { returnOriginal: false }
      );

      setTimeout(() => {
        collection.updateOne({ _id: ok._id }, { $set: { token: null } });
      }, 1800000);

      return token;
    } else {
      return new Error("Error: Mail not found");
    }
  },
  logout: async (parent, args, ctx, info) => {
    const { authorID, token } = args;
    const { client } = ctx;

    const db = client.db("blog");
    const collection = db.collection("authors");

    const ok = await collection.findOne({ _id: ObjectID(authorID), token });

    if (ok) {
      const token = null;
      await collection.updateOne(
        { _id: ObjectID(authorID) },
        { $set: { token: token } },
        { returnOriginal: false }
      );
      return ok;
    } else {
      return new Error("Error: User not found");
    }
  },

  removeUser: async (parent, args, ctx, info) => {
    const { authorID, token } = args;
    const { client } = ctx;
    const db = client.db("blog");
    const collectionAuthors = db.collection("authors");
    const collectionPosts = db.collection("posts");

    const usr = await collectionAuthors.findOne({
      _id: ObjectID(authorID),
      token
    });
    if (usr) {
      if (usr.authorType === 0) {
        const deletePosts = () => {
          return new Promise((resolve, reject) => {
            const result = collectionPosts.deleteMany({
              author: ObjectID(usr._id)
            });
            resolve(result);
          });
        };
        const deleteAuthor = () => {
          return new Promise((resolve, reject) => {
            const result = collectionAuthors.deleteOne({
              _id: ObjectID(authorID)
            });
            resolve(result);
          });
        };
        (async function() {
          const asyncFunctions = [deletePosts(), deleteAuthor()];
          const result = await Promise.all(asyncFunctions);
        })();
        return usr;
      } else {
        const result = await collectionAuthors.findOneAndDelete(
          { _id: ObjectID(authorID) },
          { returnOriginal: false }
        );
        return result.value;
      }
    } else {
      return new Error("Couldn't remove user");
    }
  },

  addPost: async (parent, args, ctx, info) => {
    const { authorID, token, title, description } = args;
    const { client, pubsub } = ctx;

    const db = client.db("blog");
    const collectionAuthors = db.collection("authors");
    const collectionPosts = db.collection("posts");

    const ok = await collectionAuthors.findOne({
      _id: ObjectID(authorID),
      token
    });

    if (ok && ok.authorType === 0) {
      const result = await collectionPosts.insertOne({
        title,
        description,
        author: ObjectID(authorID)
      });

      pubsub.publish(authorID, {
        newPostFromAuthor: result.ops[0]
      });

      return result.ops[0];
    } else {
      return new Error("Could not add post");
    }
  },

  deletePost: async (parent, args, ctx, info) => {
    const { authorID, token, postID } = args;
    const { client } = ctx;

    const db = client.db("blog");
    const collectionAuthors = db.collection("authors");
    const collectionPosts = db.collection("posts");

    const ok = await collectionAuthors.findOne({
      _id: ObjectID(authorID),
      token
    });
    if (ok && ok.authorType === 0) {
      const result = await collectionPosts.findOneAndDelete(
        { _id: ObjectID(postID) },
        { returnOriginal: false }
      );
      return result.value;
    } else {
      return new Error("Could not remove post");
    }
  }
};
export { Mutation as default };

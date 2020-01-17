const Subscription = {
    newPostFromAuthor: {
      subscribe(parent, args, ctx, info) {
          const {id} = args;
          const {pubsub} = ctx;
          return pubsub.asyncIterator(id);
        }
    }
  };
  export { Subscription as default };
  
import { reactPostArgs } from "./post.args.js";
import postResolvers from "./post.resolvers.js";
import { reactPostType } from "./post.type.js";

class PostSchema{
    
postMutation(){
    return{
        reactPost:{
            type: reactPostType,
            args:reactPostArgs,
            resolve:postResolvers.reactPost,
        }
    }
}

}
export default new PostSchema()
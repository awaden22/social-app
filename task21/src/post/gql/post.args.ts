import { GraphQLEnumType, GraphQLNonNull, GraphQLString } from "graphql";

export const reactPostArgs={
    postId:{type:new GraphQLNonNull(GraphQLString)},
    react:{type:new GraphQLNonNull(new GraphQLEnumType({
        name:"reactEnums",
        values:{like:{value:1},unlike:{value:0}}
    }),
)}
    

}
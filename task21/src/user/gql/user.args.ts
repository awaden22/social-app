import { GraphQLNonNull, GraphQLString } from "graphql"

export const getProfileArgs={
     userId: { type: new GraphQLNonNull(GraphQLString) }
}
import { GraphQLNonNull, GraphQLString } from 'graphql';
import userRepo from "../../DB/Repo/user.repo.js";
import userResolvers from "./user.resolvers.js";
import { userProfileType } from "./user.type.js";
import { getProfileArgs } from './user.args.js';

class UserSchema {
    userQueries() {
        return {
            getUserPeofile: {
                type: userProfileType,
                args: getProfileArgs,
                resolve: userResolvers.userProfile,
                description: "this for testing"

            }
        }
    }
}
export default new UserSchema();
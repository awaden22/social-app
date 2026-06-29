import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GenderEnum, ProivderEnum, RoleEnum } from "../../common/enums/user.enums.js";

export const userProfileType = new GraphQLObjectType({
    name: "UserType",
    fields: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        userName: { type:  GraphQLString,
            resolve:(parent)=>{
             return parent.gender==GenderEnum.Male
             ?"Mr."+parent.userName
             :"Ms."+parent.userName
            }
         },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        confirmPassword: { type: GraphQLString },
        confirmEmail: { type: GraphQLBoolean },
        age: { type: GraphQLInt },
        gender: {
            type: new GraphQLEnumType({
                name: "genderEnums",
                values: {
                    Male: {
                        value: GenderEnum.Male
                    },
                    Female: {
                        value: GenderEnum.Female
                    }
                }
            })
        },
        profilePics: { type: new GraphQLList(GraphQLString) },
        coverPics: { type: new GraphQLList(GraphQLString) },
        Provider: {
            type: new GraphQLEnumType({
                name: "provideEnums",
                values: {
                    Google: {
                        value: ProivderEnum.Google
                    },
                    System: {
                        value: ProivderEnum.System
                    }
                }
            })
        },
        phone: { type: GraphQLString },
        role: {
            type: new GraphQLEnumType({
                name: "roleEnums",
                values: {
                    Admin: {
                        value: RoleEnum.Admin
                    },
                    User: {
                        value: RoleEnum.User
                    }
                }
            })
        },
        friends: { type: new GraphQLList(GraphQLString) },
        changeCreditTime: { type: GraphQLString },

    }
})
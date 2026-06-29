import { Schema, type HydratedDocument, Types, model } from "mongoose";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";
import { ReactionEnums } from "../../common/enums/reactions.enums.js";
import { StoryPrivacyEnum } from "../../common/enums/story.enums.js";



export interface IStory {
    content?: string;
    attachment?: string[];

    privacy: StoryPrivacyEnum;
    tags?: Types.ObjectId[];
    createBy: Types.ObjectId;
    deletedAt?: Date;
    expiresAt?: Date;
}

export type HStory = HydratedDocument<IStory>;


const storySchema = new Schema<IStory>(
    {
        content: {
            type: String,
            required: function (): boolean {
                return !this.attachment?.length;
            },
        },

        attachment: {
            type: [String],
            default: [],
        },

        privacy: {
            type: Number,
            enum: StoryPrivacyEnum,
            default: StoryPrivacyEnum.PUBLIC,
        },

        tags: [
            {
                type: Types.ObjectId,
                ref: "User",
            },
        ],
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
            index: {
                expires: 0,
            },
        },

        deletedAt: {
            type: Date,
            default: null,
        },

        createBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    }
);

storySchema.pre(["find", "findOne"], function () {
    const query = this.getQuery();

    if (!query.withDeleted) {
        this.setQuery({
            ...query,
            deletedAt: null,
        });
    }
});


const storyModel = model<IStory>("Story", storySchema);

export default storyModel;
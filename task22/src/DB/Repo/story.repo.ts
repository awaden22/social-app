
import storyModel, { type IStory } from "../Models/story.model.js";
import DBRepo from "./db.repo.js";


class StoryRepo extends DBRepo<IStory> {
  constructor() {
    super(storyModel);
  }
 
}

export default new StoryRepo();

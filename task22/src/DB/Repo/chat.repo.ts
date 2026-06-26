import chatModel, { type IChat } from "../Models/chat.model.js";
import DBRepo from "./db.repo.js";


class ChatRepo extends DBRepo<IChat> {
  constructor() {
    super(chatModel);
  }
 
}

export default new ChatRepo();

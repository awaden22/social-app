import { badRequestException } from "../../Common/Response/response.js";
import * as DBRepo from "../../DB/db.respository.js";
import { MessageModel } from "../../DB/Models/Message.model.js";
import UserModel from "../../DB/Models/User.model.js";

export async function sendMessage(receiverId, content, attachment, senderId) {
  const receiver = await DBRepo.findById(UserModel, receiverId);
  if (!receiver) {
    return badRequestException("Receiver not found");
  }
  await DBRepo.create(MessageModel, {
    content,
    attachment,
    senderId,
    receiverId,
  });
}
export async function getMessageById(userData, messageId) {
  const messages = await DBRepo.findOne(
    // Changed to findOne
    MessageModel,
    {
      receiverId: userData._id,
      _id: messageId,
    },
    "-senderId", // Select string
  );
  if (!messages) {
    return badRequestException("no messages found");
  }
  return messages;
}
export async function getAllMessage(userData) {
  const messages = await DBRepo.find(
    MessageModel,
    {
      receiverId: userData._id,
      senderId: userData._id,
    },
    "-senderId",
  );
  if (messages.length === 0) {
    return badRequestException("no messages found");
  }
  return messages;
}

export async function deleteMessage (userData ,messageId) {
  const message = await DBRepo.deleteOne(MessageModel,{
    receiverId:userData._id,
    _id:messageId
  })
  if(message.deletedCount === 0){
    return badRequestException("no messsage found to delete")
  }
  return;
  
  
}
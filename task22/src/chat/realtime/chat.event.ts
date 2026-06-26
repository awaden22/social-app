
import type { Server } from 'socket.io';
import redisServices from '../../DB/Models/Redis/redis.services.js';
import { validationChat } from '../../Middlewares/validation.middleware.js';
import chatService from '../chat.service.js';
import { testSchema } from '../chat.validation.js';
import type { SocketAuthType } from './../../common/interface/express.interface.js';




class ChatEvents {
    private _chatService = chatService
    private _redisService = redisServices
    getChatEvent(socket: SocketAuthType) {
        return socket.on("getchat", async (args) => {
            console.log(args)
            validationChat(testSchema, args)
        })

    }
    sendMessageEvent(socket: SocketAuthType, io: Server) {
        return socket.on("sendMessage", async (args) => {
            console.log(args)

            await this._chatService.sendMessage(args, socket.data.user)
            const socketIdsAnotherUser = await this._redisService.getMemberSocketIoIds(args.sendTo)


            const socketIds = await this._redisService.getMemberSocketIoIds(socket.data.user._id)
            io.to(socketIds).emit("successMessage", args)
            io.to(socketIdsAnotherUser).emit("newMessage",{
                content:args.content,
                from:socket.data.user
            })
        })

    }
      sendGroupMessageEvent(socket: SocketAuthType, io: Server) {
        return socket.on("sendGroupMessage", async (args) => {
            console.log(args)

           const roomId= await this._chatService.sendGroupMessage(args, socket.data.user)

            const socketIds = await this._redisService.getMemberSocketIoIds(socket.data.user._id)
            io.to(socketIds).emit("successMessage", {
                content:args.content,
                sendTo:args.groupId
                
            })
            io.to(roomId).emit("newMessage",{
                content :args.content,
                from :socket.data.user,
                groupId:args.groupId


            })
        })


    }

    joinRoom(socket: SocketAuthType, io: Server) {
        return socket.on("join_room", async (args) => {
         socket.join(args.roomId)
        }
        )}

}

export const ChatEvent = new ChatEvents()
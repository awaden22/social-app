import type { Server } from "socket.io"
import type { SocketAuthType } from "../../common/interface/express.interface.js"
import { ChatEvent } from "./chat.event.js"

class ChatGateway {
  private _chatEvent = ChatEvent
  registerEvents(socket: SocketAuthType, io: Server) {
    this._chatEvent.getChatEvent(socket)
    this._chatEvent.sendMessageEvent(socket, io)
    this._chatEvent.sendGroupMessageEvent(socket, io)
    this._chatEvent.joinRoom(socket, io)

  }
}
export default new ChatGateway()
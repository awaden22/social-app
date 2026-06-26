import { Server, Socket, type ExtendedError } from "socket.io";
import { Server as httpServer } from "http"
import token from "../common/security/token.js";
import type { SocketAuthType } from "../common/interface/express.interface.js";
import { ChatEvent } from "../chat/realtime/chat.event.js"
import chatGateway from "../chat/realtime/chat.gateway.js";
import redisServices from "../DB/Models/Redis/redis.services.js";

class RealtimeGateway {
    private _tokenService = token
    private _chatGateway = chatGateway
    private _redisService= redisServices

    authentication = async (socket: Socket, next: (err?: ExtendedError) => void) => {
        try {
            const { user, verifytoken } = await this._tokenService.checkToken(
                socket.handshake.auth.authorization

            )
            socket.data = { user, verifytoken }

            await this._redisService.addSocketIoIDToSet(user._id,socket.id)
            next()
        }
        catch (error) {
            next(error as ExtendedError)
        }
    }

    initializeIo(server: httpServer) {
        const io = new Server(server, { cors: { origin: "*" } })
        io.use(this.authentication)
        io.on("connection", async (socket: SocketAuthType) => {
            this._chatGateway.registerEvents(socket,io)
            

            socket.on("disconnect",async()=>{
                await this._redisService.removeSocketIoIDToSet(socket.data.user._id,socket.id)
                   
            })

        })
    }

}

export default new RealtimeGateway()
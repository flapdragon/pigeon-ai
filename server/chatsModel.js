import mongoose from "mongoose"
import chatsSchema from "./chatsSchema.js"

// Create chat instance/model
export const chats = mongoose.model("chats_log", chatsSchema)

// I am here to make loggings on your iMAGE very nice
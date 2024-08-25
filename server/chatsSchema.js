import mongoose from "mongoose"

const Schema = mongoose.Schema

const chatsSchema = new Schema({
  ip: String, // Student IP address
  model: String,
  role: String,
  content: String,
  max_tokens: Number,
  temperature: Number,
  seed: Number,
  out: String,
  filename: String
})

export default chatsSchema
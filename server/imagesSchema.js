import mongoose from "mongoose"

const Schema = mongoose.Schema

const ImagesSchema = new Schema({
  ip: String, // Student IP address
  model: String,
  inputs: String,
  negative_prompt: String,
  guidance_scale: Number,
  filename: String
})

export default ImagesSchema
import mongoose from "mongoose"
import imagesSchema from "./imagesSchema.js"

// Create image instance/model
export const images = mongoose.model("images_log", imagesSchema)
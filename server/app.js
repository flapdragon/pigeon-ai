import "dotenv/config"
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import textToImage from "./textToImage.js"
import chatCompletion from "./chatCompletion.js"

// TODO: Make Express wait on connection to MongoDB

// Express
const app = express()
const port = 3030
// Use CORS
app.use(cors())
// Disable X-Powered-By: Express for security reasons
app.disable('x-powered-by')

// MongoDB
const mongoURL = "mongodb://127.0.0.1:27017/pigeon_ai"
const mainDB = async () => {
  await mongoose.connect(mongoURL)
  console.log(`Connected to ${mongoURL}`)
}
mainDB().catch((err) => console.log(err))

// Image routes
app.use("/image", textToImage)
// Chat routes
app.use("/chat", chatCompletion)

app.listen(port, () => {
  console.log(`Image maker app listening on port ${port}`)
})

// How to invoke text to image
// http://192.168.0.33:3030/a%20mountain%20landscape%20with%20a%20snow%20covered%20mountain%20in%20the%20distance%20a%20sunrice%20behind%20it/3d,%20cartoon,%20anime,%20(deformed%20eyes,%20nose,%20ears,%20nose),%20bad%20anatomy,%20ugly,%20blurry/8.5
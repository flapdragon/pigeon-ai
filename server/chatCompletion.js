// Non-streaming API
import express from "express"
import { writeFile } from "fs/promises"
import { join, resolve } from "path"
import { HfInference } from "@huggingface/inference"

// TODO: Log input and output to files

// Get Hugging Face token
const HF_TOKEN = process.env.HF_TOKEN || ""

const hf = new HfInference(HF_TOKEN)

const chatCompletion = express.Router()

chatCompletion.get("/:content", async (req, res) => {
  // Get params
  const { content } = req.params
  const clientIPArray = req.ip.split(":")
  const clientIP = clientIPArray[clientIPArray.length-1]
  console.log(clientIP, content)

  // Response header
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  })

  // Huggingface chatCompletion Streaming API
  let out = "";
  for await (const chunk of hf.chatCompletionStream({
    // model: "microsoft/Phi-3-mini-4k-instruct",
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [
      { role: "user", content: content },
    ],
    max_tokens: 750,
    temperature: 0.1,
    seed: 0,
  })) {
    if (chunk.choices && chunk.choices.length > 0) {
      out += chunk.choices[0].delta.content
      res.write(chunk.choices[0].delta.content)
    }
  }
  // New file name
  const fileName = `hf_${clientIP}_${Date.now().toString()}.txt`
  // Path, save to images folder
  const filePath = resolve(join(`${process.cwd()}/chats`, fileName))
  // Save file
  await writeFile(filePath, out)
  res.end()
})

// Non streaming API
chatCompletion.get("/non-streaming/:content", async (req, res) => {
  const { content } = req.params
  console.log(content)
  const out = await hf.chatCompletion({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [{ role: "user", content: content }],
    max_tokens: 500,
    temperature: 0.1,
    seed: 0
  })
  res.status(200).json(out)
})

export default chatCompletion


// NOTES
// https://huggingface.co/docs/huggingface.js/inference/README#text-generation-chat-completion-api-compatible
// http://localhost:3030/chat/How%20many%20legs%20does%20a%20dog%20have%3F
// http://localhost:3030/chat/How many legs does a dog have%3F

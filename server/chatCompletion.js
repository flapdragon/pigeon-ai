import express from "express"
import { writeFile } from "fs/promises"
import { join, resolve } from "path"
import { HfInference } from "@huggingface/inference"
import { chats } from "./chatsModel.js"

// TODO: Log input and output to files

// Get Hugging Face token
const HF_TOKEN = process.env.HF_TOKEN || ""

const inference = new HfInference(HF_TOKEN)

const chatCompletion = express.Router()

chatCompletion.get("/:content", async (req, res) => {
  // Get user ip
  const clientIPArray = req.ip.split(":")
  const ip = clientIPArray[clientIPArray.length-1]
  // Get params
  const { content } = req.params
  // Log user ip and request
  console.log(ip, `${content.substring(0, 10)}...`)

  // Hard code model until UI is built, v0.3
  const model = "mistralai/Mistral-7B-Instruct-v0.3"
  // Hard code role, max_tokens, etc.
  const role = "user"
  const maxTokens = 500
  const temperature = 0.1
  const seed = 0

  // Response header
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  })

  // Huggingface chatCompletion Streaming API
  let out = `${ip}\n${decodeURI(content)}\n`
  for await (const chunk of inference.chatCompletionStream({
    // model: "microsoft/Phi-3-mini-4k-instruct",
    model: model,
    messages: [
      { role: role, content: content },
    ],
    max_tokens: maxTokens,
    temperature: temperature,
    seed: seed,
  })) {
    if (chunk.choices && chunk.choices.length > 0) {
      out += chunk.choices[0].delta.content
      res.write(chunk.choices[0].delta.content)
    }
  }

  // New file name
  const filename = `hf_${ip}_${Date.now().toString()}.txt`
  // Path, save to chats folder
  const filePath = resolve(join(`${process.cwd()}/chats`, filename))
  // Save file
  await writeFile(filePath, out)

  // console.log(ip, model, role, content, maxTokens, temperature, seed, filename)

  // Create chat log record
  await chats.create({
    ip, model, role, content, maxTokens, temperature, seed, out, filename, date: new Date()
  })

  res.end()
})

// Non streaming API
chatCompletion.get("/non-streaming/:content", async (req, res) => {
  // Get user ip
  const clientIPArray = req.ip.split(":")
  const ip = clientIPArray[clientIPArray.length-1]
  // Get params
  const { content } = req.params
  // Log user ip and request
  console.log(ip, `${content.substring(0, 10)}...`)

  // Hard code model until UI is built, v0.3
  const model = "mistralai/Mistral-7B-Instruct-v0.3"
  // Hard code role, max_tokens, etc.
  const role = "user"
  const maxTokens = 500
  const temperature = 0.1
  const seed = 0

  const out = await inference.chatCompletion({
    model: model,
    messages: [{ role: role, content: content }],
    max_tokens: maxTokens
  })

  let outContent = out.choices[0].message.content
  
  // New file name
  const filename = `hf_${ip}_${Date.now().toString()}.txt`
  // Path, save to chats folder
  const filePath = resolve(join(`${process.cwd()}/chats`, filename))
  // Save file
  await writeFile(filePath, outContent)
  
  // console.log(ip, model, role, content, maxTokens, temperature, seed, filename)
  
  // Create chat log record
  await chats.create({
    ip, model, role, content, maxTokens, temperature, seed, out: JSON.stringify(out), filename, date: new Date()
  })

  res.status(200).json(outContent)
})


export default chatCompletion


// NOTES
// https://huggingface.co/docs/huggingface.js/inference/README#text-generation-chat-completion-api-compatible
// http://localhost:8080/chat/How%20many%20legs%20does%20a%20dog%20have%3F
// http://localhost:8080/chat/How many legs does a dog have%3F
// I found the options for the textGeneration > chatCompletion models on Hugging Chat. https://huggingface.co/chat/settings/mistralai/Mistral-7B-Instruct-v0.3. Nowhere is this defined/documented, to my knowledge

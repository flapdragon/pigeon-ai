import express from "express"
import { writeFile } from "fs/promises"
import { join, resolve } from "path"
import { HfInference } from "@huggingface/inference"

// Get Hugging Face token
const HF_TOKEN = process.env.HF_TOKEN || ""

const hf = new HfInference(HF_TOKEN)

const textToImage = express.Router()

textToImage.get('/:inputs/:negative_prompt/:guidance_scale', async (req, res) => {
  const clientIPArray = req.ip.split(":")
  const clientIP = clientIPArray[clientIPArray.length-1]
  console.log(clientIP)
  // TODO: check for inappropriate inputs
  // TODO: need param validation
  const blob = await hf.textToImage({
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    inputs: req.params.inputs,
    parameters: {
      negative_prompt: req.params.negative_prompt,
      guidance_scale: parseFloat(req.params.guidance_scale)
    }
  })
  // Convert Hugging Face response blob to buffer
  const buffer = await blob.arrayBuffer()
  // Get blob file extension
  const fileExt = blob.type.split('/')[1]
  // New file name
  const fileName = `hf_${clientIP}_${Date.now().toString()}.${fileExt}`
  // Path, save to images folder
  const filePath = resolve(join(`${process.cwd()}/images`, fileName))
  // Save file
  await writeFile(filePath, Buffer.from(buffer))
  // TODO: delete all the files, maybe a cron job once a night or something?
  // Respond with file
  res.sendFile(filePath)
})

export default textToImage
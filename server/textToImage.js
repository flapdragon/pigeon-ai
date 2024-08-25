import express from "express"
import { writeFile } from "fs/promises"
import { join, resolve } from "path"
import { HfInference } from "@huggingface/inference"
import { images } from "./imagesModel.js"

// TODO: Automate archiving of images (yearly? monthly?)

// Get Hugging Face token
const HF_TOKEN = process.env.HF_TOKEN || ""

const hf = new HfInference(HF_TOKEN)

const textToImage = express.Router()

textToImage.get('/:inputs/:negative_prompt/:guidance_scale', async (req, res) => {
  const clientIPArray = req.ip.split(":")
  const ip = clientIPArray[clientIPArray.length-1]
  console.log(ip)
  const { inputs, negative_prompt, guidance_scale } = req.params
  // Hard code model
  const model = "stabilityai/stable-diffusion-xl-base-1.0"
  // TODO: check for inappropriate inputs
  // TODO: need param validation
  const blob = await hf.textToImage({
    model: model,
    inputs: inputs,
    parameters: {
      negative_prompt: negative_prompt,
      guidance_scale: parseFloat(guidance_scale)
    }
  })
  // Convert Hugging Face response blob to buffer
  const buffer = await blob.arrayBuffer()
  // Get blob file extension
  const fileExt = blob.type.split('/')[1]
  // New file name
  const filename = `hf_${ip}_${Date.now().toString()}.${fileExt}`
  // Path, save to images folder
  const filePath = resolve(join(`${process.cwd()}/images`, filename))
  // Save file
  await writeFile(filePath, Buffer.from(buffer))

  console.log(ip, model, inputs, negative_prompt, guidance_scale, filename)
  // Create image log record
  // NOTE: Uses hard-coded model for now, until a UI gets made that passes it in
  await images.create({
    ip, model, inputs, negative_prompt, guidance_scale, filename
  })
  // Respond with file
  res.sendFile(filePath)
})

export default textToImage
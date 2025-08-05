const express = require("express")
const multer = require("multer")
const router = express.Router()
const uploadFile = require("../service/storage.service")
const songmodel = require("../models/song.model")
const { message } = require("prompt-async")

const upload = multer({storage:multer.memoryStorage()})


router.post("/songs",upload.single("audio"),async(req,res)=>{
    console.log(req.body)
    console.log(req.file)
    const fileData = await uploadFile(req.file)
    const song = await songmodel.create({
        title:req.body.title,
        artist:req.body.artist,
        audio:fileData.url,
         mood:req.body.mood
    })
    console.log(fileData)
    res.status(201).json({
        message:"Song Added",
        song:song,
    })
})

router.get("/songs",async(req,res)=>{
    const {mood} = req.query;
    const songs = await songmodel.find({
        mood:mood
    })
    res.status(200).json({
        message:"Song Fetched successfully",
        songs: songs
    })

})

module.exports = router
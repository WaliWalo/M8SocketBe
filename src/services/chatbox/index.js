const express = require("express"),
    mongoose = require("mongoose"),
    Pusher = require('pusher')

//CHATBOX SIDESERVER
const pusher = new Pusher({ 
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    encrypted: true
  })

const chatBoxRoute = express.Router()

chatBoxRoute.post('/:chatId', async (req, res, next) => {
    try {
        const payload = req.body
        const chatId = req.params.chatId
        console.log('payload', payload, 'chat', chatId)
        pusher.trigger(`${chatId}`, `${chatId}`, payload)
        res.send(payload)
    } catch (error) {
        console.log(error)
        next(error)
    }
})




module.exports = chatBoxRoute
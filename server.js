const express = require('express')
const socket = require('socket.io')

const PORT = 5000

const app = express()

const server = app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})

const io = socket(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

let peers = []

const broadcastEventTypes = {
    ACTIVE_USERS: 'ACTIVE_USERS',
    GROUP_CALL_ROOMS: 'GROUP_CALL_ROOMS'
}

io.on('connection', (socket) => {
    socket.emit('connection', null)
    console.log(`New user connected`)
    console.log(socket.id)

    socket.on('register-new-user', (data) => {
        peers.push({
            username: data.username,
            socketId: data.socketId
        })
        console.log('Registered new user')
        console.log(peers)

        io.sockets.emit('broadcast', {
            event: broadcastEventTypes.ACTIVE_USERS,
            activeUsers: peers
        })
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
        peers = peers.filter(peer => peer.socketId !==socket.id)
        io.sockets.emit('broadcast', {
            event: broadcastEventTypes.ACTIVE_USERS,
            activeUsers: peers
        })
    })

    // listeners related with direct call

    socket.on('pre-offer', (data) => {
        console.log('pre-offer handled')
        io.to(data.callee.socketId).emit('pre-offer', {
            callerUsername: data.caller.username,
            callerSocketId: socket.id
        })
    })

    socket.on('pre-offer-answer', (data) => {
        console.log('Handling pre offer answer')
        io.to(data.callerSocketId).emit('pre-offer-answer', {
            answer: data.answer
        })
    })

    socket.on('webRTC-offer', (data) => {
        console.log('Handling webRTC offer')
        io.to(data.calleeSocketId).emit('webRTC-offer', {
            offer: data.offer
        })
    })

    socket.on('webRTC-answer', (data) => {
        console.log('Handling webRTC answer')
        io.to(data.callerSocketId).emit('webRTC-answer', {
            answer: data.answer
        })
    })

    socket.on('webRTC-candidate', (data) => {
        console.log('Handling ice candidate')
        io.to(data.connectedUserSocketId).emit('webRTC-candidate', {
            candidate: data.candidate
        })
    })

    socket.on('user-hanged-up', (data) => {
        console.log('Handling user hanged up')
        io.to(data.connectedUserSocketId).emit('user-hanged-up')
    })
})

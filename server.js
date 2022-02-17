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
})

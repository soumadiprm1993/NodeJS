const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { callbackify } = require('util')
const { getMessage, getLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname,'../public')

// ===> server emit [ socket.emit('countUpdated', count) ] ---> to single client receive [ socket.on('countUpdated', (count) => {} ]
// ===> All client emit [ socket.emit('increment', (response) => {} ] ---> to server receive [ socket.on('increment', (callback) => {} ]
// ===> server emit [ io.emit('countUpdated', count) ] --> to all client receive [ socket.on('countUpdated', (count) => {} ]

// let count = 1

io.on('connection', (socket) => {
    const filter = new Filter()
    console.log('Web Socket is conected')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({id: socket.id, ...options})

        if(error) {
            return callback(error)
        }

        socket.join(user.roomid)
        socket.emit('message', getMessage('Admin','Welcome'))
        socket.broadcast.to(user.roomid).emit('message', getMessage('Admin',`${user.displayname} has been joined`)) //broadcasting the msg or emiting the event to all client except socket instance connection in a particular room
        io.to(user.roomid).emit('roomData', { 
            users: getUsersInRoom(user.roomid), 
            roomid: user.roomid 
        })
    })


    socket.on('sendMsg', (msg, callback) => {
        const user = getUser(socket.id)
        if(user) {
            if(filter.isProfane(msg)) {
                return callback('Bad languages are prohibited')
            }
            io.to(user.roomid).emit('message', getMessage(user.displayname,msg))
            callback('Message Delivered')
             //socket is refering a single collection while io is refering all the connection or all the sockets exist
        }
    })


    socket.on('disconnect', () => { //when client or connection get disconnected or disconect from the browser this event will emit to the other connections
        const user = removeUser(socket.id)
        console.log(user)
        if(user) {
            io.to(user.roomid).emit('message',getMessage('Admin',`${user.displayname} has been disconnected`))
            io.to(user.roomid).emit('roomData', { 
                users: getUsersInRoom(user.roomid), 
                roomid: user.roomid 
            })
        }
    })


    socket.on('send-location', (location, callback) => {
        const user = getUser(socket.id)
        if(user) {
            const locUrl = `https://google.com/maps?q=${location.latitude},${location.longitude}`
            io.to(user.roomid).emit('location-message', getLocationMessage(user.displayname,locUrl))
            callback('Location Shared')
        }
    })
})


app.use(express.static(publicPath))
app.use(express.json())
module.exports = server
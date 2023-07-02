const users = []

const addUser = ({id, displayname, roomid}) => {

    displayname = displayname.trim().toLowerCase()
    roomid = roomid.trim().toLowerCase()

    if(!displayname || !roomid) {
        return {
            error : 'Display Name and Room ID is required'
        }
    }

    const isExistUser = users.find((user) => {
        return user.roomid === roomid && user.displayname === displayname
    })

    if(isExistUser) {
        return {
            error : 'Display Name is Already Exist'
        }
    }

    const user = {id, displayname, roomid}
    users.push(user)

    return { user }
}
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (roomid) => {
    roomid = roomid.trim().toLowerCase() 
    return users.filter((user) => user.roomid === roomid)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
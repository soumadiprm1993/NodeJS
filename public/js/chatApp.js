const socket = io()

// elements
const $sendMsgForm = document.querySelector("#send-msg-form")
const $sendMsgFormInput = $sendMsgForm.querySelector('input')
const $sendMsgFormButton = $sendMsgForm.querySelector('button')
const $sendLoc = document.querySelector("#send-loc")
const $showMsg = document.querySelector('#show-msg')
const $showRoomId = document.querySelector('.title')
const $roomData = document.querySelector('#room-data')

// template
const $showMsgTemplate = document.querySelector('#show-msg-template')
const $showLocationTemplate = document.querySelector('#show-location-template')
const $roomDataTemplate = document.querySelector('#room-data-template')

// query strings

const { displayname, roomid } = Qs.parse(location.search, { ignoreQueryPrefix: true})
$showRoomId.innerHTML = `Room ID : ${roomid}`

//function

const scrollToButtom = () => {

    const totalHeight = $showMsg.scrollHeight
    const newMsgHeight = $showMsg.lastElementChild.offsetHeight //last child element height + vertical padding height + border height
    const scrollPosition = parseInt($showMsg.scrollTop) //distance from top of the element to top of the scroll bar
    const elementFixHeight = $showMsg.clientHeight //document height + vertical padding height

    if(totalHeight <= newMsgHeight+scrollPosition+elementFixHeight) { 
        $showMsg.scrollTop = $showMsg.scrollHeight   
    }
}

socket.on('message', (message) => {
    if(Object.keys(message).length>0) {
        const htmlMsgDiv = Mustache.render($showMsgTemplate.innerHTML, {
            message: message.text,
            displayname: message.displayname,
            createdAt: moment(message.createdAt).format('hh:mm a')
        })
        $showMsg.insertAdjacentHTML('beforeend',htmlMsgDiv)
        scrollToButtom()
    }
})

socket.on('location-message', (locMessage) => {
    const htmlLocDiv = Mustache.render($showLocationTemplate.innerHTML, {
        locMessage: locMessage.locationUrl,
        displayname: locMessage.displayname,
        createdAt: moment(locMessage.createdAt).format('hh:mm a')
    })
    $showMsg.insertAdjacentHTML('beforeend', htmlLocDiv)
    scrollToButtom()
})

socket.on('roomData', ({ users, roomid }) => {
    const htmlRoomDiv = Mustache.render($roomDataTemplate.innerHTML, {
        users,
        roomid
    })
    $roomData.innerHTML = htmlRoomDiv
})

$sendMsgForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $sendMsgFormButton.setAttribute('disabled', 'disabled')
    const message = event.target.elements.message.value
    socket.emit('sendMsg', message, (ack) => {
        $sendMsgFormButton.removeAttribute('disabled')
        console.log(ack)
    })
    $sendMsgForm.reset()
    $sendMsgForm.querySelector('input').focus()
})

$sendLoc.addEventListener('click', () => {
    $sendLoc.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        alert('Browser is not supported for fetching current locaton')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('send-location', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, (ack) => {
            $sendLoc.removeAttribute('disabled')
            console.log(ack)
        }) 
    })
})

socket.emit('join', {displayname, roomid}, (error) => {
    console.log(error)
})
const getMessage = (displayname, text) => {
    return {
        displayname,
        text,
        createdAt: new Date().getTime()
    }
}

const getLocationMessage = (displayname, locationUrl) => {
    return {
        displayname,
        locationUrl,
        createdAt: new Date().getTime()
    }
}

module.exports= {
    getMessage,
    getLocationMessage
}
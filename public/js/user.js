let googleUserId, username;

window.onload = (event) => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            googleUserId = user.uid
            username = user.displayName
            console.log(`Logged in as: ${username}`)
            getMessages(googleUserId)
        } else {
            window.location = 'index.html'
        }
    })
}

const getMessages = (userId) => {
    const messagesRef = firebase.database().ref(`users/${userId}`);
    messagesRef.on('value', (snapshot) => {
        const data = snapshot.val()
        renderDataAsHtml(data)
    })
}

const renderDataAsHtml = (data) => {
    let messages = ''

    for(const messageItem in data) {
        const message = data[messageItem]
        messages += createMessage(message, messageItem)
    }
    document.querySelector('.title').innerHTML = `Hello, ${username}`
}


window.onload = (event) => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(`Logged in as: ${user.displayName}`)
            getMessageLog()
        } else {
            window.location = 'index.html'
        }
    })
}

const getMessageLog = () => {
    const user = firebase.auth().currentUser

    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('room');

    const messagesRef = firebase.database().ref().child(`messages/${chatId}/`)
    messagesRef.limitToFirst(20).on('child_added', (snapshot) => {
        const data = snapshot.val()

        let html = ""
        html += `<li id="${snapshot.key}">
                    ${data.user}: ${data.message}
                </li>`
        
        document.getElementById("messages").innerHTML += html
    })
}

const sendMessage = () => {
    const message = document.getElementById('message')

    if (message.value != "") {
        const user = firebase.auth().currentUser

        const messageData = {
            user: user.uid,
            message: message.value,
            createdAt: new Date()
        }
        const chatData = {
            lastMessage: message.value,
            createdAt: new Date()
        }
        
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get('room');
        const messageId = firebase.database().ref()
                            .child(`messages/${chatId}/`).push().key
        
        const updates = {}
            updates[`messages/${chatId}/${messageId}/`] = messageData
            updates[`chats/${chatId}/`] = chatData

        firebase.database().ref().update(updates)
        message.value = ""
    }
}

const deleteMessage = (messageId, chatId) => {
    const user = firebase.auth().currentUser

    const messagesRef = firebase.database().ref(`messages/${chatId}/${messageId}/`)
    messagesRef.on('child_removed', (snapshot) => {
        const message = document.querySelector(`[data-id="${messageId}"]`)
        if (message != null) {
            message.parentNode.parentNode.removeChild(message.parentNode)
        }
    })
    messagesRef.remove()
}

document.getElementById('home').addEventListener('click', () => {
    window.location = 'user.html'
})

document.getElementById('sign-out').addEventListener('click', () => {
    firebase.auth()
    .signOut()
    .then(() => {
        window.location = 'index.html'
    }).catch((error) => {
        console.log(error)
    })
})
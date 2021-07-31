let userId, displayName

window.onload = (event) => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            userId = user.uid
            displayName = user.displayName
            console.log(`Logged in as: ${displayName}`)
            getChatLog(userId, displayName)
        } else {
            window.location = 'index.html'
        }
    })
}

const getChatLog = (userId, displayName) => {
    const messagesRef = firebase.database().ref(`users/${userId}/messages`)

    messagesRef.on('child_added', function (snapshot) {
        let html = ""
        html += `<li>${displayName}: 
                    ${snapshot.val().content}
                </li>`

        document.getElementById("messages").innerHTML += html
    })
}

const sendMessage = () => {
    const content = document.getElementById('message')

    const tzoffset = (new Date()).getTimezoneOffset() * 60000
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)

    if (content.value != "") {
        const messageData = {
            content: content.value,
            createdAt: localISOTime,
            uid: userId
        }
        
        const chatId = firebase.database().ref().child('chats').push().key;
        const messageId = firebase.database().ref().child('messages').push().key;
        
        const updates = {}
        updates[`/chats/${chatId}/messages/${messageId}`] = messageData
        updates[`/users/${userId}/messages/${messageId}`] = messageData

        firebase.database().ref().update(updates)
        content.value = ""
    }
}
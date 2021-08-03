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
    messagesRef.on('child_added', (snapshot) => {
        const data = snapshot.val()

        let html = ""
        html += `<li>${data.user}: 
                    ${data.message}
                </li>`

        document.getElementById("messages").innerHTML += html
    })
}

const sendMessage = () => {
    const message = document.getElementById('message')
    console.log("MSG", message.value)    
    // const tzoffset = (new Date()).getTimezoneOffset() * 60000
    // const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)

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
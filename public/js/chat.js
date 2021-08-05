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
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('room');

    const messagesRef = firebase.database().ref().child(`messages/${chatId}/`)
    messagesRef.limitToFirst(20).on('child_added', (snapshot) => {
        const data = snapshot.val()

        let html = ""
        html += `<li class="fade">
                    <div class="sender">${data.displayName}
                        <button class="gif-button"
                        onclick="convertMsgToGif('${data.message}', '${snapshot.key}')">
                            GIF
                        </button>
                    </div>
                    <div id="message-data">
                        ${data.message}
                    </div>
                    <div id="${snapshot.key}"></div>
                </li>`
        document.getElementById("messages").innerHTML += html
    })
}

document.getElementById('send').addEventListener('click', () => {
    const message = document.getElementById('message')

    if (message.value != "") {
        const user = firebase.auth().currentUser

        const messageData = {
            user: user.uid,
            displayName: user.displayName,
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
})

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
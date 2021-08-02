window.onload = (event) => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(`Logged in as: ${user.displayName}`)
            getChats(user.uid)
        } else {
            window.location = 'index.html'
        }
    })
}

const getChats = (userId) => {
    const chatsRef = firebase.database().ref(`users/${userId}/rooms/`)
    chatsRef.on('value', (snapshot) => {
        const chatId = Object.keys(snapshot.val())[0]

        let html = ""
        html += `<button class="button chat">
                    ${chatId}
                </button>`

        document.getElementById("chats").innerHTML += html
            
        const targetBtns = document.querySelectorAll('.chat')
        targetBtns.forEach((button) => {
            button.addEventListener('click', () => {
                getChatLog(chatId)                
            })
            const query = new URLSearchParams({
                room: chatId
            })
            const url = "https://5000-e8fc8fcd-7f31-433a-a2de-009b0023de33.cs-us-west1-ijlt.cloudshell.dev/user/chat?"
                        + query.toString()
            console.log(url)
        })
    })
}

const getChatLog = (chatId) => {
    const user = firebase.auth().currentUser
    console.log("HELLO", chatId)
    const messagesRef = firebase.database().ref(`messages/${chatId}/`)
    messagesRef.on('child_added', (snapshot) => {
        let html = ""
        html += `<li>${user.displayName}: 
                    ${snapshot.val().content}
                </li>`

        document.getElementById("messages").innerHTML += html
    })
}

const findRoom = () => {
    const roomCode = document.getElementById('roomCode').value

    const user = firebase.auth().currentUser

    const userData = {
        name: user.displayName,
        rooms: {
            [roomCode]: true
        }
    }

    const updates = {}

    updates[`members/${roomCode}/`] = { [user.uid]: true }
    updates[`users/${user.uid}/`] = userData

    firebase.database().ref().update(updates)
}

const createChat = () => {
    const user = firebase.auth().currentUser
    const chatId = firebase.database().ref('chats/').push().key

    const chatData = {
        createdAt: new Date()
    }
    const userData = {
        name: user.displayName,
        rooms: {
            [chatId]: true
        }
    }

    const updates = {}

    updates[`chats/${chatId}/`] = chatData
    updates[`members/${chatId}/`] = { [user.uid]: true}
    updates[`users/${user.uid}/`] = userData

    firebase.database().ref().update(updates)
}

const sendMessage = () => {
    const message = document.getElementById('message')

    // const tzoffset = (new Date()).getTimezoneOffset() * 60000
    // const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)

    if (message.value != "") {
        const user = firebase.auth().currentUser

        const messageData = {
            user: user.uid,
            message: message.value,
            createdAt: new Date(),
        }
        
        const chatId = firebase.database().ref().child('chats').push().key
        const messageId = firebase.database().ref().child('messages').push().key
        
        const updates = {}
        updates[`messages/${chatId}/${messageId}/`] = messageData

        firebase.database().ref().update(updates)
        content.value = ""
    }
}
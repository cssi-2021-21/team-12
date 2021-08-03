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
        if(snapshot.val() != null) {
            let chatIds = []
            snapshot.forEach((child) => {
                chatIds.push(child.key)

                let html = ""
                html += `<button class="button chat">
                            ${child.key}
                        </button>`
                document.getElementById("chats").innerHTML += html
            })
            console.log(chatIds)
            const targetBtns = document.querySelectorAll('.chat')
            for (let i = 0; i < targetBtns.length; i++) {
                targetBtns[i].addEventListener('click', () => {
                    getChatLog(chatIds[i])
                })
            }
        }
    })
}

const getChatLog = (chatId) => {
    const query = new URLSearchParams({ room: chatId })
    window.location.replace('chat.html?' + query.toString())
}

const createChat = () => {
    const user = firebase.auth().currentUser
    const chatId = firebase.database().ref('chats/').push().key

    const chatData = {
        createdAt: new Date()
    }

    const updates = {}
        updates[`chats/${chatId}/`] = chatData
        updates[`members/${chatId}/`] = { [user.uid]: true}
        updates[`users/${user.uid}/rooms/`] = updateRoom(user.uid, chatId)

    firebase.database().ref().update(updates)
}

const enterChat = () => {
    const roomCode = document.getElementById('roomCode').value

    const membersRef = firebase.database().ref(`members/${roomCode}/`)
    membersRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const user = firebase.auth().currentUser
            if (user.uid in snapshot.val()) {
                getChatLog(roomCode)
            } else {
                let members = {}
                snapshot.forEach((child) => {                    
                    members[child.key] = child.val()
                })
                members[user.uid] = true

                const updates = {}
                    updates[`users/${user.uid}/rooms/`] = updateRoom(user.uid, roomCode)
                    updates[`members/${roomCode}/`] = members 

                getChatLog(roomCode)
            }
        }
    })
}

const updateRoom = (userId, chatId) => {
    const roomsRef = firebase.database().ref(`users/${userId}/rooms/`)
    
    let rooms = {}
    roomsRef.once('value', (snapshot) => {
        snapshot.forEach((child) => {                    
            rooms[child.key] = child.val()
        })
        rooms[chatId] = true
    })
    return rooms
}
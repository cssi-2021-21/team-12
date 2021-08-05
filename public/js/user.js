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
    const chatsRef = firebase.database().ref().child(`users/${userId}/rooms/`)
    chatsRef.on('child_added', (snapshot) => {
        const key = snapshot.key

        let html = ""
        html += `<li>
                    <a id="${key}" 
                    onclick="getChatLog('${key}')">
                        ${key}
                    </a>
                    <button class="delete-button"
                    onclick="deleteRoom('${key}')">
                        Delete
                    </button>
                </li>`
        document.getElementById("chats").innerHTML += html
    })
}

const getChatLog = (chatId) => {
    const query = new URLSearchParams({ room: chatId })
    window.location.replace('chat.html?' + query.toString())
}

document.getElementById('create-chat').addEventListener('click', () => {
    const user = firebase.auth().currentUser
    const chatId = firebase.database().ref('chats/').push().key

    const chatData = {
        createdAt: new Date()
    }

    const updates = {}
        updates[`chats/${chatId}/`] = chatData
        updates[`members/${chatId}/`] = { [user.uid]: true }
        updates[`users/${user.uid}/rooms/`] = updateRooms(user.uid, chatId)

    firebase.database().ref().update(updates)
})

document.getElementById('enter-room').addEventListener('click', () => {
    const roomCode = document.getElementById('room-code').value

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
                    updates[`users/${user.uid}/rooms/`] = updateRooms(user.uid, roomCode)
                    updates[`members/${roomCode}/`] = members

                firebase.database().ref().update(updates)

                getChatLog(roomCode)
            }
        }
    })
})

const updateRooms = (userId, chatId) => {
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

const deleteRoom = (chatId) => {
    const user = firebase.auth().currentUser
    const room = document.querySelector(`#${chatId}`)
    console.log(room)
   
    const chatsRef = firebase.database().ref(`chats/${chatId}/`)
    const membersRef = firebase.database().ref(`members/${chatId}/${user.uid}/`)
    const messagesRef = firebase.database().ref(`messages/${chatId}/`)
    const usersRef = firebase.database().ref(`users/${user.uid}/rooms/${chatId}/`)

    chatsRef.remove()
    membersRef.remove()
    messagesRef.remove()
    usersRef.remove()

    document.getElementById(`${chatId}`).remove()
}

document.getElementById('sign-out').addEventListener('click', () => {
    firebase.auth()
    .signOut()
    .then(() => {
        window.location = 'index.html'
    }).catch((error) => {
        console.log(error)
    })
})
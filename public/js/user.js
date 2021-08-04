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
        html += `<button class="button chat" onclick="getChatLog('${key}')">
                    ${key}
                </button>`
        document.getElementById("chats").innerHTML += html
    })
}

const getChatLog = (chatId) => {
    const query = new URLSearchParams({ room: chatId })
    window.location.replace('chat.html?' + query.toString())
}

document.getElementById('profile').addEventListener('click', () => {
    const editProfile = document.getElementById('edit-profile')

    const user = firebase.auth().currentUser
    const usersRef = firebase.database().ref(`users/${user.uid}/`)
    usersRef.on('value', (snapshot) => {
        if (snapshot.child(`users/${user.uid}/displayName/`).exists()) {
            document.getElementById('new-name').value = user.displayName
        }
    })
    editProfile.classList.toggle('is-active')
})

document.getElementById('update-profile').addEventListener('click', () => {
    const user = firebase.auth().currentUser
    const newDisplayName = document.getElementById('new-name').value

    const profileEdits = {
        displayName: newDisplayName
    }
    firebase.database().ref(`users/${user.uid}/`).update(profileEdits)
})

document.getElementById('close-profile').addEventListener('click', () => {
    const editProfile = document.getElementById('edit-profile')
    editProfile.classList.toggle('is-active')
})

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

document.getElementById('enter-chat').addEventListener('click', () => {
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

document.getElementById('sign-out').addEventListener('click', () => {
    firebase.auth()
    .signOut()
    .then(() => {
        window.location = 'index.html'
    }).catch((error) => {
        console.log(error)
    })
})
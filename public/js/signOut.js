const signOut = () => {
    firebase.auth()
    .signOut()
    .then(() => {
        window.location = 'index.html'
    }).catch((error) => {
        console.log(error)
    })
}
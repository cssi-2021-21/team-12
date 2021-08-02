const signIn = () => {
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth()
  .signInWithPopup(provider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;
    var token = credential.accessToken;

    window.location = 'user.html';
  }).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    
    var email = error.email;
    var credential = error.credential;
    const err = {
      errorCode,
      errorMessage,
      email,
      credential
    };
    console.log(err);
  });
}
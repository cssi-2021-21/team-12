//Converts string message to array of words
const stringToWords = (message) => {
    const rawTokens = message.split(/\W/g);
    let tokens = [];
    
    for(const token of rawTokens){
        if(token != ""){
            tokens.push(token);
        }
    }
    return tokens;
}

//Converts string message to giphy image urls
const convertMsgToGif = (message, messageId) => {
    let keyWords = stringToWords(message);
    let gifUrl = "";
    const display = document.getElementById(`${messageId}`);
    
    let imgWidth = 25;
    if (keyWords.length > 10){
        imgWidth = 100/keyWords.length;
    }
    
    for(const word of keyWords){
        urlToFetch = `https://api.giphy.com/v1/gifs/search?api_key=${myKey}&q=${word}&limit=25&offset=0&rating=g&lang=en`;
        fetch(urlToFetch)
            .then(response => response.json())
            .then(myJson => {
                let random = Math.floor(Math.random()*25)
                console.log(random)
                let imgUrl = myJson.data[random].images.original.url;
                
                let html = ""
                    html += `<img src="${imgUrl}" alt="${word}" style="width:${imgWidth}%;"/>`
                display.innerHTML = html
            })
        .catch(error => {
            console.log(error);
        })
    }
}
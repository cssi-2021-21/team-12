console.log("chat script running");
const stringToToken = (message) => {
    let tokens = [];
    //convert string into tokens
    return tokens;
}

const returnGifUrls = (keyWords) => {
    let gifUrls = [];
    let urlToFetch = "";
    
   for (let i = 0; i < keyWords.length; i++){
        urlToFetch = `https://api.giphy.com/v1/gifs/search?api_key=${myKey}&q=${keyWords[i]}&limit=25&offset=0&rating=g&lang=en`;
        console.log(urlToFetch);
       fetch(urlToFetch)
            .then(response => response.json())
            .then(myJson => {
                const imageUrl = myJson.data[0].images.original.url;
                console.log(imageUrl);
                gifUrls.push(imageUrl);
            })
        .catch(error => {
            console.log("error was: ", error);
        }) 
    }
    return gifUrls;
}

const imageHolderDiv = document.querySelector("#imageHolderDiv");

let keyWords = [];
keyWords = ["cat", "dog", "bird"];
let gifUrls = returnGifUrls(keyWords);
let gifDisplay = "";
console.log(gifUrls);

for(gif of gifUrls){
    gifDisplay += `<img src="${gif}"/>`;
}
console.log(gifDisplay);


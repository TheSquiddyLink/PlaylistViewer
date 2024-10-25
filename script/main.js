class Playlist{
    constructor(name, url){
        this.name = name;
        this.url = url;
    }
    async getRaw(){
        const streamPlaylistRaw = await fetch(this.url);
        const streamPlaylistText = await streamPlaylistRaw.text();
        return streamPlaylistText;
    }

    async getRawLine(num){
        const raw = await this.getRaw();
        const lines = raw.split("\n");
        return lines[num];
    }

    /**
     * 
     * @returns {Promise<Song[]>}
     */

    async getSongs(){
        /** @type {Song[]} */
        var songs = [];

        const raw = await this.getRaw();
        const lines = raw.split("\n");
        for(let i = 0; i < lines.length; i++){
            const line = lines[i];
            const song = new Song(line);
            songs.push(song);
        }

        return songs;

    }

    /**
     * 
     * @param {Song[]} songs 
     * @param {Filter} filter 
     * @returns 
     */
    async filterSongs(songs, filter){
        const filtered = songs.filter(song => song[filter.key].toLowerCase().includes(filter.value.toLowerCase()));
        return filtered;
    }

    /**
     * @param {Filter[]} filters 
     */
    async multiFilterSongs(filters){
        var songs = await this.getSongs();
        for(let i = 0; i < filters.length; i++){
            const filter = filters[i];
            console.log(filter)
            songs = await this.filterSongs(songs, filter);
        }
        return songs;
    }
    
}
class Filter {
    constructor(key, value){
        this.key = key;
        this.value = value;
    }
}
class Song {
    /**
     * 
     * @param {string} rawLine 
     */
    constructor(rawLine){
        // Example:
        // Nintendo - [Super Mario Galaxy CD1 #23] Daybreak - A New Dawn
        
        // Format
        // <Artist> - [<Album> CD<cdNum> #<trackNum>] <Title>

        // Notes:
        // Album can contain spaces
        // CD is optional

        this.artist = rawLine.split(" - ")[0];
        let albumData = this.substring(rawLine, "[", "]");
        
        const cdMatch = albumData.match(/CD\d+/);
        this.cdNumber = cdMatch ? parseInt(cdMatch[0].substring(2)) : null;

        const trackMatch = albumData.match(/#\d+/);
        this.trackNumber = trackMatch ? parseInt(trackMatch[0].substring(1)) : null;
        this.album = albumData.split(/(?:CD\d+|\#)/)[0].trim();
        this.title = rawLine.split("] ")[1].replace(/\r/g, "");
    }
    /**
     * 
     * @param {String} str 
     * @param {String} char1 
     * @param {String} char2 
     * @returns {String}
     */
    substring(str, char1, char2){
        const startIndex = str.indexOf(char1) + 1;
        const endIndex = str.lastIndexOf(char2);
        
        if (startIndex === 0 || endIndex === -1 || startIndex >= endIndex) {
            return ''; // Return an empty string if characters are not found or in the wrong order
        }
        
        return str.slice(startIndex, endIndex);
    }

    get art(){
        return "./assets/images/albums/" + this.album + ".png"
    }
}

async function main(){
    createForm();
}

async function createForm(){
    const form = document.getElementById("filter");

    const albumInput = document.createElement("input");
    albumInput.type = "text";
    albumInput.placeholder = "Album";
    albumInput.id = "album";
    form.appendChild(albumInput);

    const artistInput = document.createElement("input");
    artistInput.type = "text";
    artistInput.placeholder = "Artist";
    artistInput.id = "artist";
    form.appendChild(artistInput);

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Title";
    titleInput.id = "title";
    form.appendChild(titleInput);

    const submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.addEventListener("click", submitForm);
    form.appendChild(submitButton);

    const randomAmount = document.createElement("input");
    randomAmount.type = "number";
    randomAmount.value = 1;
    randomAmount.min = 1;
    randomAmount.max = 10;
    randomAmount.id = "randomAmount";
    form.appendChild(randomAmount);


    const randomButton = document.createElement("button");
    randomButton.innerText = "Random";
    randomButton.addEventListener("click", randomSong);
    form.appendChild(randomButton);
}

/**
 * 
 * @param {SubmitEvent} event 
 */
async function submitForm(event){
    event.preventDefault();
    console.log(event.target);
    const album = document.getElementById("album").value;
    const artist = document.getElementById("artist").value;
    const title = document.getElementById("title").value;

    var filters = [];
    if(album){
        filters.push(new Filter("album", album));
    }
    if(artist){
        filters.push(new Filter("artist", artist));
    }
    if(title){
        filters.push(new Filter("title", title));
    }

    console.log(filters);


    const playlist = new Playlist("Stream", "./assets/playlists/stream.txt");
    const songs = await playlist.multiFilterSongs(filters);
    console.log(songs);

    // Sort the songs by album, cd number, then track number

    songs.sort((a, b) => {
        if(a.album < b.album){
            return -1;
        }
        if(a.album > b.album){
            return 1;
        }
        if(a.cdNumber < b.cdNumber){
            return -1;
        }
        if(a.cdNumber > b.cdNumber){
            return 1;
        }
        if(a.trackNumber < b.trackNumber){
            return -1;
        }
        if(a.trackNumber > b.trackNumber){
            return 1;
        }
        return 0;
    });
    if(songs.length == 0){
        alert("No songs found");
        return;
    }
    setTable(songs);
}

/**
 * 
 * @param {Song[]} songs 
 */
async function setTable(songs){
    const table = document.getElementById("table");
    table.innerHTML = "";
    const tbody = document.createElement("tbody");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    const headers = ["Art", "Album", "Artist", "Title"];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.innerText = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    

    for(let i = 0; i < songs.length; i++){
        const song = songs[i];
        const tr = document.createElement("tr");
        
        if(songs.length < 999){
            const td0 = document.createElement("td");
            const img = document.createElement("img");
            img.src = song.art;
            img.onerror = () => {
                img.src = './assets/images/albums/unknown.png';
            };
            img.classList.add("album-art");
            td0.appendChild(img);
            tr.appendChild(td0);
        }
       

        const td1 = document.createElement("td");
        td1.innerText = song.album;
        const td2 = document.createElement("td");
        td2.innerText = song.artist;
        const td3 = document.createElement("td");
        td3.innerText  = song.title;
        const td4 = document.createElement("td");
        const btn = document.createElement("button");
        btn.innerText = "Generate Request";
        btn.addEventListener("click", generateRequest);
        td4.appendChild(btn);
 
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
}

/**
 * @param {MouseEvent} event 
 */
async function generateRequest(event){
    /**@type {HTMLTableRowElement} */
    const tr = event.target.parentElement.parentElement;

    const album = tr.children[1].innerText;
    const artist = tr.children[2].innerText;
    const title = tr.children[3].innerText;

    const request = `${album}||${artist}||${title}`;

    await navigator.clipboard.writeText(request);
    alert("Request copied to clipboard!");
    
}

/**
 * 
 * @param {SubmitEvent} event 
 */
async function randomSong(event) {
    event.preventDefault();
    const amount = Math.min(document.getElementById("randomAmount").value, 20);
    console.log(amount);
    const playlist = new Playlist("Stream", "./assets/playlists/stream.txt");
    const songs = await playlist.getSongs();
    var randomSongs = [];
    for(let i = 0; i < amount; i++){
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        randomSongs.push(randomSong);
    }
    setTable(randomSongs);
}
main();


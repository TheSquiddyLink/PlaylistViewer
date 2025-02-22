class Playlist{
    constructor(name, url){
        this.name = name;
        this.url = url;
    }

    /**
     * 
     * @returns {Promise<Song[]>}
     */
    async getSongs(){
        /** @type {Song[]} */
        var songs = [];

        const raw = await fetch(this.url);
        const json = await raw.json();
        
        for(const song of json){
            songs.push(new Song(song));
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
    constructor(obj){
        this.title = obj.title;
        this.artist = obj.artist;
        this.album = obj.album;
        this.id = obj.id;
        this.playlistId = obj.playlistId;
    }

    get art(){
        return "./assets/images/albums/" + this.album + ".png"
    }
}

/**
 * 
 * @param {SubmitEvent} event 
 */
async function submitForm(event){
    event.preventDefault();
    console.log(event.target);
    const album = document.getElementById("albumInput").value;
    const artist = document.getElementById("artistInput").value;
    const title = document.getElementById("titleInput").value;

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

    const playlistValue = document.getElementById("playlistInput").value;
    const random = Math.random().toFixed(5);
    const playlistPath = `./assets/playlists/${playlistValue.toLowerCase()}.json?random=${random}`;
    const playlist = new Playlist(playlistValue, playlistPath);
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
    
    const headers = ["Art", "Album", "Artist", "Title", "ID"];
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
        td4.innerText = song.id;
        const td5 = document.createElement("td");
        const btn = document.createElement("button");
        btn.innerText = "Generate Request";
        btn.addEventListener("click", generateRequest);
        td5.appendChild(btn);
 
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
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
    const id = tr.children[4].innerText;
    const playlist = document.getElementById("playlistInput").value;

    const request = `${playlist.toLowerCase()}-${id}||'${title}' by '${artist}' from '${album}'`;

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

async function main(){
    const playlist = new Playlist("Stream", "./assets/playlists/stream.json");
    const songs = await playlist.getSongs();
    
    setTable(songs);

    setDropdowns(songs, submitForm);
}

async function clearForm(event){
    event.preventDefault();
    document.getElementById("albumInput").value = "";
    document.getElementById("artistInput").value = "";
    document.getElementById("titleInput").value = "";
    submitForm(event);
}

async function randomSong(event){
    event.preventDefault();
    const json = (await fetch("./assets/playlists/stream.json")).json();
    const len = (await json).length;
    const randomSong = (await json)[Math.floor(Math.random() * len)];
    console.log(randomSong);
    const result = randomSong.id + "||Random Song!";
    await navigator.clipboard.writeText(result);
    alert("Request copied to clipboard!");
}

document.getElementById("filter").addEventListener("change", submitForm);
document.getElementById("clear").addEventListener("click", clearForm);
document.getElementById("random").addEventListener("click", randomSong);

main();

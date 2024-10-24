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

    async filterSongs(key, value){
        const songs = await this.getSongs();
        const filtered = songs.filter(song => song[key].includes(value));
        return filtered;
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
    
    const submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.addEventListener("click", submitForm);
    form.appendChild(submitButton);

}

/**
 * 
 * @param {SubmitEvent} event 
 */
async function submitForm(event){
    event.preventDefault();
    console.log(event.target);
    const album = document.getElementById("album").value;

    const playlist = new Playlist("Stream", "./assets/playlists/stream.txt");
    console.log(album)
    const songs = await playlist.filterSongs("album", album);
    console.log(songs);
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
    for(let i = 0; i < songs.length; i++){
        const song = songs[i];
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.innerText = song.artist;
        const td2 = document.createElement("td");
        td2.innerText = song.album;
        const td3 = document.createElement("td");
        td3.innerText  = song.title;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
}
main();


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
    const StreamPlaylist = new Playlist("Stream", "./assets/playlists/stream.txt");
    const StreamText = await StreamPlaylist.getRaw();
    const line1 = await StreamPlaylist.getRawLine(0);
    console.log(line1);
    const song = new Song(line1);
    console.log(song);
}




main();


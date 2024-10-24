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
}

async function main(){
    const StreamPlaylist = new Playlist("Stream", "./assets/playlists/stream.txt");
    const StreamText = await StreamPlaylist.getRaw();
    console.log(StreamText);
}




main();


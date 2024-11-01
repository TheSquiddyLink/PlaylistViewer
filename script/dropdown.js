/**
 * Handle Dropdown
 * @param {event} event
 */
function toggleDropdown(id) {
    document.getElementById(id).classList.toggle("show");
}
  
function hideDropdown(id){
    console.log("hiding drop down")
    document.getElementById(id).classList.remove("show")
}

function filterFunction(id) {
    var input, filter, a, i;
    input = document.getElementById(id+"Input");
    filter = input.value.toUpperCase();
    div = document.getElementById(id);
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

/**
 * 
 * @param {Event} event 
 */
function handleDropdown(event){
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target;
    const value = target.value;

    const input = document.getElementById("albumInput");
    input.value = value;
}

/**
 * 
 * @param {Array<Song>} songs 
 */
function setDropdowns(songs){
    const album = document.getElementById("album");
    const artist = document.getElementById("artist");
    const title = document.getElementById("title");
    const albumOptions = [...new Set(songs.map(song => song.album))];
    const artistOptions = [...new Set(songs.map(song => song.artist))];
    const titleOptions = [...new Set(songs.map(song => song.title))];

    createElements(album, albumOptions);
    createElements(artist, artistOptions);
    createElements(title, titleOptions);
}   
function createElements(container, options){
    for(let i = 0; i < options.length; i++){
        const option = document.createElement("a");
        option.addEventListener("click", handleDropdown);
        option.value = options[i];
        option.innerText = options[i];
        container.appendChild(option);
    }
}
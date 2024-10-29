document.addEventListener("DOMContentLoaded", () => {
    renderWatchlist();
});

function renderWatchlist() {
    const watchlistContainer = document.getElementById('watchlist-container');
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = `
            <div class="empty-watchlist-container">
                <p>Your Watchlist is empty.</p>
            </div>
        `;
    } else {
        watchlistContainer.innerHTML = watchlist.map(movie => `
            <li class="movie-card">
                <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title} movie poster" class="movie-poster"/>
                <div class="movie-details">
                    <div class="title-group">
                        <span class="title-year"><b>${movie.Title}</b> <i>(${movie.Year})</i></span>
                        <span class="rating"><i class="fa-solid fa-star" style="color: #FFD700"></i> ${movie.imdbRating}</span>
                    </div>
                    <div class="details-to-group">
                        <div class="group-1">
                            <span>${movie.Runtime}</span>
                            <span>${movie.Genre}</span>
                            <button class="remove-btn" data-imdb-id="${movie.imdbID}"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                        <div class="group-2">
                            <span><b>Director:</b> ${movie.Director}</span>
                            <span><b>Writer:</b> ${movie.Writer}</span>
                        </div>
                        <span class="movie-language">Language: ${movie.Language}</span>
                    </div>
                    <div class="plot-container">
                        <p class="plot-text" id="plot-${movie.imdbID}">${movie.Plot}</p>
                        <button class="read-more-btn" data-imdb-id="${movie.imdbID}">Read More</button>
                    </div>
                </div>
            </li>
        `).join('');
        
        checkPlotOverflowAndToggleButtons(watchlist); 

        addEventListenersToRemoveBtns();
        addEventListenersToReadMoreBtns();
    }
}

function checkPlotOverflowAndToggleButtons(watchlist) {
    watchlist.forEach(movie => {
        const plotTextElement = document.getElementById(`plot-${movie.imdbID}`);
        const readMoreButton = document.querySelector(`.read-more-btn[data-imdb-id="${movie.imdbID}"]`);

        // Temporarily set max height to 'none' to calculate full height
        plotTextElement.style.maxHeight = 'none';

        // Check if the plot text exceeds the height for 3 lines
        const lineHeight = parseFloat(getComputedStyle(plotTextElement).lineHeight);
        const threeLineHeight = lineHeight * 3; // Height for 3 lines

        const isOverflowing = plotTextElement.scrollHeight > threeLineHeight;

        if (isOverflowing) {
            readMoreButton.style.display = 'inline';
        } else {
            readMoreButton.style.display = 'none'; 
        }
        
        plotTextElement.style.maxHeight = '4.5em'; // Limit to 3 lines
    });
}

function addEventListenersToRemoveBtns() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener("click", function() {
            const imdbID = this.getAttribute('data-imdb-id');
            removeFromWatchlist(imdbID);
        });
    });
}

function removeFromWatchlist(imdbID) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(movie => movie.imdbID !== imdbID);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    
    renderWatchlist();
}

function addEventListenersToReadMoreBtns() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imdbId = this.getAttribute('data-imdb-id');
            togglePlotVisibility(imdbId); 
        });
    });
}

// Function to toggle plot visibility
function togglePlotVisibility(imdbId) {
    const plotText = document.getElementById(`plot-${imdbId}`);
    const button = document.querySelector(`.read-more-btn[data-imdb-id="${imdbId}"]`);

    if (plotText.style.maxHeight === '4.5em' || plotText.style.maxHeight === "") {
        plotText.style.maxHeight = 'none'; // Show full plot
        plotText.style.display = 'block';   // Ensure it's displayed
        button.textContent = "Read Less"; 
    } else {
        plotText.style.maxHeight = '4.5em'; // Limit to 3 lines
        button.textContent = "Read More"; 
    }
}


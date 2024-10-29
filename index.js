// OMDb API: https://www.omdbapi.com/
// API key: apikey=184d348a
let movieId
let movies = []

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input")
const movieCardDisp = document.getElementById("movie-card-list")
const goToWatchlistBtn = document.getElementById("go-to-watchlist")
const landingPageIcon = document.querySelector('.landing-page-icon')


searchForm.addEventListener("submit", handleSearchClick);


async function handleSearchClick(e) {
    e.preventDefault();
    landingPageIcon.style.display = 'none';
    
    const movieName = searchInput.value.trim();
    if (!movieName) {
        movieCardDisp.innerHTML = `<p>Oops! You need to enter a movie name!</p>`;
        movieCardDisp.classList.add('large-container');
        return;
    }
    
    searchInput.value = "";
    movieCardDisp.innerHTML = "Loading....";
    movieCardDisp.classList.add('large-container');

    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=184d348a&s=${movieName}&type=movie`);
        const data = await res.json();
        
        if (data.Response === "False") {
            movieCardDisp.innerHTML = `<p>Uh-oh! No movies found for "${movieName}". Please try a different search.</p>`;
            movieCardDisp.classList.add('large-container');
            return;
        }
        
        const movieList = data.Search;
        const fetchMovieDetails = movieList.map(async (movie) => {
            const res = await fetch(`https://www.omdbapi.com/?apikey=184d348a&i=${movie.imdbID}`);
            return res.json();
        });

        movies = await Promise.all(fetchMovieDetails);
        renderMovieCards(movies);
    } catch (error) {
        movieCardDisp.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
        movieCardDisp.classList.add('large-container');
    }
}

function renderMovieCards(movies) {
    movieCardDisp.classList.remove('large-container');
    movieCardDisp.innerHTML = movies.map(movie => `
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
                        <button class="add-to-watchlist-btn" data-imdb-id="${movie.imdbID}">
                            <i class="fa-solid fa-circle-plus"></i> Watchlist
                        </button>
                        <span class="watchlist-message" style="display: none;">Added to Watchlist</span>
                    </div>
                    <div class="group-2">
                        <span><b>Director:</b> ${movie.Director}</span>
                        <span><b>Writer:</b> ${movie.Writer}</span>
                    </div>
                    <span class="movie-language">Language: ${movie.Language}</span>
                </div>
                <div class="plot-container">
                    <p class="plot-text" id="plot-${movie.imdbID}">
                        ${movie.Plot}
                    </p>
                        <button class="read-more-btn" data-imdb-id="${movie.imdbID}">Read More</button>
                </div>
            </div>
        </li>
    `).join('');
    
    checkPlotOverflowAndToggleButtons(movies);
    
    addEventListenersToWatchlistBtns();
    addEventListenersToReadMoreBtns();
}

// New function to check plot overflow and toggle buttons
function checkPlotOverflowAndToggleButtons(movies) {
    movies.forEach(movie => {
        const plotTextElement = document.getElementById(`plot-${movie.imdbID}`);
        const readMoreButton = document.querySelector(`.read-more-btn[data-imdb-id="${movie.imdbID}"]`);

        plotTextElement.style.maxHeight = 'none';

        // Check if the plot text exceeds the height for 3 lines
        const lineHeight = parseFloat(getComputedStyle(plotTextElement).lineHeight);
        const threeLineHeight = lineHeight * 3; 

        const isOverflowing = plotTextElement.scrollHeight > threeLineHeight;

        if (isOverflowing) {
            readMoreButton.style.display = 'inline';
        } else {
            readMoreButton.style.display = 'none'; 
        }
        
        plotTextElement.style.maxHeight = '4.5em'; // Limit to 3 lines
    });
}

//function to add eventlisteners to add to watchlist buttons to make the code a little cleaner
function addEventListenersToWatchlistBtns() {
    document.querySelectorAll('.add-to-watchlist-btn').forEach(button => {
        button.addEventListener("click", function() {
            const imdbID = this.getAttribute('data-imdb-id')
            addToWatchlist(imdbID, this)
        })
    })
}

function addToWatchlist(imdbID, buttonElement) {
    const movieDetails = movies.find(movie => movie.imdbID === imdbID)
    
    if (movieDetails) {
        // check if it's already in the watchlist
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []
        
        if (!watchlist.some(movie => movie.imdbID === imdbID)) {
            watchlist.push(movieDetails)
            localStorage.setItem('watchlist', JSON.stringify(watchlist))
            
            buttonElement.style.display = 'none'
            const messageSpan = buttonElement.nextElementSibling
            messageSpan.style.display = 'inline'
        } else {
            buttonElement.style.display = 'none'
            const messageSpan = buttonElement.nextElementSibling
            messageSpan.style.display = 'inline'
            messageSpan.textContent = 'Already in Watchlist'
        }
    }
}


// New function to add event listeners for the Read More buttons
function addEventListenersToReadMoreBtns() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imdbId = this.getAttribute('data-imdb-id');
            togglePlotVisibility(imdbId); 
        });
    });
}

// New function to toggle plot visibility
function togglePlotVisibility(imdbId) {
    const plotText = document.getElementById(`plot-${imdbId}`);
    const button = document.querySelector(`.read-more-btn[data-imdb-id="${imdbId}"]`);

    if (plotText.style.maxHeight === '4.5em' || plotText.style.maxHeight === "") {
        plotText.style.maxHeight = 'none'; // Show full plot
        plotText.style.display = 'block';  
        button.textContent = "Read Less"; 
    } else {
        plotText.style.maxHeight = '4.5em'; // Limit to 3 lines
        button.textContent = "Read More"; 
    }
    }

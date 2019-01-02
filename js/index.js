document.addEventListener("DOMContentLoaded", function() {
    let searchButton = document.getElementById("searchButton");
    let searchValue = document.getElementById("searchMovie").value;
    let searchType = document.getElementById('searchType').value;
    let searchContainer = document.getElementById("searchContainer");
    let movieContainer = document.getElementById("movieContainer");
    let loadMore = document.getElementById("loadMore"); 
    let pages = 1;
    let currentPage = 1;

    searchButton.addEventListener("click", getData, true);
    loadMore.addEventListener("click", loadMoreData, true);

    /**
     * 
     * @param {HTMLElement} el 
     * Funtion to scroll the focused/selected element to top of the Viewport
     */
    function scrollIt(el) {
        document.documentElement.scrollTop = el.offsetTop - 50;
        document.body.scrollTop = el.offsetTop - 50;
    }

    /**
     * 
     * @param {MouseEvent} event 
     * Function to make an AJAX request to get the JSON data based on the search value and create the tile markup
     */
    function getData(event) {
        event.preventDefault();
        let newSearchValue = document.getElementById("searchMovie").value;
        let newSearchType = document.getElementById("searchType").value;
        let movieSearchField = document.getElementById("movieSearchField");
        let type = '';
        currentPage = 1;
        if (newSearchValue === null || newSearchValue === "") {
            movieSearchField.classList.add("error");
        }
        if (newSearchValue === searchValue && searchType === newSearchType) {
            return;
        }
        if (newSearchValue !== null && newSearchValue !== "") {
            searchValue = newSearchValue;
            searchType = newSearchType;
            movieSearchField.classList.remove("error");
            movieContainer.innerHTML = "";
        }
        searchContainer.classList.add("top");
        loadMore.classList.add("hide");
        if (searchType === 'movie' || searchType === 'series') {
            type = `&type=${searchType}`
        }

        let requestURL = `http://www.omdbapi.com/?apikey=aba065d3&s=${searchValue}${type}`;
        let request = new XMLHttpRequest();
        request.open("GET", requestURL, true);

        request.onload = function() {
            let data = JSON.parse(this.response);
            if (request.status >= 200 && request.status < 400) {
                loadData(data);
            } else {
                const errorMessage = document.createElement("p");
                errorMessage.textContent = `Network Error, Please try after sometime`;
                errorMessage.setAttribute('class', 'no-result-error');
                movieContainer.textContent = "";
                movieContainer.appendChild(errorMessage, movieContainer.childNodes[0]);
            }
        };
        // Send request
        request.send();
    }

    /**
     * 
     * @param {MouseEvent} event 
     * Function to load more data based on availabity and type
     */
    function loadMoreData(event) {
        event.preventDefault();
        let type = '';
        if (searchType === 'movie' || searchType === 'series') {
            type = `&type=${searchType}`
        }
        let requestURL = `http://www.omdbapi.com/?apikey=aba065d3&s=${searchValue}&page=${currentPage}${type}`;
        let request = new XMLHttpRequest();
        request.open("GET", requestURL, true);
        request.onload = function() {
            // Begin accessing JSON data here
            let data = JSON.parse(this.response);
            if (request.status >= 200 && request.status < 400) {
                loadData(data);
            } else {
                const errorMessage = document.createElement("p");
                errorMessage.textContent = `Network Error, Please try after sometime`;
                errorMessage.setAttribute('class', 'no-result-error');
                movieContainer.textContent = "";
                movieContainer.appendChild(errorMessage, movieContainer.childNodes[0]);
            }
        };
        // Send request
        request.send();
    }

    /**
     * 
     * @param {JSON Object} data
     * Loads the Data, creates and appends the HTML Element to show the data on the page
     */
    function loadData(data) {
        let dataList = data.Search;
        let poster;

        pages = Math.ceil(data.totalResults / 10);
        if (dataList) {
            dataList.forEach(movie => {
                const tile = document.createElement("div");
                tile.setAttribute("class", "movie");
                tile.setAttribute("tabIndex", "-1");

                tile.addEventListener("click", showEl, true);

                const imgContainer = document.createElement("div");
                imgContainer.setAttribute("class", "movie-poster-container");

                if (movie.Poster != "N/A") {
                    poster = document.createElement("img");
                    poster.src = movie.Poster;
                    poster.setAttribute("class", "movie-poster");
                } else {
                    poster = document.createElement("div");
                    poster.setAttribute("class", "movie-poster noImage");
                    poster.textContent = "No Image";
                }

                const detailsContainer = document.createElement("div");
                detailsContainer.setAttribute("class", "movie-details-container");

                const movieDetailsContainer = document.createElement("div");
                movieDetailsContainer.setAttribute("class", "movie-details");

                const title = document.createElement("p");
                title.textContent = movie.Title;
                title.setAttribute("class", "movie-title");

                const type = document.createElement("p");
                type.textContent = movie.Type;
                type.setAttribute("class", "movie-type");

                movieContainer.appendChild(tile);
                tile.appendChild(imgContainer);
                imgContainer.appendChild(poster);
                tile.appendChild(detailsContainer);
                detailsContainer.appendChild(title);
                detailsContainer.appendChild(type);
                tile.appendChild(movieDetailsContainer);

                loadDetails(movie, tile);
            });
            loadMore.classList.remove("hide");
            // Hide the View More Movies Link if all the movies are displayed
            console.log('Current Page: ' + currentPage);
            console.log('Pages: ' + pages);
            if (currentPage >= pages) {
                loadMore.classList.add("hide");
            } else {
                currentPage++;
            }
        } else {
            if (searchValue === null || searchValue === "") {
                movieSearchField.classList.add("error");
                return;
            }
            const errorMessage = document.createElement("p");
            errorMessage.textContent = `No Results found, please try another title`;
            errorMessage.setAttribute('class', 'no-result-error');
            movieContainer.textContent = "";
            movieContainer.appendChild(errorMessage, movieContainer.childNodes[0]);
        }
    }


    /**
     * 
     * @param {MouseEvent} event 
     * Expands and closes the tile to show more information on that tile.
     */
    function showEl(event) {
        let targetElem = event.target;
        let expandedList = document.getElementsByClassName("expand");
        while (!targetElem.classList.contains("movie")) {
            targetElem = targetElem.parentElement;
        }
        if (targetElem.classList.contains("expand")) {
            targetElem.classList.remove("expand");
        } else {
            if (expandedList.length > 0) {
                for (let i = 0; i < expandedList.length; i++) {
                    expandedList[i].classList.remove("expand");
                }
            }
            targetElem.classList.add("expand");
            scrollIt(targetElem);
        }
    }

    /**
     * 
     * @param {JSON} data 
     * @param {HTMLElement} tile 
     * Loads the JSON data with the Details related to the specfic data passed as param
     */
    function loadDetails(data, tile) {
        if (data.imdbID) {
            let detailsRequestURL = `http://www.omdbapi.com/?apikey=aba065d3&i=${data.imdbID}`;
            let detailsRequest = new XMLHttpRequest();
            detailsRequest.open("GET", detailsRequestURL, true);
            detailsRequest.onload = function() {
                let data = JSON.parse(this.response);
                let movieDetails = `<h3 class="movie-title">${data.Title}</h3>
                                    <div>
                                        <span>${data.Year}</span>&nbsp
                                        <span>${
                                          data.Rated === "N/A" ? "NOT RATED"
                                            : data.Rated
                                        }</span>&nbsp
                                        <span> ${
                                            data.Type === "series" ? 
                                                data.totalSeasons > 1 ? 
                                                    data.totalSeasons+' Seasons'
                                                    : data.totalSeasons+' Season'
                                            : data.Runtime
                                        }
                                        </span>&nbsp
                                        <span>${data.Language}</span>
                                    </div>
                                    <p><strong>Genre : </strong>${data.Genre}</p>
                                    <p class="movie-plot">${data.Plot}</p>
                                    ${data.Awards !== 'N/A' ? `<p class="awards"><cite>${data.Awards}</cite></p>` : ''}
                                    <p><strong>Starring : </strong>${data.Actors}</p>
                                    ${data.Writer !== 'N/A' ? `<p><strong>Writer : </strong>${data.Writer}</p>` : ''}
                                    ${data.Director !== 'N/A' ? `<p><strong>Director : </strong>${data.Director}</p>` : ''}`;
                if (detailsRequest.status >= 200 && detailsRequest.status < 400) {
                    tile.querySelector('.movie-details').innerHTML = movieDetails;
                }
            };
            detailsRequest.send();
        }
    }
});
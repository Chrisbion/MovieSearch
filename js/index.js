document.addEventListener("DOMContentLoaded", function() {
    let search = document.getElementById("searchButton");
    let searchValue = document.getElementById("searchMovie").value;
    let searchContainer = document.getElementById("searchContainer");
    let movieContainer = document.getElementById("movieContainer");
    let loadMore = document.getElementById("loadMore");
    search.addEventListener("click", getData, true);

    function scrollIt(el) {
        document.documentElement.scrollTop = el.offsetTop - 50;
        document.body.scrollTop = el.offsetTop - 50;
    }
    // Function to make an AJAX request to get the JSON data with the movie details and create the tile markup
    function getData(event) {
        event.preventDefault();
        let newSearchValue = document.getElementById("searchMovie").value;
        let pages = 1;
        let currentPage = 1;
        let newURL = null;
        let movieSearchField = document.getElementById("movieSearchField");
        if (newSearchValue === null || newSearchValue === "") {
            movieSearchField.classList.add("error");
        }
        if (newSearchValue == searchValue) {
            return;
        }
        if (newSearchValue !== null && newSearchValue !== "") {
            searchValue = newSearchValue;
            movieSearchField.classList.remove("error");
            movieContainer.innerHTML = "";
        }
        searchContainer.classList.add("top");
        loadMore.classList.add("hide");
        let requestURL = `http://www.omdbapi.com/?apikey=aba065d3&s=${searchValue}&page=${currentPage}`;
        let request = new XMLHttpRequest();

        request.open("GET", requestURL, true);

        request.onload = function() {
            // Begin accessing JSON data here
            let data = JSON.parse(this.response);
            let poster;
            if (request.status >= 200 && request.status < 400) {
                let dataList = data.Search;
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
                    if (currentPage >= pages) {
                        loadMore.classList.add("hide");
                    } else {
                        currentPage++;
                    }
                    loadMore.addEventListener("click", loadMoreData, true);
                } else {
                    if (searchValue === null || searchValue === "") {
                        movieSearchField.classList.add("error");
                        return;
                    }
                    const errorMessage = document.createElement("p");
                    errorMessage.textContent = `No Results found, try another title`;
                    errorMessage.setAttribute('class', 'no-result-error');
                    movieContainer.textContent = "";
                    movieContainer.appendChild(errorMessage, movieContainer.childNodes[0]);
                }
            } else {
                alert('Error');
            }
        };
        //Function to load more movie list
        function loadMoreData(event) {
            event.preventDefault();
            requestURL = `http://www.omdbapi.com/?apikey=aba065d3&s=${searchValue}&page=${currentPage}`;
            request.open("GET", requestURL, true);
            request.send();
        }

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
                                              data.Rated == "N/A" ? "NOT RATED"
                                                : data.Rated
                                            }</span>&nbsp
                                            <span>${data.Runtime}</span>&nbsp
                                            <span>${data.Language}</span>
                                        </div>
                                        <p>Genre : ${data.Genre}</p>
                                        <p>${data.Plot}</p>
                                        <p>Director : ${data.Director}</p>
                                        <p>Actors: ${data.Actors}</p>`;
                    if (request.status >= 200 && request.status < 400) {
                        tile.querySelector('.movie-details').innerHTML = movieDetails;
                    }
                };
                detailsRequest.send();
            }
        }
        // Send request
        request.send();
    }
});
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
let filteredMovies = [];
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const MOVIES_PER_PAGE = 12;
const switchMode = document.querySelector("#change-mode");
const switchToList = document.querySelector("#list-mode-btn");
const switchToCard = document.querySelector("#card-mode-btn");

// 函式：載入電影列表（清單）
function renderMovieList(data) {
  let listHTML = "";
  data.forEach((item) => {
    // title, image
    listHTML += `
  <li class="list-group-item d-flex justify-content-between align-items-center">${item.title}
  <div>
    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
  </div>
  </li>
`;
  });
  let rawHTML = '<ul class="list-group">' + listHTML + "</ul>";
  dataPanel.innerHTML = rawHTML;
}

// 函式：載入電影列表（卡片）
function renderMovieCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// 函式：載入分頁
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPage; page++) {
    if (page === 1) {
      rawHTML += `<li class="page-item"><a class="page-link active" href="#" data-page="${page}">${page}</a></li>`;
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

// 函式：依據分頁載入電影
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 函式：載入電影資訊卡
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fuid">`;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
  });
}

// 函式：加入最愛
function addToFavorite(id) {
  function isMovieIdMatch(movie) {
    return movie.id === id;
  }
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find(isMovieIdMatch);
  if (list.some(isMovieIdMatch)) {
    return alert("此電影已在收藏清單中");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 函式：電影顯示方式
function activeModePage(data) {
  if (switchToList.matches(".active")) {
    return renderMovieList(data);
  }
  if (switchToCard.matches(".active")) {
    return renderMovieCard(data);
  }
}

// 電影資訊鈕
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 搜尋功能
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword);
  }
  currentPage = 1;
  renderPaginator(filteredMovies.length);
  activeModePage(getMoviesByPage(currentPage));
});

// 分頁器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  document
    .getElementById("paginator")
    .getElementsByClassName("active")[0]
    .classList.remove("active");
  event.target.classList.add("active");
  currentPage = page;
  activeModePage(getMoviesByPage(page));
});

// 改變顯示模式
switchMode.addEventListener("click", function onModeClicked(event) {
  if (event.target.matches("#list-mode-btn")) {
    switchToList.classList.add("active");
    switchToCard.classList.remove("active");
    renderMovieList(getMoviesByPage(currentPage));
  }
  if (event.target.matches("#card-mode-btn")) {
    switchToCard.classList.add("active");
    switchToList.classList.remove("active");
    renderMovieCard(getMoviesByPage(currentPage));
  }
});

// API
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  renderMovieCard(getMoviesByPage(1));
});

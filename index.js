const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const MOVIES_PER_PAGE = 12

function renderMovieList(data){
  let rawHTML =''
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount){
 const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
 let rawHTML = ''

 for (let page = 1;page <= numberOfPage; page++ ){
   rawHTML += `    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
`
 }
 paginator.innerHTML = rawHTML
}

function getMoviesByPage(page){
  // page 1 > movies 0 - 11
  // page 2 > movies 12 - 23
  // page 3 > movies 24 - 35
  // ...

  const data = filteredMovies.length ? filteredMovies : movies
  // 如果 filteredMovies 有長度就給 filteredMovies，如果沒有就給 movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  

  axios.get(INDEX_URL + id).then((response) =>{
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid">`
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function addToFavorite(id){
  function isMovieIdMatch(movie){
    return movie.id === id
  }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(isMovieIdMatch)

  if (list.some(isMovieIdMatch)){
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)
  
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click',function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')){
    showMovieModal(event.target.dataset.id)
  } else if(event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
    }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event){
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  


  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if(filteredMovies.length ===0){
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

axios.get(INDEX_URL).then((response) => {
movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})


const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const movieDetailsContainer = document.getElementById('movieDetails');
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/vistos';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';

let filmesVistos = [];
let filmesFavoritos = [];
let filmesMaisTarde = [];

async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
  }
}

async function fetchMovieCredits(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao procurar o elenco e o realizador:', error);
  }
}

async function atualizarIcones() {
  try {
    filmesVistos = await fetchWatched();
    filmesFavoritos = await fetchFavorites();
    filmesMaisTarde = await fetchLater();

    document.querySelectorAll('.watched-btn').forEach(button => {
      const movieId = parseInt(button.dataset.id);
      const isWatched = filmesVistos.some(view => view.id_tmdb === movieId);
      button.querySelector('.fa-eye').style.color = isWatched ? 'green' : 'gray';
    });

    document.querySelectorAll('.favorite-btn').forEach(button => {
      const movieId = parseInt(button.dataset.id);
      const isFavorito = filmesFavoritos.some(fav => fav.id_tmdb === movieId);
      button.querySelector('.fa-heart').style.color = isFavorito ? 'red' : 'gray';
    });

    document.querySelectorAll('.later-btn').forEach(button => {
      const movieId = parseInt(button.dataset.id);
      const isLater = filmesMaisTarde.some(lat => lat.id_tmdb === movieId);
      button.querySelector('.fa-bookmark').style.color = isLater ? 'blue' : 'gray';
    });
  } catch (error) {
    console.error('Erro ao atualizar ícones:', error);
  }
}

async function displayMovieDetails() {
  const movie = await fetchMovieDetails(movieId);
  const credits = await fetchMovieCredits(movieId);
  const isVisto = filmesVistos.some(view => view.id_tmdb === movie.id);
  const isFavorito = filmesFavoritos.some(fav => fav.id_tmdb === movie.id);
  const isMaisTarde = filmesMaisTarde.some(lat => lat.id_tmdb === movie.id);

  if (movie) {
    const directors = credits.crew?.filter(person => person.job === 'Director');
    const directorsHtml = directors.length ? directors.map(director => `<a href="00-realizadores.html?id=${director.id}"><span class="highlight">${director.name}</span></a>`).join(', ') : 'Não disponível';
    const cast = credits.cast?.slice(0, 5).map(actor => `<a href="00-atores.html?id=${actor.id}">${actor.name}</a>`).join(', ') || 'Não disponível';

    movieDetailsContainer.innerHTML = `
      <div class="filme-card container">
        <div class="separar-img">
            <img class="filmes-cartaz" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        </div>
        <div class="separar-text">
            <div class="info">
                <h1 class="filme-titulo">${movie.title}</h1>
                <p class="filme-ano">${movie.release_date ? movie.release_date.split('-')[0] : 'Ano não disponível'}</p>
                <p class="filme-realizador">Realizado por ${directorsHtml}</p>
            </div>
            <div class="plot">
                <p class="filme-plot">${movie.overview || 'Sinopse não disponível.'}</p>
                <p class="movie-genre"><strong class="white">Géneros:</strong> ${movie.genres?.map(genre => genre.name).join(', ') || 'Não disponível'}</p>
                <p class="movie-genre"><strong class="white">Elenco:</strong> ${cast}</p>
                <p class="movie-genre"><strong class="white">Duração:</strong> ${movie.runtime ? movie.runtime + ' min' : 'Não disponível'}</p>
                <div class="icones">
                  <a class="cor-icones watched-btn" data-id="${movie.id}" href="#" style="color: ${isVisto ? 'green' : 'gray'};">
                    <i class="fa-solid fa-eye"></i>
                  </a>
                  <a class="cor-icones favorite-btn" data-id="${movie.id}" href="#" style="color: ${isFavorito ? 'red' : 'gray'};">
                    <i class="fa-solid fa-heart"></i>
                  </a>
                  <a class="cor-icones later-btn" data-id="${movie.id}" href="#" style="color: ${isMaisTarde ? 'blue' : 'gray'};">
                    <i class="fa-solid fa-bookmark"></i>
                  </a>
                </div>
            </div>
        </div>
      </div>
    `;
    atualizarIcones();

    document.querySelectorAll('.watched-btn').forEach(button => {
      button.addEventListener('click', toggleWatched);
    });
    document.querySelectorAll('.favorite-btn').forEach(button => {
      button.addEventListener('click', toggleFavorite);
    });
    document.querySelectorAll('.later-btn').forEach(button => {
      button.addEventListener('click', toggleLater);
    });
  } else {
    movieDetailsContainer.innerHTML = `<p>Erro ao carregar os detalhes do filme.</p>`;
  }
}

async function fetchWatched() {
  try {
    const response = await fetch(mockApiVistos);
    return await response.json();
  } catch (error) {
    console.error('Erro ao procurar filmes já vistos.', error);
    return [];
  }
}
async function fetchFavorites() {
  try {
    const response = await fetch(mockApiFavoritos);
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar favoritos.', error);
    return [];
  }
}
async function fetchLater() {
  try {
    const response = await fetch(mockApiMaisTarde);
    return await response.json();
  } catch (error) {
    console.error('Erro ao procurar filmes para ver mais tarde.', error);
    return [];
  }
}
async function toggleWatched(event) {
  event.preventDefault();
  const button = event.target.closest('.watched-btn');
  const movieId = parseInt(button.dataset.id);
  const vistos = await fetchWatched();
  const isWatched = vistos.some(view => view.id_tmdb === movieId);

  if (isWatched) {
    const visto = vistos.find(view => view.id_tmdb === movieId);
    await fetch(`${mockApiVistos}/${visto.id}`, { method: 'DELETE' });
  } else {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-PT&append_to_response=credits`);
    const movieData = await response.json();
    const movieInfo = {
      id_tmdb: movieId,
      realizador: movieData.credits?.crew?.find(p => p.job === "Director")?.name || "Desconhecido",
      actor: movieData.credits?.cast?.slice(0, 5).map(a => a.name).join(", ") || "Desconhecido",
      tempo: movieData.runtime || 0,
      genero: movieData.genres?.map(g => g.name).join(", ") || "Desconhecido",
      data: new Date().toISOString()
    };
    await fetch(mockApiVistos, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieInfo)
    });
  }
  button.querySelector('.fa-eye').style.color = isWatched ? 'gray' : 'green';
}
async function toggleFavorite(event) {
  event.preventDefault();
  const button = event.target.closest('.favorite-btn');
  const movieId = parseInt(button.dataset.id);
  const favoritos = await fetchFavorites();
  const isFavorite = favoritos.some(fav => fav.id_tmdb === movieId);

  if (isFavorite) {
    const favorito = favoritos.find(fav => fav.id_tmdb === movieId);
    await fetch(`${mockApiFavoritos}/${favorito.id}`, { method: 'DELETE' });
  } else {
    await fetch(mockApiFavoritos, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tmdb: movieId, data: new Date().toISOString() })
    });
    await addToWatchedIfNeeded(movieId);
  }
  button.querySelector('.fa-heart').style.color = isFavorite ? 'gray' : 'red';
}
async function addToWatchedIfNeeded(movieId) {
  const vistos = await fetchWatched();
  const isWatched = vistos.some(view => view.id_tmdb === movieId);

  if (!isWatched) {
    await fetch(mockApiVistos, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tmdb: movieId, data: new Date().toISOString() })
    });

    const watchedButton = document.querySelector(`.watched-btn[data-id="${movieId}"]`);
    if (watchedButton) {
      watchedButton.querySelector('.fa-eye').style.color = 'green';
    }
  }
}
async function toggleLater(event) {
  event.preventDefault();
  const button = event.target.closest('.later-btn');
  const movieId = parseInt(button.dataset.id);
  const maisTarde = await fetchLater();
  const isLater = maisTarde.some(lat => lat.id_tmdb === movieId);

  if (isLater) {
    const maiTarde = maisTarde.find(lat => lat.id_tmdb === movieId);
    await fetch(`${mockApiMaisTarde}/${maiTarde.id}`, { method: 'DELETE' });
  } else {
    await fetch(mockApiMaisTarde, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tmdb: movieId, data: new Date().toISOString() })
    });
  }
  button.querySelector('.fa-bookmark').style.color = isLater ? 'gray' : 'blue';
}

displayMovieDetails();

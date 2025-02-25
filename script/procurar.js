const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/vistos';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';

let filmesVistos = [];
let filmesFavoritos = [];
let filmesMaisTarde = [];

async function procurarFilme(nomeFilme) {
  try {

    if (!filmesVistos.length) filmesVistos = await fetchWatched();
    if (!filmesFavoritos.length) filmesFavoritos = await fetchFavorites();
    if (!filmesMaisTarde.length) filmesMaisTarde = await fetchLater();


    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(nomeFilme)}&api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();


    const searchResults = document.getElementById("searchResults");
    const searchQueryText = document.getElementById("searchQueryText");
    const searchQuery = document.getElementById("searchQuery");


    searchResults.innerHTML = "";

    if (data.results && data.results.length > 0) {
      searchQueryText.style.display = "block";
      searchQuery.textContent = nomeFilme;

      data.results.forEach(filme => {
        if (!filme.poster_path) return;

        const isVisto = filmesVistos.some(view => view.id_tmdb === filme.id);
        const isFavorito = filmesFavoritos.some(fav => fav.id_tmdb === filme.id);
        const isMaisTarde = filmesMaisTarde.some(lat => lat.id_tmdb === filme.id);

        const filmeHTML = `
          <div class="col-md-3 col-sm-6 mb-4">
            <div class="filme-card separar-img">
              <a href="00-filmes.html?id=${filme.id}">
                <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="filme-cartaz" alt="${filme.title}">
              </a>
            </div>
            <div class="icones">
              <a class="cor-icones watched-btn" data-id="${filme.id}" href="#" style="color: ${isVisto ? 'green' : 'gray'};">
                <i class="fa-solid fa-eye"></i>
              </a>
              <a class="cor-icones favorite-btn" data-id="${filme.id}" href="#" style="color: ${isFavorito ? 'red' : 'gray'};">
                <i class="fa-solid fa-heart"></i>
              </a>
              <a class="cor-icones later-btn" data-id="${filme.id}" href="#" style="color: ${isMaisTarde ? 'blue' : 'gray'};">
                <i class="fa-solid fa-bookmark"></i>
              </a>
            </div>
          </div>
        `;
        searchResults.innerHTML += filmeHTML;
      });


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
      searchQueryText.style.display = "block";
      searchQuery.textContent = nomeFilme;
      searchResults.innerHTML = "<p>Nenhum filme encontrado.</p>";
    }
  } catch (erro) {
    console.error('Erro ao buscar filme:', erro);
  }
}

document.getElementById("searchForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const nomeFilme = document.getElementById("searchInput").value.trim();
  if (nomeFilme) {
    procurarFilme(nomeFilme);
  }
});

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
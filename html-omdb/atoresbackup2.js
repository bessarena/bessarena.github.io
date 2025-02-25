const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const actorContainer = document.getElementById("detalhesActor");
const nameActor = document.getElementById('tituloActor');
const urlParams = new URLSearchParams(window.location.search);
const actorId = urlParams.get('id');
const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';

if (actorId) {
  detalhesActor(actorId);
  nomeActor(actorId);
}

async function nomeActor(actorId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();
    nameActor.innerHTML = `Filmes com: ${data.name}`;
  } catch (error) {
    console.error('Erro a procurar filmes do actor.', error);
  }
}

async function detalhesActor(actorId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();
    const filmesActuados = data.cast
      .filter(movie => movie.vote_count > 400 && movie.overview != '')
      .sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

    const favoritos = await fetchFavorites(); // Busca os favoritos para marcar os filmes já favoritos

    actorContainer.innerHTML = filmesActuados.map(filme => {
      const isFavorito = favoritos.some(fav => fav.id_tmdb === filme.id);
      return `
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="filme-card">
            <a href="00-filmes.html?id=${filme.id}">
              <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="filme-cartaz" alt="${filme.title}">
            </a>
          </div>
          <div class="icones">
            <a class="cor-icones" href="#">
            <i class="fa-solid fa-eye"></i>
            </a>
            <a class="cor-icones favorite-btn" href="#" data-id="${filme.id}">
              <i class="fa-solid fa-heart" style="color: ${isFavorito ? 'red' : 'gray'};"></i>
            </a>
            <a class="cor-icones" href="#">
              <i class="fa-solid fa-bookmark"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Adiciona event listeners aos botões de favorito
    document.querySelectorAll('.favorite-btn').forEach(button => {
      button.addEventListener('click', toggleFavorite);
    });

  } catch (error) {
    console.error('Erro a procurar filmes do actor.', error);
  }
}

// Função para buscar os favoritos na Mock API
async function fetchFavorites() {
  try {
    const response = await fetch(mockApiFavoritos);
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar favoritos.', error);
    return [];
  }
}

// Função para favoritar ou remover favorito
async function toggleFavorite(event) {
  event.preventDefault();
  const button = event.target.closest('.favorite-btn');
  const movieId = parseInt(button.dataset.id);
  const favoritos = await fetchFavorites();
  const isFavorite = favoritos.some(fav => fav.id_tmdb === movieId);

  if (isFavorite) {
    // Remove da Mock API
    const favorito = favoritos.find(fav => fav.id_tmdb === movieId);
    await fetch(`${mockApiFavoritos}/${favorito.id}`, { method: 'DELETE' });
  } else {
    // Adiciona à Mock API com data atual
    await fetch(mockApiFavoritos, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_tmdb: movieId, data: new Date().toISOString() })
    });
  }

  // Atualiza a cor do coração sem recarregar a página
  button.querySelector('.fa-heart').style.color = isFavorite ? 'gray' : 'red';
}

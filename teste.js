const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/vistos';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';

const urlTop = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=pt-PT&page=1`;
const filmesContainer = document.getElementById('filmesGoat');

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

fetch(urlTop)
  .then(response => response.json())
  .then(data => {
    console.log(data)
    filmesContainer.innerHTML = data.results.map(filme => {
      const isVisto = false;
      const isFavorito = false;
      const isMaisTarde = false;
      return `          <div class="col-md-3 col-sm-6 mb-4">
                          <div class="filme-card">
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
                        `
    }).join('');
  })
  .catch(error => console.error('Erro ao buscar filmes:', error));

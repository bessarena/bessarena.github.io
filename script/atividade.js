const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/vistos';
const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';

async function carregarEstatisticas() {
  try {
    const response = await fetch(mockApiVistos);
    const filmesVistos = await response.json();

    let totalTempoVisto = 0;
    const generos = {};
    const realizadores = {};
    const actores = {};

    filmesVistos.forEach(filme => {
      totalTempoVisto += filme.tempo;

      if (filme.genero) {
        filme.genero.split(',').forEach(genero => {
          if (generos[genero]) {
            generos[genero] += 1;
          } else {
            generos[genero] = 1;
          }
        });
      }

      if (filme.realizador) {
        if (realizadores[filme.realizador]) {
          realizadores[filme.realizador] += 1;
        } else {
          realizadores[filme.realizador] = 1;
        }
      }

      if (filme.actor) {
        filme.actor.split(',').forEach(ator => {
          if (actores[ator]) {
            actores[ator] += 1;
          } else {
            actores[ator] = 1;
          }
        });
      }
    });

    const generoPreferido = Object.keys(generos).reduce((a, b) => generos[a] > generos[b] ? a : b);
    const realizadorPreferido = Object.keys(realizadores).reduce((a, b) => realizadores[a] > realizadores[b] ? a : b);
    const actorPreferido = Object.keys(actores).reduce((a, b) => actores[a] > actores[b] ? a : b);

    document.getElementById('stats').innerHTML = `
            <h6>Género Preferido: <strong class="highlight">${generoPreferido}</strong></h6>
            <h6>Realizador Preferido: <strong class="highlight">${realizadorPreferido}</strong></h6>
            <h6>Ator Preferido: <strong class="highlight">${actorPreferido}</strong></h6>
            <h6>Tempo Total Visto: <strong class="highlight">${totalTempoVisto} minutos</strong></h6>
        `;
  } catch (error) {
    console.error('Erro a carregar os filmes vistos:', error);
  }
}

async function exibirUltimosVistos() {
  try {
    const response = await fetch(mockApiVistos);
    const filmesVistos = await response.json();

    if (filmesVistos.length === 0) {
      document.getElementById('ultimosVistos').innerHTML = '<p>Nenhum filme visto ainda.</p>';
      return;
    }

    const filmesDetalhes = await Promise.all(
      filmesVistos.map(async (filme) => {
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${filme.id_tmdb}?api_key=${apiKey}&language=pt-PT`);
        return tmdbResponse.json();
      })
    );

    const filmesGoatContainer = document.getElementById('ultimosVistos');
    filmesGoatContainer.innerHTML = filmesDetalhes.map(filme => `
      <div class="col-md-3 col-sm-6 mb-4">
        <div class="filme-card">
          <a href="00-filmes.html?id=${filme.id}">
            <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="filme-cartaz" alt="${filme.title}">
          </a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar filmes vistos:', error);
    document.getElementById('ultimosVistos').innerHTML = '<p>Erro ao carregar filmes vistos.</p>';
  }
}

async function exibirFavoritos() {
  try {
    const response = await fetch(mockApiFavoritos);
    const filmesFavoritos = await response.json();

    if (filmesFavoritos.length === 0) {
      document.getElementById('favoritos').innerHTML = '<p>Nenhum filme favorito.</p>';
      return;
    }

    const filmesDetalhes = await Promise.all(
      filmesFavoritos.map(async (filme) => {
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${filme.id_tmdb}?api_key=${apiKey}&language=pt-PT`);
        return tmdbResponse.json();
      })
    );

    const favoritosContainer = document.getElementById('favoritos');
    favoritosContainer.innerHTML = filmesDetalhes.map(filme => `
      <div class="col-md-3 col-sm-6 mb-4">
        <div class="filme-card">
          <a href="00-filmes.html?id=${filme.id}">
            <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="filme-cartaz" alt="${filme.title}">
          </a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar filmes favoritos:', error);
    document.getElementById('favoritos').innerHTML = '<p>Erro ao carregar filmes favoritos.</p>';
  }
}
carregarEstatisticas();
exibirUltimosVistos();
exibirFavoritos();

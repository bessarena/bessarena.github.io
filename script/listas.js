const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';

async function exibirFilmesParaMaisTarde() {
  try {
    const response = await fetch(mockApiMaisTarde);
    const filmesMaisTarde = await response.json();

    if (filmesMaisTarde.length === 0) {
      filmesGoatContainer.innerHTML = '<p>Nenhum filme guardado para mais tarde.</p>';
      return;
    }

    const filmesDetalhes = await Promise.all(
      filmesMaisTarde.map(async (filme) => {
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${filme.id_tmdb}?api_key=${apiKey}&language=pt-PT`);
        return tmdbResponse.json();
      })
    );

    const filmesGoatContainer = document.getElementById('filmesGoat');
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
    console.error('Erro ao carregar filmes para mais tarde:', error);
    filmesGoatContainer.innerHTML = '<p>Erro ao carregar filmes para mais tarde.</p>';
  }
}

exibirFilmesParaMaisTarde();

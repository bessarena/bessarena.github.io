const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const mockApiSubscreverActor = 'https://6780538e85151f714b067a6a.mockapi.io/subscricoes';
const mockApiSubscreverDirector = 'https://6780538e85151f714b067a6a.mockapi.io/subscricoesD';
const subscricoesContainer = document.getElementById('subscricoesFilmes');

async function proximosActor(actorId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`);
    const data = await response.json();
    return data.cast || [];
  } catch (error) {
    console.error(`Erro ao obter filmes do ator ${actorId}.`, error);
    return [];
  }
}

async function proximosDirector(directorId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/${directorId}/movie_credits?api_key=${apiKey}`);
    const data = await response.json();
    return data.crew || [];
  } catch (error) {
    console.error(`Erro ao obter filmes do realizador ${directorId}.`, error);
    return [];
  }
}

function filtrarFilmes(filmes) {
  return filmes.filter(filme => filme.overview && filme.vote_count > 1000);
}

function renderizarFilmes(atoresEDiretores) {
  if (atoresEDiretores.length === 0) {
    subscricoesContainer.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  subscricoesContainer.innerHTML = atoresEDiretores.map(({ nome, filmes }) => {
    return `
      <div class="subscricao-section">
        <h2>${nome}</h2>
        <div class="row">
          ${filmes.slice(0, 4).map(filme => `
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="filme-card">
                <a href="00-filmes.html?id=${filme.id}">
                  <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="filme-cartaz" alt="${filme.title}">
                </a>
              </div>
              <div class="icones">
                <a class="cor-icones watched-btn" data-id="${filme.id}" href="#"><i class="fa-solid fa-eye"></i></a>
                <a class="cor-icones favorite-btn" data-id="${filme.id}" href="#"><i class="fa-solid fa-heart"></i></a>
                <a class="cor-icones later-btn" data-id="${filme.id}" href="#"><i class="fa-solid fa-bookmark"></i></a>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

async function mostrarFilmes() {
  try {
    const filmesDeAtores = await proximosFilmesActor();
    const filmesDeDiretores = await proximosFilmesDirector();
    const atoresEDiretores = [];

    for (let subscricao of filmesDeAtores) {
      const actorId = subscricao.actorId;
      const filmes = await proximosActor(actorId);

      const filmesOrdenados = filmes.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      atoresEDiretores.push({
        nome: subscricao.actorName,
        filmes: filtrarFilmes(filmesOrdenados).slice(0, 4)
      });
    }

    for (let subscricao of filmesDeDiretores) {
      const directorId = subscricao.directorId;
      const filmes = await proximosDirector(directorId);

      const filmesOrdenados = filmes.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      atoresEDiretores.push({
        nome: subscricao.directorName,
        filmes: filtrarFilmes(filmesOrdenados).slice(0, 4)
      });
    }

    renderizarFilmes(atoresEDiretores);

  } catch (error) {
    console.error('Erro ao exibir os filmes.', error);
  }
}



async function mostrarFilmes() {
  try {
    const filmesDeAtores = await proximosFilmesActor();
    const filmesDeDiretores = await proximosFilmesDirector();
    const atoresEDiretores = [];

    for (let subscricao of filmesDeAtores) {
      const actorId = subscricao.actorId;
      const filmes = await proximosActor(actorId);
      atoresEDiretores.push({
        nome: subscricao.actorName,
        filmes: filtrarFilmes(filmes).slice(0, 4)
      });
    }

    for (let subscricao of filmesDeDiretores) {
      const directorId = subscricao.directorId;
      const filmes = await proximosDirector(directorId);
      atoresEDiretores.push({
        nome: subscricao.directorName,
        filmes: filtrarFilmes(filmes).slice(0, 4)
      });
    }

    renderizarFilmes(atoresEDiretores);

  } catch (error) {
    console.error('Erro ao exibir os filmes.', error);
  }
}

async function proximosFilmesActor() {
  try {
    const response = await fetch(mockApiSubscreverActor);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao processar as subscrições de atores.', error);
    return [];
  }
}

async function proximosFilmesDirector() {
  try {
    const response = await fetch(mockApiSubscreverDirector);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao processar as subscrições de diretores.', error);
    return [];
  }
}

mostrarFilmes();

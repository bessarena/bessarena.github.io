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

function renderizarFilmes(filmes) {
  if (filmes.length === 0) {
    subscricoesContainer.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  subscricoesContainer.innerHTML = filmes.map(filme => `
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
    </div>`).join('');
}


async function mostrarFilmes() {
  try {
    const filmesDeAtores = await proximosFilmesActor();
    const filmesDeDiretores = await proximosFilmesDirector();
    const todosFilmes = [...filmesDeAtores, ...filmesDeDiretores];

    const filmesUnicos = Array.from(new Set(todosFilmes.map(filme => filme.id)))
      .map(id => todosFilmes.find(filme => filme.id === id));

    const filmesOrdenados = filmesUnicos.sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
      const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
      return dateB - dateA;
    });

    const filmesValidos = filtrarFilmes(filmesOrdenados);

    renderizarFilmes(filmesValidos);

  } catch (error) {
    console.error('Erro ao exibir os filmes.', error);
  }
}

async function proximosFilmesActor() {
  try {
    const response = await fetch(mockApiSubscreverActor);
    const data = await response.json();
    const todosFilmes = [];

    for (let subscricao of data) {
      const actorId = subscricao.actorId;
      const filmes = await proximosActor(actorId);
      todosFilmes.push(...filmes);
    }

    return todosFilmes;

  } catch (error) {
    console.error('Erro ao processar as subscrições de atores.', error);
    return [];
  }
}

async function proximosFilmesDirector() {
  try {
    const response = await fetch(mockApiSubscreverDirector);
    const data = await response.json();
    const todosFilmes = [];

    for (let subscricao of data) {
      const directorId = subscricao.directorId;
      const filmes = await proximosDirector(directorId);
      todosFilmes.push(...filmes);
    }

    return todosFilmes;

  } catch (error) {
    console.error('Erro ao processar as subscrições de diretores.', error);
    return [];
  }
}

mostrarFilmes();

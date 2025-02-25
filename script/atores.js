const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/vistos';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';
const mockApiSubscrever = 'https://6780538e85151f714b067a6a.mockapi.io/subscricoes';
// API'S

const urlParams = new URLSearchParams(window.location.search);
const actorId = urlParams.get('id');
const actorContainer = document.getElementById("detalhesActor");
const nameActor = document.getElementById('tituloActor');
const cognomeActor = document.getElementById('nomeActor');
const imgActor = document.getElementById('imagemActor');
const subActor = document.getElementById('subscreverActor');

if (actorId) {
  subscreverActor(actorId);
  verificarSubscricao(actorId);
  detalhesActor(actorId);
  nomeActor(actorId);
}

async function subscreverActor(actorId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();
    cognomeActor.innerHTML = data.name;
    imgActor.src = `https://image.tmdb.org/t/p/w500${data.profile_path}`;
    subActor.innerHTML = "SUBSCREVER";
  } catch (error) {
    console.error('Erro ao subscrever actor.', error);
  }
}

async function verificarSubscricao(actorId) {
  try {
    const response = await fetch(mockApiSubscrever);
    const subscritos = await response.json();

    const atorSubscrito = subscritos.find(sub => sub.actorId === actorId);
    if (atorSubscrito) {
      subActor.innerHTML = "SUBSCRITO";
    } else {
      subActor.innerHTML = "SUBSCREVER";
    }
  } catch (error) {
    console.error('Erro ao verificar subscrição.', error);
  }
}

async function subscreverAtor() {
  try {
    const isSubscrito = subActor.innerHTML === "SUBSCRITO";

    if (!isSubscrito) {
      const response = await fetch(mockApiSubscrever, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId,
          actorName: cognomeActor.innerHTML
        }),
      });

      if (response.ok) {
        subActor.innerHTML = "SUBSCRITO";
      }
    } else {
      const response = await fetch(mockApiSubscrever);
      const subscritos = await response.json();
      const atorSubscrito = subscritos.find(sub => sub.actorId === actorId);

      if (atorSubscrito) {
        await fetch(`${mockApiSubscrever}/${atorSubscrito.id}`, { method: 'DELETE' });
        subActor.innerHTML = "SUBSCREVER";
      }
    }
  } catch (error) {
    console.error('Erro ao subscrever ator.', error);
  }
}

subActor.addEventListener('click', subscreverAtor);

async function nomeActor(actorId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}&language=pt-PT`);
    const data = await response.json();
    nameActor.innerHTML = `Filmes com <strong>${data.name}</strong>:`;
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
    const vistos = await fetchWatched();
    const favoritos = await fetchFavorites();
    const maisTarde = await fetchLater();

    actorContainer.innerHTML = filmesActuados.map(filme => {
      const isVisto = vistos.some(view => view.id_tmdb === filme.id);
      const isFavorito = favoritos.some(fav => fav.id_tmdb === filme.id);
      const isMaisTarde = maisTarde.some(lat => lat.id_tmdb === filme.id);
      return `
        <div class="col-md-3 col-sm-6 mb-4">
          <div class="filme-card">
            <a href="00-filmes.html?id=${filme.id}">
              <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="filme-cartaz" alt="${filme.title}">
            </a>
          </div>
          <div class="icones">
            <a class="cor-icones watched-btn" href="#" data-id="${filme.id}">
              <i class="fa-solid fa-eye" style="color: ${isVisto ? 'green' : 'gray'};"></i>
            </a>
            <a class="cor-icones favorite-btn" href="#" data-id="${filme.id}">
              <i class="fa-solid fa-heart" style="color: ${isFavorito ? 'red' : 'gray'};"></i>
            </a>
            <a class="cor-icones later-btn" href="#" data-id="${filme.id}">
              <i class="fa-solid fa-bookmark" style="color: ${isMaisTarde ? 'blue' : 'gray'};"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.watched-btn').forEach(button => {
      button.addEventListener('click', toggleWatched);
    });
    document.querySelectorAll('.favorite-btn').forEach(button => {
      button.addEventListener('click', toggleFavorite);
    });
    document.querySelectorAll('.later-btn').forEach(button => {
      button.addEventListener('click', toggleLater);
    });

  } catch (error) {
    console.error('Erro a procurar filmes do actor.', error);
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
      realizador: movieData.credits?.crew?.find(p => p.job === "Director")?.name,
      actor: movieData.credits?.cast?.slice(0, 5).map(a => a.name).join(", "),
      tempo: movieData.runtime,
      genero: movieData.genres?.map(g => g.name).join(", "),
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

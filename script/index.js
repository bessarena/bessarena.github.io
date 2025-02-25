const apiKey = '71ff1dd29f7be42cb6ec291911976a68';
let filmesVisiveis = false;
let categoriaAtual = null;
const filmesCategoriaContainer = document.getElementById('filmesCategoria');
const topSemana = document.querySelector('.emAlta');
const filmesGoatContainer = document.getElementById('filmesGoat')

const mockApiFavoritos = 'https://6780538e85151f714b067a6a.mockapi.io/favoritos';
const mockApiVistos = 'https://6780538e85151f714b067a6a.mockapi.io/vistos';
const mockApiMaisTarde = 'https://6780538e85151f714b067a6a.mockapi.io/maistarde';

let filmesVistos = [];
let filmesFavoritos = [];
let filmesMaisTarde = [];

async function fetchFilmes(categoria) {
    if (categoriaAtual === categoria) {
        filmesVisiveis = !filmesVisiveis;
        filmesCategoriaContainer.style.display = filmesVisiveis ? 'flex' : 'none';
        topSemana.style.display = filmesVisiveis ? 'block' : 'none';
        return;
    } else {
        categoriaAtual = categoria;
        filmesVisiveis = true;
        filmesCategoriaContainer.style.display = 'flex';
        topSemana.style.display = 'block';
    }

    let url = '';
    switch (categoria) {
        case 'Popular':
            url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-pt`;
            topSemana.textContent = `Os filmes mais vistos da semana:`;
            break;
        case 'Ação':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-pt&with_genres=28`;
            topSemana.textContent = `Os filmes mais populares de ação:`;
            break;
        case 'Animação':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-pt&with_genres=16`;
            topSemana.textContent = `Os filmes mais populares de animação:`;
            break;
        case 'Comédia':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-pt&with_genres=35`;
            topSemana.textContent = `Os filmes mais populares de comédia:`;
            break;
        case 'Documentários':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-BR&with_genres=99`;
            topSemana.textContent = `Os documentários mais populares da semana:`;
            break;
        case 'Drama':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-pt&with_genres=18`;
            topSemana.textContent = `Os filmes mais populares de drama:`;
            break;
        case 'Fantasia':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-pt&with_genres=14`;
            topSemana.textContent = `Os filmes mais populares de fantasia:`;
            break;
        case 'Terror':
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=pt-pt&with_genres=27`;
            topSemana.textContent = `Os filmes mais populares de terror:`;
            break;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        filmesCategoriaContainer.innerHTML = '';

        if (data.results.length > 0) {
            data.results.forEach(filme => {
                const isVisto = filmesVistos.some(view => view.id_tmdb === filme.id);
                const isFavorito = filmesFavoritos.some(fav => fav.id_tmdb === filme.id);
                const isMaisTarde = filmesMaisTarde.some(lat => lat.id_tmdb === filme.id);

                filmesCategoriaContainer.innerHTML += `
                    <div class="col-md-3 col-sm-6 mb-4">
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
                `;
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
            filmesCategoriaContainer.innerHTML = '<p>Sem filmes disponíveis nesta categoria.</p>';
        }
    } catch (error) {
        console.error('Erro ao procurar dados do filme:', error);
        filmesCategoriaContainer.innerHTML = '<p>Erro ao carregar filmes.</p>';
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

async function filmesGoat() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=pt-PT`);
        const data = await response.json();
        const isVisto = filmesVistos.some(view => view.id_tmdb === filme.id);
        const isFavorito = filmesFavoritos.some(fav => fav.id_tmdb === filme.id);
        const isMaisTarde = filmesMaisTarde.some(lat => lat.id_tmdb === filme.id);

        if (data.results.length > 0) {

            data.results.forEach(filme => {
                filmesGoatContainer.innerHTML += `
                    <div class="col-md-3 col-sm-6 mb-4">
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
                    </div>`;
            });
            atualizarIcones();

            // Attach event listeners to the dynamically created buttons
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
            filmesGoatContainer.innerHTML = '<p>Sem filmes populares disponíveis.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar filmes populares:', error);
        filmesGoatContainer.innerHTML = '<p>Erro ao carregar filmes populares.</p>';
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

    // Atualiza a cor do coração sem recarregar a página
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

filmesGoat()
const express = require('express'); // --> commonjs
const crypto = require('node:crypto');
const movies = require('./movies.json');
const { validateMovie, validateParcialMovie } = require('./schemas/movies');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)){
      return callback(null, true);
    } 
    if(!origin){ return callback(null, true); }
    else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.disable('x-powered-by');



app.get('/movies', (req, res) => {
  // const origin = req.header('origin');
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin);
  // }
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies);

  }
  res.json(movies);
})

app.post('/movies', (req, res) => {

  const result = validateMovie(req.body);
  if (result.error) {
    return res.status(400).json({ message: JSON.parse(result.error.message) });
  }
  //En base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie);
})

app.patch('/movies/:id', (req, res) => {
  const result = validateParcialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ message: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  return res.json(updateMovie);
})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin');
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin);
  // }
  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);
  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  movies.splice(movieIndex, 1);
  return res.json({ message: 'Movie deleted' });
})

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin');
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

//   }
//   res.send(200);
// })

app.get('/movies/:id', (req, res) => { //path to regexp
  const { id } = req.params;
  const movie = movies.find(movie => movie.id === id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
})



const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Server listening on port PORT http://localhost:${PORT}`);
});
const z = require('zod');

const movieSchema = z.object({
    title: z.string({invalid_type_error:'Movie title must be a string'}),
    year: z.number({invalid_type_error:'Movie year must be a number'}).int().min(1900).max(2026),
    director: z.string({invalid_type_error:'Movie director must be a string'}),
    duration: z.number().int().min(10).max(300),
    rate: z.number().int().min(0).max(10).default(5),
    poster: z.string().url({message:'Movie poster must be a valid url'}),
    genre: z.array(
      z.enum(['Action','Comedy','Crime','Drama','Terror','Thriller','Western']),
      {
        required_error:'Movie genre is required',
        invalid_type_error:'Movie genre must be an array of strings'
      }
    )
  })

function validateParcialMovie (input){
    return movieSchema.partial().safeParse(input);
}

function validateMovie(object){
    return movieSchema.safeParse(object);
}

module.exports = {
    validateMovie,
    validateParcialMovie
}
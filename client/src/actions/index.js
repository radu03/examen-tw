import { SERVER } from '../config/global'

export const getMovies = (filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'GET_MOVIES',
    payload: async () => {
      const response = await fetch(`${SERVER}/movies?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const addMovie = (movie, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'ADD_MOVIE',
    payload: async () => {
      let response = await fetch(`${SERVER}/movies`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movie)
      })
      response = await fetch(`${SERVER}/movies?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const saveMovie = (id, movie, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'SAVE_MOVIE',
    payload: async () => {
      let response = await fetch(`${SERVER}/movies/${id}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movie)
      })
      response = await fetch(`${SERVER}/movies?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

export const deleteMovie = (id, filterString, page, pageSize, sortField, sortOrder) => {
  return {
    type: 'DELETE_MOVIE',
    payload: async () => {
      let response = await fetch(`${SERVER}/movies/${id}`, {
        method: 'delete'
      })
      response = await fetch(`${SERVER}/movies?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
      const data = await response.json()
      return data
    }
  }
}

const INITIAL_STATE = {
  movieList: [],
  count: 0,
  error: null,
  fetching: false,
  fetched: false
}

export default function reducer (state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_MOVIES_PENDING':
    case 'ADD_MOVIE_PENDING':
    case 'SAVE_MOVIE_PENDING':
    case 'DELETE_MOVIE_PENDING':
      return { ...state, error: null, fetching: true, fetched: false }
    case 'GET_MOVIES_FULFILLED':
    case 'ADD_MOVIE_FULFILLED':
    case 'SAVE_MOVIE_FULFILLED':
    case 'DELETE_MOVIE_FULFILLED':
      return { ...state, movieList: action.payload.records, count: action.payload.count, error: null, fetching: false, fetched: true }
    case 'GET_MOVIES_REJECTED':
    case 'ADD_MOVIE_REJECTED':
    case 'SAVE_MOVIE_REJECTED':
    case 'DELETE_MOVIE_REJECTED':
      return { ...state, movieList: [], error: action.payload, fetching: false, fetched: true }
    default:
      return state
  }
}

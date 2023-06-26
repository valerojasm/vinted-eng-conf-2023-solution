import { createMachine, assign, actions } from 'xstate'
import { API_BASE_URL, BASE_SEARCH_PARAMS } from '~/constants'
import handleSortPhotos from '~/utils/handleSortPhotos'

const fetchPhotos = (context) => {
  const search = new URLSearchParams(BASE_SEARCH_PARAMS)
  search.set('page', context.page)
  return fetch(`${API_BASE_URL}?${search}`).then((res) => res.json())
}

const vintedMachine = createMachine(
  {
    id: 'vinted',
    initial: 'idle',
    context: {
      page: 1,
      photos: [],
      error: '',
    },
    states: {
      idle: {
        on: {
          INIT: {
            target: 'fetching',
          },
        },
      },
      initialized: {
        on: {
          FETCH_PHOTOS: {
            target: 'fetching',
            actions: 'updatePage',
          },
          FAVORITE: {
            actions: 'handleFavorite',
          },
        },
      },
      fetching: {
        invoke: {
          id: 'fetchPhotos',
          src: (context) => fetchPhotos(context),
          onDone: {
            target: 'initialized',
            actions: assign({
              photos: (context, event) => [
                ...context.photos,
                ...handleSortPhotos(event.data, context.photos),
              ],
              error: '',
            }),
          },
          onError: {
            target: 'initialized',
            actions: assign({
              error: (_context, event) => event.error.message,
            }),
          },
        },
      },
    },
  },
  {
    actions: {
      handleFavorite: (context, { id, favorites }) => {
        // Do all favorite logic here
      },
      updatePage: actions.pure((_context, event) => {
        event.setIsLoading(false)
        return assign({ page: (context) => context.page + 1 })
      }),
    },
  },
)

export default vintedMachine

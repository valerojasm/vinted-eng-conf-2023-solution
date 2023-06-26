import React, { useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { FAVORITES_KEY } from '~/constants'
import LoaderIcon from '~/components/Icons/LoaderIcon'
import PhotoCard from '~/components/PhotoCard/PhotoCard'
import VisuallyHidden from '~/components/VisuallyHidden/VisuallyHidden'
import useInfiniteScroll from '~/hooks/useInfiniteScroll'
import Styled from './PhotoGrid.styled'
import usePersistentValue from '~/hooks/usePersistentValue'
import machine from '~/machine'

const Photos = () => {
  const [favorites, setFavorites] = usePersistentValue([], FAVORITES_KEY)
  const [state, send] = useMachine(machine, {
    devTools: true,
  })
  const [isLoading, setIsLoading] = useInfiniteScroll(() =>
    send({ type: 'FETCH_PHOTOS', setIsLoading }, { delay: 300 }),
  )

  useEffect(() => {
    send({ type: 'INIT' })
  }, [])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  return (
    <>
      <VisuallyHidden>Vinted Challenge</VisuallyHidden>
      <Styled.Error>
        <Styled.Error.Message>
          {state.context.errorMessage}
        </Styled.Error.Message>
      </Styled.Error>
      {Boolean(state.context.photos.length) && (
        <Styled.PhotoGrid>
          {state.context.photos.map((photo, idx) => (
            <PhotoCard
              key={`photo-${photo.id}-${idx}`}
              favorites={favorites}
              setFavorites={setFavorites}
              {...photo}
            />
          ))}
        </Styled.PhotoGrid>
      )}
      {isLoading && <LoaderIcon />}
    </>
  )
}

export default Photos

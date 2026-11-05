import React from 'react'
import { Modal } from '../ui/dialog'
import { useApp } from '../../context/AppContext'

export const TrailerModal: React.FC = () => {
  const { trailerMovie, setTrailerMovie } = useApp()

  if (!trailerMovie) return null

  return (
    <Modal
      isOpen={!!trailerMovie}
      onClose={() => setTrailerMovie(null)}
      title={`${trailerMovie.title} — Official Trailer`}
      maxWidth="max-w-4xl"
    >
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
        {trailerMovie.trailerUrl ? (
          <iframe
            src={`${trailerMovie.trailerUrl}?autoplay=1`}
            title={`${trailerMovie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <p className="text-gray-300 font-medium">Trailer stream not available for this title.</p>
            <p className="text-xs text-gray-500">
              In Offline Demo Mode, only verified trailers are embedded.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

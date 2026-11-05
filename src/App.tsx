import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppProvider } from './context/AppContext'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { Footer } from './components/layout/Footer'
import { DiscoverPage } from './pages/DiscoverPage'
import { MoviesPage } from './pages/MoviesPage'
import { TvShowsPage } from './pages/TvShowsPage'
import { WatchlistPage } from './pages/WatchlistPage'
import { WatchNextPage } from './pages/WatchNextPage'
import { HistoryPage } from './pages/HistoryPage'
import { DataStructuresLabPage } from './pages/DataStructuresLabPage'
import { AboutPage } from './pages/AboutPage'
import { MovieDetailsModal } from './components/movies/MovieDetailsModal'
import { TrailerModal } from './components/movies/TrailerModal'
import { PresentationModal } from './components/visualizers/PresentationModal'
import { TooltipProvider } from '@/components/ui/tooltip'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export const AppContent: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isPresentationOpen, setIsPresentationOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenPresentation={() => setIsPresentationOpen(true)}
        />

        <div className="flex w-full max-w-full flex-1 overflow-hidden">
          <Sidebar isCollapsed={isSidebarCollapsed} />

          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Routes>
                <Route path="/" element={<DiscoverPage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/tv" element={<TvShowsPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/watch-next" element={<WatchNextPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/dsa-lab" element={<DataStructuresLabPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>

        <Footer />

        <MovieDetailsModal />
        <TrailerModal />
        <PresentationModal
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
        />

        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(240 10% 7%)',
              border: '1px solid hsl(240 6% 16%)',
              color: '#f3f4f6',
            },
          }}
        />
      </div>
    </TooltipProvider>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ScoresProvider } from './context/ScoresContext'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import ReactionTime from './pages/ReactionTime/ReactionTime'
import SequenceMemory from './pages/SequenceMemory/SequenceMemory'
import NumberMemory from './pages/NumberMemory/NumberMemory'
import AimTrainer from './pages/AimTrainer/AimTrainer'
import VisualMemory from './pages/VisualMemory/VisualMemory'
import ChimpTest from './pages/ChimpTest/ChimpTest'
import VerbalMemory from './pages/VerbalMemory/VerbalMemory'
import TypingTest from './pages/TypingTest/TypingTest'

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,      element: <Dashboard /> },
      { path: 'reaction', element: <ReactionTime /> },
      { path: 'sequence', element: <SequenceMemory /> },
      { path: 'number',   element: <NumberMemory /> },
      { path: 'aim',      element: <AimTrainer /> },
      { path: 'visual',   element: <VisualMemory /> },
      { path: 'chimp',    element: <ChimpTest /> },
      { path: 'verbal',   element: <VerbalMemory /> },
      { path: 'typing',   element: <TypingTest /> },
    ]
  }
])

export default function App() {
  return (
    <ScoresProvider>
      <RouterProvider router={router} />
    </ScoresProvider>
  )
}

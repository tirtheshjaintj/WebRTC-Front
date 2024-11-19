import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromChildren, Route, RouterProvider } from 'react-router-dom'
import Lobby from './pages/Lobby.jsx';
import { SocketProvider } from './context/SocketProvider.jsx';
import Room from './pages/Room.jsx';

const router=createBrowserRouter(
  createRoutesFromChildren(
  <Route path="" element={<App/>}>
    <Route path="/" element={<Lobby/>}/>
    <Route path="/room/:roomId" element={<Room/>}/>
  </Route>
));

createRoot(document.getElementById('root')).render(
  <SocketProvider>
  <RouterProvider router={router}/>
  </SocketProvider>
)

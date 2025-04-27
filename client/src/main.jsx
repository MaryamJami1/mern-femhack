import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from "axios"

axios.defaults.baseURL = "https://mern-femhack-production-0e5d.up.railway.app" //

createRoot(document.getElementById('root')).render(
  <StrictMode>
   
    <App />

    
  </StrictMode>,
)

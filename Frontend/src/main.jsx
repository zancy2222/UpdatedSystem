import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import router from './router/Router.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} />
     <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="light" // or "dark" if preferred
      />
  </AuthProvider>
  
);
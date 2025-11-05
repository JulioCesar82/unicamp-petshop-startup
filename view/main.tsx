import React from 'react'
import ReactDOM from 'react-dom/client'

import { HomePage } from './pages/HomePage'
import { PetRegistrationPage } from './pages/PetRegistrationPage'
import { UserProvider } from './contexts/UserContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { RepositoryProvider } from './contexts/RepositoryContext';
import { RecommendationProvider } from './contexts/RecommendationContext';

import './styles.css';

const App = () => {
  const { currentPage } = useNavigation();

  return (
    <>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'register-pet' && <PetRegistrationPage />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NavigationProvider>
      <RepositoryProvider>
        <UserProvider>
          <RecommendationProvider>
            <App />
          </RecommendationProvider>
        </UserProvider>
      </RepositoryProvider>
    </NavigationProvider>
  </React.StrictMode>,
)
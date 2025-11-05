import React, { createContext, useContext, useState, useEffect } from 'react';

import { Tutor, Pet } from '../domain/entities';
import { API_CONFIG } from '../config';
import { useRepositories } from './RepositoryContext';

interface UserContextData {
  tutor: Tutor | null;
  pets: Pet[];
  loading: boolean;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { tutorRepository, petRepository } = useRepositories();

  useEffect(() => {
    async function loadUserData() {
      try {
        const tutorData = await tutorRepository.findById(API_CONFIG.tutorId); // Initial fetch using API_CONFIG.tutorId
        setTutor(tutorData);
        if (tutorData) {
          const petsResponse = await petRepository.findAll(undefined, tutorData.id); // Pass tutorData.id as parentId
          setPets(petsResponse.data);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [tutorRepository, petRepository]);

  return (
    <UserContext.Provider value={{ tutor, pets, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  return useContext(UserContext);
}
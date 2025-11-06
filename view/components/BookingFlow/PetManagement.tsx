import React, { useState } from 'react';
import { Pet, PetRecommendation } from '../../domain/entities';
import { PetSelection } from './PetSelection';
import { PetRegistration } from './PetRegistration';

interface PetManagementProps {

}

export const PetManagement: React.FC<PetManagementProps> = ({ }) => {
  const [isRegisteringNewPet, setIsRegisteringNewPet] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);

  return (
    <>
      {isRegisteringNewPet || petToEdit ? (
        <PetRegistration
          petToEdit={petToEdit || undefined}
          onSubmit={(pet) => {
            setIsRegisteringNewPet(false);
            setPetToEdit(null);
          }}
          onBack={() => {
            setIsRegisteringNewPet(false);
            setPetToEdit(null);
          }}
        />
      ) : (
        <PetSelection
          onEditPet={(pet) => {
            setPetToEdit(pet);
          }}
          setIsRegisteringNewPet={setIsRegisteringNewPet}
        />
      )}
    </>
  );
};
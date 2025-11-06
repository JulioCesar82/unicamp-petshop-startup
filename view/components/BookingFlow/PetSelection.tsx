import React from 'react';
import { Pet, PetRecommendation } from '../../domain/entities';
import { useUser } from '../../contexts/UserContext';

interface PetSelectionProps {
  onEditPet: (pet: Pet) => void; // New prop for editing existing pet
  setIsRegisteringNewPet: (isRegistering: boolean) => void; // New prop

}

export const PetSelection: React.FC<PetSelectionProps> = ({
  onEditPet,
  setIsRegisteringNewPet, // Destructure new prop
}) => {
  const { pets } = useUser();
  const [selectedPetId, setSelectedPetId] = React.useState<string | number | null>(null);

  // const availablePets = pets.filter(p => petRecommendations.some(pr => pr.pet.pet_id === p.pet_id));
  const availablePets = pets;

  React.useEffect(() => {
    if (availablePets.length > 0 && !selectedPetId) {
      setSelectedPetId(availablePets[0].pet_id);
    }
  }, [availablePets, selectedPetId]);

  const handleEditPet = (petId: string | number) => {
    const pet = pets.find(p => p.pet_id === petId);
    if (pet) {
      onEditPet(pet);
    }
  };

  return (
    <div className="pet-selection">
      <h3>Atualização cadastral do(s) Pet(s)</h3>
      <div className="pet-list">
        {availablePets.map((pet, index) => (
          <div
            key={`${pet.pet_id || index}`}
            className={`pet-card ${selectedPetId === pet.pet_id ? 'selected' : ''}`}
            onClick={() => handleEditPet(pet.pet_id)} // Changed to call handleEditPet
          >
            <img src={pet.image_path || 'icon-pet.png'} alt={pet.name} className="pet-photo" />
            <h4>{pet.name}</h4>
            <p>{pet.animal_type}</p>
          </div>
        ))}
      </div>
      <button className="new-pet-button secondary-button" onClick={() => { setIsRegisteringNewPet(true); }}>
        Cadastrar novo Pet
      </button>
    </div>
  );
};
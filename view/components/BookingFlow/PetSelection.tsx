import React from 'react';
import { Pet, PetRecommendation } from '../../domain/entities';
import { useUser } from '../../contexts/UserContext';

interface PetSelectionProps {
  petRecommendations: PetRecommendation[];
  onSelectPet: (pet: Pet) => void;
}

export const PetSelection: React.FC<PetSelectionProps> = ({
  petRecommendations,
  onSelectPet,
}) => {
  const { pets } = useUser();
  const [selectedPetId, setSelectedPetId] = React.useState<string | number | null>(null);

  const availablePets = pets.filter(p => petRecommendations.some(pr => pr.pet.id === p.id));

  React.useEffect(() => {
    if (availablePets.length > 0 && !selectedPetId) {
      setSelectedPetId(availablePets[0].id);
    }
  }, [availablePets, selectedPetId]);

  const handleSelectPet = (petId: string | number) => {
    setSelectedPetId(petId);
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      onSelectPet(pet);
    }
  };

  return (
    <div className="pet-selection">
      <h3>Selecione o Pet para Agendamento</h3>
      <div className="pet-list">
        {availablePets.map(pet => (
          <div
            key={pet.id}
            className={`pet-card ${selectedPetId === pet.id ? 'selected' : ''}`}
            onClick={() => handleSelectPet(pet.id)}
          >
            <img src={pet.image_path || '/public/icon-pet.png'} alt={pet.name} className="pet-photo" />
            <h4>{pet.name}</h4>
            <p>{pet.breed}</p>
          </div>
        ))}
      </div>
      {/* Optionally, add a button to register a new pet if needed */}
    </div>
  );
};
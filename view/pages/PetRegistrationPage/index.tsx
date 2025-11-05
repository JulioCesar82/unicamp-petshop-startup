import React, { useState } from 'react';

import { Pet } from '../../domain/entities';
import { useUser } from '../../contexts/UserContext';
import { useRepositories } from '../../contexts/RepositoryContext';

import './styles.css';

export const PetRegistrationPage: React.FC = () => {
  const { tutor } = useUser();
  const { petRepository } = useRepositories();

  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petBirthDate, setPetBirthDate] = useState('');
  const [petSize, setPetSize] = useState<Pet['size'] | ''>('');
  const [petFurType, setPetFurType] = useState<Pet['furType'] | ''>('');
  const [petPhoto, setPetPhoto] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!tutor || !tutor.id) {
      setError('Tutor information not available. Cannot register pet.');
      setLoading(false);
      return;
    }
    if(!petSpecies || !petSize || !petFurType){
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const newPetData: Partial<Pet> = {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        birthDate: petBirthDate,
        size: petSize as Pet['size'],
        furType: petFurType as Pet['furType'],
        photo: petPhoto,
        tutorId: tutor.id,
      };

      const createdPet = await petRepository.create(newPetData);
      
      setSuccess(`Pet ${createdPet.name} registered successfully!`);
      setPetName('');
      setPetSpecies('');
      setPetBreed('');
      setPetBirthDate('');
      setPetSize('');
      setPetFurType('');
      setPetPhoto(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to register pet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pet-registration-container">
      <h2>Register New Pet</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="petName">Pet Name:</label>
          <input
            type="text"
            id="petName"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="petSpecies">Species:</label>
          <input
            type="text"
            id="petSpecies"
            value={petSpecies}
            onChange={(e) => setPetSpecies(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="petBreed">Breed:</label>
          <input
            type="text"
            id="petBreed"
            value={petBreed}
            onChange={(e) => setPetBreed(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="petBirthDate">Birth Date:</label>
          <input
            type="date"
            id="petBirthDate"
            value={petBirthDate}
            onChange={(e) => setPetBirthDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="petSize">Size:</label>
          <select
            id="petSize"
            value={petSize}
            onChange={(e) => setPetSize(e.target.value as Pet['size'])}
            required
          >
            <option value="">Select Size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="petFurType">Fur Type:</label>
          <select
            id="petFurType"
            value={petFurType}
            onChange={(e) => setPetFurType(e.target.value as Pet['furType'])}
            required
          >
            <option value="">Select Fur Type</option>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="petPhoto">Pet Photo URL:</label>
          <input
            type="text"
            id="petPhoto"
            value={petPhoto || ''}
            onChange={(e) => setPetPhoto(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading || !tutor}>
          {loading ? 'Registering...' : 'Register Pet'}
        </button>
      </form>
    </div>
  );
};

import React from 'react';

import { PetRepository } from '../../data/PetRepository';
import { useUser } from '../../contexts/UserContext';
import { Pet } from '../../domain/entities';

import './PetRegistration.css';

interface Props {
  onSubmit: (data: Pet) => void;
}

const petRepository = new PetRepository();

export const PetRegistration: React.FC<Props> = ({ onSubmit }) => {
  const { tutor } = useUser();
  const [formData, setFormData] = React.useState<Partial<Pet>>({
    species: 'Cachorro',
    size: 'small',
    furType: 'small',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.breed && formData.birthDate && tutor?.id) {
      try {
        const newPet = await petRepository.createPet({ ...formData, tutorId: tutor.tutor_id } as Omit<Pet, 'id'>);
        if (formData.photo) {
          await petRepository.uploadPetImage(newPet.id!, formData.photo);
        }
        onSubmit(newPet);
      } catch (error) {
        console.error("Failed to create pet:", error);
        // Here you could show an error message to the user
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pet-registration-form">

      <div className='col-6'>
        <div className="form-row">
          <label>Nome do pet:</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="form-row">
          <label>Raça:</label>
          <input
            type="text"
            value={formData.breed || ''}
            onChange={e => setFormData(prev => ({ ...prev, breed: e.target.value }))}
            required
          />
        </div>
        <div className="form-row">
          <label>Tipo de pelo:</label>

          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="furType"
                checked={formData.furType === 'small'}
                onChange={() => setFormData(prev => ({ ...prev, furType: 'small' }))}
              />
              Peq.
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="furType"
                checked={formData.furType === 'medium'}
                onChange={() => setFormData(prev => ({ ...prev, furType: 'medium' }))}
              />
              Méd.
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="furType"
                checked={formData.furType === 'large'}
                onChange={() => setFormData(prev => ({ ...prev, furType: 'large' }))}
              />
              Grande
            </label>
          </div>
        </div>
      </div>


      <div className='col-6'>
        <div className="form-row">
          <label className="species-label">Espécie:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="species"
                checked={formData.species === 'Cachorro'}
                onChange={() => setFormData(prev => ({ ...prev, species: 'Cachorro' }))}
              />
              <i className="fas fa-dog"></i> Cão
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="species"
                checked={formData.species === 'Gato'}
                onChange={() => setFormData(prev => ({ ...prev, species: 'Gato' }))}
              />
              <i className="fas fa-cat"></i> Gato
            </label>
          </div>
        </div>
        <div className="form-row">
          <label>Porte:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="size"
                checked={formData.size === 'small'}
                onChange={() => setFormData(prev => ({ ...prev, size: 'small' }))}
              />
              Peq.
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="size"
                checked={formData.size === 'medium'}
                onChange={() => setFormData(prev => ({ ...prev, size: 'medium' }))}
              />
              Med.
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="size"
                checked={formData.size === 'large'}
                onChange={() => setFormData(prev => ({ ...prev, size: 'large' }))}
              />
              Grande
            </label>
          </div>
        </div>

        <div className="form-row">
          <label>Data nasc.:</label>
          <input
            type="date"
            value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
            onChange={e => setFormData(prev => ({ ...prev, birthDate: new Date(e.target.value) }))}
            required
          />
        </div>
      </div>
  
      <div className="form-row">
        <button type="button" className="photo-upload-button" onClick={() => document.getElementById('photo-upload')?.click()}>
          Escolher foto
        </button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="form-row">
        <button type="submit" className="primary-button">Cadastrar Pet</button>
      </div>
    </form>
  );
};

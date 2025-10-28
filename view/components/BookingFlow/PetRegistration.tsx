import React from 'react';
import { PetRegistrationData } from './types';

interface Props {
  onSubmit: (data: PetRegistrationData) => void;
}

export const PetRegistration: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState<Partial<PetRegistrationData>>({
    species: 'dog',
    size: 'small',
    furType: 'small',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.breed && formData.birthDate) {
      onSubmit(formData as PetRegistrationData);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pet-registration-form">
      <div className="form-row">
        <label>
          Nome do pet:
          <input
            type="text"
            value={formData.name || ''}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label className="species-label">
          Espécie:
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="species"
                checked={formData.species === 'dog'}
                onChange={() => setFormData(prev => ({ ...prev, species: 'dog' }))}
              />
              <i className="fas fa-dog"></i> Cão
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="species"
                checked={formData.species === 'cat'}
                onChange={() => setFormData(prev => ({ ...prev, species: 'cat' }))}
              />
              <i className="fas fa-cat"></i> Gato
            </label>
          </div>
        </label>
      </div>

      <div className="form-row">
        <label>
          Raça:
          <input
            type="text"
            value={formData.breed || ''}
            onChange={e => setFormData(prev => ({ ...prev, breed: e.target.value }))}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Porte:
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
        </label>
      </div>

      <div className="form-row">
        <label>
          Tipo de pelo:
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
        </label>
      </div>

      <div className="form-row">
        <label>
          Data nasc.:
          <input
            type="date"
            value={formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''}
            onChange={e => setFormData(prev => ({ ...prev, birthDate: new Date(e.target.value) }))}
            required
          />
        </label>
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
    </form>
  );
};

export default PetRegistration;

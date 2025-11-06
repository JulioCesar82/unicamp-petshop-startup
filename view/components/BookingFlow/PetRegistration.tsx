import React from 'react';

import { PetRepository } from '../../data/PetRepository';
import { useUser } from '../../contexts/UserContext';
import { Pet } from '../../domain/entities';

import './PetRegistration.css';

interface Props {
  onSubmit: (data: Pet) => void;
  petToEdit?: Pet; // New optional prop for editing
  onBack: () => void;
}

const petRepository = new PetRepository();

export const PetRegistration: React.FC<Props> = ({ onSubmit, petToEdit, onBack }) => {
  const { tutor } = useUser();
  const [formData, setFormData] = React.useState<Partial<Pet>>(
    petToEdit || {
      species: 'Cachorro',
      size: 'small',
      furType: 'small',
    }
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (petToEdit) {
      setFormData(petToEdit);
    }
  }, [petToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (formData.name && formData.animal_type && formData.birth_date && tutor?.tutor_id) {
      try {
        let savedPet: Pet;
        if (petToEdit && petToEdit.id) {
          // Update existing pet
          savedPet = await petRepository.update(petToEdit.id, { ...formData, tutorId: tutor.tutor_id } as Partial<Pet>);
        } else {
          // Create new pet
          savedPet = await petRepository.create({ ...formData, tutorId: tutor.tutor_id } as Omit<Pet, 'id'>);
        }

        if (formData.photo) {
          await petRepository.uploadPetImage(savedPet.id!, formData.photo);
        }
        onSubmit(savedPet);
      } catch (err: any) {
        console.error("Failed to save pet:", err);
        setError(err.message || "Erro ao salvar pet.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setLoading(false);
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
            value={formData.animal_type || ''}
            onChange={e => setFormData(prev => ({ ...prev, animal_type: e.target.value }))}
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
                checked={formData.fur_type === 'Pequeno'}
                onChange={() => setFormData(prev => ({ ...prev, fur_type: 'Pequeno' }))}
              />
              Peq.
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="furType"
                checked={formData.fur_type === 'Médio'}
                onChange={() => setFormData(prev => ({ ...prev, fur_type: 'Médio' }))}
              />
              Méd.
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="furType"
                checked={formData.fur_type === 'Longo'}
                onChange={() => setFormData(prev => ({ ...prev, fur_type: 'Longo' }))}
              />
              Grande
            </label>
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
      </div>


      <div className='col-6'>
        <div className="form-row">
          <label className="species-label">Espécie:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="species"
                checked={formData.species === 'Cão'}
                onChange={() => setFormData(prev => ({ ...prev, species: 'Cão' }))}
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
            value={formData.birth_date ? new Date(formData.birth_date).toISOString().split('T')[0] : ''}
            onChange={e => setFormData(prev => ({ ...prev, birth_date: new Date(e.target.value) }))}
            required
          />
        </div>
      </div>

              <button type="button" className="secondary-button" onClick={onBack} disabled={loading}>Voltar</button>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? (petToEdit ? 'Atualizando...' : 'Cadastrando...') : (petToEdit ? 'Atualizar Pet' : 'Cadastrar Pet')}
              </button>
            {error && <p className="error-message">{error}</p>}
          </form>  );
};

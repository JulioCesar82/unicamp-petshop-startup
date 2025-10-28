import React from 'react';
import { Service } from './types';
import { SERVICES } from './services';

interface Props {
  onSelect: (service: Service) => void;
  selectedService?: Service | null;
}

export const ServiceSelection: React.FC<Props> = ({ onSelect, selectedService }) => {
  return (
    <div className="service-selection">
      <h2>Selecione o Serviço</h2>
      <div className="services-list">
        {SERVICES.map(service => (
          <label key={service.id} className={`service-item ${selectedService?.id === service.id ? 'selected' : ''}`}>
            <input
              type="radio"
              name="service"
              checked={selectedService?.id === service.id}
              onChange={() => onSelect(service)}
            />
            <div className="service-info">
              <div className="service-title-row">
                <span className="service-name">{service.name}</span>
                <span className="service-price">R$ {service.price.toFixed(2)}</span>
              </div>
              {service.description && <div className="service-desc">{service.description}</div>}
              <div className="service-duration">Duração: {service.duration}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;

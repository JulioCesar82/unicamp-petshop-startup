import React from 'react';
import './Confirmation.css';

interface Props {
  petName: string;
  serviceName: string;
  date: Date;
  time: string;
  price: number;
}

export const Confirmation: React.FC<Props> = ({ petName, serviceName, date, time, price }) => {
  if (!date || !time || !petName || !serviceName) {
    return (
      <div className="confirmation error">
        <h2>Erro na Confirmação</h2>
        <p>Informações incompletas. Por favor, volte e preencha todos os dados necessários.</p>
      </div>
    );
  }

  return (
    <div className="confirmation">
      <h2>Confirmação do Agendamento</h2>
      <div className="confirmation-details">
        <div className="detail-row">
          <span className="label">Pet:</span>
          <span className="value">{petName}</span>
        </div>
        <div className="detail-row">
          <span className="label">Serviço:</span>
          <span className="value">{serviceName}</span>
        </div>
        <div className="detail-row">
          <span className="label">Data:</span>
          <span className="value">{date.toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="detail-row">
          <span className="label">Horário:</span>
          <span className="value">{time}</span>
        </div>
        <div className="detail-row total">
          <span className="label">Valor Total:</span>
          <span className="value">R$ {price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

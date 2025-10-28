import React from 'react';

interface Props {
  petName: string;
  serviceName: string;
  date: Date;
  time: string;
  price: number;
}

export const Confirmation: React.FC<Props> = ({ petName, serviceName, date, time, price }) => (
  <div>
    <h2>Confirmação</h2>
    <p>Pet: {petName}</p>
    <p>Serviço: {serviceName}</p>
    <p>Data: {date.toLocaleDateString()}</p>
    <p>Horário: {time}</p>
    <p>Valor: R$ {price.toFixed(2)}</p>
  </div>
);

export default Confirmation;

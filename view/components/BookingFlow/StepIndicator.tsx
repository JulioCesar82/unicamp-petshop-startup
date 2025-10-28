import React from 'react';

export const StepIndicator: React.FC<{ currentStep: number; labels: string[] }> = ({ currentStep, labels }) => (
  <div className="step-indicator">
    {labels.map((label, index) => (
      <div key={index} className={`step ${index + 1 <= currentStep ? 'active' : ''}`}>
        <span>{label}</span>
      </div>
    ))}
  </div>
);

export default StepIndicator;

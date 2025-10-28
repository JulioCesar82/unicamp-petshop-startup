import React from 'react';
import './StepIndicator.css';

export const StepIndicator: React.FC<{ currentStep: number; labels: string[] }> = ({ currentStep, labels }) => (
  <div className="step-indicator">
    {labels.map((label, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber <= currentStep;
      const isCurrent = stepNumber === currentStep;
      
      return (
        <div key={index} className="step-container">
          <div className={`step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="step-number">{stepNumber}</div>
            <span className="step-label">{label}</span>
          </div>
          {index < labels.length - 1 && (
            <div className={`step-line ${isActive ? 'active' : ''}`} />
          )}
        </div>
      );
    })}
  </div>
);

export default StepIndicator;

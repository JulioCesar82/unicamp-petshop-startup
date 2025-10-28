import React from 'react';
import './StepIndicator.css';

export const StepIndicator: React.FC<{ currentStep: number; labels: string[] }> = ({ currentStep, labels }) => {
  const progressPercentage = labels.length > 1 ? ((currentStep - 1) / (labels.length - 1)) * 100 : 0;

  return (
    <div className="step-indicator">
      <div className="progress-line" style={{ width: `${progressPercentage}%` }} />
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        
        return (
          <div key={index} className="step-container">
            <div className={`step ${isActive ? 'active' : ''}`}>
              <div className="step-number">{stepNumber}</div>
            </div>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Recommendations = ({ recommendations }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return AlertCircle;
      case 'medium':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#000000';
      case 'medium':
        return '#333333';
      default:
        return '#666666';
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: '#000000', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Recommendations
        </h3>
        <p style={{ color: '#666666', textAlign: 'center', padding: '30px', fontSize: '1.1rem' }}>
          Excellent work! This repository is in great shape. Keep up the good work!
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: '#000000', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Recommendations for Improvement
      </h3>
      
      <ul className="recommendations-list">
        {recommendations.map((rec, index) => {
          const Icon = getPriorityIcon(rec.priority);
          const color = getPriorityColor(rec.priority);

          return (
            <li key={index} className="recommendation-item">
              <Icon 
                size={24} 
                className="recommendation-icon" 
                style={{ color }}
                strokeWidth={2.5}
              />
              <div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: color,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  letterSpacing: '1px'
                }}>
                  {rec.priority} Priority
                </div>
                <div style={{ color: '#000000', fontSize: '1rem', lineHeight: '1.6' }}>
                  {rec.message}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Recommendations;
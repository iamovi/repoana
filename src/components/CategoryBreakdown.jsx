import { FileText, Code, Wrench, Users, Activity } from 'lucide-react';
import { getScoreColor } from '../utils/healthCalculator';

const CategoryBreakdown = ({ categories }) => {
  const categoryConfig = {
    documentation: {
      icon: FileText,
      title: 'Documentation',
      description: 'README, LICENSE, and guides'
    },
    codeQuality: {
      icon: Code,
      title: 'Code Quality',
      description: 'Issues and PR management'
    },
    maintenance: {
      icon: Wrench,
      title: 'Maintenance',
      description: 'Recent activity and updates'
    },
    community: {
      icon: Users,
      title: 'Community',
      description: 'Stars, forks, and engagement'
    },
    activity: {
      icon: Activity,
      title: 'Activity',
      description: 'Recent contributions'
    }
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: '#000000', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Category Breakdown
      </h3>
      
      <div className="category-grid">
        {Object.entries(categories).map(([key, score]) => {
          const config = categoryConfig[key];
          const Icon = config.icon;

          return (
            <div key={key} className="category-card">
              <div className="category-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Icon size={28} style={{ color: '#000000' }} strokeWidth={2.5} />
                  <div>
                    <div className="category-title">{config.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999999', marginTop: '5px' }}>
                      {config.description}
                    </div>
                  </div>
                </div>
                <div className="category-score">
                  {score}
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${score}%`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
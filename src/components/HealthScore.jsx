import { Star, GitFork, Eye, Calendar } from 'lucide-react';
import { getScoreGrade } from '../utils/healthCalculator';

const HealthScore = ({ score, repoData }) => {
  const getScoreClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      <div className="repo-info">
        {repoData.owner?.avatar_url && (
          <img 
            src={repoData.owner.avatar_url} 
            alt={repoData.owner.login}
            className="repo-avatar"
          />
        )}
        <div className="repo-details">
          <h2>{repoData.full_name}</h2>
          {repoData.description && <p>{repoData.description}</p>}
          <div className="stats-row">
            <div className="stat-item">
              <Star size={16} />
              <span>{repoData.stargazers_count?.toLocaleString()} stars</span>
            </div>
            <div className="stat-item">
              <GitFork size={16} />
              <span>{repoData.forks_count?.toLocaleString()} forks</span>
            </div>
            <div className="stat-item">
              <Eye size={16} />
              <span>{repoData.watchers_count?.toLocaleString()} watchers</span>
            </div>
            {repoData.pushed_at && (
              <div className="stat-item">
                <Calendar size={16} />
                <span>Updated {formatDate(repoData.pushed_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <div className={`score-circle ${getScoreClass(score)}`}>
          {score}
        </div>
        <h3 style={{ fontSize: '1.8rem', color: '#000000', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Overall Health Score
        </h3>
        <p style={{ fontSize: '1.3rem', color: '#666666', fontWeight: '600' }}>
          {getScoreGrade(score)}
        </p>
      </div>
    </div>
  );
};

export default HealthScore;
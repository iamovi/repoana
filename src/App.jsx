import { useState } from 'react';
import { parseRepoUrl, fetchRepoData } from './services/githubApi';
import { calculateHealthScore } from './utils/healthCalculator';
import RepoInput from './components/RepoInput';
import HealthScore from './components/HealthScore';
import CategoryBreakdown from './components/CategoryBreakdown';
import Recommendations from './components/Recommendations';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Parse the GitHub URL
      const { owner, repo } = parseRepoUrl(url);

      // Fetch repository data
      const data = await fetchRepoData(owner, repo);

      // Calculate health score
      const healthData = calculateHealthScore(data);

      // Set results
      setResults({
        repo: data.repo,
        health: healthData
      });

      // Scroll to results
      setTimeout(() => {
        window.scrollTo({
          top: document.getElementById('results')?.offsetTop - 20 || 0,
          behavior: 'smooth'
        });
      }, 100);

    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the repository');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Repo Health Analyzer</h1>
        <p>Analyze repository health, code quality, and maintenance status</p>
      </div>

      <RepoInput onAnalyze={handleAnalyze} loading={loading} />

      {loading && (
        <div className="card">
          <div className="loading">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚡</div>
            <p>ANALYZING REPOSITORY...</p>
            <p style={{ fontSize: '14px', marginTop: '15px', opacity: 0.6, fontWeight: '400' }}>
              Fetching data from GitHub API
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="card">
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {results && (
        <div id="results">
          <HealthScore 
            score={results.health.overall} 
            repoData={results.repo}
          />
          
          <CategoryBreakdown 
            categories={results.health.categories}
          />
          
          <Recommendations 
            recommendations={results.health.recommendations}
          />

          <div className="card" style={{ textAlign: 'center', background: '#f8f8f8' }}>
            <p style={{ color: '#666666', marginBottom: '15px', fontSize: '1.1rem' }}>
              Want to analyze another repository?
            </p>
            <button 
              className="btn"
              onClick={() => {
                setResults(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Analyze Another Repo
            </button>
          </div>
        </div>
      )}

      <footer style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: '#666666',
        borderTop: '2px solid #000000',
        marginTop: '60px'
      }}>
        <p style={{ fontWeight: '600', color: '#000000' }}>Made with ❤️ by Ovi | Powered by GitHub API</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          Rate limit: 60 requests/hour (unauthenticated)
        </p>
      </footer>
    </div>
  );
}

export default App;
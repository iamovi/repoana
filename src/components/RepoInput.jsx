import { useState } from 'react';
import { Search } from 'lucide-react';

const RepoInput = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!url.includes('github.com')) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    onAnalyze(url);
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="input-section">
          <input
            type="text"
            className="input-field"
            placeholder="Enter GitHub repository URL (e.g., https://github.com/iamovi/AnimeWaifu)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="btn"
            disabled={loading}
          >
            {loading ? (
              'Analyzing...'
            ) : (
              <>
                <Search size={20} style={{ display: 'inline', marginRight: '8px' }} />
                Analyze
              </>
            )}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
      
      <div style={{ marginTop: '30px', color: '#666666', fontSize: '0.95rem' }}>
        <p style={{ fontWeight: '700', color: '#000000', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Examples to try:
        </p>
        <ul style={{ marginLeft: '25px', marginTop: '10px', lineHeight: '2' }}>
          <li>https://github.com/iamovi/button-will-react</li>
          <li>https://github.com/microsoft/vscode</li>
          <li>https://github.com/nodejs/node</li>
        </ul>
      </div>
    </div>
  );
};

export default RepoInput;
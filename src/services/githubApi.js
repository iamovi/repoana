import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

// Optional: Add your GitHub token for higher rate limits
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

const api = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: GITHUB_TOKEN ? {
    Authorization: `token ${GITHUB_TOKEN}`
  } : {}
});

export const parseRepoUrl = (url) => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid GitHub URL. Format: https://github.com/owner/repo');
  }
  
  return {
    owner: match[1],
    repo: match[2].replace('.git', '')
  };
};

export const fetchRepoData = async (owner, repo) => {
  try {
    const [
      repoResponse,
      contentsResponse,
      issuesResponse,
      pullsResponse,
      commitsResponse,
      contributorsResponse,
      communityResponse
    ] = await Promise.allSettled([
      api.get(`/repos/${owner}/${repo}`),
      api.get(`/repos/${owner}/${repo}/contents`),
      api.get(`/repos/${owner}/${repo}/issues?state=all&per_page=100`),
      api.get(`/repos/${owner}/${repo}/pulls?state=all&per_page=100`),
      api.get(`/repos/${owner}/${repo}/commits?per_page=100`),
      api.get(`/repos/${owner}/${repo}/contributors?per_page=100`),
      api.get(`/repos/${owner}/${repo}/community/profile`)
    ]);

    const getResponseData = (response) => {
      return response.status === 'fulfilled' ? response.value.data : null;
    };

    return {
      repo: getResponseData(repoResponse),
      contents: getResponseData(contentsResponse) || [],
      issues: getResponseData(issuesResponse) || [],
      pulls: getResponseData(pullsResponse) || [],
      commits: getResponseData(commitsResponse) || [],
      contributors: getResponseData(contributorsResponse) || [],
      community: getResponseData(communityResponse) || {}
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Repository not found. Please check the URL.');
    } else if (error.response?.status === 403) {
      throw new Error('API rate limit exceeded. Please try again later or add a GitHub token.');
    } else {
      throw new Error('Failed to fetch repository data. Please try again.');
    }
  }
};

export const checkFileExists = (contents, fileName) => {
  return contents.some(file => file.name.toLowerCase() === fileName.toLowerCase());
};

export const getReadmeQuality = (contents) => {
  const readme = contents.find(file => 
    file.name.toLowerCase() === 'readme.md'
  );
  
  if (!readme) return 0;
  
  // Award points for README existence and size
  if (readme.size > 5000) return 100;
  if (readme.size > 2000) return 75;
  if (readme.size > 500) return 50;
  return 25;
};

export const calculateDaysSince = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
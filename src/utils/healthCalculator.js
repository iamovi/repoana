import { checkFileExists, getReadmeQuality, calculateDaysSince } from '../services/githubApi';

export const calculateHealthScore = (data) => {
  const scores = {
    documentation: calculateDocumentationScore(data),
    codeQuality: calculateCodeQualityScore(data),
    maintenance: calculateMaintenanceScore(data),
    community: calculateCommunityScore(data),
    activity: calculateActivityScore(data)
  };

  const weights = {
    documentation: 0.25,
    codeQuality: 0.20,
    maintenance: 0.25,
    community: 0.15,
    activity: 0.15
  };

  const overallScore = Object.keys(scores).reduce((total, key) => {
    return total + (scores[key] * weights[key]);
  }, 0);

  return {
    overall: Math.round(overallScore),
    categories: scores,
    recommendations: generateRecommendations(scores, data)
  };
};

const calculateDocumentationScore = (data) => {
  let score = 0;
  const { contents, repo } = data;

  // README quality (40 points)
  score += getReadmeQuality(contents) * 0.4;

  // Essential files (15 points each)
  if (checkFileExists(contents, 'LICENSE')) score += 15;
  if (checkFileExists(contents, 'CONTRIBUTING.md')) score += 15;
  if (checkFileExists(contents, '.github')) score += 10;

  // Description (10 points)
  if (repo?.description && repo.description.length > 20) score += 10;

  // Wiki or docs (10 points)
  if (repo?.has_wiki || checkFileExists(contents, 'docs')) score += 10;

  return Math.min(100, Math.round(score));
};

const calculateCodeQualityScore = (data) => {
  let score = 0;
  const { issues, pulls } = data;

  const openIssues = issues.filter(i => i.state === 'open' && !i.pull_request);
  const closedIssues = issues.filter(i => i.state === 'closed' && !i.pull_request);
  const totalIssues = openIssues.length + closedIssues.length;

  // Issue management (50 points)
  if (totalIssues > 0) {
    const closedRatio = closedIssues.length / totalIssues;
    score += closedRatio * 50;
  } else {
    score += 40; // No issues is generally good
  }

  // PR merge rate (30 points)
  const openPRs = pulls.filter(p => p.state === 'open');
  const mergedPRs = pulls.filter(p => p.merged_at);
  const totalPRs = pulls.length;

  if (totalPRs > 0) {
    const mergeRatio = mergedPRs.length / totalPRs;
    score += mergeRatio * 30;
  } else {
    score += 20;
  }

  // Issue templates (20 points)
  if (checkFileExists(data.contents, '.github')) {
    score += 20;
  }

  return Math.min(100, Math.round(score));
};

const calculateMaintenanceScore = (data) => {
  let score = 0;
  const { repo, commits, contributors } = data;

  // Recent activity (40 points)
  if (repo?.pushed_at) {
    const daysSinceUpdate = calculateDaysSince(repo.pushed_at);
    if (daysSinceUpdate < 7) score += 40;
    else if (daysSinceUpdate < 30) score += 30;
    else if (daysSinceUpdate < 90) score += 20;
    else if (daysSinceUpdate < 180) score += 10;
  }

  // Commit frequency (30 points)
  if (commits.length >= 50) score += 30;
  else if (commits.length >= 20) score += 20;
  else if (commits.length >= 5) score += 10;

  // Active contributors (30 points)
  if (contributors.length >= 10) score += 30;
  else if (contributors.length >= 5) score += 20;
  else if (contributors.length >= 2) score += 10;
  else if (contributors.length >= 1) score += 5;

  return Math.min(100, Math.round(score));
};

const calculateCommunityScore = (data) => {
  let score = 0;
  const { repo, community } = data;

  // Stars (30 points)
  const stars = repo?.stargazers_count || 0;
  if (stars >= 1000) score += 30;
  else if (stars >= 100) score += 20;
  else if (stars >= 10) score += 10;
  else if (stars >= 1) score += 5;

  // Forks (20 points)
  const forks = repo?.forks_count || 0;
  if (forks >= 100) score += 20;
  else if (forks >= 10) score += 15;
  else if (forks >= 1) score += 10;

  // Watchers (20 points)
  const watchers = repo?.watchers_count || 0;
  if (watchers >= 50) score += 20;
  else if (watchers >= 10) score += 10;
  else if (watchers >= 1) score += 5;

  // Community health files (30 points)
  if (community?.health_percentage) {
    score += (community.health_percentage / 100) * 30;
  }

  return Math.min(100, Math.round(score));
};

const calculateActivityScore = (data) => {
  let score = 0;
  const { issues, pulls, commits } = data;

  // Recent issues (40 points)
  const recentIssues = issues.filter(issue => {
    const createdAt = new Date(issue.created_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return createdAt > monthAgo;
  });

  if (recentIssues.length >= 10) score += 40;
  else if (recentIssues.length >= 5) score += 30;
  else if (recentIssues.length >= 1) score += 20;
  else score += 10;

  // Recent PRs (30 points)
  const recentPRs = pulls.filter(pr => {
    const createdAt = new Date(pr.created_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return createdAt > monthAgo;
  });

  if (recentPRs.length >= 5) score += 30;
  else if (recentPRs.length >= 2) score += 20;
  else if (recentPRs.length >= 1) score += 10;

  // Recent commits (30 points)
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return commitDate > monthAgo;
  });

  if (recentCommits.length >= 20) score += 30;
  else if (recentCommits.length >= 10) score += 20;
  else if (recentCommits.length >= 5) score += 10;

  return Math.min(100, Math.round(score));
};

const generateRecommendations = (scores, data) => {
  const recommendations = [];

  // Documentation recommendations
  if (scores.documentation < 70) {
    if (!checkFileExists(data.contents, 'README.md')) {
      recommendations.push({
        category: 'documentation',
        priority: 'high',
        message: 'Add a comprehensive README.md file with project description, installation, and usage instructions.'
      });
    }
    if (!checkFileExists(data.contents, 'LICENSE')) {
      recommendations.push({
        category: 'documentation',
        priority: 'high',
        message: 'Add a LICENSE file to clarify how others can use your code.'
      });
    }
    if (!checkFileExists(data.contents, 'CONTRIBUTING.md')) {
      recommendations.push({
        category: 'documentation',
        priority: 'medium',
        message: 'Add CONTRIBUTING.md to guide potential contributors.'
      });
    }
  }

  // Code quality recommendations
  if (scores.codeQuality < 70) {
    const openIssues = data.issues.filter(i => i.state === 'open' && !i.pull_request);
    if (openIssues.length > 10) {
      recommendations.push({
        category: 'codeQuality',
        priority: 'medium',
        message: `You have ${openIssues.length} open issues. Consider triaging and closing resolved ones.`
      });
    }
    if (!checkFileExists(data.contents, '.github')) {
      recommendations.push({
        category: 'codeQuality',
        priority: 'medium',
        message: 'Add issue and PR templates in .github folder for better collaboration.'
      });
    }
  }

  // Maintenance recommendations
  if (scores.maintenance < 70) {
    const daysSinceUpdate = calculateDaysSince(data.repo?.pushed_at);
    if (daysSinceUpdate > 90) {
      recommendations.push({
        category: 'maintenance',
        priority: 'high',
        message: `Last commit was ${daysSinceUpdate} days ago. Consider updating dependencies or archiving if inactive.`
      });
    }
    if (data.contributors.length < 2) {
      recommendations.push({
        category: 'maintenance',
        priority: 'low',
        message: 'Encourage community contributions to share maintenance responsibilities.'
      });
    }
  }

  // Community recommendations
  if (scores.community < 50) {
    recommendations.push({
      category: 'community',
      priority: 'low',
      message: 'Promote your project on social media, dev.to, or Reddit to increase visibility.'
    });
    if (!data.repo?.description) {
      recommendations.push({
        category: 'community',
        priority: 'medium',
        message: 'Add a clear, compelling repository description to attract contributors.'
      });
    }
  }

  // Activity recommendations
  if (scores.activity < 60) {
    recommendations.push({
      category: 'activity',
      priority: 'medium',
      message: 'Increase project activity by addressing issues, reviewing PRs, or adding new features.'
    });
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#38ef7d';
  if (score >= 60) return '#3498db';
  if (score >= 40) return '#f39c12';
  return '#e74c3c';
};

export const getScoreGrade = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};
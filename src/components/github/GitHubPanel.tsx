import React, { useState, useCallback, useEffect } from 'react';

interface GitHubRepo {
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
}

export function GitHubPanel() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.crucible.keystore.hasKey('github:token').then(setIsAuthenticated);
  }, []);

  const handleAuth = useCallback(async () => {
    if (!token.trim()) return;
    await window.crucible.keystore.setKey('github:token', token.trim());
    setIsAuthenticated(true);
    setToken('');
  }, [token]);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    // Repos would be fetched via main process using @octokit/rest
    // For now, placeholder
    setLoading(false);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-crucible-text">Connect GitHub</h3>
        <p className="text-xs text-crucible-text-secondary">
          Enter a personal access token to connect your GitHub account.
        </p>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxx"
          className="w-full px-2 py-1.5 bg-crucible-editor border border-crucible-border rounded text-sm text-crucible-text placeholder-crucible-text-secondary/50 focus:outline-none focus:border-crucible-accent"
        />
        <button
          onClick={handleAuth}
          disabled={!token.trim()}
          className="w-full px-3 py-1.5 bg-crucible-accent text-white rounded text-sm disabled:opacity-50"
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-crucible-text">GitHub</h3>
        <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">Connected</span>
      </div>
      <div className="space-y-2">
        <button
          onClick={loadRepos}
          className="w-full px-3 py-1.5 bg-crucible-hover text-crucible-text rounded text-xs hover:bg-crucible-active"
        >
          {loading ? 'Loading...' : 'Browse Repositories'}
        </button>
        <button
          className="w-full px-3 py-1.5 bg-crucible-hover text-crucible-text rounded text-xs hover:bg-crucible-active"
        >
          Create Pull Request
        </button>
        <button
          className="w-full px-3 py-1.5 bg-crucible-hover text-crucible-text rounded text-xs hover:bg-crucible-active"
        >
          View Pull Requests
        </button>
      </div>
      {repos.length > 0 && (
        <div className="mt-3 space-y-1">
          {repos.map(repo => (
            <div key={repo.full_name} className="px-2 py-1.5 rounded hover:bg-crucible-hover cursor-pointer">
              <div className="text-xs text-crucible-text font-medium">{repo.full_name}</div>
              <div className="text-[10px] text-crucible-text-secondary truncate">{repo.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

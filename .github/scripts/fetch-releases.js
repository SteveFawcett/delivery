const axios = require('axios');
const fs = require('fs');

const repos = [
  'SteveFawcett/TestPlugin',
  'SteveFawcett/RedisPlugin',
  'SteveFawcett/MSFSPlugin',
  'SteveFawcett/LocalCachePlugin',
  'SteveFawcett/BroadcastPluginSDK',
  'SteveFawcett/APIPlugin'
];

const headers = {
  Authorization: `Bearer ${process.env.GH_TOKEN}`,
  'User-Agent': 'release-fetcher'
};

(async () => {
  const allReleases = [];

  for (const repo of repos) {
    const url = `https://api.github.com/repos/${repo}/releases`;
    const repoUrl = `https://github.com/${repo}`;
    let readmeUrl = null;

    // Try to get README file via GitHub API
    try {
      const { data: readmeData } = await axios.get(
        `https://api.github.com/repos/${repo}/readme`,
        { headers }
      );
      if (readmeData && readmeData.html_url) {
        readmeUrl = readmeData.html_url;
      } else {
        // Fallback: try the classic README.md route (this may 404 if it doesn't exist)
        readmeUrl = `${repoUrl}/blob/main/README.md`;
      }
    } catch (err) {
      // README does not exist or is not accessible
      readmeUrl = null;
    }

    const { data: releases } = await axios.get(url, { headers });

    // Sort releases by published date descending
    const sorted = releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    let latestMarked = false;

    for (const release of sorted) {
      const zipAssets = release.assets
        .filter(a => a.name.endsWith('.zip'))
        .map(a => ({
          name: a.name,
          url: a.browser_download_url
        }));

      if (zipAssets.length === 0) continue; // Skip releases with no zip files

      allReleases.push({
        repo,
        repoUrl,
        readmeUrl,
        tag: release.tag_name,
        name: release.name,
        published: release.published_at,
        isLatest: !latestMarked, // mark only the first valid release
        zipFiles: zipAssets
      });

      latestMarked = true;
    }
  }

  fs.writeFileSync('releases.json', JSON.stringify(allReleases, null, 2));
})();

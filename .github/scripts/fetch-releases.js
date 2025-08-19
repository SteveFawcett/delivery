// .github/scripts/fetch-releases.js
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
    const { data: releases } = await axios.get(url, { headers });

    // Sort releases by published date descending
    const sorted = releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    sorted.forEach((release, index) => {
      const zipAssets = release.assets
        .filter(a => a.name.endsWith('.zip'))
        .map(a => ({
          name: a.name,
          url: a.browser_download_url
        }));

      allReleases.push({
        repo,
        tag: release.tag_name,
        name: release.name,
        published: release.published_at,
        isLatest: index === 0, // mark the first (most recent) release
        zipFiles: zipAssets
      });
    });
  }

  fs.writeFileSync('releases.json', JSON.stringify(allReleases, null, 2));
})();

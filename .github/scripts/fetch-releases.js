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

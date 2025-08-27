const fs = require('fs');
const semver = require('semver');

// Load JSON
const data = require('../../releases.json');

// Group by repo name
const grouped = {};
for (const item of data) {
  const repoName = item.repo.split('/')[1];
  if (!grouped[repoName]) grouped[repoName] = [];
  grouped[repoName].push(item);
}

// Sort versions descending and limit to 10
for (const repo in grouped) {
  grouped[repo] = grouped[repo]
    .sort((a, b) => semver.rcompare(a.tag, b.tag))
    .slice(0, 10);
}

// Build Markdown
let markdown = '';

for (const [repoName, releases] of Object.entries(grouped)) {
  const { repoUrl, ReadMeDocUrl } = releases[0];

  markdown += `## 🔌 [${repoName}](${repoUrl})\n`;
  markdown += `_[View README](${ReadMeDocUrl})_\n\n`;

  markdown += `| Version | Published | Downloads | Latest |\n`;
  markdown += `|---------|-----------|-----------|--------|\n`;

  for (const release of releases) {
    const published = new Date(release.published).toISOString().slice(0, 10);
    const latest = release.isLatest ? '🟢' : '';
    const downloads = release.zipFiles
      .map(zip => `[${zip.name}](${zip.url})`)
      .join('<br>');

    markdown += `| \`${release.tag}\` | ${published} | ${downloads} | ${latest} |\n`;
  }

  markdown += `\n---\n\n`;
}

// Output to file
fs.writeFileSync('PluginReleases.md', markdown);
console.log('✅ Markdown table generated: PluginReleases.md');

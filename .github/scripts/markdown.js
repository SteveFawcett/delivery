const fs = require('fs');
const semver = require('semver');

// Load JSON
const data = require('./releases.json');

// Group by repo name
const grouped = {};
for (const item of data) {
  const repoName = item.repo.split('/')[1];
  if (!grouped[repoName]) grouped[repoName] = [];
  grouped[repoName].push(item);
}

// Sort versions descending
for (const repo in grouped) {
  grouped[repo].sort((a, b) => semver.rcompare(a.tag, b.tag));
}

// Build Markdown
let markdown = '';

for (const [repoName, releases] of Object.entries(grouped)) {
  const { repoUrl, ReadMeDocUrl } = releases[0];

  markdown += `## 🔌 [${repoName}](${repoUrl})\n`;
  markdown += `_[View README](${ReadMeDocUrl})_\n\n`;

  for (const release of releases) {
    const published = new Date(release.published).toISOString().slice(0, 16).replace('T', ' ');
    const latestBadge = release.isLatest ? ' 🟢 **Latest**' : '';

    markdown += `### ${release.name}${latestBadge}\n`;
    markdown += `- 📅 Published: \`${published}\`\n`;
    markdown += `- 🏷️ Tag: \`${release.tag}\`\n`;
    markdown += `- 📦 Downloads:\n`;
    for (const zip of release.zipFiles) {
      markdown += `  - [\`${zip.name}\`](${zip.url})\n`;
    }
    markdown += `\n`;
  }

  markdown += `---\n\n`;
}

// Output to file
fs.writeFileSync('PluginReleases.md', markdown);
console.log('✅ Markdown generated: PluginReleases.md');

import fs from "fs";
import fetch from "node-fetch";

const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_ACTOR;
const TOKEN = process.env.GITHUB_TOKEN;

if (!USERNAME) {
  throw new Error("GitHub username not found in environment variables.");
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "User-Agent": "github-stats-svg",
  Accept: "application/vnd.github+json"
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

async function run() {
  const user = await fetchJSON(`https://api.github.com/users/${USERNAME}`);
  const repos = await fetchJSON(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`
  );

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  const svg = `
<svg width="900" height="260" viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { fill: #F7B93E; font-size: 26px; font-weight: 700; font-family: Arial, Helvetica, sans-serif; }
    .label { fill: #9AEBA3; font-size: 18px; font-family: Arial, Helvetica, sans-serif; }
    .value { fill: #9AEBA3; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; }
  </style>

  <rect width="900" height="260" rx="18" fill="#1F2228"/>

  <text x="30" y="40" class="title">${USERNAME}'s GitHub Stats</text>

  <text x="30" y="80" class="label">⭐ Total Stars</text>
  <text x="230" y="80" class="value">${totalStars}</text>

  <text x="30" y="115" class="label">📦 Public Repos</text>
  <text x="230" y="115" class="value">${user.public_repos}</text>

  <text x="30" y="150" class="label">👥 Followers</text>
  <text x="230" y="150" class="value">${user.followers}</text>

  <text x="30" y="185" class="label">🔁 Following</text>
  <text x="230" y="185" class="value">${user.following}</text>

  <g transform="translate(700,130)">
    <circle r="72" fill="none" stroke="#2E3440" stroke-width="12"/>
    <circle r="72" fill="none" stroke="#F7B93E" stroke-width="12"
            stroke-linecap="round"
            stroke-dasharray="360"
            stroke-dashoffset="40"
            transform="rotate(-90)"/>
    <text y="10" text-anchor="middle"
          fill="#9AEBA3"
          font-size="42"
          font-weight="bold"
          font-family="Arial, Helvetica, sans-serif">
      A++
    </text>
  </g>
</svg>
`;

  fs.writeFileSync("github-stats.svg", svg.trim());
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

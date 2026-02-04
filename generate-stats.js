import fs from "fs";
import fetch from "node-fetch";

const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_ACTOR;
const TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "github-stats-svg"
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

function clamp(value, max) {
  return Math.min(value / max, 1);
}

async function run() {
  const user = await fetchJSON(`https://api.github.com/users/${USERNAME}`);
  const repos = await fetchJSON(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`
  );

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const activeRepos = repos.filter(
    r => new Date(r.pushed_at) > oneYearAgo
  ).length;

  /* ---------- SCORE CALCULATION ---------- */
  const starScore = clamp(totalStars, 500) * 35;
  const repoScore = clamp(user.public_repos, 30) * 15;
  const followerScore = clamp(user.followers, 100) * 20;
  const activityScore = clamp(activeRepos, 20) * 30;

  const totalScore = Math.round(
    starScore + repoScore + followerScore + activityScore
  );

  let grade = "C";
  if (totalScore >= 90) grade = "A++";
  else if (totalScore >= 80) grade = "A+";
  else if (totalScore >= 70) grade = "A";
  else if (totalScore >= 60) grade = "B";

  /* ---------- SVG RING MATH ---------- */
  const circumference = 2 * Math.PI * 72;
  const offset = circumference * (1 - totalScore / 100);

  const svg = `
<svg width="900" height="260" viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { fill:#F7B93E; font-size:26px; font-weight:700; font-family:Arial; }
    .label { fill:#9AEBA3; font-size:18px; font-family:Arial; }
    .value { fill:#9AEBA3; font-size:18px; font-weight:bold; font-family:Arial; }
  </style>

  <rect width="900" height="260" rx="18" fill="#1F2228"/>

  <text x="30" y="40" class="title">${USERNAME}'s GitHub Stats</text>

  <text x="30" y="80" class="label">⭐ Total Stars</text>
  <text x="230" y="80" class="value">${totalStars}</text>

  <text x="30" y="115" class="label">📦 Public Repos</text>
  <text x="230" y="115" class="value">${user.public_repos}</text>

  <text x="30" y="150" class="label">👥 Followers</text>
  <text x="230" y="150" class="value">${user.followers}</text>

  <text x="30" y="185" class="label">🔥 Active Repos (1y)</text>
  <text x="230" y="185" class="value">${activeRepos}</text>

  <g transform="translate(700,130)">
    <circle r="72" fill="none" stroke="#2E3440" stroke-width="12"/>
    <circle r="72"
      fill="none"
      stroke="#F7B93E"
      stroke-width="12"
      stroke-linecap="round"
      stroke-dasharray="${circumference}"
      stroke-dashoffset="${offset}"
      transform="rotate(-90)"
    />
    <text y="-6" text-anchor="middle" fill="#9AEBA3"
          font-size="42" font-weight="bold">${grade}</text>
    <text y="20" text-anchor="middle" fill="#9AEBA3"
          font-size="16">${totalScore}/100</text>
  </g>
</svg>
`;

  fs.writeFileSync("github-stats.svg", svg.trim());
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

import fs from "fs";
import fetch from "node-fetch";

const USERNAME = "RajPatel-5";
const TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

async function run() {
  const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
  const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers });

  const user = await userRes.json();
  const repos = await reposRes.json();

  let stars = 0;
  repos.forEach(r => stars += r.stargazers_count);

  const svg = `
<svg width="900" height="260" viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="260" rx="18" fill="#1F2228"/>

  <text x="30" y="40" fill="#F7B93E" font-size="26" font-family="Arial" font-weight="bold">
    Eric Parker's GitHub Stats
  </text>

  <g fill="#9AEBA3" font-size="18" font-family="Arial">
    <text x="30" y="80">⭐ Total Stars:</text>
    <text x="230" y="80">${stars}</text>

    <text x="30" y="115">📦 Public Repos:</text>
    <text x="230" y="115">${user.public_repos}</text>

    <text x="30" y="150">👥 Followers:</text>
    <text x="230" y="150">${user.followers}</text>

    <text x="30" y="185">🔁 Following:</text>
    <text x="230" y="185">${user.following}</text>
  </g>

  <g transform="translate(700,130)">
    <circle r="72" fill="none" stroke="#2E3440" stroke-width="12"/>
    <circle r="72" fill="none" stroke="#F7B93E" stroke-width="12"
            stroke-linecap="round"
            stroke-dasharray="360"
            stroke-dashoffset="40"
            transform="rotate(-90)"/>
    <text y="10" text-anchor="middle" fill="#9AEBA3"
          font-size="42" font-weight="bold">A++</text>
  </g>
</svg>
`;

  fs.writeFileSync("github-stats.svg", svg);
}

run();

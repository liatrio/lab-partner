const { Octokit } = require("@octokit/rest");
let octokit;

const github = {
    name: "Github",
    init: (controller) => {
        controller.addPluginExtension("github", github);
    },
    getOctokit: () => {
        if (octokit === undefined) {
            octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN,
            });
        }
        return octokit;
    },
    getGithubUser: async (username) => {
        let resp = await github.getOctokit().users.getByUsername({
            username,
        });
        return resp;
    },
    getUserRepositories: async (username) => {
        let resp = await github.getOctokit().repos.listForUser({
            username,
        });
        const repos = resp.data;
        return repos;
    },
    getRepoCommits: async (owner, repo) => {
        let resp = await github.getOctokit().repos.listCommits({
            owner,
            repo,
        });
        const commits = resp.data;
        return commits;
    },
    watchForNewRepo: async (username, callback) => {
        let lastRepoList = [];
        let resp = await github.getOctokit().repos.listForUser({
            username,
        });
        lastRepoList = resp.data;
        const interval = setInterval(async () => {
            resp = await github.getOctokit().repos.listForUser({
                username,
            });
            const currentRepoList = resp.data;
            var newRepoList = [];
            if (lastRepoList.length == currentRepoList.length) newRepoList = [];
            else {
                // Find unique elements
                var lastIds = [];
                var currentIds = [];
                // Gather IDs for all of the repos
                for (let i = 0; i < lastRepoList.length; i++)
                    lastIds.push(lastRepoList[i].id);

                for (let i = 0; i < currentRepoList.length; i++)
                    currentIds.push(currentRepoList[i].id);

                for (let i = 0; i < currentIds.length; i++) {
                    if (!lastIds.includes(currentIds[i])) {
                        newRepoList.push(currentRepoList[i]);
                    }
                }
            }
            newRepoList.forEach((repo) => {
                callback(repo);
            });
            lastRepoList = currentRepoList;
        }, 60000);
        return () => {
            clearInterval(interval);
        };
    },
    watchForNewCommits: async (owner, repo, callback) => {
        let resp = await github.getOctokit().repos.listCommits({
            owner,
            repo,
        });
        let lastCommit = resp.data[0];
        const interval = setInterval(async () => {
            resp = await github.getOctokit().repos.listCommits({
                owner,
                repo,
            });
            const currentCommit = resp.data[0];
            if (currentCommit.sha == lastCommit.sha) {
                /* No new commit, nothing to do  */
            } else {
                callback(currentCommit);
            }
            lastCommit = currentCommit;
        }, 60000);
        return () => {
            return clearInterval(interval);
        };
    },
};

module.exports = github;

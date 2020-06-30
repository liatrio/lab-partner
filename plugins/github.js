const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const github = {
    name: "Github",
    init: (controller) => {
        controller.addPluginExtension("github", github);
    },
    getGithubUser: (username) => {
        let resp = octokit.users.getByUsername({
            username,
        });
        return resp;
    },
    getUserRepositories: async (username) => {
        let resp = await octokit.repos.listForUser({
            username,
        });
        const repos = resp.data;
        return repos;
    },
    getRepoCommits: async (owner, repo) => {
        let resp = await octokit.repos.listCommits({
            owner,
            repo,
        });
        const commits = resp.data;
        return commits;
    },
    watchForNewRepo: async (username, callback, test = false) => {
        let lastRepoList = [];
        let resp = await octokit.repos.listForUser({
            username,
        });
        lastRepoList = resp.data;
        let watch = setInterval(async () => {
            resp = await octokit.repos.listForUser({
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
            if (test) {
                clearInterval(watch);
            }
        }, 20000);
    },
    watchForNewCommits: async (username, repo, callback, test = false) => {
        let resp = test;
        //let resp = await octokit.repos.listCommits({
        //    username,
        //    repo,
        //});
        //let lastCommit = resp.data[0];
        //let watch = setInterval(async () => {
        //    resp = await octokit.repos.listCommits({
        //        username,
        //        repo,
        //    });
        //    const currentCommit = resp.data[0];
        //    if (currentCommit.id == lastCommit.id) {
        //        /* No new commit, nothing to do  */
        //    } else {
        //        callback(currentCommit);
        //    }
        //    lastCommit = currentCommit;
        //    if (test) {
        //        clearInterval(watch);
        //    }
        //}, 20000);
        return resp;
    },
};

module.exports = github;

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

let gqlFetch = null

/* global Headers */

/**
 * @typedef {object} GithubContributorInfo
 * @property {string} name Github user name
 * @property {string} login Github user login
 * @property {string} date date of the contribution (ISO string)
 */

/**
 * GraphQL fetch function.
 *
 * @param {string} api the url of the GraphQL api
 * @param {string} query the GraphQL query
 * @param {string} token the Github Personal Access Token (repo scope only is needed)
 */
async function githubFetch(api, query, token) {
  if (!gqlFetch) {
    gqlFetch = require('graphql-fetch')(api)
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`
  })

  return gqlFetch(
    query,
    {},
    {
      headers,
      method: 'POST'
    }
  )
}

/**
 * Fetch the Github contributors for pages at a path in a repo.
 *
 * @param {string} api the url of the GraphQL api
 * @param {string} repoOwner the Github org/owner to query from
 * @param {string} repoName the Github repo to query from
 * @param {string} branch the Github branch to query from
 * @param {string} pagePath the folder path for the pages in the repo to query from
 * @param {string} token the Github Personal Access Token
 * @returns {Array<GithubContributorInfo>} an array of the Github Contributor data
 */
async function githubFetchContributorsForPage(
  api,
  repoOwner,
  repoName,
  branch,
  pagePath,
  token
) {
  const res = await githubFetch(
    api,
    `
  query {
    repository(owner: "${repoOwner}", name: "${repoName}") {
      object(expression: "${branch}") {
        ... on Commit {
          history(first: 100, path: "${pagePath}") {
            nodes {
              author {
                avatarUrl
                user {
                  name
                  login
                }
                date
              }
            }
          }
        }
      }
    }
  }
  `, token)

  // if data is not as expected (usually from a Github API error) just return an empty array
  if (!(
    res &&
    res.data &&
    res.data.repository &&
    res.data.repository.object &&
    res.data.repository.object.history &&
    res.data.repository.object.history.nodes &&
    Array.isArray(res.data.repository.object.history.nodes)
  )) {
    console.warn(`The Github API didn't return the expected data, returning an empty contributor array. res: ${JSON.stringify(res, null, 2)}`)
    return []
  }

  // the nodes history is from latest history to earliest
  const { nodes } = res.data.repository.object.history
  const flattenedNodes = nodes
    // remove nodes where the user is null
    .filter(node => {
      return node.author && node.author.user && node.author.user.name && node.author.user.login
    })
    // flatten the nodes
    .map(node => {
      const { date, user, avatarUrl } = node.author
      const { name, login } = user

      return {
        name,
        login,
        date,
        avatarUrl
      }
    })

  // create a Set (thus unique items), by mapping via login
  return Array.from(new Set(flattenedNodes.map(node => node.login)))
    // map it back to the node (the first found will be the latest entry)
    .map(login => flattenedNodes.find(node => node.login === login))
}

module.exports = {
  githubFetch,
  githubFetchContributorsForPage
}

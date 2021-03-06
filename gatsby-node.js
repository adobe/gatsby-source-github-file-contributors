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

const globby = require('globby')
const { githubFetchContributorsForPage } = require('./src/gql')
const path = require('path')

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type Contributors implements Node {
      date: String,
      login: String,
      name: String
    }
    type GithubContributors implements Node {
      contributors: [Contributors]
    }
  `
  createTypes(typeDefs)
}

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, options = {}) => {
  const cwd = process.cwd()
  const root = options.root ? options.root : ''
  const { paths: pages = ['src/pages'], extensions = ['md', 'mdx'] } = options.pages ? options.pages : {}
  const { token, owner, name, branch = 'main', default_branch = 'main' } = options.repo ? options.repo : {}

  if (!token) {
    console.warn('To get Github Contributors, a Github token is required (GITHUB_TOKEN environment variable)')
  }

  // Support Windows
  const regExp = /\\/g
  const paths = await globby(pages.map(page => path.resolve(cwd, page).replace(regExp, '//')), {
    expandDirectories: {
      extensions
    }
  })

  const repository = `${owner}/${name}`

  actions.createNode({
    repository,
    branch,
    default_branch,
    root,
    id: createNodeId(repository),
    internal: {
      type: 'Github',
      contentDigest: createContentDigest(repository)
    }
  })

  for (const _path of paths) {
    let githubPath = path.join(root, _path.replace(cwd, ''))
    if (githubPath.charAt(0) === path.sep) githubPath = githubPath.substr(1)

    let contributors = []
    if (token) {
      contributors = await githubFetchContributorsForPage(owner, name, branch, githubPath, token)
    }

    actions.createNode({
      contributors,
      path: _path,
      id: createNodeId(_path),
      internal: {
        type: 'GithubContributors',
        contentDigest: createContentDigest(_path)
      }
    })
  }
}

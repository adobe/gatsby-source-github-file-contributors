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

const mockGithubFetchContributors = jest.fn()
const mockGithubFetch = jest.fn()
jest.mock('../src/gql', () => ({
  githubFetchContributorsForPage: mockGithubFetchContributors,
  githubFetch: mockGithubFetch
}))

const mockGlobby = jest.fn()
jest.mock('globby', () => mockGlobby)

const gatsbyNode = require('../gatsby-node')

const gatsbyHelpers = {
  actions: {
    createNode: jest.fn()
  },
  createNodeId: jest.fn(),
  createContentDigest: jest.fn()
}

beforeEach(() => {
  jest.restoreAllMocks()
})

test('exists', () => {
  expect(typeof gatsbyNode.sourceNodes).toEqual('function')
})

test('sourceNodes, no token', async () => {
  await expect(gatsbyNode.sourceNodes(gatsbyHelpers)).rejects.toThrowError('token is required (GITHUB_TOKEN environment variable)')
})

test('sourceNodes', async () => {
  const options = {
    pages: {
    },
    repo: {
      owner: 'my-owner',
      name: 'my-repo',
      branch: 'my-branch',
      token: 'dummy-token'
    }
  }

  const pages = ['foo.md', 'bar.md']
  mockGlobby.mockResolvedValueOnce(pages)

  const contributors = [
    [{ name: 'John Doe', login: 'johndoe2020', date: new Date() }],
    [{ name: 'Jane Austen', login: 'janeausten2020', date: new Date() }]
  ]

  mockGithubFetchContributors
    .mockResolvedValueOnce(contributors[0])
    .mockResolvedValueOnce(contributors[1])

  await expect(gatsbyNode.sourceNodes(gatsbyHelpers, options)).resolves.toEqual(undefined)
  expect(gatsbyHelpers.actions.createNode).toHaveBeenCalledTimes(pages.length)
  expect(mockGithubFetchContributors).toHaveBeenCalledTimes(pages.length)

  pages.forEach((page, index) => {
    const { owner, name, branch, token } = options.repo
    expect(mockGithubFetchContributors).toHaveBeenNthCalledWith(index + 1, owner, name, branch, page, token)
    expect(gatsbyHelpers.actions.createNode).toHaveBeenNthCalledWith(index + 1, expect.objectContaining({
      contributors: contributors[index],
      href: `https://github.com/${owner}/${name}`,
      internal: expect.objectContaining({
        type: 'GithubContributors'
      })
    }))
  })
})

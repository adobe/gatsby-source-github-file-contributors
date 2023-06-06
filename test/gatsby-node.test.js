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

const path = require('path')
const mockGithubFetchContributors = jest.fn()
const mockGithubFetch = jest.fn()
jest.mock('../src/gql', () => ({
  githubFetchContributorsForPage: mockGithubFetchContributors,
  githubFetch: mockGithubFetch
}))

const originalWarn = console.warn
const mockedWarn = jest.fn()

const mockGlobby = jest.fn()
jest.mock('globby', () => mockGlobby)

const gatsbyNode = require('../gatsby-node')

const gatsbyHelpers = {
  actions: {
    createNode: jest.fn(),
    createTypes: jest.fn()
  },
  createNodeId: jest.fn(),
  createContentDigest: jest.fn()
}

// ///////////////////////////////////////

describe('gatsby-node', () => {
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
  const contributors = [
    [{ name: 'John Doe', login: 'johndoe2020', date: new Date() }],
    [{ name: 'Jane Austen', login: 'janeausten2020', date: new Date() }]
  ]

  beforeEach(() => {
    jest.resetAllMocks()
    console.warn = mockedWarn
  })

  afterEach(() => {
    console.warn = originalWarn
  })

  test('exists', () => {
    expect(typeof gatsbyNode.sourceNodes).toEqual('function')
  })

  test('no token', async () => {
    mockGlobby.mockResolvedValueOnce(pages)

    await expect(gatsbyNode.sourceNodes(gatsbyHelpers)).resolves.toEqual(undefined)
    await expect(mockedWarn).toHaveBeenCalledWith('To get Github Contributors, a Github token is required (GITHUB_TOKEN environment variable)')
  })

  test('createSchemaCustomization', () => {
    expect(gatsbyNode.createSchemaCustomization(gatsbyHelpers)).toEqual(undefined)
    expect(gatsbyHelpers.actions.createTypes).toHaveBeenCalledTimes(1)
  })

  test('no root', async () => {
    mockGlobby.mockResolvedValue(pages)
    mockGithubFetchContributors
      .mockResolvedValueOnce(contributors[0])
      .mockResolvedValueOnce(contributors[1])

    await expect(gatsbyNode.sourceNodes(gatsbyHelpers, options)).resolves.toEqual(undefined)
    expect(gatsbyHelpers.actions.createNode).toHaveBeenCalledTimes(pages.length + 1)
    expect(mockGithubFetchContributors).toHaveBeenCalledTimes(pages.length)

    pages.forEach((page, index) => {
      const { owner, name, branch, token } = options.repo
      expect(mockGithubFetchContributors).toHaveBeenNthCalledWith(index + 1, 'https://api.github.com/graphql', owner, name, branch, page, token)
      // skip the very first createNode, which is a Github object
      expect(gatsbyHelpers.actions.createNode).toHaveBeenNthCalledWith(index + 2, expect.objectContaining({
        contributors: contributors[index],
        internal: expect.objectContaining({
          type: 'GithubContributors'
        })
      }))
    })
  })

  test('with root', async () => {
    mockGlobby.mockResolvedValue(pages)
    mockGithubFetchContributors
      .mockResolvedValueOnce(contributors[0])
      .mockResolvedValueOnce(contributors[1])

    const root = 'my-root'
    const _options = Object.assign({}, options)
    _options.root = `/${root}` // coverage
    await expect(gatsbyNode.sourceNodes(gatsbyHelpers, _options)).resolves.toEqual(undefined)
    expect(gatsbyHelpers.actions.createNode).toHaveBeenCalledTimes(pages.length + 1)
    expect(mockGithubFetchContributors).toHaveBeenCalledTimes(pages.length)

    pages.forEach((page, index) => {
      const { owner, name, branch, token } = _options.repo
      const pagePath = path.join(root, page)
      expect(mockGithubFetchContributors).toHaveBeenNthCalledWith(index + 1, 'https://api.github.com/graphql', owner, name, branch, pagePath, token)
      // skip the very first createNode, which is a Github object
      expect(gatsbyHelpers.actions.createNode).toHaveBeenNthCalledWith(index + 2, expect.objectContaining({
        contributors: contributors[index],
        internal: expect.objectContaining({
          type: 'GithubContributors'
        })
      }))
    })
  })

  test('with prefix', async () => {
    mockGlobby.mockResolvedValue(pages)
    mockGithubFetchContributors
      .mockResolvedValueOnce(contributors[0])
      .mockResolvedValueOnce(contributors[1])

    const _options = Object.assign({}, options)
    _options.pages.paths = ['/some/fake/path']
    _options.pages.prefix = '/some/fake/path'
    _options.pages.root = '/some/fake/path'
    await expect(gatsbyNode.sourceNodes(gatsbyHelpers, _options)).resolves.toEqual(undefined)
    expect(gatsbyHelpers.actions.createNode).toHaveBeenCalledTimes(pages.length + 1)
    expect(mockGithubFetchContributors).toHaveBeenCalledTimes(pages.length)

    pages.forEach((page, index) => {
      const { owner, name, branch, token } = _options.repo
      expect(mockGithubFetchContributors).toHaveBeenNthCalledWith(index + 1, 'https://api.github.com/graphql', owner, name, branch, page, token)
      // skip the very first createNode, which is a Github object
      expect(gatsbyHelpers.actions.createNode).toHaveBeenNthCalledWith(index + 2, expect.objectContaining({
        contributors: contributors[index],
        internal: expect.objectContaining({
          type: 'GithubContributors'
        })
      }))
    })
  })

  test('replace windows path separators for globby', async () => {
    mockGlobby.mockImplementation((pages) => {
      pages.forEach((page) => {
        expect(page.indexOf('\\')).toEqual(-1) // should not find Windows path separator
      })
      return pages
    })

    const resolveSpy = jest.spyOn(path, 'resolve')
    resolveSpy.mockImplementation((...args) => {
      return path.win32.resolve(...args) // force Windows path resolver
    })
    const _options = Object.assign({}, options)
    _options.pages = {
      paths: ['path\\1.md', 'path\\2.md', 'path/3.md']
    }

    await expect(gatsbyNode.sourceNodes(gatsbyHelpers, _options)).resolves.toEqual(undefined)
    resolveSpy.mockRestore()
  })
})

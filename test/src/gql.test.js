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

const mockFetch = jest.fn()
const mockGqlFetch = jest.fn(() => mockFetch)
jest.mock('graphql-fetch', () => mockGqlFetch)

const { githubFetch, githubFetchContributorsForPage } = require('../../src/gql')

beforeEach(() => {
  jest.restoreAllMocks()
  global.Headers = jest.fn(_ => _)
})

test('exists', () => {
  expect(typeof githubFetch).toEqual('function')
  expect(typeof githubFetchContributorsForPage).toEqual('function')
  expect(mockGqlFetch).not.toHaveBeenCalled()
})

test('githubFetch', async () => {
  const result = { data: 'some-data' }
  const query = 'my-query'
  const token = 'my-token'
  mockFetch.mockResolvedValueOnce(result)

  await expect(githubFetch('https://api.github.com/graphql', query, token)).resolves.toEqual(result)
  expect(mockFetch).toHaveBeenCalledWith(query, {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'POST'
    }
  )
})

test('githubFetchContributorsForPage', async () => {
  // repoOwner, repoName, branch, pagePath, token
  const repoOwner = 'my-org'
  const repoName = 'my-name'
  const branch = 'my-branch'
  const pagePath = 'page-path'
  const token = 'my-token'
  const aDate = new Date()

  mockFetch.mockResolvedValueOnce({
    data: {
      repository: {
        object: {
          history: {
            nodes: [
              {
                author: {
                  date: aDate.toISOString(),
                  user: {
                    name: 'John Doe',
                    login: 'johndoe2020'
                  }
                }
              },
              {
                author: {
                  date: aDate.toISOString(),
                  user: {
                    name: 'Jane Austen',
                    login: 'janeausten2020'
                  }
                }
              }
            ]
          }
        }
      }
    }

  })
  await expect(githubFetchContributorsForPage(repoOwner, repoName, branch, pagePath, token))
    .resolves.toEqual([
      { date: aDate.toISOString(), login: 'johndoe2020', name: 'John Doe' },
      { date: aDate.toISOString(), login: 'janeausten2020', name: 'Jane Austen' }
    ])
})

test('githubFetchContributorsForPage (Github API failure)', async () => {
  // repoOwner, repoName, branch, pagePath, token
  const repoOwner = 'my-org'
  const repoName = 'my-name'
  const branch = 'my-branch'
  const pagePath = 'page-path'
  const token = 'my-token'

  mockFetch.mockResolvedValueOnce({})

  await expect(githubFetchContributorsForPage(repoOwner, repoName, branch, pagePath, token))
    .resolves.toEqual([])
})

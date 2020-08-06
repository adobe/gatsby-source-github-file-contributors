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
  expect(mockGqlFetch).toHaveBeenCalledTimes(1)
})

test('githubFetch', async () => {
  const result = { data: 'some-data' }
  const query = 'my-query'
  const token = 'my-token'
  mockFetch.mockResolvedValueOnce(result)

  await expect(githubFetch(query, token)).resolves.toEqual(result)
  expect(mockFetch).toHaveBeenCalledWith(query, {},
    {
      headers: {
        Authorization: 'Bearer my-token'
      },
      method: 'POST'
    }
  )
})

<!--
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

[![Version](https://img.shields.io/npm/v/@adobe/gatsby-source-github-file-contributors.svg)](https://npmjs.org/package/@adobe/gatsby-source-github-file-contributors)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/gatsby-source-github-file-contributors.svg)](https://npmjs.org/package/@adobe/gatsby-source-github-file-contributors)
[![Build Status](https://travis-ci.com/adobe/gatsby-source-github-file-contributors.svg?branch=master)](https://travis-ci.com/adobe/gatsby-source-github-file-contributors)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/gatsby-source-github-file-contributors/master.svg?style=flat-square)](https://codecov.io/gh/adobe/gatsby-source-github-file-contributors/)

# @adobe/gatsby-source-github-file-contributors

A Gatsby source plugin to get contributors per file for a Github repo

## Install

```bash
npm install --save @adobe/gatsby-source-github-file-contributors
```

## Example

```javascript
// In gatsby-config.js
plugins: [
  {
    resolve: `@adobe/gatsby-source-github-file-contributors`,
      options: {
        pages: {
          root: '', // root of the page paths (below) in the Github repo
          paths: ['src/pages'], // relative path of the pages from the config
          extensions: ['md'] // page extensions to filter for
        },
        repo: {
          token: process.env.REPO_GITHUB_TOKEN, // Github Personal Access Token
          owner: process.env.REPO_OWNER, // user or org name
          name: process.env.REPO_NAME, 
          branch: process.env.REPO_BRANCH, // defaults to 'main'
          default_branch: process.env.REPO_DEFAULT_BRANCH // defaults to 'main'
        }
      }
  }
];
```

GraphQL
```
{
  allGithub {
    nodes {
      repository
      branch
      default_branch
      root
    }
  }    
  allGithubContributors {
    nodes {
      contributors {
        date
        login
        name
      }
      path
    }
  }        
}
```

### Github Personal Access Token

Without a [Github Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token), your requests will be rate-limited.

The GraphQL API v4 rate limit is 5,000 points per hour when authenticated, and 60 points per hour when anonymous.

The number of points in a GraphQL API call is returned in the metadata for the call.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.


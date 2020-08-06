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
          paths: ['src/pages'],
          extensions: ['md']
        },
        repo: {
          token: process.env.GITHUB_TOKEN,
          owner: process.env.GITHUB_REPO_OWNER,
          name: process.env.GITHUB_REPO_NAME,
          branch: process.env.GITHUB_REPO_BRANCH
        }
      }
  }
];
```

GraphQL
```
{
  allGithubContributors {
    nodes {
      contributors {
        date
        login
        name
      }
      path,
      href
    }
  }        
}
```

### Github Personal Access Token

Without a [Github Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token), your requests will be rate-limited.  
The GraphQL API v4 rate limit is 5,000 points per hour when authenticated, and 60 points per hour when anonymous.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.


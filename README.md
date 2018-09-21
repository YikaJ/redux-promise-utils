# redux-promise-utils

Based on [redux-thunk](https://github.com/reduxjs/redux-thunk) & [redux-actions](https://github.com/redux-utilities/redux-actions).

Easy utils to handle Promise in redux.

## Quick Start

### Install

use npm

```
npm i redux-promise-utils --save
```

use yarn

```
yarn add redux-promise-utils
```

## Usage

1. Ensure your reducer is handled by `redux-thunk`.
2. Ensure your api is a Promise.

```js
// data/action.js
import { createPromiseAction } from 'redux-promise-utils'
import * as api from './api'

export const fetchAction = createPromiseAction('fetchList', api.fetchList)

// data/reducer.js
import { createReducer } from 'redux-promise-utils'
import { fetchAction } from './action'

const initState = {}

const reducer = createReducer(initState)
    // catch sync action
    .which('SYNC_ACTION', (state, action) => {
        return state
    })
    // catch async action with three state
    .asyncWhich(fetchAction, {
        start(state, action) {
            return state
        },
        success(state, action) {
            return state
        },
        fail(state, action) {
            return state
        }
    })
    // build redux reducer handler
    .build()

export default reducer
```

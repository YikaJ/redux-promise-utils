import { createAction } from 'redux-actions'

const ASYNC_SUFFIX = {
  START: 'START',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

function _isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

/**
 * 创建一个异步 Action
 * create an promise action
 * @param {string} type 类型
 * @param {*} handler 处理函数
 */
export function createPromiseAction(type, asyncFunc) {
  if(typeof type !== 'string') {
    new Error(`type must be string but got ${typeof type}`)
  }

  const startAction = createAction(`${type}_${ASYNC_SUFFIX.START}`)
  const successAction = createAction(`${type}_${ASYNC_SUFFIX.SUCCESS}`)
  const failedAction = createAction(`${type}_${ASYNC_SUFFIX.FAILED}`)

  const actionCreator = (payload) => {
    // 这一层是给 redux-thunk 用的
    return (dispatch, getState) => {
      // 调用初始 Action
      dispatch(startAction(payload))

      const promise = asyncFunc(payload, dispatch, getState)

      // 不用 constructor 来保证非标准化的 Promise 也可用
      if (!_isPromise(promise)) {
        return new Error('createPromiseAction 第二个参数必须是 Promise')
      }

      return promise.then(value => {
        dispatch(successAction(value))
        return value
      }).catch(err => {
        dispatch(failedAction(err))
        return Promise.reject(err)
      })
    }
  }

  // 重写 toString 来配合 combineReducer 使用
  actionCreator.toString = () => type

  return actionCreator
}


// 提供可处理异步 Reducer 的函数
class Reducer {

  state

  constructor(initState) {
    this.state = initState
  }

  // 暂存 handlers，用于 kv 索引
  handlers = {}

  // case ActionType
  which(actionType, handler) {
    if (Array.isArray(actionType)) {
      actionType.forEach(type => {
        this.handlers[type.toString()] = handler
      })
    } else {
      this.handlers[actionType.toString()] = handler
    }

    return this
  }

  /**
   * 异步 switch
   * @param {string | string[]} actionType Action 值
   * @param {start?: void, success?: void, fail?: void} handlerOptions 异步处理函数
   */
  asyncWhich(actionType, handlerOptions) {
    const addHandler = function(actionType, handlerOptions) {
      if (handlerOptions.start) this.handlers[`${actionType}_${ASYNC_SUFFIX.START}`] = handlerOptions.start
      if (handlerOptions.success) this.handlers[`${actionType}_${ASYNC_SUFFIX.SUCCESS}`] = handlerOptions.success
      if (handlerOptions.fail) this.handlers[`${actionType}_${ASYNC_SUFFIX.FAILED}`] = handlerOptions.fail
    }.bind(this)

    if (Array.isArray(actionType)) {
      actionType.forEach(type => {
        addHandler(type.toString(), handlerOptions)
      })
    } else {
      addHandler(actionType.toString(), handlerOptions)
    }

    return this
  }

  build() {
    return (state = this.state, action) => {
      if(!action || !action.type) {
        return state
      }

      const handler = this.handlers[action.type]

      if (typeof handler === 'function') {
        return handler(state, action)
      }

      return state
    }
  }
}

export function createReducer(initState = {}) {
  return new Reducer(initState)
}

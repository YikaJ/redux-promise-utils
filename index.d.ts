import { Action, ActionFunctionAny, Reducer } from 'redux-actions'

declare module 'redux-promise-utils' {

  export type AsyncActionFunctionAny<R, P, Arguments = {}> = (args?: Arguments) => Promise<P>

  export function createPromiseAction<Payload, Arguments>(
    type: string,
    asyncFunc: (args?: Arguments) => Promise<Payload>
  ): AsyncActionFunctionAny<Action<Payload>, Payload, Arguments>

  interface IHandlerOptions<State> {
    start?: (state: State, action: Action<any>) => State,
    success?: (state: State, action: Action<any>) => State,
    fail?: (state: State, action: Action<any>) => State,
  }

  interface IReducer<State, Payload> {
    // handle sync Action
    which(
      type: ActionFunctionAny<Action<any>>,
      handler: (state: State, action: Action<any>) => State
    ): IReducer<State, Payload>

    // handle async Action
    asyncWhich(
      type: AsyncActionFunctionAny<Action<Payload>, Payload>,
      options: IHandlerOptions<State>
    ): IReducer<State, Payload>

    // build reducer
    build: () => Reducer<State, Payload>
  }

  export function createReducer<State, Payload>(initState: State): IReducer<State, Payload>
}
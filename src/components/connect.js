/**
 *
 * connect 本质上就是接受一个组件然后返回一个组件
 * 为什么说 react-redux 帮助我们连接 UI 层和数据层呢
 * 是因为每个要与 redux 结合的使用的组件，需要做如下几件事
 * - 在组件中获取 store 的状态
 * - 监听组件中 store 状态的改变，在状态改变时，更新组件
 * - 在组件卸载时，移除对 store 状态变化的监听
 *
 * 所以 react-redux 相当于将这些逻辑抽离了出来，搞成 react HOC，就可以在 react 中复用这些逻辑了
 *
 * 但是由于每个组件所需要的 store 的状态是不一样的，所以这里就需要传一个该组件需要的状态内容给 connect
 * 除了这个需要的状态内容之外，还需要一个能够修改状态的动作，因为一个组件可能要对这个状态进行增/删/改的动作
 *
 * 由此我们引出两个参数
 * - mapStateToProps
 * - mapDispatchToProps
 *
 * mapStateToProps 表示该组件需要的状态，mapDispatchToProps 表示对该组件状态的增/删/改的动作
 */
import React, {useContext, useReducer, useEffect} from 'react'
import ReactReduxContext from './context'
import { bindActionCreators } from 'redux'

const defaultMapStateToProps = state => ({})
const defaultMapDispatchToProps = dispatch => ({dispatch})

export default function connect(mapStateToProps, mapDispatchToProps) {

  // 默认值设定
  mapStateToProps = mapStateToProps || defaultMapStateToProps
  mapDispatchToProps = mapDispatchToProps || defaultMapDispatchToProps

  // 对于 connect 而言，其返回值是一个组件
  // 对于下面的 Connect Class 而言，其传入的参数是一个原始组件
  return function wrapWithConnect(WrappedComponent) {
    // 返回的是一个类组件
    return function ConnectFunc(props) {
      // 获取到从 Provider 传入的 store 以及 state
      const store = useContext(ReactReduxContext)
      const state = store.getState()
      const mappedState = mapStateToProps(state, props)
      // 利用 useReducer 获取到强制组件更新的 dispatch 函数
      const [, forceComponentUpdateDispatch] =
        useReducer(storeStateUpdatesReducer, null, () => [null, 0])

      // 兼容 mapDispatchToProps 是函数或者是对象的情况
      const mappedDispatch = typeof mapDispatchToProps === 'function'
      ? mapDispatchToProps(store.dispatch, props)
      : bindActionCreators(mapDispatchToProps, store.dispatch)

      // 订阅行为在 useEffect 中
      useEffect(() => {
        const unSubscribe = store.subscribe(() => {
          forceComponentUpdateDispatch({
            type: '@@redux/STORE_UPDATED',
            payload: { latestStoreState: state, }
          })
        })

        return () => {
          // 组件销毁时取消订阅
          unSubscribe()
        }
      })

      return (
        <WrappedComponent
          {...props}
          {...mappedState}
          {...mappedDispatch}
        ></WrappedComponent>
      )
    }
  }
}

function storeStateUpdatesReducer(state, action) {
  const [, updateCount] = state
  return [action.payload, updateCount + 1]
}

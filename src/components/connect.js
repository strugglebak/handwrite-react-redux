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
 *
 * 而由于组件的状态以及动作不能够直接获取到，所以需要将 mapStateToProps 和 mapDispatchToProps 定义为函数
 * 以方便 connect 能够在内部访问到 store 以及 store.dispatch
 */
import React, {Component} from 'react'
import storeShapes from '../utils/storeShapes'
import {bindActionCreators} from 'redux'

/**
 * mapStateToProps 默认不关联 state，其默认值为 state => ({})
 * mapDispatchToProps 默认将 store.dispatch 方法作为属性传递给包装的属性，其默认值为 dispatch => ({dispatch})
 */

const defaultMapStateToProps = state => ({})
const defaultMapDispatchToProps = dispatch => ({dispatch})

// const mapStateToProps = (state, ownProps) => {
//   return {
//     prop: state.prop
//   }
// }

// const mapDispatchToProps = (dispatch, ownProps) => {
//   return {
//     dispatch1: () => {
//       dispatch(actionCreator)
//     }
//   }
// }

export default function connect(mapStateToProps, mapDispatchToProps) {

  // 默认值设定
  mapStateToProps = mapStateToProps || defaultMapStateToProps
  mapDispatchToProps = mapDispatchToProps || defaultMapDispatchToProps

  // 对于 connect 而言，其返回值是一个组件
  // 对于下面的 Connect Class 而言，其传入的参数是一个原始组件
  return function wrapWithConnect(WrappedComponent) {
    // 返回的是一个类组件
    return class Connect extends Component {
      // 构建 childContextTypes 验证器
      static childContextTypes = {
        store: storeShapes
      }

      constructor(props, context) {
        super(props, context)
        // 这个 store 哪里来的，就是 Provider 组件中传入的
        this.store = context.store // 注意这里是从 context 中获取的 store，这里先尝试使用旧 API 解决问题

        // 初始化状态和动作
        this.state = mapStateToProps(this.store.getState(), this.props)
        /**
         * 传进来的 mapDispatchToProps 也许是个对象，这个时候你可能就要这样子定义 mapDispatchToProps
         *
         import actions from '../store/actions/counter'
         const mapDispatchToProps = (dispatch, ownProps) => ({
          add: (num) => {
            dispatch(actions.add(num))
          },
          minus: (num) => {
            dispatch(actions.minus(num))
          }
         })

         * 但是这样调用太麻烦了，能不能优化成如下定义
         import actions from '../store/actions/counter'
         const mapDispatchToProps = {
           add: actions.add,
           minus: actions.minus
         }

         * 所以这个时候就要用到 redux 的 bindActionCreators 了
         */
        this.mappedDispatch = typeof mapDispatchToProps === 'function'
          ? mapDispatchToProps(store.dispatch, this.props)
          : bindActionCreators(mapDispatchToProps, this.store.dispatch)
      }

      componentDidMount() {
        this.unsub = store.subscribe(() => {
          const mappedState = mapStateToProps(this.store.getState())
          this.setState(mappedState)
        })
      }

      componentWillUnmount() {
        this.unsub()
      }

      render() {
        return (
          <WrappedComponent {...this.props} {...this.state} {...this.mappedDispatch} />
        )
      }
    }
  }
}

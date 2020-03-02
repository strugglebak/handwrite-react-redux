/**
 *
 * connect.js 中不可能直接从外部引入 store, 这个 store 应该是由使用 react-redux 的应用传入
 *
 * react 的数据传递有两种
 * - 通过 props 传递数据
 * - 通过 context 传递数据
 *
 * 而我们应该将 store 放在 context 中传，因为这样根组件下的子孙组件就能够访问这个 store 了
 *
 * Provider 组件的作用就是
 * 1. 接受应用传进来的 store
 * 2. 将其挂在 context 上
 *
 * prop-types 是一个 validator 验证器，用于 react props 以及一些相似的对象的验证
 *
 * 只要通过给 Provider 类添加 childContextTypes 以及 getChildContext，react 会自动向下传递信息
 * 子组件只需要访问 context 即可得到其传入的 store
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class Provider extends Component {
  // 构建 childContextTypes 验证器
  static childContextTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }).isRequired
  }

  constructor(props) {
    super(props)
    this.store = props.store // 这里传入 store
  }

  getChildContext() {
    return { store: this.store }
  }

  render() {
    return this.props.children
  }
}

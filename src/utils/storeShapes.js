/**
 * 将 store 验证器的逻辑抽离出来
 */
import PropTypes from 'prop-types'
export default PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
  }).isRequired

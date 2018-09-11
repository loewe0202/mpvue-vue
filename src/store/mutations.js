import * as type from './mutation-types';
const mutations = {
  [type.SET_MPVUEINFO](state, mpvueInfo) { // eslint-disable-line
    state.mpvueInfo = mpvueInfo;
  },
  [type.SET_USERINFO](state, userInfo) { // eslint-disable-line
    state.userInfo = userInfo;
  }
}

export default mutations;

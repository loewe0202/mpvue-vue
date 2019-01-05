var Fly = require("flyio/dist/npm/wx")
var fly = new Fly()
let requestReg = /^http(s)?:/
const baseUrl = ' https://www.easy-mock.com/mock/5becfd4e9e6bbf680f549443/oppo_api/'

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: baseUrl + 'login',
            header: {
              'content-type': 'application/json',
              'accept': 'application/json'
            },
            data: {
              code: res.code
            },
            method: 'POST',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.setStorageSync('api_token', res.data.data)
                resolve(res.data.data)
              }
            },
            fail: (res) => {
              console.log('登录失败: ', res)
              reject(res)
            }
          })
        } else {
          console.log('登录失败: ', res)
          reject(res)
        }
      }
    })
  })
}

// 添加请求拦截器
fly.interceptors.request.use((request) => {
  let token = wx.getStorageSync('api_token')
  if (!requestReg.test(request.url)) {
    request.baseURL = baseUrl
  }
  if (request.showLoading || request.text) {
    wx.showLoading({
      title: request.text || '加载中...',
      mask: true
    })
  }
  request.timeout = 30000 // 本次请求的超时时间
  request.headers = { // 自定义的请求头
    'content-type': 'application/json',
    'accept': 'application/json',
    'authorization': 'Bearer ' + token
  }
  if (!token) {
    fly.lock()
    return login().then(res => {
      request.headers.authorization = 'Bearer ' + res
      fly.unlock()
      return request
    })
  } else {
    return request
  }
})

fly.interceptors.response.use(
  (response) => { // 成功回调
    hiddenLoading(response.request)
    return response.data
  },
  (error) => { // 失败回调
    hiddenLoading(error.request)
    //  return Promise.resolve(error) // 返回到then中
    switch (error.status) {
      case 0: // 网络异常
        showToast("网络连接异常~")
        break
      case 1: // 超时请求
        showToast("网络请求超时~")
        break
      case 401: // 未登入
        wx.clearStorageSync() // 清除缓存
        break
      case 404: // 接口地址错误
        showToast("接口地址不存在")
        break
      case 422: // 请求参数错误
        showToast("提交数据有误，请核对后重新提交")
        break
      case 500: // 服务器错误
        showToast("服务器正在开小差，请稍后再试~")
        break
      default: // 其它
        showToast("网络请求异常，请稍后再试~")
        break
    }
  }
)

/**
 * 隐藏加载框
 */
function hiddenLoading(obj = {}) {
  wx.stopPullDownRefresh()
  if (obj.showLoading || obj.text) {
    wx.hideLoading()
  }
}

// 弹窗提示
function showToast(title = "网络请求错误") {
  wx.showToast({
    title: title,
    icon: "none"
  })
}

export default fly

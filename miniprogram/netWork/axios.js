// 环境变量
class ENV {
  constructor() {

  }
  dev = {
    baseUrl: 'http://127.0.0.1:5000'
  }
  prod = {
    baseUrl: 'http://127.0.0.1:5000'
  }
  test = {
    baseUrl: 'http://127.0.0.1:5000'
  }
  getEnv() {
    return this.dev //在这里设置要暴露的环境
  }
  baseUrl = this.getEnv().baseUrl
}
var env = new ENV()
// Token
class Token {
  constructor() {

  }
  // 以 code 获取 token
  getToken(noRefech = false) {
    // 获取获取登录凭证（code）,code仅能使用一次
    console.log('env', env.baseUrl)
    wx.login({
      success: function (res) {
        wx.request({
          url: env.baseUrl + '/cms/user/wx/login',
          method: "POST",
          data: {
            code: res.code
          },
          success: (res => {
            if (res.statusCode.toString().charAt(0) === '2') {
              console.log(res)
              console.log(res.data)
              if (res.data.access_token && res.data.refresh_token) {
                const {access_token, refresh_token} = res.data
                wx.setStorageSync('access_token', access_token)
                wx.setStorageSync('refresh_token', refresh_token)
              }
            } else {
              if (!noRefech) {
                this._refech(param)
                noRefech = true
              }
            }
          })
        })
      }
    })
  }
  // 令牌刷新
  _refechToken(param){
    return new Promise((resolve, reject) => {
      wx.request({
        url: env.baseUrl + '/cms/user/refresh',
        method: "GET",
        data: {},
        header: {
          "content-type": "application/json",
          "Authorization": "Bearer " +  wx.getStorageSync('refresh_token') 
        },
        success: (res => {
          if (res.statusCode.toString().charAt(0) === '2') {
            if (res.data.access_token && res.data.refresh_token) {
              const { access_token, refresh_token } = res.data
              wx.setStorageSync('access_token', access_token)
              wx.setStorageSync('refresh_token', refresh_token)
            }
          }
        }),
        async complete(){
          var axois=new Axios()
          var res=await axois._refech(param)
          resolve(res)
        }
      })
    })
  }
}
var token = new Token()
// 网络请求封装
class Axios {
  constructor() {

  }
  // 请求数据
  axios(param) {
    return this.requestAll(param)
  }
  // 请求重试
  async _refech(param) {
    let res=await this.axios(param, false)
    return res
  }

  // 封装请求
  requestAll(param, noRefech) {
    var that=this
    return new Promise((resolve, reject) => {
      var access_token = wx.getStorageSync('access_token') // 获取缓存中的token
      // 统一弹窗
      wx.showLoading({
        title: '加载中',
      })
      // 开始请求数据
      wx.request({
        url: env.baseUrl + param.url,
        data: param.data,
        method: param.method ? param.method : "GET",
        header: {
          "content-type": "application/json",
          "Authorization": "Bearer " + access_token
        }, // token根据后端实际需求
        // 调用 wx.request API 成功 重点：是调用API，不是请求结束
        async success(res){
          let statusCode = res.statusCode
          // 网络请求状态码不是以 '2' 开头的认为请求的接口不正确
          if (statusCode.toString().charAt(0) === '2') {
            // 状态码以'2' 开头，说明请求正确
            // 根据自定义业务码进行处理
            // this.Hander_code(res)
            resolve(res.data)
          } else {
            // 错误处理
            let { error_code, msg } = res.data
            let message = ''
            // 本次使用内 token 失效
            if (error_code === 10040 || error_code === 10050) {
                var  result= await token._refechToken(param)
                resolve(result)
                return
            }
            reject (res)
          }
        },
        // async success: (res => {
        //   let statusCode = res.statusCode
        //   // 网络请求状态码不是以 '2' 开头的认为请求的接口不正确
        //   if (statusCode.toString().charAt(0) === '2') {
        //     // 状态码以'2' 开头，说明请求正确
        //     // 根据自定义业务码进行处理
        //     // this.Hander_code(res)
        //     resolve(res.data)
        //   } else {
        //     console.log(res.statusCode)
        //     // 错误处理
        //     let { error_code, msg } = res.data
        //     let message = ''
        //     console.log(error_code)
        //     // 本次使用内 token 失效
        //     if (error_code === 10040 || error_code === 10050) {
        //         var  result= await token._refechToken(param)
        //         console.log(result)
        //         resolve(result)
        //         return
        //     }
        //     reject (res)
        //   }
        // }),
        // 调用 wx.request API 失败
        fail: (failData => {
          console.error('调用API异常', failData)
          wx.showToast({
            title: '程序异常，请退出重试',
            icon: "none"
          })
        }),
        // 调用 wx.request API 结束
        complete: (completeData => {
          // 关闭统一弹窗
          wx.hideLoading({
            success: (res) => {},
          })
        })
      })
    })
  }

  Hander_code(res) {
    switch (res.data.code) {
      case 2000:
        resolve(res.data) // 未测试是否能在这里 resolve
    }
  }
}

export {
  Token,
  ENV,
  Axios
}
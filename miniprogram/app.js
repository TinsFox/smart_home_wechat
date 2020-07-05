//app.js
import { Token} from "./netWork/axios"
var token=new Token()
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    token.getToken()
    this.globalData = {}
  }
})

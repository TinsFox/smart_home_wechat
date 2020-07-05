import Device from "../../model/device"
var device = new Device()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  async stateChange(e){
    console.log(e.detail.value)
    let form=this.data.device
    form.state=e.detail.value
    console.log(form)
    let res=await device.updateDeviceDetail(form)
    console.log(res)
    if(res.error_code===0){
      let msg= await device.publish_message(form)
      console.log(msg)
    }
  },
  async getDetail(){
    let res=await device.getDeviceDetail(this.data.deviceID)
    console.log(res)
    this.setData({
      device:res
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      deviceID:options.deviceID
    })
    this.getDetail()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
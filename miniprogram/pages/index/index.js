import Device from "../../model/device"
var device = new Device()
Page({
  data: {
    isIndex: false,
    isShare: false,
    tabbar: [
      '常用设备',
      '摄像机',
      '电源开关',
      '照明',
      '家居安防',
      '厨房电器',
      "环境电器",
      "传感器",
      "娱乐影音",
      "出行车载",
      "生活电器",
      "运动健康",
      "红外遥控",
      "其他"
    ],
    height: 0, //scroll-view高度
    currentTab: 0, //预设当前项的值
    scrollViewId: "id_0"
  },
  detail(e){
    console.log(e)
  },
  add(){
    console.log('add')
  },
  async onLoad(options) {
    setTimeout(() => {
      wx.getSystemInfo({
        success: res => {
          this.setData({
            height: res.windowHeight - res.windowWidth / 750 * 92
          });
        }
      });
    }, 50);
    this.getList()
  },
  async getList(){
    let res=await device.getMyDevice()
    console.log(res)
    this.setData({
      mylist:res
    })
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    let cur = e.currentTarget.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab:cur
      },()=>{
        this.checkCor();
      })
     
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 6) {
      this.setData({
        scrollViewId:`id_${this.data.currentTab - 2}`
      })
    } else {
      this.setData({
        scrollViewId:'id_0'
      })
    }
  },
  detail(e) {
    let key = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../productDetail/productDetail?deviceID=' + key
    })
  },
  productList(e) {
    
  },
  search: function () {
    wx.navigateTo({
      url: '../../news/search/search'
    });
  }

})
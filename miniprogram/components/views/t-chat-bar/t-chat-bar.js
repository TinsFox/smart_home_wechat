//聊天栏 回复栏
const emoji = require('../../../utils/emoji.js');
Component({
  properties: {
    //禁用聊天栏
    isLocked: {
      type: Boolean,
      value: false
    },
    //是否显示遮罩
    mask: {
      type: Boolean,
      value: true
    },
    //true表示遮罩透明
    maskOpacity: {
      type: Boolean,
      value: true
    },
    sendText: {
      type: String,
      value: '发送'
    },
    color: {
      type: String,
      value: '#5677fc'
    }
  },
  lifetimes: {
    attached: function () {
      //键盘高度监听
      this.setData({
        faceList: emoji.en
      })
      let safeH = this.isPhoneX() ? 34 : 0;
      wx.onKeyboardHeightChange(res => {
        let h = res.height - safeH;
        this.setData({
          keyboardHeight: h > 0 ? h : 0
        })
        //去除 完成那一栏高度影响
        setTimeout(() => {
          if (this.data.showIndex == 1 && this.data.keyboardHeight != 0) {
            this.setData({
              replyContainerH: this.data.keyboardHeight
            })
          }
        }, 100);
      });
    }
  },
  data: {
    showIndex: 0, //1-键盘 2-表情 3-其他
    keyboardHeight: 0,
    replyContainerH: 260,
    faceList: [],
    content: '',
    isVoice: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    isPhoneX: function () {
      const res = uni.getSystemInfoSync();
      let iphonex = false;
      let models = ['iphonex', 'iphonexr', 'iphonexsmax', 'iphone11', 'iphone11pro', 'iphone11promax']
      const model = res.model.replace(/\s/g, "").toLowerCase()
      if (models.includes(model)) {
        iphonex = true;
      }
      return iphonex;
    },
    hideKeyboard() {
      //隐藏键盘
      this.setData({
        showIndex: 0
      })
      wx.hideKeyboard();
    },
    showKeyBoard(e) {
      let index = Number(e.currentTarget.dataset.index);
      if (this.data.showIndex == index) return;
      this.setData({
        showIndex: index,
        isVoice: false
      })
    },
    inputReply(e) {
      this.setData({
        content: e.detail.value
      })
    },
    inputFace(e) {
      let index = Number(e.currentTarget.dataset.index);
      let face = emoji.cn[index];
      this.setData({
        content: this.data.content + face
      })
    },
    switchVoice() {
      this.setData({
        isVoice: true,
        showIndex: 0
      })
    },
    switchInput() {
      this.setData({
        isVoice: false
      })
    },
    stop() {}
  }
})
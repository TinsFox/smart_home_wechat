Component({
  properties: {
    //如果图标是image，则icon传入图片地址
    itemList: {
      type: Array,
      value: [{
        title: '关闭',
        icon: 'close'
      }]
    },
    //遮罩背景色
    maskBgColor: {
      type: String,
      value: 'transparent'
    },
    //图标是否为图片
    isImage: {
      type: Boolean,
      value: false
    },
    //图标宽度
    width: {
      type: String,
      value: '40rpx'
    },
    //图标高度
    height: {
      type: String,
      value: '40rpx'
    }
  },
  data: {
    popupShow: false,
    popupTop: '12rpx'
  },
  methods: {
    handleClick(e) {
      let index=Number(e.currentTarget.dataset.index)
			this.triggerEvent('click', { index: index });
			this.toggle()
		},
		toggle:function() {
      this.setData({
        popupShow:!this.data.popupShow
      })
		}
  }
})
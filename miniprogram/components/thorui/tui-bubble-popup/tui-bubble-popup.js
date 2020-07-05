Component({
  properties: {
    //宽度
    width: {
      type: String,
      value: '300rpx'
    },
    //popup圆角
    radius: {
      type: String,
      value: '8rpx'
    },
    //popup 定位 left right top bottom值
    left: {
      type: String,
      value: 'auto'
    },
    right: {
      type: String,
      value: 'auto'
    },
    top: {
      type: String,
      value: 'auto'
    },
    bottom: {
      type: String,
      value: 'auto'
    },
    translateX: {
      type: String,
      value: '0'
    },
    translateY: {
      type: String,
      value: '0'
    },
    //背景颜色
    backgroundColor: {
      type: String,
      value: '#4c4c4c'
    },
    //字体颜色
    color: {
      type: String,
      value: '#fff'
    },
    //三角border-width
    borderWidth: {
      type: String,
      value: '12rpx'
    },
    //三角形方向 top left right bottom
    direction: {
      type: String,
      value: 'top'
    },
    //定位 left right top bottom值
    triangleLeft: {
      type: String,
      value: 'auto'
    },
    triangleRight: {
      type: String,
      value: 'auto'
    },
    triangleTop: {
      type: String,
      value: 'auto'
    },
    triangleBottom: {
      type: String,
      value: 'auto'
    },
    //定位 relative absolute  fixed
    position: {
      type: String,
      value: 'fixed'
    },
    //flex-end
    flexEnd: {
      type: Boolean,
      value: false
    },
    //是否需要mask
    mask: {
      type: Boolean,
      value: true
    },
    maskBgColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.4)'
    },
    //控制显示
    show: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    handleClose() {
      if (!this.data.show)  return;
      this.triggerEvent('close', {});
    },
    stop() {
      return false;
    }
  }
})
Component({
  properties: {
    //图片集合
    /*
      [{id:1,src:"1.png"}]
    */
    imageList: {
      type: Array,
      value: []
    },
    //图片宽度
    width: {
      type: String,
      value: '120rpx'
    },
    //图片高度
    height: {
      type: String,
      value: '120rpx'
    },
    //图片边框宽度 rpx
    borderWidth: {
      type: String,
      value: '0'
    },
    //图片边框颜色 可传rgba
    borderColor: {
      type: String,
      value: '#fff'
    },
    //图片圆角
    radius: {
      type: String,
      value: '50%'
    },
    //图片裁剪、缩放的模式
    mode: {
      type: String,
      value: 'scaleToFill'
    },
    //图片懒加载。只针对page与scroll-view下的image有效
    lazyLoad: {
      type: Boolean,
      value: true
    },
    //图片显示动画效果 | 仅App-nvue 2.3.4+ Android有效
    fadeShow: {
      type: Boolean,
      value: true
    },
    //默认不解析 webP 格式，只支持网络资源 | 微信小程序2.9.0
    webp: {
      type: Boolean,
      value: false
    },
    //开启长按图片显示识别小程序码菜单 | 微信小程序2.7.0
    longpress: {
      type: Boolean,
      value: false
    },
    //是否组合排列
    isGroup: {
      type: Boolean,
      value: false
    },
    //排列方向 row ，column
    direction: {
      type: String,
      value: 'row'
    },
    //偏移距离 rpx
    distance: {
      type: [Number, String],
      value: -16
    }
  },
  methods: {
    error(e) {
			this.triggerEvent('errorEvent', e);
		},
		load(e) {
			this.triggerEvent('loaded', e);
		},
		bindClick(e) {
      let dataset = e.currentTarget.dataset;
			this.triggerEvent('click', {
				index: dataset.index,
				id: dataset.id || ''
			});
		}
  }
})
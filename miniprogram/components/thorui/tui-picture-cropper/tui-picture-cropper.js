/**
 * 注意：组件中使用的图片地址，将文件复制到自己项目中
 * 如果图片位置与组件同级，编译成小程序时图片会丢失
 * 拷贝static下整个components文件夹
 *也可直接转成base64（不建议）
 * */
Component({
  properties: {
    //图片路径
    imageUrl: {
      type: String,
      value: ''
    },
    /*
     默认正方形，可修改大小控制比例
     裁剪框高度 px
    */
    height: {
      type: Number,
      value: 280
    },
    //裁剪框宽度 px
    width: {
      type: Number,
      value: 280
    },
    //裁剪框最小宽度 px
    minWidth: {
      type: Number,
      value: 100
    },
    //裁剪框最小高度 px
    minHeight: {
      type: Number,
      value: 100
    },
    //裁剪框最大宽度 px
    maxWidth: {
      type: Number,
      value: 360
    },
    //裁剪框最大高度 px
    maxHeight: {
      type: Number,
      value: 360
    },
    //裁剪框border颜色
    borderColor: {
      type: String,
      value: 'rgba(255,255,255,0.1)'
    },
    //裁剪框边缘线颜色
    edgeColor: {
      type: String,
      value: '#FFFFFF'
    },
    //裁剪框边缘线宽度 w=h
    edgeWidth: {
      type: String,
      value: '34rpx'
    },
    //裁剪框边缘线border宽度
    edgeBorderWidth: {
      type: String,
      value: '6rpx'
    },
    //偏移距离，根据edgeBorderWidth进行调整
    edgeOffsets: {
      type: String,
      value: '6rpx'
    },
    /**
     * 如果宽度和高度都为true则裁剪框禁止拖动
     * 裁剪框宽度锁定
     */
    lockWidth: {
      type: Boolean,
      value: false
    },
    //裁剪框高度锁定
    lockHeight: {
      type: Boolean,
      value: false
    },
    //锁定裁剪框比例（放大或缩小）
    lockRatio: {
      type: Boolean,
      value: false
    },
    //生成的图片尺寸相对剪裁框的比例
    scaleRatio: {
      type: Number,
      value: 2
    },
    //图片的质量，取值范围为 (0, 1]，不在范围内时当作1.0处理
    quality: {
      type: Number,
      value: 0.8
    },
    //图片旋转角度
    rotateAngle: {
      type: Number,
      value: 0
    },
    //图片最小缩放比
    minScale: {
      type: Number,
      value: 0.5
    },
    //图片最大缩放比
    maxScale: {
      type: Number,
      value: 2
    },
    //是否禁用触摸旋转（为false则可以触摸转动图片，limitMove为false生效）
    disableRotate: {
      type: Boolean,
      value: true
    },
    //是否限制移动范围(剪裁框只能在图片内,为true不可触摸转动图片)
    limitMove: {
      type: Boolean,
      value: true
    },
    //自定义操作栏（为true时隐藏底部操作栏）
    custom: {
      type: Boolean,
      value: false
    },
    //值发生改变开始裁剪（custom为true时生效）
    startCutting: {
      type: [Number, Boolean],
      value: 0
    },
    /**
     * 是否返回base64(H5端默认base64)
     * 支持平台：App，微信小程序，支付宝小程序,H5(默认url就是base64)
     **/
    isBase64: {
      type: Boolean,
      value: false
    },
    //裁剪时是否显示loadding
    loadding: {
      type: Boolean,
      value: true
    },
    //旋转icon
    rotateImg: {
      type: String,
      value: '/static/components/cropper/img_rotate.png'
    }
  },
  data: {
    TIME_CUT_CENTER: null,
    CROPPER_WIDTH: 200, //裁剪框宽
    CROPPER_HEIGHT: 200, //裁剪框高
    cutX: 0, //画布x轴起点
    cutY: 0, //画布y轴起点0
    canvasWidth: 0,
    canvasHeight: 0,
    imgWidth: 0, //图片宽度
    imgHeight: 0, //图片高度
    scale: 1, //图片缩放比
    angle: 0, //图片旋转角度
    cutAnimation: false, //是否开启图片和裁剪框过渡
    cutAnimationTime: null,
    imgTop: 0, //图片上边距
    imgLeft: 0, //图片左边距
    ctx: null,
    sysInfo: {},
    props: '',
    sizeChange: 0, //2
    angleChange: 0, //3
    resetChange: 0, //4
    centerChange: 0 //5
  },
  observers: {
    'imageUrl': function (val) {
      if(val){
        this.showLoading();
        this.imageReset();
        wx.getImageInfo({
          src: val,
          success: res => {
            //计算图片尺寸
            this.imgComputeSize(res.width, res.height);
            if (this.data.limitMove) {
              this.data.angleChange++;
              this.setData({
                props: `3,${this.data.angleChange}`
              })
            }
          },
          fail: err => {
            this.imgComputeSize();
            if (this.data.limitMove) {
              this.data.angleChange++;
              this.setData({
                props: `3,${this.data.angleChange}`
              })
            }
          }
        });
      }
    },
    'rotateAngle': function (val) {
      this.setData({
        cutAnimation: true,
        angle: val
      })
      this.angleChanged(val);
    },
    'cutAnimation': function (val) {
      //开启过渡260毫秒之后自动关闭
      clearTimeout(this.data.cutAnimationTime);
      if (val) {
        this.data.cutAnimationTime = setTimeout(() => {
          this.setData({
            cutAnimation: false
          })
        }, 260);
      }
    },
    'limitMove': function (val) {
      if (val) {
        this.angleChanged(this.data.angle);
      }
    },
    'startCutting': function (val) {
      if (this.data.custom && val) {
        this.getImage();
      }
    }
  },
  lifetimes: {
    ready: function () {
      let sysInfo = wx.getSystemInfoSync();
      this.setData({
        sysInfo: sysInfo,
        imgTop: sysInfo.windowHeight / 2,
        imgLeft: sysInfo.windowWidth / 2,
        CROPPER_WIDTH: this.data.width,
        CROPPER_HEIGHT: this.data.height,
        canvasHeight: this.data.height,
        canvasWidth: this.data.width,
        ctx: wx.createCanvasContext('tui-image-cropper', this)
      },()=>{
        if(!this.data.imageUrl){
          this.imageReset();
        }
        this.setData({
          props: '1,1'
        })
        setTimeout(() => {
          this.triggerEvent('ready', {});
        }, 180);
      })
    }
  },
  methods: {
    //返回裁剪后图片信息
    getImage() {
      if (!this.data.imageUrl) {
        wx.showToast({
          title: '请选择图片',
          icon: 'none'
        });
        return;
      }
      this.data.loadding && this.showLoading();
      let draw = () => {
        //图片实际大小
        let imgWidth = this.data.imgWidth * this.data.scale * this.data.scaleRatio;
        let imgHeight = this.data.imgHeight * this.data.scale * this.data.scaleRatio;
        //canvas和图片的相对距离
        let xpos = this.data.imgLeft - this.data.cutX;
        let ypos = this.data.imgTop - this.data.cutY;
        //旋转画布
        this.data.ctx.translate(xpos * this.data.scaleRatio, ypos * this.data.scaleRatio);
        this.data.ctx.rotate((this.data.angle * Math.PI) / 180);
        this.data.ctx.drawImage(this.data.imageUrl, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        this.data.ctx.draw(false, () => {
          let params = {
            width: this.data.canvasWidth * this.data.scaleRatio,
            height: Math.round(this.data.canvasHeight * this.data.scaleRatio),
            destWidth: this.data.canvasWidth * this.data.scaleRatio,
            destHeight: Math.round(this.data.canvasHeight) * this.data.scaleRatio,
            fileType: 'png',
            quality: this.data.quality
          };
          let data = {
            url: '',
            base64: '',
            width: this.data.canvasWidth * this.data.scaleRatio,
            height: this.data.canvasHeight * this.data.scaleRatio
          };

          if (this.data.isBase64) {
            wx.canvasGetImageData({
              canvasId: 'tui-image-cropper',
              x: 0,
              y: 0,
              width: this.data.canvasWidth * this.data.scaleRatio,
              height: Math.round(this.data.canvasHeight * this.data.scaleRatio),
              success: res => {
                const arrayBuffer = new Uint8Array(res.data);
                const base64 = wx.arrayBufferToBase64(arrayBuffer);
                data.base64 = base64;
                this.data.loadding && wx.hideLoading();
                this.triggerEvent('cropper', data);
              }
            });
          } else {
            wx.canvasToTempFilePath({
                ...params,
                canvasId: 'tui-image-cropper',
                success: res => {
                  data.url = res.tempFilePath;
                  data.base64 = res.tempFilePath;
                  this.data.loadding && wx.hideLoading();
                  this.triggerEvent('cropper', data);
                },
                fail(res) {
                  console.log(res)
                }
              },
              this
            );
          }

        });
      };
      if (this.data.CROPPER_WIDTH != this.data.canvasWidth || this.data.CROPPER_HEIGHT != this.data.canvasHeight) {
        this.setData({
          CROPPER_WIDTH: this.data.canvasWidth,
          CROPPER_HEIGHT: this.data.canvasHeight
        }, () => {
          setTimeout(() => {
            draw();
          }, 80);
        })
      } else {
        draw();
      }
    },
    change(e) {
      this.setData({
        cutX: e.cutX || 0,
        cutY: e.cutY || 0,
        canvasWidth: e.canvasWidth || 100,
        canvasHeight: e.canvasHeight || 100,
        imgWidth: e.imgWidth || 100,
        imgHeight: e.imgHeight || 100,
        scale: e.scale || 1,
        angle: e.angle || 0,
        imgTop: e.imgTop || 0,
        imgLeft: e.imgLeft || 0
      })
    },
    imageReset() {
      let sys = this.data.sysInfo || wx.getSystemInfoSync();
      this.data.resetChange++;
      this.setData({
        scale: 1,
        angle: 0,
        imgTop: sys.windowHeight / 2,
        imgLeft: sys.windowWidth / 2,
        props: `4,${this.data.resetChange}`
      }, () => {
        //初始化旋转角度 0deg
        this.triggerEvent('initAngle', {});
      })
    },
    imageLoad(e) {
      this.imageReset();
      wx.hideLoading();
      setTimeout(() => {
        this.triggerEvent('imageLoad', {});
      }, 20)
    },
    imgComputeSize(width, height) {
      //默认按图片最小边 = 对应裁剪框尺寸
      let imgWidth = width,
        imgHeight = height;
      if (imgWidth && imgHeight) {
        if (imgWidth / imgHeight > this.data.width / this.data.height) {
          imgHeight = this.data.height;
          imgWidth = (width / height) * imgHeight;
        } else {
          imgWidth = this.data.width;
          imgHeight = (height / width) * imgWidth;
        }
      } else {
        let sys = this.data.sysInfo || wx.getSystemInfoSync();
        imgWidth = sys.windowWidth;
        imgHeight = 0;
      }
      this.data.sizeChange++;
      this.setData({
        imgWidth: imgWidth,
        imgHeight: imgHeight,
        props: `2,${this.data.sizeChange}`
      })

    },
    moveStop() {
      clearTimeout(this.data.TIME_CUT_CENTER);
      this.data.TIME_CUT_CENTER = setTimeout(() => {
        //动画启动
        if (!this.data.cutAnimation) {
          this.data.centerChange++;
          this.setData({
            cutAnimation: true,
            props:`5,${this.data.centerChange}`
          })
        }
      }, 666)
    },
    moveDuring() {
      clearTimeout(this.data.TIME_CUT_CENTER);
    },
    showLoading() {
      wx.showLoading({
        title: '请稍候...',
        mask: true
      });
    },
    stop() {},
    back() {
      wx.navigateBack();
    },
		angleChanged(val) {
			this.moveStop();
			if (this.data.limitMove && val % 90) {
				this.angle = Math.round(val / 90) * 90;
			}
      this.data.angleChange++;
      this.setData({
        props:`3,${this.data.angleChange}`
      })
		},
    setAngle() {
      this.setData({
        cutAnimation: true,
        angle: this.data.angle + 90
      },()=>{
        this.angleChanged(this.data.angle);
      })
    }

  }
})
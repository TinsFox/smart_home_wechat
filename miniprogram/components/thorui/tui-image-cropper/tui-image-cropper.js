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
    MOVE_THROTTLE: null, //触摸移动节流setTimeout
    MOVE_THROTTLE_FLAG: true, //节流标识
    TIME_CUT_CENTER: null,
    CROPPER_WIDTH: 200, //裁剪框宽
    CROPPER_HEIGHT: 200, //裁剪框高
    CUT_START: null,
    cutX: 0, //画布x轴起点
    cutY: 0, //画布y轴起点0
    touchRelative: [{
      x: 0,
      y: 0
    }], //手指或鼠标和图片中心的相对位置
    flagCutTouch: false, //是否是拖动裁剪框
    hypotenuseLength: 0, //双指触摸时斜边长度
    flagEndTouch: false, //是否结束触摸
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
    sysInfo: null
  },
  observers: {
    'imageUrl': function (val) {
      if (val) {
        this.imageReset();
        this.showLoading();
        wx.getImageInfo({
          src: val,
          success: res => {
            //计算图片尺寸
            this.imgComputeSize(res.width, res.height);
            if (this.data.limitMove) {
              //限制移动，不留空白处理
              this.imgMarginDetectionScale();
            }
          },
          fail: err => {
            this.imgComputeSize();
            if (this.data.limitMove) {
              this.imgMarginDetectionScale();
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
    },
    'canvasWidth': function (val) {
      if (val < this.data.minWidth) {
        this.setData({
          canvasWidth: this.data.minWidth
        })
      }
      this.computeCutSize();

    },
    'canvasHeight': function (val) {
      if (val < this.data.minHeight) {
        this.setData({
          canvasHeight: this.data.minHeight
        })
      }
      this.computeCutSize();
    },
    'angle': function (val) {
      this.moveStop();
      if (this.data.limitMove && val % 90) {
        this.setData({
          angle: Math.round(val / 90) * 90
        })
      }
      this.imgMarginDetectionScale();
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
        if (this.data.angle % 90) {
          this.setData({
            angle: Math.round(this.data.angle / 90) * 90
          })
        }
        this.imgMarginDetectionScale();
      }
    },
    'cutX,cutY': function (x, y) {
      this.cutDetectionPosition();
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
      })
      this.setCutCenter();
      //设置裁剪框大小>设置图片尺寸>绘制canvas
      this.computeCutSize();
      //检查裁剪框是否在范围内
      this.cutDetectionPosition();
      setTimeout(() => {
        this.triggerEvent('ready', {});
      }, 200);
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
    /**
     * 设置剪裁框和图片居中
     */
    setCutCenter() {
      let sys = this.data.sysInfo || wx.getSystemInfoSync();
      let cutY = (sys.windowHeight - this.data.canvasHeight) * 0.5;
      let cutX = (sys.windowWidth - this.data.canvasWidth) * 0.5;
      //顺序不能变
      this.setData({
        imgTop: this.data.imgTop - this.data.cutY + cutY,
        cutY: cutY,
        imgLeft: this.data.imgLeft - this.data.cutX + cutX,
        cutX: cutX
      })
    },
    imageReset() {
      let sys = this.data.sysInfo || wx.getSystemInfoSync();
      this.setData({
        scale: 1,
        angle: 0,
        imgTop: sys.windowHeight / 2,
        imgLeft: sys.windowWidth / 2
      })
    },
    imageLoad(e) {
      this.imageReset();
      wx.hideLoading();
      setTimeout(() => {
        this.triggerEvent('imageLoad', {});
      }, 20)
    },
    //检测剪裁框位置是否在允许的范围内(屏幕内)
    cutDetectionPosition() {
      let cutDetectionPositionTop = () => {
          //检测上边距是否在范围内
          if (this.data.cutY < 0) {
            this.setData({
              cutY: 0
            })
          }
          if (this.data.cutY > this.data.sysInfo.windowHeight - this.data.canvasHeight) {
            this.setData({
              cutY: this.data.sysInfo.windowHeight - this.data.canvasHeight
            })
          }
        },
        cutDetectionPositionLeft = () => {
          //检测左边距是否在范围内
          if (this.data.cutX < 0) {
            this.setData({
              cutX: 0
            })
          }
          if (this.data.cutX > this.data.sysInfo.windowWidth - this.data.canvasWidth) {
            this.setData({
              cutX: this.data.sysInfo.windowWidth - this.data.canvasWidth
            })
          }
        };
      //裁剪框坐标处理（如果只写一个参数则另一个默认为0，都不写默认居中）
      if (this.data.cutY == null && this.data.cutX == null) {
        let cutY = (this.data.sysInfo.windowHeight - this.data.canvasHeight) * 0.5;
        let cutX = (this.data.sysInfo.windowWidth - this.data.canvasWidth) * 0.5;
        this.setData({
          cutY: cutY,
          cutX: cutX
        })
      } else if (this.data.cutY != null && this.data.cutX != null) {
        cutDetectionPositionTop();
        cutDetectionPositionLeft();
      } else if (this.data.cutY != null && this.data.cutX == null) {
        cutDetectionPositionTop();
        this.setData({
          cutX: (this.data.sysInfo.windowWidth - this.data.canvasWidth) / 2
        })
      } else if (this.data.cutY == null && this.data.cutX != null) {
        cutDetectionPositionLeft();
        this.setData({
          cutY: (this.data.sysInfo.windowHeight - this.data.canvasHeight) / 2
        })
      }
    },
    /**
     * 图片边缘检测-位置
     */
    imgMarginDetectionPosition(scale) {
      if (!this.data.limitMove) return;
      let left = this.data.imgLeft;
      let top = this.data.imgTop;
      scale = scale || this.data.scale;
      let imgWidth = this.data.imgWidth;
      let imgHeight = this.data.imgHeight;
      if ((this.data.angle / 90) % 2) {
        imgWidth = this.data.imgHeight;
        imgHeight = this.data.imgWidth;
      }
      left = this.data.cutX + (imgWidth * scale) / 2 >= left ? left : this.data.cutX + (imgWidth * scale) / 2;
      left = this.data.cutX + this.data.canvasWidth - (imgWidth * scale) / 2 <= left ? left : this.data.cutX + this.data.canvasWidth - (
        imgWidth * scale) / 2;
      top = this.data.cutY + (imgHeight * scale) / 2 >= top ? top : this.data.cutY + (imgHeight * scale) / 2;
      top = this.data.cutY + this.data.canvasHeight - (imgHeight * scale) / 2 <= top ? top : this.data.cutY + this.data.canvasHeight - (
        imgHeight * scale) / 2;
      this.setData({
        imgLeft: left,
        imgTop: top,
        scale: scale
      })
    },
    /**
     * 图片边缘检测-缩放
     */
    imgMarginDetectionScale() {
      if (!this.data.limitMove) return;
      let scale = this.data.scale;
      let imgWidth = this.data.imgWidth;
      let imgHeight = this.data.imgHeight;
      if ((this.data.angle / 90) % 2) {
        imgWidth = this.data.imgHeight;
        imgHeight = this.data.imgWidth;
      }
      if (imgWidth * scale < this.data.canvasWidth) {
        scale = this.data.canvasWidth / imgWidth;
      }
      if (imgHeight * scale < this.canvasHeight) {
        scale = Math.max(scale, this.data.canvasHeight / imgHeight);
      }
      this.imgMarginDetectionPosition(scale);
    },
    /**
     * 计算图片尺寸
     */
    imgComputeSize(width, height) {
      //默认按图片最小边 = 对应裁剪框尺寸
      let imgWidth = width,
        imgHeight = height;
      if (imgWidth && imgHeight) {
        if (imgWidth / imgHeight > (this.data.canvasWidth || this.data.width) / (this.data.canvasHeight || this.data.height)) {
          imgHeight = this.data.canvasHeight || this.data.height;
          imgWidth = (width / height) * imgHeight;
        } else {
          imgWidth = this.data.canvasWidth || this.data.width;
          imgHeight = (height / width) * imgWidth;
        }
      } else {
        let sys = this.data.sysInfo || wx.getSystemInfoSync();
        imgWidth = sys.windowWidth;
        imgHeight = 0;
      }
      this.setData({
        imgWidth: imgWidth,
        imgHeight: imgHeight
      })
    },
    //改变截取框大小
    computeCutSize() {
      if (this.data.canvasWidth > this.data.sysInfo.windowWidth) {
        this.setData({
          canvasWidth: this.data.sysInfo.windowWidth
        })
      } else if (this.data.canvasWidth + this.data.cutX > this.data.sysInfo.windowWidth) {
        this.setData({
          cutX: this.data.sysInfo.windowWidth - this.data.cutX
        })
      }
      if (this.data.canvasHeight > this.data.sysInfo.windowHeight) {
        this.setData({
          canvasHeight: this.data.sysInfo.windowHeight
        })
      } else if (this.data.canvasHeight + this.data.cutY > this.data.sysInfo.windowHeight) {
        this.setData({
          cutY: this.data.sysInfo.windowHeight - this.data.cutY
        })
      }
    },
    //开始触摸
    start(e) {
      this.data.flagEndTouch = false
      if (e.touches.length == 1) {
        //单指拖动
        this.data.touchRelative[0] = {
          x: e.touches[0].clientX - this.data.imgLeft,
          y: e.touches[0].clientY - this.data.imgTop
        }
      } else {
        //双指放大
        let width = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
        let height = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
        this.data.touchRelative = [{
            x: e.touches[0].clientX - this.data.imgLeft,
            y: e.touches[0].clientY - this.data.imgTop
          },
          {
            x: e.touches[1].clientX - this.data.imgLeft,
            y: e.touches[1].clientY - this.data.imgTop
          }
        ]
        this.data.hypotenuseLength = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
      }
    },
    moveThrottle() {
      if (this.data.sysInfo.platform == 'android') {
        clearTimeout(this.data.MOVE_THROTTLE);
        this.data.MOVE_THROTTLE = setTimeout(() => {
          this.data.MOVE_THROTTLE_FLAG = true
        }, 800 / 40);
        return this.data.MOVE_THROTTLE_FLAG;
      } else {
        this.data.MOVE_THROTTLE_FLAG = true
      }
    },
    move(e) {
      if (this.data.flagEndTouch || !this.data.MOVE_THROTTLE_FLAG) return;
      this.data.MOVE_THROTTLE_FLAG = false
      this.moveThrottle();
      this.moveDuring();
      if (e.touches.length == 1) {
        //单指拖动
        let left = e.touches[0].clientX - this.data.touchRelative[0].x,
          top = e.touches[0].clientY - this.data.touchRelative[0].y;
        //图像边缘检测,防止截取到空白
        this.data.imgLeft = left;
        this.data.imgTop = top;
        this.imgMarginDetectionPosition();
        this.setData({
          imgLeft: this.data.imgLeft,
          imgTop: this.data.imgTop
        })
      } else {
        //双指放大
        let width = Math.abs(e.touches[0].clientX - e.touches[1].clientX),
          height = Math.abs(e.touches[0].clientY - e.touches[1].clientY),
          hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
          scale = this.data.scale * (hypotenuse / this.data.hypotenuseLength),
          current_deg = 0;
        scale = scale <= this.data.minScale ? this.data.minScale : scale;
        scale = scale >= this.data.maxScale ? this.data.maxScale : scale;
        //图像边缘检测,防止截取到空白
        this.data.scale = scale;
        this.imgMarginDetectionScale();

        //双指旋转(如果没禁用旋转)
        let touchRelative = [{
            x: e.touches[0].clientX - this.data.imgLeft,
            y: e.touches[0].clientY - this.data.imgTop
          },
          {
            x: e.touches[1].clientX - this.data.imgLeft,
            y: e.touches[1].clientY - this.data.imgTop
          }
        ];
        if (!this.data.disableRotate) {
          let first_atan = (180 / Math.PI) * Math.atan2(touchRelative[0].y, touchRelative[0].x);
          let first_atan_old = (180 / Math.PI) * Math.atan2(this.data.touchRelative[0].y, this.data.touchRelative[0].x);
          let second_atan = (180 / Math.PI) * Math.atan2(touchRelative[1].y, touchRelative[1].x);
          let second_atan_old = (180 / Math.PI) * Math.atan2(this.data.touchRelative[1].y, this.data.touchRelative[1].x);
          //当前旋转的角度
          let first_deg = first_atan - first_atan_old,
            second_deg = second_atan - second_atan_old;
          if (first_deg != 0) {
            current_deg = first_deg;
          } else if (second_deg != 0) {
            current_deg = second_deg;
          }
        }
        this.data.touchRelative = touchRelative;
        this.data.hypotenuseLength = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.setData({
          angle: this.data.angle + current_deg,
          scale: this.data.scale
        })
      }
    },
    //结束操作
    end(e) {
      this.data.flagEndTouch = true
      this.moveStop();

    },
    //裁剪框处理
    cutTouchMove(e) {
      if (this.data.flagCutTouch && this.data.MOVE_THROTTLE_FLAG) {
        if (this.data.lockRatio && (this.data.lockWidth || this.data.lockHeight)) return;
        //节流
        this.data.MOVE_THROTTLE_FLAG = false;
        this.moveThrottle();
        let width = this.data.canvasWidth,
          height = this.data.canvasHeight,
          cutY = this.data.cutY,
          cutX = this.data.cutX,
          size_correct = () => {
            width = width <= this.data.maxWidth ? (width >= this.data.minWidth ? width : this.data.minWidth) : this.data.maxWidth;
            height = height <= this.data.maxHeight ? (height >= this.data.minHeight ? height : this.data.minHeight) : this.data.maxHeight;
          },
          size_inspect = () => {
            if ((width > this.data.maxWidth || width < this.data.minWidth || height > this.data.maxHeight || height < this.data.minHeight) &&
              this.data.lockRatio) {
              size_correct();
              return false;
            } else {
              size_correct();
              return true;
            }
          };
        height = this.data.CUT_START.height + (this.data.CUT_START.corner > 1 && this.data.CUT_START.corner < 4 ? 1 : -1) * (this.data.CUT_START
          .y - e.touches[0].clientY);
        switch (this.data.CUT_START.corner) {
          case 1:
            width = this.data.CUT_START.width - this.data.CUT_START.x + e.touches[0].clientX;
            if (this.data.lockRatio) {
              height = width / (this.data.canvasWidth / this.data.canvasHeight);
            }
            if (!size_inspect()) return;
            break;
          case 2:
            width = this.data.CUT_START.width - this.data.CUT_START.x + e.touches[0].clientX;
            if (this.data.lockRatio) {
              height = width / (this.data.canvasWidth / this.data.canvasHeight);
            }
            if (!size_inspect()) return;
            cutY = this.data.CUT_START.cutY - (height - this.data.CUT_START.height);
            break;
          case 3:
            width = this.data.CUT_START.width + this.data.CUT_START.x - e.touches[0].clientX;
            if (this.data.lockRatio) {
              height = width / (this.data.canvasWidth / this.data.canvasHeight);
            }
            if (!size_inspect()) return;
            cutY = this.data.CUT_START.cutY - (height - this.data.CUT_START.height);
            cutX = this.data.CUT_START.cutX - (width - this.data.CUT_START.width);
            break;
          case 4:
            width = this.data.CUT_START.width + this.data.CUT_START.x - e.touches[0].clientX;
            if (this.data.lockRatio) {
              height = width / (this.data.canvasWidth / this.data.canvasHeight);
            }
            if (!size_inspect()) return;
            cutX = this.data.CUT_START.cutX - (width - this.data.CUT_START.width);
            break;
          default:
            break;
        }
        if (!this.data.lockWidth && !this.data.lockHeight) {
          this.setData({
            canvasWidth: width,
            cutX: cutX,
            canvasHeight: height,
            cutY: cutY
          })
        } else if (!this.data.lockWidth) {
          this.setData({
            canvasWidth: width,
            cutX: cutX
          })
        } else if (!this.data.lockHeight) {
          this.setData({
            canvasHeight: height,
            cutY: cutY
          })
        }
        this.imgMarginDetectionScale();
      }
    },
    cutTouchStart(e) {
      let currentX = e.touches[0].clientX;
      let currentY = e.touches[0].clientY;

      /*
       * (右下-1 右上-2 左上-3 左下-4)
       * left_x [3,4]
       * top_y [2,3]
       * right_x [1,2]
       * bottom_y [1,4]
       */
      let left_x1 = this.data.cutX - 24;
      let left_x2 = this.data.cutX + 24;

      let top_y1 = this.data.cutY - 24;
      let top_y2 = this.data.cutY + 24;

      let right_x1 = this.data.cutX + this.data.canvasWidth - 24;
      let right_x2 = this.data.cutX + this.data.canvasWidth + 24;

      let bottom_y1 = this.data.cutY + this.data.canvasHeight - 24;
      let bottom_y2 = this.data.cutY + this.data.canvasHeight + 24;

      if (currentX > right_x1 && currentX < right_x2 && currentY > bottom_y1 && currentY < bottom_y2) {
        this.moveDuring();
        this.data.flagEndTouch = true
        this.data.flagCutTouch = true
        this.data.CUT_START = {
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          x: currentX,
          y: currentY,
          corner: 1
        }
      } else if (currentX > right_x1 && currentX < right_x2 && currentY > top_y1 && currentY < top_y2) {
        this.moveDuring();
        this.data.flagEndTouch = true
        this.data.flagCutTouch = true
        this.data.CUT_START = {
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          x: currentX,
          y: currentY,
          cutY: this.data.cutY,
          cutX: this.data.cutX,
          corner: 2
        }
      } else if (currentX > left_x1 && currentX < left_x2 && currentY > top_y1 && currentY < top_y2) {
        this.moveDuring();
        this.data.flagEndTouch = true
        this.data.flagCutTouch = true
        this.data.CUT_START = {
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          cutY: this.data.cutY,
          cutX: this.data.cutX,
          x: currentX,
          y: currentY,
          corner: 3
        }
      } else if (currentX > left_x1 && currentX < left_x2 && currentY > bottom_y1 && currentY < bottom_y2) {
        this.moveDuring();
        this.data.flagEndTouch = true
        this.data.flagCutTouch = true
        this.data.CUT_START = {
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          cutY: this.data.cutY,
          cutX: this.data.cutX,
          x: currentX,
          y: currentY,
          corner: 4
        }
      }
    },
    cutTouchEnd(e) {
      this.moveStop();
      this.data.flagCutTouch = false
    },
    //停止移动时需要做的操作
    moveStop() {
      //清空之前的自动居中延迟函数并添加最新的
      clearTimeout(this.data.TIME_CUT_CENTER);
      this.data.TIME_CUT_CENTER = setTimeout(() => {
        //动画启动
        if (!this.data.cutAnimation) {
          this.setData({
            cutAnimation: true
          })
        }
        this.setCutCenter();
      }, 800)
    },
    //移动中
    moveDuring() {
      //清空之前的自动居中延迟函数
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
    setAngle() {
      this.setData({
        cutAnimation: true,
        angle: this.data.angle + 90
      })
    }
  }
})
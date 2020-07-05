Component({
  properties: {
    /*
    		  传值需使用rpx进行转换保证各终端兼容
    		  px = rpx / 750 * wx.getSystemInfoSync().windowWidth
    		  圆形进度条(画布)宽度，直径 [px]
    		*/
    diam: {
      type: Number,
      value: 60
    },
    //圆形进度条(画布)高度，默认取diam值[当画半弧时传值，height有值时则取height]
    height: {
      type: Number,
      value: 0
    },
    //进度条线条宽度[px]
    lineWidth: {
      type: Number,
      value: 4
    },
    /*
     线条的端点样式
     butt：向线条的每个末端添加平直的边缘
     round	向线条的每个末端添加圆形线帽
     square	向线条的每个末端添加正方形线帽
    */
    lineCap: {
      type: String,
      value: 'round'
    },
    //圆环进度字体大小 [px]
    fontSize: {
      type: Number,
      value: 12
    },
    //圆环进度字体颜色
    fontColor: {
      type: String,
      value: '#5677fc'
    },
    //是否显示进度文字
    fontShow: {
      type: Boolean,
      value: true
    },
    /*
     自定义显示文字[默认为空，显示百分比，fontShow=true时生效]
     可以使用 slot自定义显示内容
    */
    percentText: {
      type: String,
      value: ''
    },
    //是否显示默认(背景)进度条
    defaultShow: {
      type: Boolean,
      value: true
    },
    //默认进度条颜色
    defaultColor: {
      type: String,
      value: '#CCC'
    },
    //进度条颜色
    progressColor: {
      type: String,
      value: '#5677fc'
    },
    //进度条渐变颜色[结合progressColor使用，默认为空]
    gradualColor: {
      type: String,
      value: ''
    },
    //起始弧度，单位弧度
    sAngle: {
      type: Number,
      value: -Math.PI / 2
    },
    //指定弧度的方向是逆时针还是顺时针。默认是false，即顺时针
    counterclockwise: {
      type: Boolean,
      value: false
    },
    //进度百分比 [10% 传值 10]
    percentage: {
      type: Number,
      value: 0,
      observer(val) {
        this.initDraw()
      }
    },
    //进度百分比缩放倍数[使用半弧为100%时，则可传2]
    multiple: {
      type: Number,
      value: 1
    },
    //动画执行速度，值越大动画越快（0.1~100）
    speed: {
      type: Number,
      value: 1
    },
    //backwards: 动画从头播；forwards：动画从上次结束点接着播
    activeMode: {
      type: String,
      value: 'backwards'
    }
  },
  data: {
    progressContext: null,
    canvas: null,
    //起始百分比
    startPercentage: 0
  },
  lifetimes: {
    ready: function() {
      //在组件在视图层布局完成后执行
      this.init()
    }
  },
  methods: {
    //初始化绘制
    init() {
      wx.createSelectorQuery().in(this)
        .select('#progressCanvasId')
        .fields({
          node: true,
          size: true,
        })
        .exec(this.initDraw.bind(this))
    },
    initDraw(res) {
      let start = this.data.activeMode === 'backwards' ? 0 : this.data.startPercentage;
      if (res) {
        const width = res[0].width
        const height = res[0].height
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        this.setData({
          progressContext: ctx,
          canvas: canvas
        })
        this.drawProgressCircular(start, ctx, canvas);
      } else {
        this.drawProgressCircular(start, this.data.progressContext, this.data.canvas);
      }
    },
    //默认(背景)圆环
    drawDefaultCircular(ctx, canvas) {
      //终止弧度
      let eAngle = Math.PI * (this.data.height ? 1 : 2) + this.data.sAngle;
      this.drawArc(ctx, eAngle, this.data.defaultColor);
    },
    drawPercentage(ctx, percentage) {
      ctx.save(); //save和restore可以保证样式属性只运用于该段canvas元素
      ctx.beginPath();
      ctx.fillStyle = this.data.fontColor;
      ctx.font = this.data.fontSize + "px Arial"; //设置字体大小和字体
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let radius = this.data.diam / 2;
      if (!this.data.percentText) {
        percentage = this.data.counterclockwise ? 100 - percentage * this.data.multiple : percentage * this.data.multiple;
        percentage = percentage.toFixed(0) + "%"
      } else {
        percentage = this.data.percentText
      }
      ctx.fillText(percentage, radius, radius);
      ctx.stroke();
      ctx.restore();
    },
    //进度圆环
    drawProgressCircular(startPercentage, ctx, canvas) {
      if (!ctx || !canvas) return;
      let that = this
      let percentage = that.data.percentage;
      let gradient = ctx.createLinearGradient(0, 0, that.data.diam, 0);
      gradient.addColorStop(0, that.data.progressColor);
      if (that.data.gradualColor) {
        gradient.addColorStop('1', that.data.gradualColor);
      }
      let requestId = null
      let renderLoop = () => {
        drawFrame((res) => {
          if (res) {
            requestId = canvas.requestAnimationFrame(renderLoop)
          } else {
            canvas.cancelAnimationFrame(requestId)
            requestId = null;
            renderLoop = null;
          }
        })
      }
      requestId = canvas.requestAnimationFrame(renderLoop)

      function drawFrame(callback) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (that.data.defaultShow) {
          that.drawDefaultCircular(ctx, canvas)
        }
        if (that.data.fontShow) {
          that.drawPercentage(ctx, startPercentage);
        }
        if (percentage === 0 || (that.data.counterclockwise && startPercentage === 100)) return;
        let eAngle = ((2 * Math.PI) / 100) * startPercentage + that.data.sAngle;
        that.drawArc(ctx, eAngle, gradient);
        that.triggerEvent('change', {
          percentage: startPercentage
        });
        if (startPercentage >= percentage) {
          that.setData({
            startPercentage: startPercentage
          })
          that.triggerEvent('end', {
            canvasId: that.data.progressCanvasId
          });
          canvas.cancelAnimationFrame(requestId)
          callback && callback(false)
          return;
        }
        let num = startPercentage + that.data.speed
        startPercentage = num > percentage ? percentage : num;
        callback && callback(true)
      }

    },
    //创建弧线
    drawArc(ctx, eAngle, strokeStyle) {
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = this.data.lineCap;
      ctx.lineWidth = this.data.lineWidth;
      ctx.strokeStyle = strokeStyle;
      let radius = this.data.diam / 2; //x=y
      ctx.arc(radius, radius, radius - this.data.lineWidth, this.data.sAngle, eAngle, this.data.counterclockwise);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }
})
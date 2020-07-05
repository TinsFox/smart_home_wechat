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
    //动画执行时间[单位毫秒，低于50无动画]
    duration: {
      type: Number,
      value: 1500
    },
    //backwards: 动画从头播；forwards：动画从上次结束点接着播
    activeMode: {
      type: String,
      value: 'backwards'
    }
  },
  data: {
    progressCanvasId: "progressCanvasId",
    defaultCanvasId: "defaultCanvasId",
    progressContext: null,
    linearGradient: null,
    //起始百分比
    startPercentage: 0,
    timer: null
  },
  lifetimes: {
    ready: function() {
      //在组件在视图层布局完成后执行
      this.initDraw(true)
    }
  },
  methods: {
    //初始化绘制
    initDraw(init) {
      this.data.startPercentage = this.data.activeMode === 'backwards' ? 0 : this.data.startPercentage;
      if (this.data.defaultShow && init) {
        this.drawDefaultCircular();
      }

      let time = this.data.duration / this.data.percentage;
      this.drawProgressCircular();
      this.data.timer = setInterval(() => {
        this.drawProgressCircular();
      }, time)
    },
    //默认(背景)圆环
    drawDefaultCircular() {
      let ctx = wx.createCanvasContext(this.data.defaultCanvasId, this);
      ctx.setLineWidth(this.data.lineWidth);
      ctx.setStrokeStyle(this.data.defaultColor);
      //终止弧度
      let eAngle = Math.PI * (this.data.height ? 1 : 2) + this.data.sAngle;
      this.drawArc(ctx, eAngle);
    },
    //进度圆环
    drawProgressCircular() {
      let ctx = this.data.progressContext;
      let gradient = this.data.linearGradient;
      if (!ctx) {
        ctx = wx.createCanvasContext(this.data.progressCanvasId, this);
        //创建一个线性的渐变颜色 CanvasGradient对象
        gradient = ctx.createLinearGradient(0, 0, this.data.diam, 0);
        gradient.addColorStop('0', this.data.progressColor);
        if (this.data.gradualColor) {
          gradient.addColorStop('1', this.data.gradualColor);
        }
        this.setData({
          progressContext: ctx,
          linearGradient: gradient
        })
      }
      ctx.setLineWidth(this.data.lineWidth);
      ctx.setStrokeStyle(gradient);
      let time = this.data.duration / this.data.percentage;
      if (this.data.percentage > 0 || !this.data.fontShow) {
        this.data.startPercentage = this.data.duration < 50 ? this.data.percentage - 1 : this.data.startPercentage;
        this.data.startPercentage++;
        if (this.data.startPercentage > this.data.percentage) {
          this.triggerEvent('end', {
            canvasId: this.data.progressCanvasId
          });
          clearInterval(this.data.timer)
          return;
        }
      }
      if (this.data.fontShow) {
        ctx.setFontSize(this.data.fontSize);
        ctx.setFillStyle(this.data.fontColor);
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');
        let percentage = this.data.percentText;
        if (!percentage) {
          percentage = this.data.counterclockwise ? 100 - this.data.startPercentage * this.data.multiple : this.data.startPercentage * this.data.multiple;
          percentage = `${percentage}%`;
        }
        let radius = this.data.diam / 2;
        ctx.fillText(percentage, radius, radius);
        if (this.data.percentage === 0 || (this.data.counterclockwise && this.data.startPercentage === 100)) {
          ctx.draw();
          clearInterval(this.data.timer)
          return;
        }
      }
      let eAngle = ((2 * Math.PI) / 100) * this.data.startPercentage + this.data.sAngle;
      this.drawArc(ctx, eAngle);
      this.triggerEvent('change', {
        percentage: this.data.startPercentage
      });
    },
    //创建弧线
    drawArc(ctx, eAngle) {
      ctx.setLineCap(this.data.lineCap);
      ctx.beginPath();
      let radius = this.data.diam / 2; //x=y
      ctx.arc(radius, radius, radius - this.data.lineWidth, this.data.sAngle, eAngle, this.data.counterclockwise);
      ctx.stroke();
      ctx.draw();
    }
  }
})
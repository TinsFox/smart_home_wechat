const calendar = require("./tui-calendar-convert.js")
Component({
  properties: {
    //1-切换月份和年份 2-切换月份
    arrowType: {
      type: [Number, String],
      value: 1
    },
    //1-单个日期选择 2-开始日期+结束日期选择
    type: {
      type: [Number, String],
      value: 1
    },
    //可切换最大年份
    maxYear: {
      type: Number,
      value: 2030
    },
    //可切换最小年份
    minYear: {
      type: Number,
      value: 1920
    },
    //最小可选日期(不在范围内日期禁用不可选)
    minDate: {
      type: String,
      value: '1920-01-01'
    },
    /**
     * 最大可选日期
     * 默认最大值为今天，之后的日期不可选
     * 2030-12-31
     * */
    maxDate: {
      type: String,
      value: ''
    },
    //显示圆角
    radius: {
      type: Boolean,
      value: true
    },
    //状态 数据顺序与当月天数一致，index=>day
    /**
       * [{
         * text:"", 描述：2字以内
         * value:"",状态值 
         * bgColor:"",背景色
         * color:""  文字颜色,
         * check:false //是否显示对勾
         * 
       }]
       * 
       * **/
    status: {
      type: Array,
      value: [],
      observer(val) {
        this.setData(this.data.statusChange)
      }
    },
    //月份切换箭头颜色
    monthArrowColor: {
      type: String,
      value: '#999'
    },
    //年份切换箭头颜色
    yearArrowColor: {
      type: String,
      value: '#bcbcbc'
    },
    //默认日期字体颜色
    color: {
      type: String,
      value: '#333'
    },
    //选中|起始结束日期背景色
    activeBgColor: {
      type: String,
      value: '#5677fc'
    },
    //选中|起始结束日期字体颜色
    activeColor: {
      type: String,
      value: '#fff'
    },
    //范围内日期背景色
    rangeBgColor: {
      type: String,
      value: 'rgba(86,119,252,0.1)'
    },
    //范围内日期字体颜色
    rangeColor: {
      type: String,
      value: '#5677fc'
    },
    //type=2时生效，起始日期自定义文案
    startText: {
      type: String,
      value: '开始'
    },
    //type=2时生效，结束日期自定义文案
    endText: {
      type: String,
      value: '结束'
    },
    //按钮样式类型
    btnType: {
      type: String,
      value: 'primary'
    },
    //固定在底部
    isFixed: {
      type: Boolean,
      value: false
    },
    //固定日历容器高度，isFixed=true时生效
    fixedHeight: {
      type: Boolean,
      value: true,
      observer(val) {
        if (val) {
          this.initDateHeight();
        }
      }
    },
    //当前选中日期带选中效果
    isActiveCurrent: {
      type: Boolean,
      value: true
    },
    //切换年月是否触发事件 type=1时生效
    isChange: {
      type: Boolean,
      value: false
    },
    //切换日期时是否延迟渲染[isChange=true时生效，status改变时同步更新]
    //当需要优先显示日历再 渲染状态status时 传false
    isDelay: {
      type: Boolean,
      value: true
    },
    //是否显示农历
    lunar: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isShow: false,
    weekday: 1, // 星期几,值为1-7
    weekdayArr: [],
    days: 0, //当前月有多少天
    daysArr: [],
    daysLunarArr: [],
    showTitle: '',
    year: 2020,
    month: 0,
    day: 0,
    startYear: 0,
    startMonth: 0,
    startDay: 0,
    endYear: 0,
    endMonth: 0,
    endDay: 0,
    today: '',
    activeDate: '',
    startDate: '',
    endDate: '',
    isStart: true,
    min: {},
    max: {},
    dateHeight: 20,
    statusChange: {}
  },
  observers: {
    'type,minDate,maxDate': function (type, minDate, maxDate) {
      this.init();
    }
  },
  lifetimes: {
    attached: function () {
      this.init();
    }
  },
  methods: {
    getLunar(year, month, day) {
      let obj = calendar.solar2lunar(year, month, day);
      return obj.IDayCn
    },
    initDateHeight() {
      if (this.data.fixedHeight && this.data.isFixed) {
        this.setData({
          dateHeight: wx.getSystemInfoSync().windowWidth / 7
        })
      }
    },
    init() {
      this.initDateHeight();
      let now = new Date();
      let today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      this.setData({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        today: today,
        activeDate: today,
        min: this.initDate(this.data.minDate),
        max: this.initDate(this.data.maxDate || today),
        startDate: '',
        startYear: 0,
        startMonth: 0,
        startDay: 0,
        endYear: 0,
        endMonth: 0,
        endDay: 0,
        endDate: '',
        isStart: true
      })
      this.changeData();

    },
    //日期处理
    initDate(date) {
      let fdate = date.split('-');
      return {
        year: Number(fdate[0] || 1920),
        month: Number(fdate[1] || 1),
        day: Number(fdate[2] || 1)
      };
    },
    openDisAbled: function (year, month, day) {
      let bool = true;
      let date = `${year}/${month}/${day}`;
      // let today = this.today.replace(/\-/g, '/');
      let min = `${this.data.min.year}/${this.data.min.month}/${this.data.min.day}`;
      let max = `${this.data.max.year}/${this.data.max.month}/${this.data.max.day}`;
      let timestamp = new Date(date).getTime();
      if (timestamp >= new Date(min).getTime() && timestamp <= new Date(max).getTime()) {
        bool = false;
      }
      return bool;
    },
    generateArray: function (start, end) {
      return Array.from(new Array(end + 1).keys()).slice(start);
    },
    formatNum: function (num) {
      return num < 10 ? '0' + num : num + '';
    },
    stop() {
      return !this.data.isFixed;
    },
    //一个月有多少天
    getMonthDay(year, month) {
      let days = new Date(year, month, 0).getDate();
      return days;
    },
    getWeekday(year, month) {
      let date = new Date(`${year}/${month}/01 00:00:00`);
      return date.getDay();
    },
    checkRange(year) {
      let overstep = false;
      if (year < this.data.minYear || year > this.data.maxYear) {
        wx.showToast({
          title: '日期超出范围啦~',
          icon: 'none'
        });
        overstep = true;
      }
      return overstep;
    },
    changeMonth(e) {
      let isAdd = e.currentTarget.dataset.add;
      if (isAdd == 1) {
        let month = this.data.month + 1;
        let year = month > 12 ? this.data.year + 1 : this.data.year;
        if (!this.checkRange(year)) {
          this.data.year = year;
          this.data.month = month > 12 ? 1 : month;
          this.changeData();
        }
      } else {
        let month = this.data.month - 1;
        let year = month < 1 ? this.data.year - 1 : this.data.year;
        if (!this.checkRange(year)) {
          this.data.year = year;
          this.data.month = month < 1 ? 12 : month;
          this.changeData();
        }
      }
    },
    changeYear(e) {
      let isAdd = e.currentTarget.dataset.add;
      let year = isAdd == 1 ? this.data.year + 1 : this.data.year - 1;
      if (!this.checkRange(year)) {
        this.data.year = year;
        this.changeData();
      }
    },
    changeData() {
      let days = this.getMonthDay(this.data.year, this.data.month);
      let daysArr = this.generateArray(1, days);
      let daysLunarArr = [];

      for (let i = 0, length = daysArr.length; i < length; i++) {
        let lunarText = this.getLunar(this.data.year, this.data.month, i + 1)
        daysLunarArr.push(lunarText)
      }
      let weekday = this.getWeekday(this.data.year, this.data.month)

      let statusChange = {
        days: days,
        daysArr: daysArr,
        weekday: weekday,
        weekdayArr: this.generateArray(1, weekday),
        showTitle: `${this.data.year}年${this.data.month}月`,
        daysLunarArr: daysLunarArr,
        year: this.data.year,
        month: this.data.month
      }

      if (this.data.isChange && this.data.type == 1) {
        if (this.data.isDelay) {
          this.data.statusChange = statusChange;
        } else {
          this.setData(statusChange)
        }
        this.btnFix(true);
      } else {
        this.setData(statusChange)
      }
    },
    dateClick: function (e) {
      let day = Number(e.currentTarget.dataset.index);
      day += 1;
      if (!this.openDisAbled(this.data.year, this.data.month, day)) {
        this.setData({
          day: day
        })
        let date = `${this.data.year}-${this.data.month}-${day}`;
        if (this.data.type == 1) {
          this.setData({
            activeDate: date
          })
        } else {
          let compare = new Date(date.replace(/\-/g, '/')).getTime() < new Date(this.data.startDate.replace(/\-/g, '/')).getTime();

          if (this.data.isStart || compare) {
            this.setData({
              startDate: date,
              startYear: this.data.year,
              startMonth: this.data.month,
              startDay: this.data.day,
              endYear: 0,
              endMonth: 0,
              endDay: 0,
              endDate: '',
              activeDate: '',
              isStart: false
            })
          } else {
            this.setData({
              endDate: date,
              endYear: this.data.year,
              endMonth: this.data.month,
              endDay: this.data.day,
              isStart: true
            })
          }
        }
        if (!this.data.isFixed) {
          this.btnFix();
        }
      }
    },
    show() {
      this.setData({
        isShow: true
      })
    },
    hide() {
      this.setData({
        isShow: false
      })
    },
    getWeekText(date) {
      date = new Date(`${date.replace(/\-/g, '/')} 00:00:00`);
      let week = date.getDay();
      return '星期' + ['日', '一', '二', '三', '四', '五', '六'][week];
    },
    btnClickFix(e) {
      this.btnFix()
    },
    btnFix(show) {
      if (!show) {
        this.hide();
      }
      if (this.data.type == 1) {
        let arr = this.data.activeDate.split('-');
        let year = this.data.isChange ? this.data.year : Number(arr[0]);
        let month = this.data.isChange ? this.data.month : Number(arr[1]);
        let day = this.data.isChange ? this.data.day : Number(arr[2]);
        //当前月有多少天
        let days = this.getMonthDay(year, month);
        let result = `${year}-${this.formatNum(month)}-${this.formatNum(day)}`;
        let weekText = this.getWeekText(result);
        let isToday = false;
        if (`${year}-${month}-${day}` == this.data.today) {
          //今天
          isToday = true;
        }
        let lunar = calendar.solar2lunar(year, month, day)
        this.triggerEvent('change', {
          year: year,
          month: month,
          day: day,
          days: days,
          result: result,
          week: weekText,
          isToday: isToday,
          switch: show, //是否是切换年月操作
          lunar: lunar
        });
      } else {
        if (!this.data.startDate || !this.data.endDate) return;
        let startMonth = this.formatNum(this.data.startMonth);
        let startDay = this.formatNum(this.data.startDay);
        let startDate = `${this.data.startYear}-${startMonth}-${startDay}`;
        let startWeek = this.getWeekText(startDate);
        let startLunar = calendar.solar2lunar(this.data.startYear, startMonth, startDay);

        let endMonth = this.formatNum(this.data.endMonth);
        let endDay = this.formatNum(this.data.endDay);
        let endDate = `${this.data.endYear}-${endMonth}-${endDay}`;
        let endWeek = this.getWeekText(endDate);
        let endLunar = calendar.solar2lunar(this.data.endYear, endMonth, endDay);
        this.triggerEvent('change', {
          startYear: this.data.startYear,
          startMonth: this.data.startMonth,
          startDay: this.data.startDay,
          startDate: startDate,
          startWeek: startWeek,
          startLunar: startLunar,
          endYear: this.data.endYear,
          endMonth: this.data.endMonth,
          endDay: this.data.endDay,
          endDate: endDate,
          endWeek: endWeek,
          endLunar: endLunar
        });
      }
    }
  }
})
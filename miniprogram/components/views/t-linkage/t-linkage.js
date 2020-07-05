let timer = null;
Component({
  properties: {
    scrollTop: {
      type: Number,
      observer(val) {
        if (this.data.initialize != 0) {
          this.updateScrollChange(() => {
            this.updateStickyChange();
            this.setData({
              initialize: 0
            })
          });
        } else {
          this.updateStickyChange();
        }
      }
    },
    recalc: {
      type: Number,
      value: 0,
      observer(val) {
        this.updateScrollChange(() => {
          this.updateStickyChange();
          this.setData({
            initialize: 0
          })
        });
      }
    },
    //px
    distanceTop: {
      type: Number,
      value: 0
    },
    //列表中的索引值
    index: {
      type: [Number, String],
      value: 0
    }
  },
  data: {
    top: 0,
    height: 0,
    initialize: 0 //重新初始化
  },
  lifetimes: {
    attached: function () {
      this.setData({
        initialize: this.data.recalc
      })
    },
    ready: function () {
      setTimeout(() => {
        this.updateScrollChange();
      }, 20);
    }
  },
  methods: {
    updateStickyChange() {
      const top = this.data.top;
      const height = this.data.height;
      const scrollTop = this.data.scrollTop;
      let linkage = scrollTop + this.data.distanceTop >= top && scrollTop + this.data.distanceTop < top + height ? true : false;
      if (linkage) {
        this.triggerEvent('linkage', {
          isLinkage: linkage,
          index: this.data.index
        });
      }
    },
    updateScrollChange(callback) {
      if (timer) {
        clearTimeout(timer);
        timer = null
      }
      timer = setTimeout(() => {
        const className = '.tui-linkage-class';
        const query = wx.createSelectorQuery().in(this);
        query
          .select(className)
          .boundingClientRect(res => {
            if (res) {
              this.setData({
                top: res.top + (this.data.scrollTop || 0),
                height: res.height
              }, () => {
                clearTimeout(timer);
                timer = null
              })
              callback && callback();
            }
          })
          .exec();
      }, 0);
    }
  }
})
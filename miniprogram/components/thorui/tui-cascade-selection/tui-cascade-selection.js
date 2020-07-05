Component({
  properties: {
    //所有数据 or 第一级数据
    itemList: {
      type: Array,
      value: [],
      observer(val) {
        this.initData(val, -1);
      }
    },
    /*
       初始化默认选中数据
       [{
        text: "",//选中text
        subText: '',//选中subText
        value: '',//选中value
        src: '', ////选中src，没有则传空或不传
        index: 0, //选中数据在当前layer索引
        list: [{src: "", text: "", subText: "", value: 101}] //layer数据集合
      }];
    
    */
    defaultItemList: {
      type: Array,
      value: []
    },
    //是否显示header底部细线
    headerLine: {
      type: Boolean,
      value: true
    },
    //header背景颜色
    headerBgColor: {
      type: String,
      value: '#FFFFFF'
    },
    //顶部标签栏高度
    tabsHeight: {
      type: String,
      value: '88rpx'
    },
    //默认显示文字
    text: {
      type: String,
      value: '请选择'
    },
    //tabs 文字大小
    size: {
      type: Number,
      value: 28
    },
    //tabs 文字颜色
    color: {
      type: String,
      value: '#555'
    },
    //选中颜色
    activeColor: {
      type: String,
      value: '#5677fc'
    },
    //选中后文字加粗
    bold: {
      type: Boolean,
      value: true
    },
    //选中后是否显示底部线条
    showLine: {
      type: Boolean,
      value: true
    },
    //线条颜色
    lineColor: {
      type: String,
      value: '#5677fc'
    },
    //icon 大小
    checkMarkSize: {
      type: Number,
      value: 15
    },
    //icon 颜色
    checkMarkColor: {
      type: String,
      value: '#5677fc'
    },
    //item 图片宽度
    imgWidth: {
      type: String,
      value: '40rpx'
    },
    //item 图片高度
    imgHeight: {
      type: String,
      value: '40rpx'
    },
    //图片圆角
    radius: {
      type: String,
      value: '50%'
    },
    //item text颜色
    textColor: {
      type: String,
      value: '#333'
    },
    textActiveColor: {
      type: String,
      value: '#333'
    },
    //选中后字体是否加粗
    textBold: {
      type: Boolean,
      value: true
    },
    //item text字体大小
    textSize: {
      type: Number,
      value: 28
    },
    //text 是否不换行
    nowrap: {
      type: Boolean,
      value: false
    },
    //item subText颜色
    subTextColor: {
      type: String,
      value: '#999'
    },
    //item subText字体大小
    subTextSize: {
      type: Number,
      value: 24
    },
    // item padding
    padding: {
      type: String,
      value: '20rpx 30rpx'
    },
    //占位高度，第一条数据距离顶部距离
    firstItemTop: {
      type: String,
      value: '20rpx'
    },
    //swiper 高度
    height: {
      type: String,
      value: '300px'
    },
    //item  swiper 内容部分背景颜色
    backgroundColor: {
      type: String,
      value: '#FFFFFF'
    },
    //子集数据是否请求返回（默认false，一次性返回所有数据）
    request: {
      type: Boolean,
      value: false
    },
    //子级数据（当有改变时，默认当前选中项新增子级数据，request=true时生效）
    receiveData: {
      type: Array,
      value: [],
      observer(val) {
        this.subLevelData(val, this.data.currentTab);
      }
    },
    //改变值则重置数据
    reset: {
      type: [Number, String],
      value: 0,
      observer(val) {
        this.initData(this.data.itemList, -1);
      }
    }
  },
  data: {
    currentTab: 0,
    //tab栏scrollview滚动的位置
    scrollViewId: 'id__1',
    selectedArr: []
  },
  lifetimes: {
    attached: function () {
      let defaultItemList = this.data.defaultItemList || [];
      if (defaultItemList.length > 0) {
        defaultItemList.map(item => {
          item.scrollViewId = `id_${item.index}`
        })
        this.setData({
          selectedArr: defaultItemList,
          currentTab : defaultItemList.length - 1
        },()=>{
          this.checkCor()
        })
      } else {
        this.initData(this.data.itemList, -1);
      }
    }
  },
  methods: {
    initData(data, layer) {
      if (!data || data.length === 0) return;
      if (this.data.request) {
        //第一级数据
        this.subLevelData(data, layer);
      } else {
        this.subLevelData(this.getItemList(layer, -1), layer);
      }
    },
    removeChildren(data) {
      let list = data.map(item => {
        delete item['children'];
        return item;
      });
      return list;
    },
    getItemList(layer, index) {
      let list = [];
      let arr = JSON.parse(JSON.stringify(this.data.itemList));
      if (layer == -1) {
        list = this.removeChildren(arr);
      } else {
        let value = this.data.selectedArr[0].index;
        value = value == -1 ? index : value;
        list = arr[value].children || [];
        if (layer > 0) {
          for (let i = 1; i < layer + 1; i++) {
            let val = layer === i ? index : this.data.selectedArr[i].index;
            list = list[val].children || [];
            if (list.length === 0) break;
          }
        }
        list = this.removeChildren(list);
      }
      return list;
    },
    //滚动切换
    switchTab: function (e) {
      this.setData({
        currentTab: e.detail.current
      }, () => {
        this.checkCor();
      })
    },
    //点击标题切换当
    swichNav: function (e) {
      let cur = e.currentTarget.dataset.current;
      if (this.data.currentTab != cur) {
        this.setData({
          currentTab: cur
        })
      }
    },
    checkCor: function () {
      let item = this.data.selectedArr[this.data.currentTab];
      let scrollViewId = `selectedArr[${this.data.currentTab}].scrollViewId`;
      this.setData({
        [scrollViewId]: 'id__1'
      }, () => {
        setTimeout(() => {
          let val = item.index < 2 ? 0 : Number(item.index - 2);
          this.setData({
            [scrollViewId]: `id_${val}`
          })
        }, 1);
      })

      let viewId = this.data.currentTab > 1 ? `id_${this.data.currentTab - 1}` : "id_0";

      this.setData({
        scrollViewId: viewId
      })
    },
    change(e) {
      let dataset = e.currentTarget.dataset;
      let index = dataset.index;
      let subIndex = dataset.subindex;
      let subItem = dataset.subitem;
      let item = this.data.selectedArr[index];
      if (item.index == subIndex) return;
      let itemStr = `selectedArr[${index}]`;
      item.index = subIndex;
      item.text = subItem.text;
      item.value = subItem.value;
      item.subText = subItem.subText || '';
      item.src = subItem.src || '';
      this.setData({
        [itemStr]: item
      })
      this.triggerEvent('change', {
        layer: index,
        subIndex: subIndex, //layer=> Array index
        ...subItem
      });

      if (!this.data.request) {
        let data = this.getItemList(index, subIndex);
        this.subLevelData(data, index);
      }
    },
    //新增子级数据时处理
    subLevelData(data, layer) {
      if (!data || data.length === 0) {
        if (layer == -1) return;
        //完成选择
        let result = JSON.parse(JSON.stringify(this.data.selectedArr));
        let lastItem = result[result.length - 1] || {};
        let text = '';
        result.map(item => {
          text += item.text;
          delete item['list'];
          //delete item['index'];
          delete item['scrollViewId'];
          return item;
        });
        this.triggerEvent('complete', {
          result: result,
          value: lastItem.value,
          text: text,
          subText: lastItem.subText,
          src: lastItem.src
        });
      } else {
        //重置数据（ >layer层级）
        let item = [{
          text: this.data.text,
          subText: '',
          value: '',
          src: '',
          index: -1,
          scrollViewId: 'id__1',
          list: data
        }];
        if (layer == -1) {
          this.setData({
            selectedArr: item
          }, () => {
            this.setData({
              currentTab: this.data.selectedArr.length - 1
            })
          })
        } else {
          let retainArr = this.data.selectedArr.slice(0, layer + 1);
          this.setData({
            selectedArr: retainArr.concat(item)
          }, () => {
            this.setData({
              currentTab: this.data.selectedArr.length - 1
            })
          })
        }
      }
    }
  }
})
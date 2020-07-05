import fetch from '../../../common/httpRequest'
Component({
  properties: {
    //控制显示
    show: {
      type: Boolean,
      value: false
    },
    page: {
      type: Number,
      value: 1
    }
  },
  data: {

  },
  methods: {
    close() {
      this.triggerEvent("close",{})
    },
    btnPay(){
      this.close();
      fetch.href("/pages/template/mall/success/success")
    }
  }
})
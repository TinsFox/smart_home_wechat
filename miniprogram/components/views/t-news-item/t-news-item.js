Component({
  properties: {
    entity: {
      type: Object,
      value: {}
    },
    lastChild: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    bindClick() {
			this.triggerEvent('click');
		}
  }
})
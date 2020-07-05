import { Axios } from "../netWork/axios"
var axios = new Axios()
export default class Device {
  async getMyDevice(){
    return axios.requestAll({
      url : "/v1/device",
      method:"get"
    })
  }
  async getDeviceDetail(did){
    return axios.requestAll({
      url : "/v1/device/"+did,
      method:"get"
    })
  }
  async updateDeviceDetail(data){
    return axios.requestAll({
      url : "/v1/device/"+data.deviceID,
      method:"put",
      data:data
    })
  }
  async publish_message(data){
    return axios.requestAll({
      url : "/publish",
      method:"post",
      data:data
    })
  }
}




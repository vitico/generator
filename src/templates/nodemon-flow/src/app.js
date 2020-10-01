// @flow
import cron from "node-cron";
import winston from "winston";
import TuyaWebApi from "./tuyaweapi";
import moment from "moment";

const api = new TuyaWebApi(
  "hidalgovictor@hotmail.com",
  "Zulenego12",
  "1809",
  "smart_life",
  winston
);
type Device = {
  id: string,
  name: string
}
type DeviceState = {
  online: boolean,
  state: boolean
}
type apiDevice = {
  data: DeviceState,
  name: string,
  icon: string,
  id: string,
  dev_type: string,
  ha_type: string
};
let deviceShutdownTime: {
  [deviceID: string]: moment.Moment
} = {};
let devicesToWatch: Array<string> = ["148868452cf432045f1c"];

function refreshDeviceState() {
  devicesToWatch.map((devId: string) => {
    api.discoverDevices().then((devices:apiDevice[])=>{
      devices.filter((dev:apiDevice)=>
        devicesToWatch.includes(dev.id)
      ).map((dev:apiDevice)=>{
        let resp = dev.data;
        let hasDevice = deviceShutdownTime.hasOwnProperty(devId);
        if (!resp.state) {
          if (hasDevice) {
            delete deviceShutdownTime[devId];
          }
        } else {
          if (!hasDevice) {
            deviceShutdownTime[devId] = moment().add(30, 'seconds');
          } else {
            if (deviceShutdownTime[devId].isBefore(moment())) {
              delete deviceShutdownTime[devId];
              api.setDeviceState(devId, "turnOnOff", {value: 0});
            }
          }
        }

      });
    })
  })
}

api.getOrRefreshToken().then(token => {
  api.token = token;
  cron.schedule("*/5 * * * *", () => {
    console.log("refreshing state");
    refreshDeviceState();
  })
})

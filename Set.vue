<template>
  <div class="component-container">
    <span class="lab">设备控制：</span>
    <button @click="toggleDeviceControl" class="buttonStyle">设置</button>
    <div v-if="showDeviceControl">
      <h2>设备控制</h2>
      <button @click="toggleTable" class="buttonStyle">显示/隐藏</button>
      <el-table v-if="showTable" :data="devices" border style="width: 100%" class="uitable">
        <el-table-column prop="name" label="设备名称" width="180"></el-table-column>
        <el-table-column prop="status" label="设备状态"> </el-table-column>
        <el-table-column label="打开设备">
          <template slot-scope="scope">
            <el-button type="success" @click="toggleDeviceStatus(scope.row.id, 'open')" :disabled="autoControlEnabled">开启设备</el-button>
          </template>
        </el-table-column>
        <el-table-column label="关闭设备">
          <template slot-scope="scope">
            <el-button type="success" @click="toggleDeviceStatus(scope.row.id, 'close')" :disabled="autoControlEnabled">关闭设备</el-button>
          </template>
        </el-table-column>
        <el-table-column label="删除">
          <template slot-scope="scope">
            <el-button type="danger" icon="el-icon-delete" circle @click="deleteDevice(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <div>
        <h2>MQTT 自动控制</h2>
        <button @click="enableAutoControl" :disabled="autoControlEnabled" class="buttonStyle">开启自动控制</button>
        <button @click="disableAutoControl" :disabled="!autoControlEnabled" class="buttonStyle">关闭自动控制</button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';
import { Table, TableColumn } from "element-ui"; // 导入el-table和el-table-column组件
Vue.use(Table)
Vue.use(TableColumn)

export default {
  name: 'Set',
  data() {
    return {
      showDeviceControl: false,
      devices: [],
      autoControlEnabled: false,
      showTable: false, // 控制表格的显示与隐藏
    };
  },
  methods: {
    toggleDeviceControl() {
      this.showDeviceControl = !this.showDeviceControl;
      if (this.showDeviceControl) {
        this.getDevices();
      }
    },
    getDevices() {
      axios
        .get('http://127.0.0.1:3000/devices')
        .then((response) => {
          this.devices = response.data;
        })
        .catch((error) => {
          console.error('无法获取设备列表:', error);
        });
    },
    toggleDeviceStatus(deviceId, status) {
      axios
        .put(`http://127.0.0.1:3000/devices/${deviceId}`, { status })
        .then((response) => {
          console.log(response.data);
          const device = this.devices.find((device) => device.id === deviceId);
          if (device) {
            device.status = status;
            // 向后端发送指令
            this.sendCommand(deviceId, device.name, status);
          }
        })
        .catch((error) => {
          console.error('更新设备状态出错:', error);
        });
    },
    sendCommand(deviceId, deviceName, status) {
      const command = {
        deviceid: deviceId,
        name:deviceName,
        order: status
      };

      axios
        .post('http://127.0.0.1:3000/command', command)
        .then((response) => {
          console.log('指令发送成功:', response.data);
          // 在此处理指令发送成功后的逻辑
        })
        .catch((error) => {
          console.error('发送指令出错:', error);
        });
    },
    deleteDevice(deviceId) {
      axios
        .delete(`http://127.0.0.1:3000/devices/${deviceId}`)
        .then((response) => {
          console.log(response.data);
          // 从设备列表中移除已删除的设备
          this.devices = this.devices.filter((device) => device.id !== deviceId);
        })
        .catch((error) => {
          console.error('删除设备出错:', error);
        });
    },
    enableAutoControl() {
      axios
        .post('http://127.0.0.1:3000/autoControl', { enabled: true })
        .then((response) => {
          console.log(response.data);
          this.autoControlEnabled = true;// 开启自动控制时，设置autoControlEnabled为true
        })
        .catch((error) => {
          console.error('无法开启自动控制:', error);
        });
    },
    disableAutoControl() {
      axios
        .post('http://127.0.0.1:3000/autoControl', { enabled: false })
        .then((response) => {
          console.log(response.data);
          this.autoControlEnabled = false;// 关闭自动控制时，设置autoControlEnabled为false
        })
        .catch((error) => {
          console.error('无法关闭自动控制:', error);
        });
    },
    toggleTable() {
      this.showTable = !this.showTable; // 切换showTable的值来控制表格的显示与隐藏
    },
  },
  mounted() {
    this.getDevices(); // 初始化获取设备列表

    // 每隔一段时间更新设备列表
    setInterval(() => {
      this.getDevices();
    }, 5000); // 每5秒钟更新一次设备列表
  },
  beforeDestroy() {
    // 清除定时器，避免内存泄漏
    clearInterval(this.intervalId);
  }
};
</script>

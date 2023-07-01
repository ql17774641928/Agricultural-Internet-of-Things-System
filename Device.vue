<template>
<div class="component-container">
      <div>
      <span class="lab">添加设备：</span>
      <input v-model="newDevice" type="text" placeholder="type-name-status" class="inputStyle">
      <button @click="addDevice" class="buttonStyle">添加设备</button>
       <button @click="getDevice" class="buttonStyle">getDevice</button>
      <button @click="toggleTable" class="buttonStyle">显示/隐藏图表</button>
      <el-table v-if="showTable" :data="devices" border style="width: 100%" class="uitable">
        <el-table-column prop="id" label="ID" width="180"></el-table-column>
        <el-table-column prop="name" label="设备名称" width="180"></el-table-column>
        <el-table-column prop="type" label="设备类型"> </el-table-column>
        <el-table-column prop="status" label="设备状态"> </el-table-column>
        <el-table-column label="删除">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" circle @click="deleteDevice(scope.row.id)"></el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>
</div>    
</template>

<script>
import Vue from 'vue'
import axios from "axios";
import { Table, TableColumn } from "element-ui"; // 导入el-table和el-table-column组件
Vue.use(Table)
Vue.use(TableColumn)
export default {
   name:'Device',
   data() {
    return {
      devices: [], // 存储设备表信息
      showTable: false, // 控制表格的显示与隐藏
      newDevice: '', // 保存用户输入的设备信息
    };
  },
methods:{
    getDevice(){
      //设备信息请求
     axios.get('http://127.0.0.1:3000/devices')
    .then(response => {
      this.devices = response.data;
    })
    .catch(error => {
      console.error('无法获取设备表数据:', error);
    });
    },
    updateStatus(deviceId, status) {
      axios
        .put(`http://127.0.0.1:3000/devices/${deviceId}`, { status })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("更新设备状态出错:", error);
        });
    },
    toggleTable() {
      this.showTable = !this.showTable; // 切换showTable的值来控制表格的显示与隐藏
    },
    addDevice() {
      axios.post('http://127.0.0.1:3000/devices', {
        deviceInfo: this.newDevice
      })
        .then((response) => {
          console.log(response.data);
          this.newDevice = ''; // 清空输入框
          this.getDevice(); // 重新获取设备列表
        })
        .catch((error) => {
          console.error("添加设备出错:", error);
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
}
}
</script>

<style>

</style>
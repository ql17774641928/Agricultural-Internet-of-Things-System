<template>
  <div class="component-container">
     <div class="alert-container">
      <el-alert
        v-for="(alert, index) in alerts"
        :key="index"
        :title="alert.message"
        type="warning"
        :closable="true"
        @close="removeAlert(index)"
      >
      </el-alert>
    </div>
    <div class="alert-history">
      <span class="lab">警告记录查询：</span>
      <button @click="getAlerts" class="buttonStyle">getAlerts</button>
      <button @click="toggleTable" class="buttonStyle">显示/隐藏图表</button>
      <el-table v-if="showTable" :data="alertRecords" border style="width: 100%" class="uitable">
        <el-table-column prop="id" label="ID" width="180"></el-table-column>
        <el-table-column prop="type" label="传感器类型" width="180"></el-table-column>
        <el-table-column prop="value" label="触发警报值"> </el-table-column>
        <el-table-column prop="time" label="触发警报时间"> </el-table-column>
        <el-table-column prop="dataid" label="对应数据ID"> </el-table-column>
        <el-table-column prop="dataid" label="删除"> 
          <template slot-scope="scope">
            <el-button type="danger" icon="el-icon-delete" circle @click="deleteAlert(scope.$index)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
// import mqtt from "mqtt";
import axios from "axios";
import { Table, TableColumn,Button } from "element-ui"; // 导入el-table和el-table-column组件
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Button)
export default {
  data() {
    return {
      alerts: [],
      alertRecords: [],
      showTable: false, // 控制表格的显示与隐藏
    };
  },
   
  methods: {
    addAlert(message) {
      this.alerts.push({ message });
    },
    removeAlert(index) {
      this.alerts.splice(index, 1);
    },
    deleteAlert(index) {
      const alertId = this.alertRecords[index].id;
      axios
        .delete(`http://127.0.0.1:3000/alerts/${alertId}`)
        .then((response) => {
          console.log("警告记录删除成功");
          this.alertRecords.splice(index, 1); // 从列表中删除警告记录
        })
        .catch((error) => {
          console.error("删除警告记录失败:", error);
        });
    },
    getAlerts() {
      axios
        .get("http://127.0.0.1:3000/alerts")
        .then((response) => {
          this.alertRecords = response.data;
        })
        .catch((error) => {
          console.error("获取警告记录失败:", error);
        });
    },
    toggleTable() {
      this.showTable = !this.showTable; // 切换showTable的值来控制表格的显示与隐藏
    },
  },
  mounted() {
    // 创建mqtt实例和订阅主题
    const client = mqtt.connect("ws://localhost:8083/mqtt");
    client.subscribe("test1/topic");

    // 监听mqtt消息
    client.on("message", (topic, message) => {
      const data = JSON.parse(message.toString());

      if (data.temperature > 30) {
        this.addAlert("温度已经高于30度了哟~~~");
      }
      if (data.temperature < 10) {
        this.addAlert("温度已经低于10度了哟~~~");
      }
      if (data.illumination > 25) {
        this.addAlert("光照已经高于25了哟~~~");
      }
      if (data.illumination < 15) {
        this.addAlert("光照已经低于15了哟~~~");
      }
    });

    this.client = client;
  },
  beforeUnmount() {
    if (this.client) {
      this.client.end();
    }
  },
};
</script>
<style>
.alert-container {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 9999;
}
.lab {
  font-size: 18px;
  font-weight: 600;
}

</style>
<template>
  <div class="component-container">
    <div>
      <span class="lab">创建指令: </span>
      <input type="text" v-model="commandInput" placeholder="deviceid-type-order" class="inputStyle"/>
      <button @click="createCommand" class="buttonStyle">创建</button>
      <button @click="fetchCommands" class="buttonStyle">指令查询</button>
      <button @click="toggleCommandsVisibility" class="buttonStyle">{{ showCommands ? '隐藏指令' : '显示指令' }}</button>
    </div> 

    <el-table v-if="showCommands" :data="commands" border style="width: 100%" class="uitable">
      <el-table-column prop="id" label="ID" width="180"></el-table-column>
      <el-table-column prop="deviceid" label="绑定设备ID" width="180"></el-table-column>
      <el-table-column prop="type" label="指令类型"> </el-table-column>
      <el-table-column prop="order" label="指令内容"> </el-table-column>
      <el-table-column prop="time" label="创建时间"> </el-table-column>
      <el-table-column label="删除">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" circle @click="deleteCommand(scope.row.id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>


<script>
import Vue from 'vue'
import { Table, TableColumn } from "element-ui"; // 导入el-table和el-table-column组件
Vue.use(Table)
Vue.use(TableColumn)
import axios from "axios";

export default {
  name: 'Command',
  data() {
    return {
      commandInput: '',
      commands: [],
      showCommands: false   
    };
  },
  methods: {
    createCommand() {
      // 获取系统时间
      const currentTime = new Date().toLocaleString();

      // 解析输入的指令信息
      const [deviceid, type, order] = this.commandInput.split('-');

      // 发送指令信息到后端保存到数据库
      axios
        .post('http://127.0.0.1:3000/commands', {
          deviceid,
          type,
          order,
          time: currentTime
        })
        .then((response) => {
          console.log('指令创建成功');
          this.commandInput = ''; // 清空输入框
        })
        .catch((error) => {
          console.error('指令创建失败', error);
        });
    },
    fetchCommands() {
      // 从后端获取指令数据
      axios
        .get('http://127.0.0.1:3000/commands')
        .then((response) => {
          this.commands = response.data;
        })
        .catch((error) => {
          console.error('获取指令数据失败', error);
        });
    },
    deleteCommand(commandId) {
      axios
        .delete(`http://127.0.0.1:3000/commands/${commandId}`)
        .then((response) => {
          console.log('指令删除成功');
          this.fetchCommands(); // 重新获取指令数据
        })
        .catch((error) => {
          console.error('删除指令失败', error);
        });
    },
    toggleCommandsVisibility() {
    this.showCommands = !this.showCommands;
  }
  }
};
</script>

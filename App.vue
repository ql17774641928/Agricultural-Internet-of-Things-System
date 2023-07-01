<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <h1>农业物联网系统</h1>
    <BarChart
      :dataT="dataT"
      :dataH="dataH"
      :dataI="dataI"
      :dataTH="dataTH"
      :dataHH="dataHH"
      :dataIH="dataIH"
    />
    <div class="component-container">
    <span class="lab">数据历史查询:</span>
    <input
      type="text"
      v-model="inputTime"
      placeholder="Enter time"
      class="inputStyle"
    />
    <button @click="searchData" class="buttonStyle">Search</button> <br />
    </div>
    <Device/>
    <Alerts />
    <Command />
    <Set />
  </div>
</template>

<script>
import axios from "axios";

import mqtt from "mqtt";
import BarChart from "./components/BarCharts.vue";
import Alerts from "./components/Alerts.vue";
import Device from "./components/Device.vue";
import Command from "./components/Command.vue"
import Set from "./components/Set.vue"
export default {
  name: "App",
  components: {
    BarChart,
    Alerts,
    Device,
    Command,
    Set,
  },
  data() {
    return {
      data: [], // 用于存储从数据库中获取的数据
      dataT: [],
      dataH: [],
      dataI: [],
      dataTH: [],
      dataHH: [],
      dataIH: [],
      inputTime: "",
      searchResults: [],
      // devices: [], // 存储设备表信息
    };
  },
  methods: {
    searchData() {
      // 发起请求，查询与输入时间相等的数据
      axios
        .get("http://127.0.0.1:3000/search", {
          params: {
            time: this.inputTime,
          },
        })
        .then((response) => {
          this.searchResults = []; // 清空查询结果数组,以便在次查询
          this.searchResults.push(response.data[response.data.length - 1]);

          // 将查询结果添加到dataTH, dataHH, dataIH中
          const data = response.data[response.data.length - 1];
          this.dataTH.push([data.time, data.temperature]);
          this.dataHH.push([data.time, data.humidity]);
          this.dataIH.push([data.time, data.illumination]);
        })
        .catch((error) => {
          console.error("无法获取查询结果:", error);
          this.searchResults = []; // 清空查询结果数组,以便在次查询
        });
    },
    getDataFromServer() {
      axios
        .get("http://127.0.0.1:3000/data")
        .then((response) => {
          this.data = response.data;
          // 清空之前的数据
          this.dataT = [];
          this.dataH = [];
          this.dataI = [];

          // 遍历数据并将time、temperature、humidity和illumination分别存储到对应数组中
          this.data.forEach((item) => {
            this.dataT.push([item.time, item.temperature]);
            this.dataH.push([item.time, item.humidity]);
            this.dataI.push([item.time, item.illumination]);
          });
        })
        .catch((error) => {
          console.error("获取数据出错:", error);
        });
    },
  },
  created() {
    this.getDataFromServer(); // 初始化时立即获取数据
    setInterval(this.getDataFromServer, 1000); // 每隔十秒执行一次获取数据的操作
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#app button {
  display: inline-block;
  line-height: 1;
}
ul > li {
  list-style: none;
}
.component-container {
  text-align: left;
  margin-top: 20px;
}

.uitable{
  margin-top: 20px;
}

.buttonStyle {
  margin-left: 20px;
  height: 20px;
  width: 100px;
  border: 0;
  background-color: #6c6c6c;
  box-shadow: 0 0 1px #272727, 0 0 3px 2px #3c3c3c, 0 0 3px 4px #4f4f4f;
  border-radius: 4px;
  font-family: Calibri;
  font-weight: 800;
  font-style: italic;
  color: aqua;
  cursor: pointer;
}
.buttonStyle:hover {
  animation: buttonEffect 0.4s linear;
  transition-timing-function: linear;
}
.buttonStyle:active {
  transform: scale(1.2);
  bottom: -3px;
  transition-timing-function: ease-in-out;
}
@keyframes buttonEffect {
  0% {
    background: radial-gradient(ellipse 20px 8px, white, black, black);
  }
  20% {
    background: radial-gradient(ellipse 30px 12px, white, black, black);
  }
  40% {
    background: radial-gradient(ellipse 40px 16px, white, black, black);
  }
  60% {
    background: radial-gradient(ellipse 50px 20px, white, black, black);
  }
  80% {
    background: radial-gradient(ellipse 60px 24px, white, black, black);
  }
  100% {
    background: radial-gradient(ellipse 70px 280px, white, black, black);
  }
}
.inputStyle {
  margin-left: 10px;
  width: 150px;
  height: 10px;
  background-color: #4f4f4f;
  border-radius: 8px;
  border-width: 3px 3px 3px 3px;
  border-style: inset;
  border-color: black;
  font-family: "Droid Sans Mono Slashed";
  font-weight: 300;
  font-style: italic;
  color: aqua;
  box-shadow: 0 0 1px #272727, 0 0 3px 2px #3c3c3c, 0 0 3px 2px #4f4f4f;
}
.inputStyle:focus {
  background-color: black;
}
.inputStyle:hover {
  animation: inputEffect 0.8s linear;
  transition-timing-function: linear;
}
@keyframes inputEffect {
  0% {
    border-top-color: aqua;
    background: linear-gradient(to right, aqua, black 20%);
  }
  25% {
    border-right-color: aqua;
    background: linear-gradient(to right, aqua, black 40%);
  }
  50% {
    border-bottom-color: aqua;
    background: linear-gradient(to right, aqua, black 60%);
  }
  75% {
    border-left-color: aqua;
    background: linear-gradient(to right, aqua, black 80%);
  }
  100% {
    border-color: cyan;
    background: linear-gradient(to right, aqua, black 100%);
  }
}
.lab {
  font-size: 18px;
  font-weight: 600;
}
input::-webkit-input-placeholder {
  color: white;
}
</style>

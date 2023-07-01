<template>
  <div>
    <div class="charts-row">
      <div class="chart-container" ref="chart1"></div>
      <div class="chart-container" ref="chart2"></div>
      <div class="chart-container" ref="chart3"></div>
    </div>
    <div class="charts-row">
      <div class="chart-container" ref="chart4"></div>
      <div class="chart-container" ref="chart5"></div>
      <div class="chart-container" ref="chart6"></div>
    </div>
  </div>
</template>
<script>

import 'echarts/lib/chart/bar';

import * as echarts from "echarts/core";
import { BarChart,LineChart } from "echarts/charts";
import 'echarts/lib/chart/line'; // 导入折线图组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

export default {
  name: "BarCharts",
  props: ["dataT", "dataH", "dataI","dataTH","dataHH","dataIH"],
  data() {
    return {
      chart1: null,
      chart2: null,
      chart3: null,
      chart4: null,
      chart5: null,
      chart6: null,
    };
  },
  created() {
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      DatasetComponent,
      TransformComponent,
      LegendComponent,
      BarChart,
      CanvasRenderer,
      LineChart, // 使用折线图组件
    ]);
  },
  mounted() {
    Object.defineProperty(this.$refs.chart1, 'clientWidth', { get: function() { return 235 } })//解决echarts警告Can't get DOM width or height
    Object.defineProperty(this.$refs.chart1, 'clientHeight', { get: function() { return 215 } })
    Object.defineProperty(this.$refs.chart2, 'clientWidth', { get: function() { return 235 } })
    Object.defineProperty(this.$refs.chart2, 'clientHeight', { get: function() { return 215 } })
    Object.defineProperty(this.$refs.chart3, 'clientWidth', { get: function() { return 235 } })
    Object.defineProperty(this.$refs.chart3, 'clientHeight', { get: function() { return 215 } })
    Object.defineProperty(this.$refs.chart4, 'clientWidth', { get: function() { return 235 } })
    Object.defineProperty(this.$refs.chart4, 'clientHeight', { get: function() { return 215 } })
    Object.defineProperty(this.$refs.chart5, 'clientWidth', { get: function() { return 235 } })
    Object.defineProperty(this.$refs.chart5, 'clientHeight', { get: function() { return 215 } })
    Object.defineProperty(this.$refs.chart6, 'clientWidth', { get: function() { return 235 } })
    Object.defineProperty(this.$refs.chart6, 'clientHeight', { get: function() { return 215 } })
  window.addEventListener('resize', this.handleResize); // 添加resize事件监听
  
  this.$nextTick(() => {
    this.initializeCharts();//通过在 nextTick 中延迟初始化图表来解决获取 DOM 宽度和高度为 0 的问题
  });
  this.$bus.$on('getinfo',this.getinfo)
},
beforeDestroy() {
  window.removeEventListener('resize', this.handleResize); // 移除resize事件监听
},
  watch: {
    dataT: {
      handler(newData) {
        this.updateChart(this.chart1, newData);
      },
      //deep: true,
    },
    dataH: {
      handler(newData) {
        this.updateChart(this.chart2, newData);
      },
      //deep: true,
    },
    dataI: {
      handler(newData) {
        this.updateChart(this.chart3, newData);
      },
      //deep: true,
    },
    dataTH: {
      handler(newData) {
        this.updateChart(this.chart4, newData);
      },
      //deep: true,
    },
    dataHH: {
      handler(newData) {
        this.updateChart(this.chart5, newData);
      },
      //deep: true,
    },
    dataIH: {
      handler(newData) {
        this.updateChart(this.chart6, newData);
      },
      //deep: true,
    },
  },
  methods: {
      handleResize() {
    // 监听窗口大小变化，重新渲染图表
    this.chart1.resize();
    this.chart2.resize();
    this.chart3.resize();
    this.chart4.resize();
    this.chart5.resize();
    this.chart6.resize();
  },
    initializeCharts() {
    //   this.dataT.push([['0','温度']]);
      this.dataT.push(['0', '温度']),//初始化数据，防止第一次数据不能显示
      this.dataH.push(['0', '湿度']);
      this.dataI.push(['0', '光照度']);  
      this.dataTH.push(['0','温度']);
      this.dataHH.push(['0', '湿度']);
      this.dataIH.push(['0', '光照度']);
      this.chart1 = this.createChart(this.$refs.chart1, "实时温度显示", this.dataT, "温度");
      this.chart2 = this.createChart(this.$refs.chart2, "实时湿度显示", this.dataH, "湿度");
      this.chart3 = this.createChart(this.$refs.chart3, "实时光照度显示", this.dataI, "光照度");
      this.chart4 = this.createChart(this.$refs.chart4, "温度历史显示", this.dataTH, "温度");
      this.chart5 = this.createChart(this.$refs.chart5, "湿度历史显示", this.dataHH, "湿度");
      this.chart6 = this.createChart(this.$refs.chart6, "光照度历史显示", this.dataIH, "光照度");
      window.addEventListener('resize', this.handleResize); // 添加resize事件监听
    },
    createChart(container, title, data, yAxisName) {
      const chart = echarts.init(container);

      const option = {
        title: {
          text: title,
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        grid: {
        //   top: 70,
        //   bottom: 50,
        //   left: 50,
        //   right: 50,
        },
        dataset: {
          source: data,
        },
        xAxis: { type: "category" },
        yAxis: { type: "value", name: yAxisName },
        series: [
          {
            type: "line",
            //显示数值
            itemStyle: {
              normal: {
                label: {
                  show: true, //开启显示
                  position: 'top', //在上方显示
                  textStyle: {
                    //数值样式
                    color: 'black',
                    fontSize: 12,
                  },
                  color: "#5470C6", // 线条颜色
                lineStyle: {
                  width: 2, // 线条宽度
                },
                },
              },
            }, 
          },
        ],
      };

      chart.setOption(option);
      return chart;
    },
    updateChart(chart, data) {
      chart.setOption({
        dataset: {
          source: data,
        },
      });
    },
  },
};
</script>
<style>
.charts-row {
  display: flex;
  justify-content: space-between;
}

.chart-container {
  width: 30%;
  height: 300px;
}
</style>
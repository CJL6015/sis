<template>
  <PageWrapper title="循环水系统优化概览">
    <a-card>
      <a-row>
        <a-col :md="12">
          <div ref="chartRef" style="width: 100%; height: 400px"></div>
        </a-col>
        <a-col :md="12">
          <div ref="chartRef1" style="width: 100%; height: 400px"></div>
        </a-col>
      </a-row>
      <a-divider />
      <a-row>
        <a-col :md="12">
          <div ref="chartRef2" style="width: 100%; height: 400px"></div>
        </a-col>
        <a-col :md="12">
          <div ref="chartRef3" style="width: 100%; height: 400px"></div>
        </a-col>
      </a-row>
      <a-divider />
      <IllustrationTable />
    </a-card>
  </PageWrapper>
</template>
<script lang="ts">
  import { Col, Row, Card, Divider, Alert } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted, onBeforeUnmount } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getInfo, getLoadTrend, getPumpTrend } from '/@/api/sis/info';
  import dayjs, { Dayjs } from 'dayjs';
  import { BasicTable, useTable } from '/@/components/Table';
  import { columns } from './point.data';
  import { getData } from '/@/api/sis/future';
  import { getData as getLoadData } from '/@/api/sis/main';
  import IllustrationTable from '../../components/IllustrationTable.vue';

  export default {
    components: {
      PageWrapper,
      ARow: Row,
      ACol: Col,
      ACard: Card,
      ADivider: Divider,
      AAlert: Alert,
      IllustrationTable,
      BasicTable,
    },
    setup() {
      const [registerTable, methods] = useTable({
        columns,
        formConfig: {
          labelWidth: 120,
          size: 'large',
        },
        pagination: false,
        bordered: true,
        showIndexColumn: false,
        canResize: false,
      });
      const formData = ref({
        electricity: undefined,
        coal: undefined,
        count: 4,
        temperature: undefined,
      });
      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

      const chartRef1 = ref<HTMLDivElement | null>(null);
      const { setOptions: setOptions1 } = useECharts(chartRef1 as Ref<HTMLDivElement>);

      const chartRef2 = ref<HTMLDivElement | null>(null);
      const { setOptions: setOptions2 } = useECharts(chartRef2 as Ref<HTMLDivElement>);

      const chartRef3 = ref<HTMLDivElement | null>(null);
      const { setOptions: setOptions3 } = useECharts(chartRef3 as Ref<HTMLDivElement>);

      let timer = null;

      onMounted(() => {
        setChart();
        setChart1();
        setChart2();
        setChart3();
        // setInfo();
        timer = setInterval(() => {
          setChart();
          setChart1();
          setChart2();
          setChart3();
          // setInfo();
        }, 10000);
      });

      onBeforeUnmount(() => {
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      });

      async function setChart() {
        const param = {
          st: dayjs().subtract(24, 'hour').format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
        };
        const chartData = await getLoadTrend(param);
        setOptions(
          {
            animation: false, // 取消动画
            title: {
              text: '机组负荷与循泵状态',
              left: 'center',
              bottom: '0%',
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: [
                '#1机发电功率',
                '#2机发电功率',
                '循环水泵A状态',
                '循环水泵B状态',
                '循环水泵C状态',
                '循环水泵D状态',
              ],
              textStyle: {
                fontSize: 18,
              },
            },
            dataZoom: [
              {
                showDataShadow: false,
              },
            ],
            grid: {
              left: '3%',
              right: '4%',
              bottom: '8%',
              containLabel: true,
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            xAxis: {
              type: 'category',
            },
            yAxis: [
              {
                name: '机组发电功率(MW)',
                type: 'value',
                show: true,
                alignTicks: true,
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 25,
                axisLabel: {
                  fontSize: 18,
                },
              },
              {
                name: '循泵状态',
                type: 'value',
                show: true,
                alignTicks: true,
                position: 'right',
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 35,
                axisLabel: {
                  fontSize: 18,
                },
              },
            ],
            series: [
              {
                name: '#1机发电功率',
                type: 'line',
                data: chartData['U1P_QC'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'blue',
                },
                itemStyle: {
                  color: 'blue',
                },
                symbol: 'none',
                yAxisIndex: 0,
              },
              {
                name: '#2机发电功率',
                type: 'line',
                data: chartData['U2P_QC'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'red',
                },
                itemStyle: {
                  color: 'red',
                },
                symbol: 'none',
                yAxisIndex: 0,
              },
              {
                name: '循环水泵A状态',
                type: 'line',
                data: chartData['XHSBACZT_1'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(128,0,128)',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '循环水泵B状态',
                type: 'line',
                data: chartData['XHSBBDZT_1'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(0,128,128)',
                },
                itemStyle: {
                  color: 'rgb(0,128,128)',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '循环水泵C状态',
                type: 'line',
                data: chartData['XHSBACZT_2'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(128, 128, 128)',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 128)',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '循环水泵D状态',
                type: 'line',
                data: chartData['XHSBBDZT_2'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(255, 102, 0)',
                },
                itemStyle: {
                  color: 'rgb(255, 102, 0)',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
            ],
          },
          false,
        );
      }

      async function setChart1() {
        const param = {
          st: dayjs().subtract(24, 'hour').format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
        };
        const chartData = await getPumpTrend(param);
        setOptions1(
          {
            animation: false,
            title: {
              text: '实时循泵优化节支计算',
              left: 'center',
              bottom: '0%',
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['最大理想收益', '实际收益', '节支收益', '实际循泵配伍', '理想循泵配伍'],
              textStyle: {
                fontSize: 18,
              },
            },
            dataZoom: [
              {
                showDataShadow: false,
              },
            ],
            grid: {
              left: '5%',
              right: '5%',
              bottom: '8%',
              containLabel: true,
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            xAxis: {
              type: 'category',
            },
            yAxis: [
              {
                name: '相对利润(万元/h)',
                type: 'value',
                show: true,
                alignTicks: true,
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 25,
                axisLabel: {
                  fontSize: 18,
                },
              },
              {
                name: '循泵配伍方式',
                type: 'value',
                show: true,
                alignTicks: true,
                position: 'right',
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 35,
                axisLabel: {
                  fontSize: 18,
                },
              },
            ],
            series: [
              {
                name: '最大理想收益',
                type: 'line',
                data: chartData['LXZDSY'],
                lineStyle: {
                  width: 3,
                  color: 'blue',
                },
                itemStyle: {
                  color: 'blue',
                },
                symbol: 'none',
                yAxisIndex: 0,
              },
              {
                name: '实际收益',
                type: 'line',
                data: chartData['SJSY'],
                lineStyle: {
                  width: 3,
                  color: 'red',
                },
                itemStyle: {
                  color: 'red',
                },
                symbol: 'none',
                yAxisIndex: 0,
              },
              {
                name: '节支收益',
                type: 'line',
                data: chartData['JZSY'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(128,0,128)',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
                symbol: 'none',
                yAxisIndex: 0,
              },
              {
                name: '实际循泵配伍',
                type: 'line',
                data: chartData['SJXBPWXH'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(0,128,128)',
                },
                itemStyle: {
                  color: 'rgb(0,128,128)',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                type: 'line',
                data: chartData['LXXBPWXH'].map((num) => {
                  return [num[0], parseFloat(num[1].toFixed(2))];
                }),
                lineStyle: {
                  width: 3,
                  color: 'rgb(0,128,128)',
                },
                itemStyle: {
                  color: 'rgb(0,128,128)',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
            ],
          },
          false,
        );
      }

      async function setChart2() {
        const chartData = await getLoadData();
        console.log(chartData);
        if (chartData.length === 6) {
          setOptions2({
            title: {
              text: '规划负荷循泵优化节支计算',
              left: 'center',
              bottom: '0%',
            },
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: [
                '循泵配伍9相对利润',
                '循泵配伍8相对利润',
                '循泵配伍7相对利润',
                '理想最大收益',
                '理想循泵配伍',
              ],
              textStyle: {
                fontSize: 18,
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '6%',
              containLabel: true,
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            xAxis: {
              type: 'category',
              data: chartData[0],
            },
            yAxis: [
              {
                name: '相对利润(万元/h)',
                type: 'value',
                show: true,
                alignTicks: true,
                axisLine: {
                  show: true,
                },
                axisLabel: {
                  fontSize: 16,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 55,
              },
              {
                name: '循环配伍方式',
                type: 'value',
                show: true,
                alignTicks: true,
                position: 'right',
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 45,
                axisLabel: {
                  fontSize: 18,
                },
              },
            ],
            series: [
              {
                name: '理想最大收益',
                type: 'line',
                data: chartData[1].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'black',
                  width: 3,
                },
                itemStyle: {
                  color: 'black',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                symbol: 'none',
                type: 'line',
                step: 'end',
                data: chartData[2].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                yAxisIndex: 1,
                lineStyle: {
                  color: 'red',
                  width: 3,
                },
                itemStyle: {
                  color: 'red',
                },
              },
              {
                name: '循泵配伍9相对利润',
                type: 'line',
                data: chartData[3].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 128, 0)',
                },
              },
              {
                name: '循泵配伍8相对利润',
                type: 'line',
                data: chartData[4].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(128, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 0)',
                },
              },
              {
                name: '循泵配伍7相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[5].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(128,0,128)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
              },
            ],
          });
        } else {
          setOptions2({
            title: {
              text: '规划负荷循泵优化节支计算',
              left: 'center',
              bottom: '0%',
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: [
                '循泵配伍6相对利润',
                '循泵配伍5相对利润',
                '循泵配伍4相对利润',
                '循泵配伍3相对利润',
                '循泵配伍2相对利润',
                '循泵配伍1相对利润',
                '理想最大收益',
                '理想循泵配伍',
              ],
              textStyle: {
                fontSize: 18,
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            xAxis: {
              type: 'category',
              data: chartData[0],
            },
            yAxis: [
              {
                name: '相对利润(万元/h)',
                type: 'value',
                show: true,
                alignTicks: true,
                axisLine: {
                  show: true,
                },
                axisLabel: {
                  fontSize: 16,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 55,
              },
              {
                name: '循环配伍',
                type: 'value',
                show: true,
                alignTicks: true,
                position: 'right',
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 45,
                axisLabel: {
                  fontSize: 18,
                },
              },
            ],
            series: [
              {
                name: '理想最大收益',
                type: 'line',
                data: chartData[1].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'black',
                  width: 3,
                },
                itemStyle: {
                  color: 'black',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                symbol: 'none',
                type: 'line',
                step: 'end',
                data: chartData[2].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                yAxisIndex: 1,
                lineStyle: {
                  color: 'red',
                  width: 3,
                },
                itemStyle: {
                  color: 'red',
                },
              },
              {
                name: '循泵配伍6相对利润',
                type: 'line',
                data: chartData[3].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 128, 0)',
                },
              },
              {
                name: '循泵配伍5相对利润',
                type: 'line',
                data: chartData[4].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(128, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 0)',
                },
              },
              {
                name: '循泵配伍4相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[5].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(255, 165, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(255, 165, 0)',
                },
              },
              {
                name: '循泵配伍3相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[6].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(128,0,128)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
              },
              {
                name: '循泵配伍2相对利润',
                type: 'line',
                data: chartData[7].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'blue',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'blue',
                },
              },
              {
                name: '循泵配伍1相对利润',
                type: 'line',
                data: chartData[8].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'blue',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'blue',
                },
              },
            ],
          });
        }
      }

      async function setChart3() {
        const chartData = await getData();
        console.log(chartData);
        if (chartData.length === 6) {
          setOptions3({
            title: {
              text: '未来96点循泵优化节支计算',
              left: 'center',
              bottom: '0%',
            },
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: [
                '循泵配伍9相对利润',
                '循泵配伍8相对利润',
                '循泵配伍7相对利润',
                '理想最大收益',
                '理想循泵配伍',
              ],
              textStyle: {
                fontSize: 18,
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '6%',
              containLabel: true,
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            xAxis: {
              type: 'category',
              data: chartData[0],
            },
            yAxis: [
              {
                name: '相对利润(万元/h)',
                type: 'value',
                show: true,
                alignTicks: true,
                axisLine: {
                  show: true,
                },
                axisLabel: {
                  fontSize: 16,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 55,
              },
              {
                name: '循环配伍方式',
                type: 'value',
                show: true,
                alignTicks: true,
                position: 'right',
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 45,
                axisLabel: {
                  fontSize: 18,
                },
              },
            ],
            series: [
              {
                name: '理想最大收益',
                type: 'line',
                data: chartData[1].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'black',
                  width: 3,
                },
                itemStyle: {
                  color: 'black',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                symbol: 'none',
                type: 'line',
                step: 'end',
                data: chartData[2].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                yAxisIndex: 1,
                lineStyle: {
                  color: 'red',
                  width: 3,
                },
                itemStyle: {
                  color: 'red',
                },
              },
              {
                name: '循泵配伍9相对利润',
                type: 'line',
                data: chartData[3].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 128, 0)',
                },
              },
              {
                name: '循泵配伍8相对利润',
                type: 'line',
                data: chartData[4].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(128, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 0)',
                },
              },
              {
                name: '循泵配伍7相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[5].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(128,0,128)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
              },
            ],
          });
        } else {
          setOptions3({
            title: {
              text: '未来96点循泵优化节支计算',
              left: 'center',
              bottom: '0%',
            },
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: [
                '循泵配伍6相对利润',
                '循泵配伍5相对利润',
                '循泵配伍4相对利润',
                '循泵配伍3相对利润',
                '循泵配伍2相对利润',
                '循泵配伍1相对利润',
                '理想最大收益',
                '理想循泵配伍',
              ],
              textStyle: {
                fontSize: 18,
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '6%',
              containLabel: true,
            },
            toolbox: {
              feature: {
                saveAsImage: {},
              },
            },
            xAxis: {
              type: 'category',
              data: chartData[0],
            },
            yAxis: [
              {
                name: '相对利润(万元/h)',
                type: 'value',
                show: true,
                alignTicks: true,
                axisLine: {
                  show: true,
                },
                axisLabel: {
                  fontSize: 16,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 55,
              },
              {
                name: '循环配伍方式',
                type: 'value',
                show: true,
                alignTicks: true,
                position: 'right',
                axisLine: {
                  show: true,
                },
                nameLocation: 'middle',
                nameRotate: 90,
                nameTextStyle: {
                  fontWeight: 'bold',
                  fontSize: 20,
                  align: 'middle',
                },
                nameGap: 45,
                axisLabel: {
                  fontSize: 18,
                },
              },
            ],
            series: [
              {
                name: '理想最大收益',
                type: 'line',
                data: chartData[1].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'black',
                  width: 3,
                },
                itemStyle: {
                  color: 'black',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                symbol: 'none',
                type: 'line',
                step: 'end',
                data: chartData[2].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                yAxisIndex: 1,
                lineStyle: {
                  color: 'red',
                  width: 3,
                },
                itemStyle: {
                  color: 'red',
                },
              },
              {
                name: '循泵配伍6相对利润',
                type: 'line',
                data: chartData[3].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 128, 0)',
                },
              },
              {
                name: '循泵配伍5相对利润',
                type: 'line',
                data: chartData[4].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(128, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 0)',
                },
              },
              {
                name: '循泵配伍4相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[5].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(255, 165, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(255, 165, 0)',
                },
              },
              {
                name: '循泵配伍3相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[6].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(128,0,128)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
              },
              {
                name: '循泵配伍2相对利润',
                type: 'line',
                data: chartData[7].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'blue',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'blue',
                },
              },
              {
                name: '循泵配伍1相对利润',
                type: 'line',
                data: chartData[8].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'blue',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'blue',
                },
              },
            ],
          });
        }
      }

      async function setInfo() {
        const info = await getInfo();
        console.log(info);
        methods.setTableData(info);
      }

      const labelCol = { style: { width: '120px' } };
      return {
        formData,
        labelCol,
        chartRef,
        chartRef1,
        chartRef2,
        chartRef3,
      };
    },
  };
</script>
<style>
  .big-word {
    font-size: 20px;
  }
</style>
<style scoped>
  .inf-table {
    width: 100%;
    border-collapse: collapse;
  }

  .inf-table th,
  .inf-table td {
    padding: 8px;
    border: 1px solid #ccc;
  }

  .inf-table tr:nth-child(even) {
    background-color: #ffffff48;
  }

  .inf-table tr:nth-child(odd) {
    background-color: #ffffff48;
  }
</style>

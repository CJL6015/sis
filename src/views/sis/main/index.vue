<template>
  <PageWrapper title="主要信息一览">
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
      <div>
        <IllustrationTable />
      </div>
      <BasicTable @register="registerTable" size="large" />
    </a-card>
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted, onBeforeUnmount, h } from 'vue';
  import { Col, Row, Card, Divider, Modal } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getInfo, getLoadTrend, getPumpTrend, getPointInfo } from '/@/api/sis/info';
  import dayjs from 'dayjs';
  import { BasicTable, useTable } from '/@/components/Table';
  import { columns } from './point.data';
  import IllustrationTable from '../../components/IllustrationTable.vue';

  export default defineComponent({
    components: {
      PageWrapper,
      ARow: Row,
      ACol: Col,
      ACard: Card,
      ADivider: Divider,
      BasicTable,
      IllustrationTable,
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
      const { setOptions } = useECharts(chartRef);

      const chartRef1 = ref<HTMLDivElement | null>(null);
      const { setOptions: setOptions1 } = useECharts(chartRef1);

      let timer = null;
      const openNotificationWithIcon = async () => {
        const info = await getPointInfo();
        if (info) {
          const contentVNode = h(
            'div',
            {
              style: {
                fontSize: '20px',
              },
            },
            info['info']
              .split(';')
              .map((line, index) =>
                h('div', { key: index, style: 'margin-bottom: 6px;margin-left:30px' }, line),
              ),
          );

          Modal.error({
            content: contentVNode,
            title: info['point'],
            centered: true,
            okText: '确定',
          });
        }
      };

      onMounted(() => {
        openNotificationWithIcon();
        setChart();
        setChart1();
        setInfo();
        timer = setInterval(() => {
          setChart();
          setChart1();
          setInfo();
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
              left: '4%',
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
                nameGap: 45,
                axisLabel: {
                  fontSize: 18,
                },
                min: 0, // 设置最小值为 0
                max: 700, // 设置最大值为 1
                interval: 100,
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
                  formatter: (value) => (value === 0 || value === 1 ? value : ''), // 只显示 0 和 1
                },
                min: 0, // 设置最小值为 0
                max: 7, // 设置最大值为 1
                interval: 1,
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
              formatter: function (params) {
                let tooltipContent = '';
                params.forEach((item) => {
                  if (item.seriesName.includes('配伍')) {
                    // 循泵配伍显示整数
                    tooltipContent += `${item.marker} ${item.seriesName}: ${Math.round(
                      item.data[1],
                    )}<br>`;
                  } else {
                    // 收益保留小数点后4位
                    tooltipContent += `${item.marker} ${item.seriesName}: ${parseFloat(
                      item.data[1],
                    ).toFixed(4)}<br>`;
                  }
                });
                return tooltipContent;
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
                nameGap: 45,
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
                  color: 'rgb(255,165,0)', // 修改为橙色
                },
                itemStyle: {
                  color: 'rgb(255,165,0)', // 修改为橙色
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
            ],
          },
          false,
        );
      }

      async function setInfo() {
        const info = await getInfo();
        console.log(info);
        methods.setTableData(info);
      }

      return {
        formData,
        chartRef,
        chartRef1,
        registerTable,
      };
    },
  });
</script>

<style>
  .big-word1 {
    min-width: 300px;
    font-size: 20px;
  }

  .big-word {
    font-size: 20px;
  }
</style>

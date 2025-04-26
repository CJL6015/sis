<template>
  <PageWrapper title="循泵优化节支查询">
    <a-card>
      <a-form :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="8">
            <a-form-item label="历史时间">
              <a-form-item name="input-number" no-style>
                <a-range-picker v-model:value="historyTime" show-time />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="getHistoryData">确定</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" tip="加载中">
        <div ref="chartRef" style="width: 100%; height: 500px"></div
      ></a-spin>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts">
  import {
    Form,
    FormItem,
    Col,
    Row,
    Card,
    Button,
    Divider,
    RangePicker,
    Spin,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getHistory } from '/@/api/sis/influx';

  export default {
    components: {
      PageWrapper,
      ARow: Row,
      ACol: Col,
      AForm: Form,
      AFormItem: FormItem,
      ACard: Card,
      AButton: Button,
      ADivider: Divider,
      ARangePicker: RangePicker,
      ASpin: Spin,
    },
    setup() {
      type RangeValue = [Dayjs, Dayjs];
      const historyTime = ref<RangeValue>();
      const currentDate: Dayjs = dayjs();
      const lastMonthDate: Dayjs = currentDate.subtract(1, 'day');
      const rangeValue: RangeValue = [lastMonthDate, currentDate];
      historyTime.value = rangeValue;

      const spinning = ref<boolean>(false);

      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
      const names = {
        '4': ['7pumps', '6pumps', '5pumps', '4pumps'],
        '3': ['6pumps', '5pumps', '4pumps', '3pumps'],
        '2': ['4pumps(A)', '4pumps(B)', '3pumps', '2pumps'],
      };
      function generateRandomData() {
        const numberOfPoints = 288; // 24 hours * 60 minutes / 5 minutes
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        const currentTime: number = new Date().getTime();

        const dataList = Array.from({ length: numberOfPoints }, (_, index) => {
          const time: number = currentTime - index * 5 * 60 * 1000;
          const value: number = Math.random() * 100; // replace 100 with your desired range
          return [time, value];
        });

        return dataList;
      }

      async function getHistoryData() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const body = {
          bucket: 'FC_SSYH',
          points:
            'XDLR_C2A,XDLR_C2B,XDLR_C2C,XDLR_C2D,LXBS_C2,LXZDMLR_C2,JZYXSL_C2,LXZDXDLR_C2,SJBS_C2',
          st: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
        };
        spinning.value = true;
        // const data = await getHistory(body);
        // console.log(data);
        const unitCount = 2; //data['JZYXSL_C2'][data['JZYXSL_C2'].length - 1][1];
        spinning.value = false;
        setOptions({
          title: {
            text: '循泵优化节支查询',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
          legend: {
            data: [
              names[unitCount][3],
              names[unitCount][2],
              names[unitCount][1],
              names[unitCount][0],
              '机组实际运行数量',
              '循泵实际运行数量',
              '理想泵数',
              '理想最大毛利润',
              '理想最大相对利润',
            ],
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
          },
          yAxis: [
            {
              name: '相对利润',
              type: 'value',
              show: true,
              alignTicks: true,
              axisLine: {
                show: true,
              },
              axisLabel: {
                formatter: '{value} 万元/h',
              },
              nameLocation: 'middle',
              nameRotate: 90,
              nameTextStyle: {
                fontWeight: 'bold',
                fontSize: 20,
                align: 'left',
              },
              nameGap: 75,
            },
            {
              name: '循环水泵投运数量',
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
                align: 'left',
              },
              nameGap: 75,
            },
          ],
          dataZoom: [{}],
          series: [
            {
              name: names[unitCount][3],
              type: 'line',
              symbol: 'none',
              data: generateRandomData(), //data['XDLR_C2D'],
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: names[unitCount][2],
              type: 'line',
              symbol: 'none',
              data: generateRandomData(), //data['XDLR_C2C'],
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: names[unitCount][1],
              symbol: 'none',
              type: 'line',
              data: generateRandomData(), //data['XDLR_C2B'],
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: names[unitCount][0],
              symbol: 'none',
              type: 'line',
              data: generateRandomData(), //data['XDLR_C2A'],
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: '理想最大毛利润',
              symbol: 'none',
              type: 'line',
              data: generateRandomData(), //data['LXZDMLR_C2'],
              smooth: true,
              yAxisIndex: 0,
            },
            {
              name: '理想最大相对利润',
              symbol: 'none',
              type: 'line',
              data: generateRandomData(), //data['LXZDXDLR_C2'],
              smooth: true,
              yAxisIndex: 0,
            },
            {
              name: '机组实际运行数量',
              symbol: 'none',
              type: 'line',
              data: generateRandomData(), // data['JZYXSL_C2'],
              smooth: true,
              yAxisIndex: 1,
            },
            {
              name: '理想泵数',
              symbol: 'none',
              type: 'line',
              step: 'end',
              data: generateRandomData(), //data['LXBS_C2'],
              yAxisIndex: 1,
            },
            {
              name: '循泵实际运行数量',
              symbol: 'none',
              type: 'line',
              step: 'end',
              data: generateRandomData(), // data['SJBS_C2'],
              yAxisIndex: 1,
            },
          ],
        });
      }

      onMounted(() => {
        getHistoryData();
      });

      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        chartRef,
        historyTime,
        getHistoryData,
        spinning,
      };
    },
  };
</script>

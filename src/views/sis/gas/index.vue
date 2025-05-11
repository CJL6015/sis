<template>
  <PageWrapper title="汽侧不凝气体诊断">
    <a-card>
      <a-form :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="8">
            <a-form-item label="历史时间">
              <a-form-item name="input-number" no-style>
                <a-range-picker v-model:value="historyTime" :ranges="quickRanges" show-time />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="8">
            <a-form-item label="取数周期">
              <a-input-number v-model:value="timeValue" placeholder="请输入数字">
                <!-- 前缀模板：时间单位选择 -->
                <template #addonAfter>
                  <a-select v-model:value="timeUnit" style="width: 90px">
                    <a-select-option value="s">秒</a-select-option>
                    <a-select-option value="m">分</a-select-option>
                    <a-select-option value="h">小时</a-select-option>
                    <a-select-option value="d">天</a-select-option>
                  </a-select>
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :md="3">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="getHistoryData">确定</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" tip="加载中">
        <a-row>
          <a-col :md="12">
            <div ref="chartRef" style="width: 100%; height: 400px"></div>
          </a-col>
          <a-col :md="12">
            <div ref="chartRef1" style="width: 100%; height: 400px"></div>
          </a-col>
          <a-col :md="12">
            <div ref="chartRef2" style="width: 100%; height: 400px"></div>
          </a-col>
          <a-col :md="12">
            <div ref="chartRef3" style="width: 100%; height: 400px"></div>
          </a-col>
        </a-row>
      </a-spin>
      <a-divider />
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
    Alert,
    InputNumber,
    Select,
    SelectOption,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getCleanData2 } from '/@/api/sis/diagnosis';

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
      AAlert: Alert,
      AInputNumber: InputNumber,
      ASelect: Select,
      ASelectOption: SelectOption,
    },
    setup() {
      type RangeValue = [Dayjs, Dayjs];
      const historyTime = ref<RangeValue>();
      const currentDate: Dayjs = dayjs();
      const lastMonthDate: Dayjs = currentDate.subtract(1, 'day');
      const rangeValue: RangeValue = [lastMonthDate, currentDate];
      historyTime.value = rangeValue;

      const timeValue = ref<number>(1);
      const timeUnit = ref<string>('m');

      const spinning = ref<boolean>(false);

      const chartRef = ref<HTMLDivElement | null>(null);
      const chartRef1 = ref<HTMLDivElement | null>(null);
      const chartRef2 = ref<HTMLDivElement | null>(null);
      const chartRef3 = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
      const { setOptions: setOptions1 } = useECharts(chartRef1 as Ref<HTMLDivElement>);
      const { setOptions: setOptions2 } = useECharts(chartRef2 as Ref<HTMLDivElement>);
      const { setOptions: setOptions3 } = useECharts(chartRef3 as Ref<HTMLDivElement>);

      async function getHistoryData() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const body = {
          startTime: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          endTime: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          period: timeValue.value + timeUnit.value,
        };
        spinning.value = true;
        const data = await getCleanData2(body);
        console.log(data);
        spinning.value = false;
        setChart(data);
        setChart1(data);
        setChart2(data);
        setChart3(data);
      }
      function setChart(chartData) {
        setOptions(
          {
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['#1机组低背压综合热阻', '#1机组低压A真空泵电流', '#1机组低压B真空泵电流'],
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
                name: '热阻((m2.K)/W)',
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
                name: '电流(A)',
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
                name: '#1机组低背压综合热阻',
                type: 'line',
                data: chartData['DBYZHRZ_1'],
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
                name: '#1机组低压A真空泵电流',
                type: 'line',
                data: chartData['U1DYAZKBDL_QC'],
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
                name: '#1机组低压B真空泵电流',
                type: 'line',
                data: chartData['U1DYBZKBDL_QC'].map((num) => {
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
            ],
          },
          false,
        );
      }
      function setChart1(chartData) {
        setOptions1(
          {
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['#2机组低背压综合热阻', '#2机组低压A真空泵电流', ' #2机组低压B真空泵电流'],
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
                name: '热阻((m2.K)/W)',
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
                name: '电流(A)',
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
                name: '#2机组低背压综合热阻',
                type: 'line',
                data: chartData['DBYZHRZ_2'],
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
                name: '#2机组低压A真空泵电流',
                type: 'line',
                data: chartData['U2DYAZKBDL_QC'],
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
                name: '#2机组低压B真空泵电流',
                type: 'line',
                data: chartData['U2DYBZKBDL_QC'].map((num) => {
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
            ],
          },
          false,
        );
      }
      function setChart2(chartData) {
        setOptions2(
          {
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['#1机组高背压综合热阻', '#1机组高压A真空泵电流', '#1机组高压B真空泵电流'],
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
                name: '热阻((m2.K)/W)',
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
                name: '电流(A)',
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
                name: '#1机组高背压综合热阻',
                type: 'line',
                data: chartData['GBYZHRZ_1'],
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
                name: '#1机组高压A真空泵电流',
                type: 'line',
                data: chartData['U1DYAZKBDL_QC'],
                lineStyle: {
                  width: 3,
                  color: 'red',
                },
                itemStyle: {
                  color: 'red',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '#1机组高压B真空泵电流',
                type: 'line',
                data: chartData['U1GYBZKBDL_QC'].map((num) => {
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
            ],
          },
          false,
        );
      }
      function setChart3(chartData) {
        setOptions3(
          {
            animation: false,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['#2机组高背压综合热阻', '#2机组高压A真空泵电流', '#2机组高压B真空泵电流'],
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
                name: '热阻((m2.K)/W)',
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
                name: '电流(A)',
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
                name: '#2机组高背压综合热阻',
                type: 'line',
                data: chartData['GBYZHRZ_2'],
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
                name: '#2机组高压A真空泵电流',
                type: 'line',
                data: chartData['U2GYAZKBDL_QC'],
                lineStyle: {
                  width: 3,
                  color: 'red',
                },
                itemStyle: {
                  color: 'red',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '#2机组高压B真空泵电流',
                type: 'line',
                data: chartData['U2GYBZKBDL_QC'].map((num) => {
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
            ],
          },
          false,
        );
      }

      onMounted(() => {
        getHistoryData();
      });
      const quickRanges = {
        前6小时: [dayjs().subtract(6, 'hour'), dayjs()],
        前12小时: [dayjs().subtract(12, 'hour'), dayjs()],
        前1天: [dayjs().subtract(1, 'day'), dayjs()],
        前3天: [dayjs().subtract(3, 'day'), dayjs()],
      };
      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        chartRef,
        chartRef1,
        chartRef2,
        chartRef3,
        historyTime,
        getHistoryData,
        spinning,
        quickRanges,
        timeValue,
        timeUnit,
      };
    },
  };
</script>
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

<template>
  <PageWrapper title="子页面1">
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
  import { getScatterData } from '/@/api/sis/diagnosis';

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
        const data = await getScatterData(body);
        console.log(data);
        spinning.value = false;
        setChart(data);
        setChart1(data);
        setChart2(data);
        setChart3(data);
      }
      function setChart(data) {
        setOptions({
          tooltip: {
            position: 'top',
            formatter: function (params) {
              return (
                '发电机功率' +
                ' : ' +
                params.value[0] +
                '<br>' +
                '背压下降空间' +
                ' : ' +
                params.value[1]
              );
            },
          },
          legend: {
            data: ['#1机低背压理想降幅', '#1机高背压理想降幅'],
            left: 'center',
            bottom: 10,
          },
          xAxis: {
            name: '发电机功率',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'center',
            },
            nameLocation: 'center',
            axisLabel: {
              fontSize: 18,
            },
            nameGap: 45,
          },
          yAxis: {
            name: '背压下降空间',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'left',
            },
            nameLocation: 'middle',
            nameGap: 45,
            axisLabel: {
              fontSize: 18,
            },
          },
          grid: {
            left: '8%',
            right: '8%',
            bottom: '20%',
            top: '5%',
            containLabel: true,
          },
          series: [
            {
              name: '#1机低背压理想降幅',
              symbolSize: 5,
              data: data.idealPressureDrop[0],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
            {
              name: '#1机高背压理想降幅',
              symbolSize: 5,
              data: data.idealPressureDrop[1],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
          ],
        });
      }
      function setChart1(data) {
        setOptions1({
          tooltip: {
            position: 'top',
            formatter: function (params) {
              return (
                '发电机功率' +
                ' : ' +
                params.value[0] +
                '<br>' +
                '背压下降空间' +
                ' : ' +
                params.value[1]
              );
            },
          },
          legend: {
            data: ['#2机低背压理想降幅', '#2机高背压理想降幅'],
            left: 'center',
            bottom: 10,
          },
          xAxis: {
            name: '发电机功率',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'center',
            },
            nameLocation: 'center',
            axisLabel: {
              fontSize: 18,
            },
            nameGap: 45,
          },
          yAxis: {
            name: '背压下降空间',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'left',
            },
            nameLocation: 'middle',
            nameGap: 45,
            axisLabel: {
              fontSize: 18,
            },
          },
          grid: {
            left: '8%',
            right: '8%',
            bottom: '20%',
            top: '5%',
            containLabel: true,
          },
          series: [
            {
              name: '#2机低背压理想降幅',
              symbolSize: 5,
              data: data.idealPressureDrop1[0],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
            {
              name: '#2机高背压理想降幅',
              symbolSize: 5,
              data: data.idealPressureDrop1[1],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
          ],
        });
      }
      function setChart2(data) {
        setOptions2({
          tooltip: {
            position: 'top',
            formatter: function (params) {
              return (
                '发电机功率' +
                ' : ' +
                params.value[0] +
                '<br>' +
                '凝汽器传热能效' +
                ' : ' +
                params.value[1]
              );
            },
          },
          legend: {
            data: ['#1机低背压传热能效', '#1机高背压传热能效'],
            left: 'center',
            bottom: 10,
          },
          xAxis: {
            name: '发电机功率',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'left',
            },
            nameLocation: 'middle',
            axisLabel: {
              fontSize: 18,
            },
            nameGap: 45,
          },
          yAxis: {
            name: '凝汽器传热能效',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'center',
            },
            nameLocation: 'center',
            nameGap: 45,
            axisLabel: {
              fontSize: 18,
            },
          },
          grid: {
            left: '8%',
            right: '8%',
            bottom: '20%',
            top: '5%',
            containLabel: true,
          },
          series: [
            {
              name: '#1机低背压传热能效',
              symbolSize: 5,
              data: data.thermalEfficiency[0],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
            {
              name: '#1机高背压传热能效',
              symbolSize: 5,
              data: data.thermalEfficiency[1],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
          ],
        });
      }
      function setChart3(data) {
        setOptions3({
          tooltip: {
            position: 'top',
            formatter: function (params) {
              return (
                '发电机功率' +
                ' : ' +
                params.value[0] +
                '<br>' +
                '凝汽器传热能效' +
                ' : ' +
                params.value[1]
              );
            },
          },
          legend: {
            data: ['#2机低背压传热能效', '#2机高背压传热能效'],
            left: 'center',
            bottom: 10,
          },
          xAxis: {
            name: '发电机功率',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'center',
            },
            nameLocation: 'center',
            axisLabel: {
              fontSize: 18,
            },
            nameGap: 45,
          },
          yAxis: {
            name: '凝汽器传热能效',
            nameTextStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              align: 'left',
            },
            nameLocation: 'middle',
            nameGap: 45,
            axisLabel: {
              fontSize: 18,
            },
          },
          grid: {
            left: '8%',
            right: '8%',
            bottom: '20%',
            top: '5%',
            containLabel: true,
          },
          series: [
            {
              name: '#2机低背压传热能效',
              symbolSize: 5,
              data: data.thermalEfficiency1[0],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
            {
              name: '#2机高背压传热能效',
              symbolSize: 5,
              data: data.thermalEfficiency1[1],
              type: 'scatter',
              encode: { tooltip: [0, 1] },
            },
          ],
        });
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

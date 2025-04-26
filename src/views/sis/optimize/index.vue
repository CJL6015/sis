<template>
  <PageWrapper title="实时循泵优化节支查询">
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
      <a-divider />
      <div>
        <IllustrationTable />
      </div>
      <div>
        <BasicTable
          @register="registerTable"
          :columns="columns"
          :data="[]"
          :pagination="false"
          :bordered="true"
          :showIndexColumn="false"
          :canResize="false"
        />
      </div>
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
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getHistory } from '/@/api/sis/influx';
  import IllustrationTable from '../../components/IllustrationTable.vue';
  import { columns } from './point.data';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getRealtimeData } from '/@/api/sis/calculate';

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
      IllustrationTable,
      BasicTable,
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

      async function getRealtimeTable() {
        const data = await getRealtimeData();
        methods.setTableData(data);
      }

      async function getHistoryData() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const body = {
          bucket: 'HJB_SSYH',
          points:
            'XDLR_9,XDLR_8,XDLR_7,XDLR_6,XDLR_5,XDLR_4,XDLR_3,XDLR_2,XDLR_1,LXZDSY,SJSY,LXXBPWXH,SJXBPWXH',
          st: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
        };
        spinning.value = true;
        const data = await getHistory(body);
        console.log(data);
        spinning.value = false;
        setOptions({
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
              '循泵配伍6相对利润',
              '循泵配伍5相对利润',
              '循泵配伍4相对利润',
              '循泵配伍3相对利润',
              '循泵配伍2相对利润',
              '循泵配伍1相对利润',
              '理想最大收益',
              '实际收益',
              '理想循泵配伍',
              '实际循泵配伍',
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
              name: '循泵配伍',
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
                formatter: (value) => (value > 0 && value < 10 ? value : ''), // 只显示 1-9
              },
              min: 0, // 设置最小值为 0
              max: 10, // 设置最大值为 10
              interval: 1,
            },
          ],
          dataZoom: [
            {
              showDataShadow: false,
            },
          ],
          series: [
            {
              name: '循泵配伍9相对利润',
              type: 'line',
              symbol: 'none',
              data: data['XDLR_9'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              lineStyle: {
                color: 'rgb(0, 128, 0)', // 保留原有绿色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(0, 128, 0)',
              },
            },
            {
              name: '循泵配伍8相对利润',
              type: 'line',
              symbol: 'none',
              data: data['XDLR_8'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              lineStyle: {
                color: 'rgb(128, 128, 0)', // 保留原有黄色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(128, 128, 0)',
              },
            },
            {
              name: '循泵配伍7相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_7'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              lineStyle: {
                color: 'rgb(128,0,128)', // 保留原有紫色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(128,0,128)',
              },
            },
            {
              name: '循泵配伍6相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_6'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              lineStyle: {
                color: 'blue', // 保留原有蓝色
                type: 'dashed',
              },
              itemStyle: {
                color: 'blue',
              },
            },
            {
              name: '循泵配伍5相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_5'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'black', // 保留原有黑色
                type: 'dashed',
              },
              itemStyle: {
                color: 'black',
              },
            },
            {
              name: '循泵配伍4相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_4'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'rgb(255, 165, 0)', // 新增橙色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(255, 165, 0)',
              },
            },
            {
              name: '循泵配伍3相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_3'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'rgb(70, 130, 180)', // 新增钢蓝色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(70, 130, 180)',
              },
            },
            {
              name: '循泵配伍2相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_2'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'rgb(255, 20, 147)', // 新增深粉色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(255, 20, 147)',
              },
            },
            {
              name: '循泵配伍1相对利润',
              symbol: 'none',
              type: 'line',
              data: data['XDLR_1'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'rgb(0, 191, 255)', // 新增天蓝色
                type: 'dashed',
              },
              itemStyle: {
                color: 'rgb(0, 191, 255)',
              },
            },
            {
              name: '理想最大收益',
              symbol: 'none',
              type: 'line',
              data: data['LXZDSY'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'black', // 保留原有黑色
                width: 3,
              },
              itemStyle: {
                color: 'black',
              },
            },
            {
              name: '实际收益',
              symbol: 'none',
              type: 'line',
              data: data['SJSY'].map((num) => {
                return [num[0], parseFloat(num[1].toFixed(6))];
              }),
              yAxisIndex: 0,
              lineStyle: {
                color: 'rgb(105, 105, 105)', // 新增深灰色
                width: 3,
              },
              itemStyle: {
                color: 'rgb(105, 105, 105)',
              },
            },
            {
              name: '理想循泵配伍',
              symbol: 'none',
              type: 'line',
              step: 'end',
              data: data['LXXBPWXH'],
              yAxisIndex: 1,
              lineStyle: {
                color: 'red', // 保留原有红色
                width: 3,
              },
              itemStyle: {
                color: 'red',
              },
            },
            {
              name: '实际循泵配伍',
              symbol: 'none',
              type: 'line',
              step: 'end',
              data: data['SJXBPWXH'],
              yAxisIndex: 1,
              lineStyle: {
                color: 'rgb(160, 82, 45)', // 保留原有棕色
                width: 3,
              },
              itemStyle: {
                color: 'rgb(160, 82, 45)',
              },
            },
          ],
        });
      }

      onMounted(() => {
        getHistoryData();
        getRealtimeTable();
      });

      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        chartRef,
        historyTime,
        getHistoryData,
        spinning,
        registerTable,
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

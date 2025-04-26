<template>
  <PageWrapper title="冷端系统特性">
    <a-card>
      <a-form :model="formData" :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="8">
            <a-form-item label="历史时间">
              <a-form-item name="input-number" no-style>
                <a-range-picker v-model:value="historyTime" show-time />
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
          <a-col :md="2">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="getScatterData">确定</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-row>
        <a-col :md="12">
          <a-spin :spinning="spinning" size="large" tip="加载中">
            <div ref="chartRef" style="width: 100%; height: 750px"></div
          ></a-spin>
        </a-col>
        <a-col :md="12">
          <BasicTable @register="registerTable" size="large" />
        </a-col>
      </a-row>
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
    Select,
    SelectOption,
    RangePicker,
    InputNumber,
    Spin,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getCalculateData } from '/@/api/sis/calculate';
  import dayjs, { Dayjs } from 'dayjs';
  import { columns } from './point.data';
  import { BasicTable, useTable } from '/@/components/Table';

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
      ASelect: Select,
      ASelectOption: SelectOption,
      ARangePicker: RangePicker,
      ASpin: Spin,
      AInputNumber: InputNumber,
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
      const timeValue = ref<number>(1);
      const timeUnit = ref<string>('m');

      const formData = ref({
        unit: '1',
        x: undefined,
        y: undefined,
      });

      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

      const options = ref<string[]>([]);
      async function getOptions() {
        getScatterData();
      }
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
      async function getScatterData() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const period = timeValue.value + timeUnit.value;
        const params = {
          period: period,
          startTime: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          endTime: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
        };
        spinning.value = true;
        const data = await getCalculateData(params);
        console.log(data);
        methods.setTableData(data.tableData);
        spinning.value = false;
        setOptions({
          tooltip: {
            position: 'top',
            formatter: function (params) {
              return (
                '流量需求（总阀位指令）%' +
                ' : ' +
                params.value[0] +
                '<br>' +
                '实际流量%' +
                ' : ' +
                params.value[1]
              );
            },
          },
          xAxis: {
            name: '流量需求（总阀位指令）%',
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
            min: data.min,
            max: data.max,
            interval: 5, // 设置 x 轴刻度步长为 5
          },
          yAxis: {
            name: '实际流量%',
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
            min: data.min,
            max: data.max,
            interval: 5, // 设置 y 轴刻度步长为 5
          },
          grid: {
            left: '8%',
            right: '4%',
            bottom: '8%',
            top: '5%',
            containLabel: true,
          },
          series: [
            {
              name: '实际流量',
              symbolSize: 5,
              data: data.chartData,
              type: 'scatter',
              encode: { tooltip: [0, 1] },
              itemStyle: {
                color: 'blue', // 点的颜色
              },
              markLine: {
                symbol: 'none', // 不显示箭头
                lineStyle: {
                  type: 'dashed', // 设置为虚线
                  color: 'red', // 设置线的颜色为红色
                },
                data: [
                  [
                    { coord: [data.min, data.min] }, // 起点
                    { coord: [data.max, data.max] }, // 终点
                  ],
                ],
              },
            },
          ],
          graphic: [
            {
              type: 'group',
              left: '15%', // 相对于图表左侧的偏移
              top: '10%', // 相对于图表顶部的偏移
              children: [
                {
                  type: 'text',
                  z: 100,
                  top: 20,
                  ldft: 30,
                  style: {
                    text: '--- 参照标定线',
                    fontSize: 20,
                    fill: 'red',
                  },
                },
                {
                  type: 'text',
                  z: 100,
                  top: 40,
                  ldft: 30,
                  style: {
                    text: '·     实际流量',
                    fontSize: 20,
                    fill: 'blue',
                  },
                },
              ],
            },
          ],
        });
      }

      onMounted(() => {
        getOptions();
      });

      const labelCol = { style: { width: '120px' } };
      return {
        formData,
        labelCol,
        chartRef,
        options,
        historyTime,
        getScatterData,
        spinning,
        timeValue,
        timeUnit,
        registerTable,
      };
    },
  };
</script>

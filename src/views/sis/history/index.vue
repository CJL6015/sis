<template>
  <PageWrapper title="历史参数查询">
    <a-card>
      <a-form :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="6">
            <a-form-item label="机组">
              <a-select value="1" disabled>
                <a-select-option value="1">#1机组 </a-select-option>
                <a-select-option value="2">#2机组 </a-select-option>
              </a-select>
            </a-form-item></a-col
          >
          <a-col :md="8">
            <a-form-item label="参数选择">
              <a-form-item name="input-number" no-style>
                <a-select
                  mode="multiple"
                  v-model:value="points"
                  :options="options.map((option) => ({ value: option, label: option }))"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="8">
            <a-form-item label="历史时间">
              <a-form-item name="input-number" no-style>
                <a-range-picker v-model:value="historyTime" :ranges="quickRanges" show-time />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="2">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="fetchHistory">确定</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" tip="加载中">
        <div
          ref="chartRef1"
          style="width: 100%; height: 400px; margin-bottom: 10px"
          v-show="unit.indexOf('1') > -1"
        ></div>
      </a-spin>
    </a-card>
    <a-card>
      <a-form :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="6">
            <a-form-item label="机组">
              <a-select value="2" disabled>
                <a-select-option value="1">#1机组 </a-select-option>
                <a-select-option value="2">#2机组 </a-select-option>
              </a-select>
            </a-form-item></a-col
          >
          <a-col :md="8">
            <a-form-item label="参数选择">
              <a-form-item name="input-number" no-style>
                <a-select
                  mode="multiple"
                  v-model:value="points1"
                  :options="options.map((option) => ({ value: option, label: option }))"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="8">
            <a-form-item label="历史时间">
              <a-form-item name="input-number" no-style>
                <a-range-picker v-model:value="historyTime1" :ranges="quickRanges" show-time />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="2">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="fetchHistory1">确定</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning1" size="large" tip="加载中">
        <div
          ref="chartRef2"
          style="width: 100%; height: 400px; margin-bottom: 10px"
          v-show="unit.indexOf('2') > -1"
        ></div>
      </a-spin>
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
    Select,
    SelectOption,
    Spin,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getHistory } from '/@/api/sis/history';
  import { getParamsList } from '/@/api/sis/param';

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
      ASelect: Select,
      ASelectOption: SelectOption,
      ASpin: Spin,
    },
    setup() {
      type RangeValue = [Dayjs, Dayjs];
      const historyTime = ref<RangeValue>();
      const historyTime1 = ref<RangeValue>();
      const currentDate: Dayjs = dayjs();
      const lastMonthDate: Dayjs = currentDate.subtract(1, 'day');
      const rangeValue: RangeValue = [lastMonthDate, currentDate];
      historyTime.value = rangeValue;
      historyTime1.value = rangeValue;

      const unit = ref(['1', '2']);
      const spinning = ref<boolean>(false);
      const spinning1 = ref<boolean>(false);

      const chartRef1 = ref<HTMLDivElement | null>(null);
      const chartRef2 = ref<HTMLDivElement | null>(null);
      const chartRef3 = ref<HTMLDivElement | null>(null);
      const chartRef4 = ref<HTMLDivElement | null>(null);

      const points = ref([]);
      const points1 = ref([]);

      const { setOptions: setOptions1, getInstance: getInstance1 } = useECharts(
        chartRef1 as Ref<HTMLDivElement>,
      );
      const { setOptions: setOptions2, getInstance: getInstance2 } = useECharts(
        chartRef2 as Ref<HTMLDivElement>,
      );
      const { setOptions: setOptions3, getInstance: getInstance3 } = useECharts(
        chartRef3 as Ref<HTMLDivElement>,
      );
      const { setOptions: setOptions4, getInstance: getInstance4 } = useECharts(
        chartRef4 as Ref<HTMLDivElement>,
      );

      const options = ref<string[]>([]);
      async function getOptions() {
        const data = await getParamsList();
        options.value = data;
        points.value.push(data[0]);
        points1.value.push(data[0]);
        fetchHistory();
        fetchHistory1();
      }
      onMounted(() => {
        getOptions();
      });
      const chartMap = {
        '1': setOptions1,
        '2': setOptions2,
        '3': setOptions3,
        '4': setOptions4,
      };

      async function fetchHistory() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const id = 1;
        const params = {
          unitId: 1,
          st: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          points: points.value.join(','),
        };
        console.log(unit.value.indexOf('1'));
        spinning.value = true;
        const data = await getHistory(params);
        console.log(data);
        let i = 0;
        setChart(data[0], chartMap[id], id);
        spinning.value = false;
      }
      async function fetchHistory1() {
        const [startDate, endDate] = historyTime1.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const id = 2;
        const params = {
          unitId: 2,
          st: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          points: points1.value.join(','),
        };
        console.log(unit.value.indexOf('1'));
        spinning.value = true;
        const data = await getHistory(params);
        console.log(data);
        let i = 0;
        setChart(data[0], chartMap[id], id);
        spinning.value = false;
      }

      function setChart(data, setOptions, id) {
        let series: any = [];
        let yAxis: any = [];
        const pointsValue = id === 1 ? points.value : points1.value;
        for (let i = 0; i < pointsValue.length; i++) {
          series.push({
            name: pointsValue[i],
            type: 'line',
            data: data[pointsValue[i]],
            symbol: 'none',
            yAxisIndex: i,
          });
          yAxis.push({
            type: 'value',
            axisLabel: {
              fontSize: 18,
            },
          });
        }
        console.log(series);
        spinning.value = false;
        spinning1.value = false;
        let option1 = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
          legend: {
            top: 'bottom',
            data: pointsValue,
            textStyle: {
              fontSize: 18,
            },
          },
          grid: {
            left: '0%',
            right: '1%',
            bottom: '10%',
            top: '10%',
            containLabel: true,
          },
          dataZoom: [
            {
              showDataShadow: false,
            },
          ],
          xAxis: {
            type: 'category',
          },
          yAxis: yAxis,
          series: series,
        };
        setOptions(option1);

        // const instance1 = getInstance1();

        // instance1?.on('click', (param: any) => {
        //   setMarkLine(param, instance1);
        // });
      }

      function setMarkLine(param, instance) {
        let xAxis = param.data[0];
        let yAxis = param.data[1];
        let markLine = {
          silent: true,
          animation: false,
          lineStyle: {
            color: 'black',
          },
          symbol: 'none',
          data: [
            {
              name: xAxis,
              xAxis: xAxis,
              label: {
                show: false,
              },
            },
            {
              name: yAxis,
              yAxis: yAxis,
              label: {
                show: false,
              },
            },
          ],
        };
        instance.setOption({
          series: {
            markLine: markLine,
          },
        });
      }
      const quickRanges = {
        前6小时: [dayjs().subtract(6, 'hour'), dayjs()],
        前12小时: [dayjs().subtract(12, 'hour'), dayjs()],
        前1天: [dayjs().subtract(1, 'day'), dayjs()],
        前3天: [dayjs().subtract(3, 'day'), dayjs()],
      };
      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        chartRef1,
        chartRef2,
        chartRef3,
        chartRef4,
        historyTime,
        unit,
        options,
        fetchHistory,
        fetchHistory1,
        spinning,
        points,
        quickRanges,
        points1,
        spinning1,
        historyTime1,
      };
    },
  };
</script>

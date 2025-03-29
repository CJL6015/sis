<template>
  <PageWrapper title="历史参数查询">
    <a-card>
      <a-form :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="5">
            <a-form-item label="机组">
              <a-select v-model:value="unit">
                <a-select-option value="1">#1机组 </a-select-option>
                <a-select-option value="2">#2机组 </a-select-option>
                <a-select-option value="3">#3机组 </a-select-option>
                <a-select-option value="4">#4机组 </a-select-option>
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
                <a-range-picker v-model:value="historyTime" show-time />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="fetchHistory">确定</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" tip="加载中">
        <div ref="chartRef1" style="width: 100%; height: 400px; margin-bottom: 10px"></div>
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
      const currentDate: Dayjs = dayjs();
      const lastMonthDate: Dayjs = currentDate.subtract(1, 'day');
      const rangeValue: RangeValue = [lastMonthDate, currentDate];
      historyTime.value = rangeValue;

      const unit = ref('1');
      const spinning = ref<boolean>(false);

      const chartRef1 = ref<HTMLDivElement | null>(null);
      const chartRef2 = ref<HTMLDivElement | null>(null);
      const chartRef3 = ref<HTMLDivElement | null>(null);

      const points = ref([]);

      const { setOptions: setOptions1, getInstance: getInstance1 } = useECharts(
        chartRef1 as Ref<HTMLDivElement>,
      );
      const { setOptions: setOptions2, getInstance: getInstance2 } = useECharts(
        chartRef2 as Ref<HTMLDivElement>,
      );
      const { setOptions: setOptions3, getInstance: getInstance3 } = useECharts(
        chartRef3 as Ref<HTMLDivElement>,
      );

      const options = ref<string[]>([]);
      async function getOptions() {
        const data = await getParamsList();
        options.value = data;
        points.value.push(data[0]);
        fetchHistory();
      }
      onMounted(() => {
        getOptions();
      });
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

      async function fetchHistory() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const params = {
          unitId: unit.value,
          st: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          points: points.value.join(','),
        };
        spinning.value = true;
        // const data = await getHistory(params);
        // console.log(data);
        let series: any = [];
        let yAxis: any = [];
        for (let i = 0; i < points.value.length; i++) {
          series.push({
            name: points.value[i],
            type: 'line',
            data: generateRandomData(), // data[points.value[i]],
            symbol: 'none',
            smooth: true,
            yAxisIndex: i,
          });
          yAxis.push({
            type: 'value',
          });
        }
        console.log(series);
        spinning.value = false;
        let option1 = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
          legend: {
            top: 'bottom',
            data: points.value,
          },
          grid: {
            left: '0%',
            right: '1%',
            bottom: '25%',
            top: '4%',
            containLabel: true,
          },
          dataZoom: [{}],
          xAxis: {
            type: 'category',
          },
          yAxis: yAxis,
          series: series,
        };
        setOptions1(option1);

        const instance1 = getInstance1();

        instance1?.on('click', (param: any) => {
          setMarkLine(param, instance1);
        });
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

      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        chartRef1,
        historyTime,
        unit,
        options,
        fetchHistory,
        spinning,
        points,
      };
    },
  };
</script>

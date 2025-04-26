<template>
  <PageWrapper title="冷端系统特性">
    <a-card>
      <a-form :model="formData" :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="4">
            <a-form-item label="机组">
              <a-select v-model:value="formData.unit">
                <a-select-option value="1">#1机组 </a-select-option>
                <a-select-option value="2">#2机组 </a-select-option>
              </a-select>
            </a-form-item></a-col
          >
          <a-col :md="4">
            <a-form-item label="横坐标参数">
              <a-form-item name="input-number" no-style>
                <a-select
                  v-model:value="formData.x"
                  :options="options.map((option) => ({ value: option, label: option }))"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="5">
            <a-form-item label="纵坐标参数">
              <a-form-item name="input-number" no-style>
                <a-select
                  show-search
                  v-model:value="formData.y"
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
          <a-col :md="1">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="getScatterData">确定</a-button>
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
    Select,
    SelectOption,
    RangePicker,
    Spin,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getParamsList } from '/@/api/sis/param';
  import { getHistoryScatter } from '/@/api/sis/history';
  import dayjs, { Dayjs } from 'dayjs';

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
    },
    setup() {
      type RangeValue = [Dayjs, Dayjs];
      const historyTime = ref<RangeValue>();
      const currentDate: Dayjs = dayjs();
      const lastMonthDate: Dayjs = currentDate.subtract(5, 'day');
      const rangeValue: RangeValue = [lastMonthDate, currentDate];
      historyTime.value = rangeValue;

      const spinning = ref<boolean>(false);

      const formData = ref({
        unit: '1',
        x: undefined,
        y: undefined,
      });

      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

      const options = ref<string[]>([]);
      async function getOptions() {
        const data = await getParamsList();
        options.value = data;
        formData.value.x = data[0];
        formData.value.y = data[1];
        getScatterData();
      }
      async function getScatterData() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const params = {
          unitId: formData.value.unit,
          x: formData.value.x,
          y: formData.value.y,
          st: dayjs(startDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
          et: dayjs(endDateDate).format('YYYY-MM-DDTHH:mm:ssZ'),
        };
        spinning.value = true;
        const data = await getHistoryScatter(params);
        console.log(data);
        spinning.value = false;
        setOptions({
          tooltip: {
            position: 'top',
            formatter: function (params) {
              return (
                formData.value.x +
                ' : ' +
                params.value[0] +
                '<br>' +
                formData.value.y +
                ' : ' +
                params.value[1]
              );
            },
          },
          xAxis: {
            name: formData.value.x,
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
            name: formData.value.y,
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
            right: '4%',
            bottom: '8%',
            top: '5%',
            containLabel: true,
          },
          series: [
            {
              symbolSize: 5,
              data: data,
              type: 'scatter',
              encode: { tooltip: [0, 1] },
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
      };
    },
  };
</script>

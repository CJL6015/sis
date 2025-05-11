<template>
  <PageWrapper title="#2机组调门故障诊断">
    <a-card>
      <a-row>
        <a-col :md="12">
          <table class="fault-table">
            <colgroup>
              <col style="width: 30%" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th colspan="2">调门卡涩故障</th>
              </tr>
            </thead>
            <tbody>
              <!-- 渲染 KSGZ 组 -->
              <tr v-for="(item, index) in ksItems" :key="'ks-' + index">
                <td v-if="index === 0" class="label" :rowspan="ksItems.length">故障诊断：</td>
                <td>{{ item }}</td>
              </tr>

              <!-- 空行 -->
              <tr class="spacer" v-if="ksItems.length && fxtItems.length">
                <td colspan="2"></td>
              </tr>
              <tr class="spacer" v-if="ksItems.length && fxtItems.length">
                <th colspan="2">调门阀芯脱落/阀杆断裂故障</th>
              </tr>
              <!-- 渲染 FXTLGZ 组 -->
              <tr v-for="(item, index) in fxtItems" :key="'fxt-' + index">
                <td v-if="index === 0" class="label" :rowspan="fxtItems.length">故障诊断：</td>
                <td>{{ item }}</td>
              </tr>
            </tbody>
          </table>
        </a-col>
        <a-col :md="12">
          <a-spin :spinning="spinning" size="large" tip="加载中">
            <div ref="chartRef" style="width: 100%; height: 500px"></div
          ></a-spin>
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
  import { getGateDiagnosisData2 } from '/@/api/sis/diagnosis';
  import dayjs, { Dayjs } from 'dayjs';
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

      const ksItems = ref([]);
      const fxtItems = ref([]);
      async function getScatterData() {
        spinning.value = true;
        const data = await getGateDiagnosisData2();
        console.log(data);
        spinning.value = false;
        const half = Math.floor(data.faults.length / 2);
        ksItems.value = data.faults.slice(0, half);
        fxtItems.value = data.faults.slice(half);
        setOptions({
          xAxis: {
            type: 'category',
            data: ['高调门1', '高调门2', '高调门3', '高调门4'],
          },
          yAxis: {
            type: 'value',
          },
          tooltip: {},
          legend: {
            data: ['实际开度', '指令'],
          },
          series: [
            {
              data: data.chartValue[0],
              type: 'bar',
              name: '实际开度',
            },
            {
              data: data.chartValue[1],
              type: 'bar',
              name: '指令',
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
        ksItems,
        fxtItems,
      };
    },
  };
</script>
<style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 8px;
    border: 1px solid #d9d9d9; /* 边框颜色变为柔和的灰色 */
    font-size: 20px; /* 设置文字大小为20px */
    text-align: center;
  }

  th {
    background-color: #f5f5f5; /* 表头背景颜色为浅灰色 */
    font-weight: bold;
  }

  td {
    height: 40px;
    min-height: 40px;
    background-color: #fff; /* 表格单元格背景颜色为白色 */
    line-height: 40px;
  }

  tr:nth-child(even) td {
    background-color: #fff; /* 偶数行背景颜色为浅灰色 */
  }
</style>

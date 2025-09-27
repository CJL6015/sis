<template>
  <PageWrapper title="#2机组真空密封性试验">
    <a-card>
      <a-form :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="8">
            <a-form-item label="历史时间">
              <a-form-item name="input-number" no-style>
                <a-range-picker
                  v-model:value="historyTime"
                  :ranges="quickRanges"
                  show-time
                  @change="getReportList"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="8">
            <a-form-item label="试验记录">
              <a-select
                v-model:value="selectedType"
                placeholder="请选择试验记录"
                style="width: 100%"
              >
                <a-select-option
                  v-for="item in experimentList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4">
            <a-alert :message="status" type="info" style="height: 32px" />
          </a-col>
          <a-col :md="3">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="getHistoryData">确定</a-button>
              <a-button
                type="primary"
                html-type="submit"
                @click="submitData"
                style="margin-left: 10px"
                >手动触发</a-button
              >
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" tip="加载中">
        <a-row>
          <a-col :md="10">
            <table>
              <tbody>
                <tr v-for="(item, index) in tableData" :key="index">
                  <td class="field">{{ item.field }}</td>
                  <td class="value">{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </a-col>
          <a-col :md="14"> <div ref="chartRef" style="width: 100%; height: 680px"></div> </a-col>
        </a-row>
      </a-spin>
      <a-divider />
      <div> </div>
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
    Select,
    SelectOption,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import dayjs, { Dayjs } from 'dayjs';
  import { getReport, getResult, submit } from '/@/api/sis/test';
  import { useMessage } from '/@/hooks/web/useMessage';

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
      ASelect: Select,
      ASelectOption: SelectOption,
    },
    setup() {
      type RangeValue = [Dayjs, Dayjs];
      const historyTime = ref<RangeValue>();
      const currentDate: Dayjs = dayjs();
      const lastMonthDate: Dayjs = currentDate.subtract(7, 'day');
      const rangeValue: RangeValue = [lastMonthDate, currentDate];
      historyTime.value = rangeValue;
      const { createMessage } = useMessage();

      const spinning = ref<boolean>(false);

      const experimentList = ref([]);
      const selectedType = ref<string | undefined>(undefined);

      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

      const fixedFields = [
        '试验开始时间',
        '记录开始时间',
        '统计起始时间',
        '统计结束时间',
        '低背压平均值(kPa)',
        '低背压排汽温度平均值(℃)',
        '低背压排汽温度平均值对应饱和压力(kPa)',
        '高背压平均值(kPa)',
        '高背压排汽温度平均值(℃)',
        '高背压排汽温度平均值对应饱和压力(kPa)',
        '低背压真空下降速度(kPa/min)',
        '高背压真空下降速度(kPa/min)',
      ];

      const tableData = ref([
        { field: '试验开始时间', value: '--' },
        { field: '记录开始时间', value: '--' },
        { field: '统计起始时间', value: '--' },
        { field: '统计结束时间', value: '--' },
        { field: '低背压平均值(kPa)', value: '--' },
        { field: '低背压排汽温度平均值(℃)', value: '--' },
        { field: '低背压排汽温度平均值对应饱和压力(kPa)', value: '--' },
        { field: '高背压平均值(kPa)', value: '--' },
        { field: '高背压排汽温度平均值(℃)', value: '--' },
        { field: '高背压排汽温度平均值对应饱和压力(kPa)', value: '--' },
        { field: '低背压真空下降速度(kPa/min)', value: '--' },
        { field: '高背压真空下降速度(kPa/min)', value: '--' },
      ]);
      const status = ref('');
      async function getHistoryData() {
        if (!selectedType.value) {
          createMessage.error('请选择试验记录');
          return;
        }
        const params = {
          time: selectedType.value?.split('(')[0],
          unitId: 2,
        };
        const data = await getResult(params);
        console.log('data', data);
        status.value = '当前试验状态： ' + data.status;
        const dynamicData = data.tableData;
        tableData.value = fixedFields.map((field, index) => ({
          field,
          value: dynamicData[index],
        }));
        setOptions({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
          legend: {
            data: ['#2机组高背压排汽温度', '#2机组低背压排汽温度', '#2机组高背压', '#2机组低背压'],
            textStyle: {
              fontSize: 18,
            },
          },
          grid: {
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
              name: '温度(℃)',
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
              name: '背压(kPa)',
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
            },
          ],
          dataZoom: [
            {
              showDataShadow: false,
            },
          ],
          series: [
            {
              name: '#2机组高背压排汽温度',
              type: 'line',
              symbol: 'none',
              data: data.chartValue['GBYPQWD_2'],
              lineStyle: {
                color: 'rgb(0, 128, 0)',
              },
              itemStyle: {
                color: 'rgb(0, 128, 0)',
              },
            },
            {
              name: '#2机组低背压排汽温度',
              type: 'line',
              symbol: 'none',
              data: data.chartValue['DBYPQWD_2'],
              lineStyle: {
                color: 'rgb(128, 128, 0)',
              },
              itemStyle: {
                color: 'rgb(128, 128, 0)',
              },
            },
            {
              name: '#2机组高背压',
              symbol: 'none',
              type: 'line',
              data: data.chartValue['GBY_2'],
              lineStyle: {
                color: 'rgb(128,0,128)',
              },
              itemStyle: {
                color: 'rgb(128,0,128)',
              },
              yAxisIndex: 1,
            },
            {
              name: '#2机组低背压',
              symbol: 'none',
              type: 'line',
              data: data.chartValue['DBY_2'],
              lineStyle: {
                color: 'blue',
              },
              itemStyle: {
                color: 'blue',
              },
              yAxisIndex: 1,
            },
          ],
          markLine: {
            data: [
              {
                xAxis: data.tableData[0].value, // 试验开始时间
                label: {
                  formatter: '试验开始时间',
                  position: 'insideTop',
                },
                lineStyle: {
                  color: 'red',
                  type: 'dashed',
                },
              },
              {
                xAxis: data.tableData[1].value, // 记录开始时间
                label: {
                  formatter: '记录开始时间',
                  position: 'insideTop',
                },
                lineStyle: {
                  color: 'blue',
                  type: 'dashed',
                },
              },
              {
                xAxis: data.tableData[2].value, // 统计起始时间
                label: {
                  formatter: '统计起始时间',
                  position: 'insideTop',
                },
                lineStyle: {
                  color: 'green',
                  type: 'dashed',
                },
              },
              {
                xAxis: data.tableData[3].value, // 统计结束时间
                label: {
                  formatter: '统计结束时间',
                  position: 'insideTop',
                },
                lineStyle: {
                  color: 'orange',
                  type: 'dashed',
                },
              },
            ],
          },
        });
      }

      async function getReportList() {
        const [startDate, endDate] = historyTime.value;
        const startDateDate = startDate.toDate();
        const endDateDate = endDate.toDate();
        const body = {
          start: dayjs(startDateDate).format('YYYY-MM-DD HH:mm:ss'),
          end: dayjs(endDateDate).format('YYYY-MM-DD HH:mm:ss'),
          unitId: 2,
        };
        const data = await getReport(body);
        experimentList.value = data.map((item: any) => ({
          label: item,
          value: item,
        }));
        if (data.length > 0) {
          selectedType.value = data[0];
          getHistoryData();
        } else {
          selectedType.value = undefined;
        }
      }

      async function submitData() {
        const data = await submit(2);
        console.log('data', data);
        if (data) {
          createMessage.success('手动触发成功');
          status.value = '当前试验状态： ' + data;
        } else {
          createMessage.error('手动触发失败');
        }
      }
      onMounted(() => {
        getReportList();
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
        historyTime,
        getReportList,
        spinning,
        quickRanges,
        experimentList,
        selectedType,
        tableData,
        getHistoryData,
        submitData,
        status,
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
    font-size: 18px; /* 设置文字大小为20px */
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

<template>
  <PageWrapper title="未来96点循泵优化节支计算">
    <a-alert type="warning" show-icon style="margin-bottom: 6px" banner>
      <template #message
        ><span style="font-size: 25px; font-weight: bold"
          >注意！计算条件：96点各机组的启停状态须与当前状态一致！否则不建议使用</span
        ></template
      >
    </a-alert>

    <a-card>
      <a-form :model="formData" :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="3">
            <a-form-item label="电价" :label-col="{ style: { width: '60px' } }">
              <a-form-item name="input-number" no-style>
                <a-input-number v-model:value="formData.electricity" addon-after="元/kWh" />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item label="标煤单价" :label-col="{ style: { width: '70px' } }">
              <a-form-item name="input-number" no-style>
                <a-input-number v-model:value="formData.coal" addon-after="元/吨" />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item label="#1机发电功率" :label-col="{ style: { width: '100px' } }">
              <a-form-item name="input-number" no-style>
                <a-input-number
                  v-model:value="formData.unit1"
                  disabled
                  addon-after="MW"
                  style="width: 150px"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item label="#2机发电功率" :label-col="{ style: { width: '120px' } }">
              <a-form-item name="input-number" no-style>
                <a-input-number
                  v-model:value="formData.unit2"
                  disabled
                  addon-after="MW"
                  style="width: 150px"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="4">
            <a-form-item label="#1机低背压进水温度" :label-col="{ style: { width: '180px' } }">
              <a-form-item name="input-number" no-style>
                <a-input-number
                  v-model:value="formData.temperature1"
                  addon-after="℃"
                  disabled
                  style="width: 50px"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="5">
            <a-form-item label="#2机低背压进水温度" :label-col="{ style: { width: '170px' } }">
              <a-form-item name="input-number" no-style>
                <a-input-number
                  v-model:value="formData.temperature2"
                  addon-after="℃"
                  disabled
                  style="width: 50px"
                />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="submitTask" :loading="spinning">{{
                spinning ? '计算中' : '确定'
              }}</a-button>
              <a-button
                type="primary"
                html-type="submit"
                @click="openModal"
                style="margin-left: 10px"
                >手动上传</a-button
              >
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" :tip="tips">
        <div ref="chartRef" style="width: 100%; height: 500px"></div
      ></a-spin>
      <a-divider />
      <div>
        <IllustrationTable />
      </div>
    </a-card>

    <Data @register="registerModal" @ok="ok" />
  </PageWrapper>
</template>
<script lang="ts">
  import {
    Form,
    FormItem,
    InputNumber,
    Col,
    Row,
    Card,
    Button,
    Divider,
    Spin,
    Alert,
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted, toRaw } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getParams } from '/@/api/sis/main';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs, { Dayjs } from 'dayjs';
  import Data from './Data.vue';
  import { useModal } from '/@/components/Modal';
  import { submit, getStatus, getData } from '/@/api/sis/future';
  import IllustrationTable from '../../components/IllustrationTable.vue';

  export default {
    components: {
      PageWrapper,
      ARow: Row,
      ACol: Col,
      AForm: Form,
      AFormItem: FormItem,
      AInputNumber: InputNumber,
      ACard: Card,
      AButton: Button,
      ADivider: Divider,
      ASpin: Spin,
      Data,
      AAlert: Alert,
      IllustrationTable,
    },
    setup() {
      const [registerModal, { openModal, closeModal }] = useModal();
      const formData = ref({
        electricity: undefined,
        coal: undefined,
        unit1: undefined,
        unit2: undefined,
        temperature1: undefined,
        temperature2: undefined,
      });
      const { createMessage } = useMessage();
      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
      const fetchParams = async () => {
        const params = await getParams();
        formData.value.electricity = params.electricity;
        formData.value.coal = params.coal;
        formData.value.unit1 = params.unit1;
        formData.value.unit2 = params.unit2;
        formData.value.temperature1 = params.temperature1.toFixed(2);
        formData.value.temperature2 = params.temperature2.toFixed(2);
        setChart();
      };

      onMounted(() => {
        fetchParams();
      });

      const spinning = ref<boolean>(false);
      const tips = ref('');

      async function submitTask() {
        const task = toRaw(formData.value);
        console.log(task);
        const result = await submit(task);
        if (result) {
          createMessage.success('提交成功');
          const currentDate: Dayjs = dayjs();
          const finishTIme = currentDate.add(5, 'minute');
          spinning.value = true;
          const intervalId = setInterval(async () => {
            const status = await getStatus();
            const now = dayjs();
            const diff = finishTIme.diff(now, 'second');
            if (status) {
              clearInterval(intervalId);
              new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
                spinning.value = false;
                setChart();
              });
            } else {
              const minutes = Math.floor(diff / 60);
              const seconds = diff % 60;
              tips.value = `预计剩余计算时间${minutes}分${seconds}秒`;
            }
          }, 1000);
        } else {
          createMessage.success('提交失败请重试');
        }
      }

      async function setChart() {
        const chartData = await getData();
        if (chartData.length === 6) {
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
                '理想最大收益',
                '理想循泵配伍',
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
              data: chartData[0],
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
                name: '循环配伍',
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
                },
              },
            ],
            series: [
              {
                name: '理想最大收益',
                type: 'line',
                data: chartData[1].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'black',
                  width: 3,
                },
                itemStyle: {
                  color: 'black',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                symbol: 'none',
                type: 'line',
                step: 'end',
                data: chartData[2].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                yAxisIndex: 1,
                lineStyle: {
                  color: 'red',
                  width: 3,
                },
                itemStyle: {
                  color: 'red',
                },
              },
              {
                name: '循泵配伍9相对利润',
                type: 'line',
                data: chartData[3].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 128, 0)',
                },
              },
              {
                name: '循泵配伍8相对利润',
                type: 'line',
                data: chartData[4].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(128, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 0)',
                },
              },
              {
                name: '循泵配伍7相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[5].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(128,0,128)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
              },
            ],
          });
        } else {
          setOptions({
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: [
                '循泵配伍6相对利润',
                '循泵配伍5相对利润',
                '循泵配伍4相对利润',
                '循泵配伍3相对利润',
                '循泵配伍2相对利润',
                '循泵配伍1相对利润',
                '理想最大收益',
                '理想循泵配伍',
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
              data: chartData[0],
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
                name: '循环配伍',
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
                },
              },
            ],
            series: [
              {
                name: '理想最大收益',
                type: 'line',
                data: chartData[1].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'black',
                  width: 3,
                },
                itemStyle: {
                  color: 'black',
                },
                symbol: 'none',
                yAxisIndex: 1,
              },
              {
                name: '理想循泵配伍',
                symbol: 'none',
                type: 'line',
                step: 'end',
                data: chartData[2].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                yAxisIndex: 1,
                lineStyle: {
                  color: 'red',
                  width: 3,
                },
                itemStyle: {
                  color: 'red',
                },
              },
              {
                name: '循泵配伍6相对利润',
                type: 'line',
                data: chartData[3].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 128, 0)',
                },
              },
              {
                name: '循泵配伍5相对利润',
                type: 'line',
                data: chartData[4].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(128, 128, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128, 128, 0)',
                },
              },
              {
                name: '循泵配伍4相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[5].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(255, 165, 0)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(255, 165, 0)',
                },
              },
              {
                name: '循泵配伍3相对利润',
                type: 'line',
                symbol: 'none',
                data: chartData[6].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                lineStyle: {
                  color: 'rgb(128,0,128)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(128,0,128)',
                },
              },
              {
                name: '循泵配伍2相对利润',
                type: 'line',
                data: chartData[7].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'blue',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'blue',
                },
              },
              {
                name: '循泵配伍1相对利润',
                type: 'line',
                data: chartData[8].map((num) => {
                  return parseFloat(num.toFixed(6));
                }),
                symbol: 'none',
                lineStyle: {
                  color: 'rgb(0, 191, 255)',
                  type: 'dashed',
                },
                itemStyle: {
                  color: 'rgb(0, 191, 255)',
                },
              },
            ],
          });
        }
      }

      function ok() {
        closeModal();
        createMessage.success('数据上传成功');
      }
      const labelCol = { style: { width: '120px' } };

      return {
        formData,
        labelCol,
        chartRef,
        submitTask,
        tips,
        spinning,
        registerModal,
        openModal,
        ok,
        fetchParams,
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

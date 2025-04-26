<template>
  <PageWrapper title="主界面">
    <a-card>
      <a-form :model="formData" :label-col="labelCol">
        <a-row :gutter="24" class="custom-row-gap">
          <a-col :md="5">
            <a-form-item label="电价">
              <a-form-item name="input-number" no-style>
                <a-input-number v-model:value="formData.electricity" addon-after="元/KW·h" />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="5">
            <a-form-item label="标煤单价">
              <a-form-item name="input-number" no-style>
                <a-input-number v-model:value="formData.coal" addon-after="元/吨" />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="5">
            <a-form-item label="当前运行机组数量">
              <a-form-item name="input-number" no-style>
                <a-input-number v-model:value="formData.count" disabled />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="5">
            <a-form-item label="当前冷却水温度">
              <a-form-item name="input-number" no-style>
                <a-input-number v-model:value="formData.temperature" addon-after="℃" disabled />
              </a-form-item> </a-form-item
          ></a-col>
          <a-col :md="3">
            <a-form-item>
              <a-button type="primary" html-type="submit" @click="submitTask" :loading="spinning">{{
                spinning ? '计算中' : '确定'
              }}</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-divider />
      <a-spin :spinning="spinning" size="large" :tip="tips">
        <div ref="chartRef" style="width: 100%; height: 500px"></div
      ></a-spin>
    </a-card>
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
  } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { ref, Ref, onMounted, toRaw } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getParams, submit, getData, getStatus } from '/@/api/sis/main';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs, { Dayjs } from 'dayjs';

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
    },
    setup() {
      const formData = ref({
        electricity: undefined,
        coal: undefined,
        count: 4,
        temperature: undefined,
      });
      const { createMessage } = useMessage();
      const chartRef = ref<HTMLDivElement | null>(null);
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
      const fetchParams = async () => {
        const params = await getParams();
        formData.value.electricity = params.electricity;
        formData.value.coal = params.coal;
        formData.value.count = params.count;
        formData.value.temperature = params.temperature;
        setChart();
      };
      const names = {
        '4': ['7pumps', '6pumps', '5pumps', '4pumps'],
        '3': ['6pumps', '5pumps', '4pumps', '3pumps'],
        '2': ['4pumps(A)', '4pumps(B)', '3pumps', '2pumps'],
      };

      onMounted(() => {
        setChart();
        // fetchParams();
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
              spinning.value = false;
              setChart();
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
        console.log(chartData);
        setOptions({
          title: {
            text: '规划符合循泵优化节支概算图',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
          legend: {
            data: [
              '理想最大毛利润',
              names[formData.value.count][3],
              names[formData.value.count][2],
              names[formData.value.count][1],
              names[formData.value.count][0],
              '理想泵数',
              '理想最大相对利润',
            ],
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
              name: '相对利润',
              type: 'value',
              show: true,
              alignTicks: true,
              axisLine: {
                show: true,
              },
              axisLabel: {
                formatter: '{value} 万元/h',
              },
              nameLocation: 'middle',
              nameRotate: 90,
              nameTextStyle: {
                fontWeight: 'bold',
                fontSize: 20,
                align: 'left',
              },
              nameGap: 75,
            },
            {
              name: '理想最大毛利润',
              type: 'value',
              show: false,
              alignTicks: true,
              axisLine: {
                show: true,
              },
              axisLabel: {
                formatter: '{value} 万元/h',
              },
            },
            {
              name: '循环水泵投运数量',
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
                align: 'left',
              },
              nameGap: 75,
            },
          ],
          series: [
            {
              name: '理想最大毛利润',
              type: 'line',
              data: chartData[6],
              smooth: true,
              lineStyle: {
                color: 'black',
                width: 3,
              },
              symbol: 'none',
              yAxisIndex: 1,
            },
            {
              name: '理想最大相对利润',
              type: 'line',
              data: chartData[7],
              smooth: true,
              lineStyle: {
                color: 'blue',
                width: 3,
              },
              symbol: 'none',
              yAxisIndex: 1,
            },
            {
              name: names[formData.value.count][3],
              type: 'line',
              data: chartData[2],
              smooth: true,
              symbol: 'none',
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: names[formData.value.count][2],
              type: 'line',
              data: chartData[3],
              symbol: 'none',
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: names[formData.value.count][1],
              type: 'line',
              symbol: 'none',
              data: chartData[4],
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: names[formData.value.count][0],
              type: 'line',
              data: chartData[5],
              symbol: 'none',
              smooth: true,
              lineStyle: {
                type: 'dashed',
              },
            },
            {
              name: '理想泵数',
              symbol: 'none',
              type: 'line',
              step: 'end',
              data: chartData[1],
              yAxisIndex: 2,
              lineStyle: {
                width: 3,
              },
            },
            {
              data: [chartData[8]],
              type: 'effectScatter',
              symbolSize: 20,
              label: {
                show: true,
                position: 'right',
                formatter: [
                  `机组当前总负荷: ${chartData[8][0]}`,
                  `当前循泵启动数量: ${chartData[8][1]}`,
                ].join('\n'),
              },
              yAxisIndex: 2,
            },
          ],
        });
      }

      const labelCol = { style: { width: '120px' } };
      return {
        formData,
        labelCol,
        chartRef,
        submitTask,
        tips,
        spinning,
      };
    },
  };
</script>

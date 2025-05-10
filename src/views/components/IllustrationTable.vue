<template>
  <div>
    <table>
      <thead>
        <tr>
          <td colspan="6" style="background-color: #fafafa">循泵配伍说明</td>
        </tr>
        <tr>
          <td colspan="2" style="background-color: #fafafa">单机组运行</td>
          <td colspan="4" style="background-color: #fafafa">双机组运行</td>
        </tr>
        <tr>
          <td>循泵配伍方式</td>
          <td>循泵运行状态</td>
          <td>循泵配伍方式</td>
          <td>循泵运行状态</td>
          <td>循泵配伍方式</td>
          <td>循泵运行状态</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ tableData[0].singlePumpLevel }}</td>
          <td>{{ tableData[0].singlePumpState }}</td>
          <td>{{ tableData[0].doublePumpLevel1 }}</td>
          <td>{{ tableData[0].doublePumpState1 }}</td>
          <td>{{ tableData[0].doublePumpLevel2 }}</td>
          <td>{{ tableData[0].doublePumpState2 }}</td>
        </tr>
        <tr>
          <td>{{ tableData[1].singlePumpLevel }}</td>
          <td>{{ tableData[1].singlePumpState }}</td>
          <td>{{ tableData[1].doublePumpLevel1 }}</td>
          <td>{{ tableData[1].doublePumpState1 }}</td>
          <td>{{ tableData[1].doublePumpLevel2 }}</td>
          <td>{{ tableData[1].doublePumpState2 }}</td>
        </tr>
        <tr>
          <td>{{ tableData[2].singlePumpLevel }}</td>
          <td>{{ tableData[2].singlePumpState }}</td>
          <td>{{ tableData[2].doublePumpLevel1 }}</td>
          <td>{{ tableData[2].doublePumpState1 }}</td>
          <td>{{ tableData[2].doublePumpLevel2 }}</td>
          <td>{{ tableData[2].doublePumpState2 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';

  export default defineComponent({
    name: 'IllustrationTable',
    setup() {
      const tableData = ref([
        {
          singlePumpLevel: '方式9',
          singlePumpState: '一高一低',
          doublePumpLevel1: '方式6',
          doublePumpState1: '两高两低',
          doublePumpLevel2: '方式3',
          doublePumpState2: '两高',
        },
        {
          singlePumpLevel: '方式8',
          singlePumpState: '一高',
          doublePumpLevel1: '方式5',
          doublePumpState1: '两高一低',
          doublePumpLevel2: '方式2',
          doublePumpState2: '一高一低',
        },
        {
          singlePumpLevel: '方式7',
          singlePumpState: '一低',
          doublePumpLevel1: '方式4',
          doublePumpState1: '两低一高',
          doublePumpLevel2: '方式1',
          doublePumpState2: '两低',
        },
      ]);

      return {
        tableData,
      };
    },
  });
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
    background-color: #fff; /* 表格单元格背景颜色为白色 */
  }

  tr:nth-child(even) td {
    background-color: #fff; /* 偶数行背景颜色为浅灰色 */
  }
</style>

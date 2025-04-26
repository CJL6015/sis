<template>
  <PageWrapper title="热力参数汇总">
    <a-card
      ><div style="margin-bottom: 16px">
        <a-input
          v-model:value="inputValue"
          placeholder="请输入参数"
          style="width: 200px; margin-right: 8px"
        />
        <a-button type="primary" @click="onSearch">确定</a-button>
      </div>
      <BasicTable @register="registerTable"
    /></a-card>
  </PageWrapper>
</template>
<script lang="ts">
  import { PageWrapper } from '/@/components/Page';
  import { columns } from './point.data';
  import { getParams } from '/@/api/sis/param';
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';

  import { Card } from 'ant-design-vue';

  export default {
    components: {
      BasicTable,
      PageWrapper,
      ACard: Card,
    },
    setup() {
      const inputValue = ref(''); // 输入框的值
      const [registerTable, methods] = useTable({
        columns,
        formConfig: {
          labelWidth: 120,
        },
        pagination: true,
        bordered: true,
        showIndexColumn: false,
        canResize: false,
      });
      const searchData = ref('');

      async function freshTableData() {
        const data = await getParams({
          search: searchData.value,
        });
        methods.setTableData(data);
      }

      const onSearch = () => {
        searchData.value = inputValue.value;
      };

      let timer = null;

      onMounted(() => {
        freshTableData();
        timer = setInterval(() => {
          freshTableData();
        }, 1000);
      });

      onBeforeUnmount(() => {
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      });

      return {
        inputValue,
        onSearch,
        registerTable,
      };
    },
  };
</script>

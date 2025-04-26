<template>
  <PageWrapper title="热力参数汇总">
    <BasicTable @register="registerTable" />
  </PageWrapper>
</template>
<script lang="ts">
  import { PageWrapper } from '/@/components/Page';
  import { columns } from './point.data';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getParams } from '/@/api/sis/param';
  import { onMounted, onBeforeUnmount } from 'vue';

  export default {
    components: {
      BasicTable,
      PageWrapper,
    },
    setup() {
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

      async function freshTableData() {
        const data = await getParams();
        methods.setTableData(data);
      }

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
        registerTable,
      };
    },
  };
</script>

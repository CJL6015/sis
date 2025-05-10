<template>
  <PageWrapper title="概览">
    <a-card>
      <a-row>
        <a-col :md="24">
          <BasicTable @register="registerTable" size="large" />
        </a-col>
      </a-row>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts">
  import { Col, Row, Card, Divider } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { onMounted } from 'vue';
  import { getOverviewTable } from '/@/api/sis/calculate';
  import { columns } from './point.data';
  import { BasicTable, useTable } from '/@/components/Table';

  export default {
    components: {
      PageWrapper,
      ARow: Row,
      ACol: Col,
      ACard: Card,
      ADivider: Divider,
      BasicTable,
    },
    setup() {
      const [registerTable, methods] = useTable({
        columns,
        formConfig: {
          labelWidth: 120,
          size: 'large',
        },
        pagination: false,
        bordered: true,
        showIndexColumn: false,
        canResize: false,
      });

      async function getdata() {
        const res = await getOverviewTable();
        methods.setTableData(res);
      }

      onMounted(() => {
        getdata();
      });

      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        registerTable,
      };
    },
  };
</script>

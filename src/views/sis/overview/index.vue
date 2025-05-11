<template>
  <PageWrapper title="实时循泵优化节支计算概览">
    <a-card>
      <a-row>
        <a-col :md="24">
          <img :src="pic" style="display: block; width: 100%" />
        </a-col>
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
  import { getOverview } from '/@/api/sis/calculate';
  import { columns } from './point.data';
  import { BasicTable, useTable } from '/@/components/Table';
  import pic from '/@/assets/images/pic.png';

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
        const res = await getOverview();
        methods.setTableData(res);
      }

      onMounted(() => {
        getdata();
      });

      const labelCol = { style: { width: '120px' } };
      return {
        labelCol,
        registerTable,
        pic,
      };
    },
  };
</script>

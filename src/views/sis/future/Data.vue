<template>
  <BasicModal @register="register" @ok="handleOk" title="数据上传" width="1200px">
    <a-upload
      :before-upload="handleBeforeUpload"
      :customRequest="handleCustomRequest"
      :show-upload-list="false"
    >
      <a-button type="primary">上传Excel文件</a-button>
    </a-upload>
    <a :href="fileUrl" download="96点负荷模板.xlsx">模板下载</a>
    <BasicTable @register="registerTable" @edit-end="handleEditEnd" />
  </BasicModal>
</template>

<script lang="ts">
  import { ref, Ref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Upload } from 'ant-design-vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import * as XLSX from 'xlsx';
  import { columns } from './point.data';
  import { upload } from '/@/api/sis/future';

  export default {
    components: { BasicModal, AUpload: Upload, BasicTable },
    props: {
      point: { type: Object },
    },
    setup() {
      async function onDataReceive(data) {}

      const [register] = useModalInner((data) => {
        data && onDataReceive(data);
      });

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

      function handleBeforeUpload(file) {
        // 确保上传的文件是Excel文件
        const fileType = file.type;
        if (
          fileType !== 'application/vnd.ms-excel' &&
          fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          // 提示用户上传的文件不是Excel文件
          return false;
        }
        return true;
      }
      const tableData = ref([]);
      function handleCustomRequest({ file }) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const binaryString = e.target.result;
          const workbook = XLSX.read(binaryString, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log(111, sheetData);

          // 去除表头后的数据
          tableData.value = sheetData.slice(1).map((subArray) => {
            const data = {};
            data.ID = subArray[0] || '0';
            data.TimeTag = subArray[1] || '0';
            data.p1Mw = subArray[2] && isNumber(subArray[2]) ? subArray[2] : '0';
            data.p2Mw = subArray[3] && isNumber(subArray[3]) ? subArray[3] : '0';
            return data;
          });
          methods.setTableData(tableData.value);
        };

        reader.readAsBinaryString(file);
      }

      function isNumber(value) {
        return /^-?[\d.]+(?:e-?\d+)?$/.test(value.toString());
      }

      function handleEditEnd({ record, index, key, value }) {
        tableData.value[index][key] = value;
        return true;
      }

      function getTableData() {
        console.log(666, tableData.value);
      }

      const fileUrl = ref('/files/96点负荷模板.xlsx');
      function handleOk() {
        upload(tableData.value);
        return true;
      }

      return {
        register,
        handleBeforeUpload,
        handleCustomRequest,
        registerTable,
        getTableData,
        handleEditEnd,
        fileUrl,
        handleOk,
        isNumber,
      };
    },
  };
</script>

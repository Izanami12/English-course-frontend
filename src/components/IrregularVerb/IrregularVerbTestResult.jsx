import { Table } from 'antd';
import React from 'react';
import { createStyles } from 'antd-style';
import ProgressBar from '../ProgressBar';
import './TestResultModal.css';
/* const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: unset;
            max-height: 'calc(100vh - 150px)';
            height: 'calc(100vh - 150px)';}
            overflow-y: auto;
          }
        }
      }
    `,
  };
}); */

const IrregularVerbTestResult = ({ result }) => {

  //const { styles } = useStyle();

  const percentage = result.percentage

  const columns = [
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Translation</span>,
      width: 120,
      height: 30,
      dataIndex: 'translationRu',
      key: 'translationRu',
      fixed: 'left',
      onCell: () => {
        return {
          style: { fontSize: "24px", fontWeight: 'bold', border: "3px solid", borderRadius: '5px'}
        };
      }
    },
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Infinitive</span>,
      width: 120,
      height: 30,
      dataIndex: 'infinitive',
      key: 'infinitive',
      onCell: (record) => {
        const checkBg = record.isInfinitiveCorrect ? "#d8f7ba" : "#ffdede";
        const checkFontColor = record.isInfinitiveCorrect ? "#5a900d" : "#e65f5f";
        const checkBorderColor = record.isInfinitiveCorrect ? "3px solid #5a900d" : "3px solid #e65f5f";
        return {
          style: { background: checkBg, fontSize: "24px", fontWeight: 'bold', color: checkFontColor, border: checkBorderColor, borderRadius: '10px'}
        };
      }
    },
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Input infinitive</span>,
      width: 120,
      height: 30,
      dataIndex: 'inspectedInfinitive',
      key: 'inspectedInfinitive',
      onCell: (record) => {
        const checkBg = record.isInfinitiveCorrect ? "#d8f7ba" : "#ffdede";
        const checkFontColor = record.isInfinitiveCorrect ? "#5a900d" : "#e65f5f";
        const checkBorderColor = record.isInfinitiveCorrect ? "3px solid #5a900d" : "3px solid #e65f5f";
        return {
          style: { background: checkBg, fontSize: "24px", fontWeight: 'bold', color: checkFontColor, border: checkBorderColor, borderRadius: '10px'}
        };
      }
    },
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Past simple</span>,
      width: 120,
      height: 30,
      dataIndex: 'pastSimple',
      key: 'pastSimple',
      onCell: (record) => {
        const checkBg = record.isPastSimpleCorrect ? "#d8f7ba" : "#ffdede";
        const checkFontColor = record.isPastSimpleCorrect ? "#5a900d" : "#e65f5f";
        const checkBorderColor = record.isPastSimpleCorrect ? "3px solid #5a900d" : "3px solid #e65f5f";
        return {
          style: { background: checkBg, fontSize: "24px", fontWeight: 'bold', color: checkFontColor, border: checkBorderColor, borderRadius: '10px'}
        };
      }
    },
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Input past simple</span>,
      width: 120,
      height: 30,
      dataIndex: 'inspectedPastSimple',
      key: 'inspectedPastSimple',
      onCell: (record) => {
        const checkBg = record.isPastSimpleCorrect ? "#d8f7ba" : "#ffdede";
        const checkFontColor = record.isPastSimpleCorrect ? "#5a900d" : "#e65f5f";
        const checkBorderColor = record.isPastSimpleCorrect ? "3px solid #5a900d" : "3px solid #e65f5f";
        return {
          style: { background: checkBg, fontSize: "24px", fontWeight: 'bold', color: checkFontColor, border: checkBorderColor, borderRadius: '10px'}
        };
      }
    },
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Past participle</span>,
      width: 120,
      height: 30,
      dataIndex: 'pastParticiple',
      key: 'pastParticiple',
      onCell: (record) => {
        const checkBg = record.isPastParticipleCorrect ? "#d8f7ba" : "#ffdede";
        const checkFontColor = record.isPastParticipleCorrect ? "#5a900d" : "#e65f5f";
        const checkBorderColor = record.isPastParticipleCorrect ? "3px solid #5a900d" : "3px solid #e65f5f";
        return {
          style: { background: checkBg, fontSize: "24px", fontWeight: 'bold', color: checkFontColor, border: checkBorderColor, borderRadius: '10px'}
        };
      }
    },
    {
      title: <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Input past participle</span>,
      width: 120,
      height: 30,
      dataIndex: 'inspectedPastParticiple',
      key: 'inspectedPastParticiple',
      onCell: (record) => {
        const checkBg = record.isPastParticipleCorrect ? "#d8f7ba" : "#ffdede";
        const checkFontColor = record.isPastParticipleCorrect ? "#5a900d" : "#e65f5f";
        const checkBorderColor = record.isPastParticipleCorrect ? "3px solid #5a900d" : "3px solid #e65f5f";
        return {
          style: { background: checkBg, fontSize: "24px", fontWeight: 'bold', color: checkFontColor, border: checkBorderColor, borderRadius: '10px'}
        };
      }
    }
  ];

  return (

    <div style={{ flex: 1, overflow: 'hidden' }}>
      <ProgressBar progress={percentage}/>
      <Table
        bordered
        
        
        columns={columns}
        dataSource={result.answers}
        pagination={false}
        style={{ height: '100%' }}
        scroll={{
          x: 'max-content',
          y: 55 * 5,
        }}>
      </Table>
    </div>

  );
};
export default IrregularVerbTestResult;
import React from "react";
import { Modal, Table, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ProgressBar from "../ProgressBar";
import "./TestResultModal.css";

const TestResultModal = ({ visible, onClose, result }) => {
  if (!result) return null;

  const percentage = result.percentage;

  // ✅ Define cell styles based on correctness
  const getCellStyle = (isCorrect) => ({
    background: isCorrect ? "#d8f7ba" : "#ffdede",
    color: isCorrect ? "#5a900d" : "#e65f5f",
    border: `3px solid ${isCorrect ? "#5a900d" : "#e65f5f"}`,
    fontWeight: "bold",
    fontSize: "18px",
    borderRadius: "10px",
    textAlign: "center",
    display: "flex", // Ensures content aligns properly within the cell
    justifyContent: "center", // Centers content horizontally
    alignItems: "center", // Centers content vertically
    padding: "20px", // Ensures the background fills the whole cell
    height: "100%", // Ensures the height of the content matches the cell height
    width: "100%", // Ensures the width of the content matches the cell width
  });

  // ✅ Table columns
  const columns = [
    {
      title: <span style={{ fontSize: "18px", fontWeight: "bold" }}>Translation</span>,
      dataIndex: "translationRu",
      key: "translationRu",
      fixed: "left",
      width: 150,
      render: (text) => <span style={{ fontSize: "24px", fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "Infinitive",
      dataIndex: "infinitive",
      key: "infinitive",
      width: 120,
      render: (text, record) => <div style={getCellStyle(record.isInfinitiveCorrect)}>{text}</div>,
    },
    {
      title: "Input Infinitive",
      dataIndex: "inspectedInfinitive",
      key: "inspectedInfinitive",
      width: 120,
      render: (text, record) => <div style={getCellStyle(record.isInfinitiveCorrect)}>{text}</div>,
    },
    {
      title: "Past Simple",
      dataIndex: "pastSimple",
      key: "pastSimple",
      width: 120,
      render: (text, record) => <div style={getCellStyle(record.isPastSimpleCorrect)}>{text}</div>,
    },
    {
      title: "Input Past Simple",
      dataIndex: "inspectedPastSimple",
      key: "inspectedPastSimple",
      width: 120,
      render: (text, record) => <div style={getCellStyle(record.isPastSimpleCorrect)}>{text}</div>,
    },
    {
      title: "Past Participle",
      dataIndex: "pastParticiple",
      key: "pastParticiple",
      width: 120,
      render: (text, record) => <div style={getCellStyle(record.isPastParticipleCorrect)}>{text}</div>,
    },
    {
      title: "Input Past Participle",
      dataIndex: "inspectedPastParticiple",
      key: "inspectedPastParticiple",
      width: 120,
      render: (text, record) => <div style={getCellStyle(record.isPastParticipleCorrect)}>{text}</div>,
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      width="100vw"
      styles={{
        content: {
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "0",
          position: "relative",
        },
      }}
    >
      {/* ✅ Close Button Positioned Top-Right */}
      <Button
        onClick={onClose}
        icon={<CloseOutlined />}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          zIndex: 1000,
          fontSize: "20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      />

      {/* ✅ Progress Bar Below Close Button */}
      <div style={{ padding: "20px", paddingTop: "50px" }}>
        <ProgressBar progress={percentage} />
      </div>

      {/* ✅ Table with Pagination */}
      <div style={{ flex: 1, overflow: "hidden", padding: "10px" }}>
        <Table
          bordered
          columns={columns}
          dataSource={result.answers}
          pagination={{ pageSize: 7 }} // ✅ Pagination with 10 rows per page
          scroll={{ x: "max-content", y: "70vh" }} // ✅ Scrollable table
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </Modal>
  );
};

export default TestResultModal;

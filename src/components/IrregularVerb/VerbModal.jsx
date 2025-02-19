import React, { useEffect, useState } from "react";
import { Modal, Table, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import IrregularVerbService from "../service/IrregularVerbService";
import "./VerbModal.css"; // Import styles

const VerbModal = ({ progressId, isVisible, onClose }) => {
  const [verbs, setVerbs] = useState([]);
  const [selectedVerb, setSelectedVerb] = useState(null);

  useEffect(() => {
    if (progressId) {
      IrregularVerbService.getProgress(progressId).then((r) => {
        setVerbs(formatVerbs(r.data.data));
      });
    }
  }, [progressId]);

  const formatVerbs = (verbsList) => {
    const formatted = [];
    for (let i = 0; i < verbsList.length; i += 2) {
      formatted.push({
        key: i,
        first: verbsList[i] || null,
        second: verbsList[i + 1] || null,
      });
    }
    return formatted;
  };

  const columns = [
    {
      title: "",
      dataIndex: "first",
      key: "first",
      render: (verb) =>
        verb ? <a onClick={() => setSelectedVerb(verb)}>{verb.infinitive}</a> : null,
    },
    {
      title: "",
      dataIndex: "second",
      key: "second",
      render: (verb) =>
        verb ? <a onClick={() => setSelectedVerb(verb)}>{verb.infinitive}</a> : null,
    },
  ];

  return (
    <Modal
      className="verb-modal"
      title="Passed verbs modal"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      {selectedVerb ? (
        <div className="selected-verb-container">
          <ArrowLeftOutlined
            className="back-arrow"
            onClick={() => setSelectedVerb(null)}
          />
          <Card className="verb-card">
            <h2>{selectedVerb.infinitive}</h2>
            <p>{selectedVerb.translationRu}</p>
            <p>Past Simple: {selectedVerb.pastSimple}</p>
            <p>Past Participle: {selectedVerb.pastParticiple}</p>
          </Card>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={verbs}
          rowKey="key"
          pagination={false}
          showHeader={false} // Hide the table header
        />
      )}
    </Modal>
  );
};

export default VerbModal;

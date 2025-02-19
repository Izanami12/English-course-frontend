import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Spin } from 'antd';
import 'antd/dist/reset.css';
import './IrregularVerbs.css';
import IrregularVerbService from '../service/IrregularVerbService';
import { useNavigate } from 'react-router-dom';
import VerbModal from './VerbModal';

const IrregularVerbs = () => {
  const [questionCount, setQuestionCount] = useState(10);
  const [progress, setProgress] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProgressId, setSelectedProgressId] = useState(null);
  const [hasInProgress, setHasInProgress] = useState(false);
  const [loading, setLoading] = useState(false); // <-- Loading state
  const navigate = useNavigate();

  const fetchProgressList = () => {
    setLoading(true); // <-- Start loading
    IrregularVerbService.getProgressList()
      .then((r) => {
        const response = r.data.data;
        setProgress(response);
        const inProcessExists = response.some((item) => item.status === 'IN_PROCESS');
        setHasInProgress(inProcessExists);
      })
      .catch((err) => {
        console.error('Failed to fetch progress list:', err);
      })
      .finally(() => {
        setLoading(false); // <-- End loading
      });
  };

  const showVerbsModal = (progressId) => {
    setSelectedProgressId(progressId);
    setIsModalVisible(true);
  };

  const handleStartProgress = () => {
    IrregularVerbService.createProgress(questionCount).then((r) => {
      const progressId = r.data.data;
      if (progressId) {
        navigate('/irregular-verbs-progress-card', { state: { progressId } });
      }
    });
  };

  const columns = [
    {
      title: 'Progress',
      dataIndex: 'progressId',
      key: 'progressId',
    },
    {
      title: 'Date of start',
      dataIndex: 'dateOfStart',
      key: 'dateOfStart',
    },
    {
      title: 'Date of finish',
      dataIndex: 'dateOfFinish',
      key: 'dateOfFinish',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <>
          {record.status === 'FINISHED' ? (
            <>
              <Button
                type="primary"
                onClick={() => showVerbsModal(record.progressId)}
                style={{ marginRight: '8px' }}
              >
                Show verbs
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/irregular-verbs-progress-test', { state: record })}
                style={{ marginRight: '8px' }}
              >
                Re-pass
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/irregular-verbs-progress-history', { state: record })}
                style={{ marginRight: '8px' }}
              >
                Show history
              </Button>
            </>
          ) : (
            <>
              <Button
                type="default"
                onClick={() => navigate('/irregular-verbs-progress-card', { state: record })}
                style={{ marginRight: '8px' }}
              >
                Show verbs
              </Button>
              <Button
                type="default"
                onClick={() => navigate('/irregular-verbs-progress-test', { state: record })}
                style={{ marginRight: '8px' }}
              >
                Pass the test
              </Button>
            </>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchProgressList();
  }, []);

  return (
    <div className="irregular-verbs-container" style={{ padding: '20px' }}>
      <div className="header-section">
        <h2>Irregular Verbs</h2>
        <div className="control-panel">
          {hasInProgress && (
            <p className="in-progress-message">
              You have an ongoing progress. Complete it before starting a new one.
            </p>
          )}
          <div className="input-button-group">
            <Input
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              disabled={hasInProgress}
              placeholder="Enter question count"
            />
            <Button type="primary" onClick={handleStartProgress} disabled={hasInProgress}>
              Start Progress
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={progress}
          pagination={{ pageSize: 10 }}
          rowKey="progressId"
          style={{ width: '100%' }}
          scroll={{ x: true }}
        />
      )}

      {isModalVisible && (
        <VerbModal
          progressId={selectedProgressId}
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
};

export default IrregularVerbs;

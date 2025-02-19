import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table, Button } from "antd";
import IrregularVerbService from "../service/IrregularVerbService";
import "./IrregularVerbProgressHistory.css"; // Import external styles
import HistoryTestResultModal from "./HistoryTestResultModal";

const IrregularVerbProgressHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { progressId } = location.state || {};

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Default: 10 items per page

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);

    useEffect(() => {
        const fetchProgressHistoryList = async () => {
            try {
                const response = await IrregularVerbService.getProgressHistory(progressId);
                setHistory(response.data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (progressId) {
            fetchProgressHistoryList();
        }
    }, [progressId]);

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center error-text">Error: {error}</p>;

    // Handle Show Result Button Click
    const showModal = (historyId) => {
        setSelectedHistoryId(historyId);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: "Test ID",
            dataIndex: "id",
            key: "id",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Status",
            dataIndex: "testStatus",
            key: "testStatus",
            render: (status) => (
                <span className={status === "SUCCEED" ? "status-success" : "status-failed"}>
                    {status}
                </span>
            ),
        },
        {
            title: "Score",
            dataIndex: "percentage",
            key: "percentage",
            render: (percentage) => `${percentage}%`,
        },
        {
            title: "Action",
            key: "action",
            render: (record) => (
                <Button type="primary" size="small" onClick={() => showModal(record.id)}>
                    View Result
                </Button>
            ),
        },
    ];

    return (
        <div className="progress-history-container">
            <div className="header-container">
                <div className="card-back-btn" onClick={() => navigate(-1)}>
                    ←
                </div>
                <h2 className="progress-title">Progress History</h2>
            </div>

            <Table
                columns={columns}
                dataSource={history}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: history.length,
                    onChange: (page, pageSize) => {
                        setCurrentPage(page);
                        setPageSize(pageSize);
                    },
                }}
                rowClassName={(record) =>
                    record.testStatus === "SUCCEED" ? "row-success" : "row-failed"
                }
            />

            {isModalVisible && (
                <HistoryTestResultModal
                    historyId={selectedHistoryId}
                    isVisible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                />
            )}
        </div>

    );


};

export default IrregularVerbProgressHistory;

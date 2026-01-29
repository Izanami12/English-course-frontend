import React, { useEffect, useState } from "react";
import { Card, Avatar, Spin, Select, Typography, Button, notification, Modal } from "antd";
import VocabularyService from "../service/VocabularyService";

const { Title, Paragraph } = Typography;

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [algorithm, setAlgorithm] = useState({ name: "", description: "" });
  const [availableAlgorithms, setAvailableAlgorithms] = useState({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const userRes = await VocabularyService.getUserInfo();
        setUser(userRes.data.data);

        const algoRes = await VocabularyService.getAlgorithmInfo();
        setAlgorithm(algoRes.data.data.currentAlgorithm);
        setAvailableAlgorithms(algoRes.data.data.availableAlgorithms || []);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAlgorithmChange = async (value) => {
    setLoading(true);
    try {
      const res = await VocabularyService.setAlgorithm(value);
      setAlgorithm(res.data.data.currentAlgorithm);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommon = async () => {
    Modal.confirm({
      title: "Подтверждение добавления слов",
      content: "Вы уверены, что хотите добавить общие слова? Это действие можно выполнить только один раз.",
      okText: "Подтвердить",
      cancelText: "Отмена",
      onOk: async () => {
        setAdding(true);
        try {
          const res = await VocabularyService.addCommonInputsToUser();
          const msg = res?.data?.data || "Common inputs successfully added";
          notification.success({ message: "Добавление слов", description: msg });
          // Обновляем данные пользователя после добавления слов
          const userRes = await VocabularyService.getUserInfo();
          setUser(userRes.data.data);
        } catch (e) {
          const errMsg = e?.response?.data?.message || e.message || "Server error";
          notification.error({ message: "Ошибка", description: errMsg });
        } finally {
          setAdding(false);
        }
      }
    });
  }; 

  if (loading) return <Spin />;

  return (
    <Card style={{ maxWidth: 400, margin: "32px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar size={64} src={user.avatar ? `/api/v1/avatar/${user.avatar}` : undefined}>
          {user.userName?.[0]?.toUpperCase()}
        </Avatar>
        <div>
          <Title level={4} style={{ margin: 0 }}>{user.userName}</Title>
          <Paragraph style={{ margin: 0, color: "#888" }}>{user.login}</Paragraph>
          <Paragraph style={{ margin: 0, color: "#aaa", fontSize: 12 }}>ID: {user.userId}</Paragraph>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <b>Learning Algorithm:</b>
        <Select
          style={{ width: "100%", marginTop: 8 }}
          value={algorithm.name}
          onChange={handleAlgorithmChange}
        >
          {availableAlgorithms.map(algo => (
            <Select.Option key={algo.name} value={algo.name}>
              {algo.name}
            </Select.Option>
          ))}
        </Select>
        <Paragraph style={{ marginTop: 12, color: "#555" }}>
          <b>Description:</b> {algorithm.description}
        </Paragraph>
        <Button 
          type="primary" 
          style={{ marginTop: 12 }} 
          loading={adding} 
          onClick={handleAddCommon}
          disabled={user?.userProperties?.commonsInitiated === true}
        >
          Добавить общие слова
        </Button>
      </div>
    </Card>
  );
};

export default UserInfo;
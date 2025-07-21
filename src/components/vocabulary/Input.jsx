import { useEffect, useState } from "react";
import { Card, Tag, Button, Spin, Space, Typography, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import VocabularyService from "../service/VocabularyService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./Input.css";
import EditInputModal from "./EditInputModal";

const { Title, Paragraph } = Typography;

const Input = ({ inputId: propInputId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const inputId = propInputId || Number(params.id);

  const [loading, setLoading] = useState(true);
  const [inputObj, setInputObj] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchInput = async () => {
      setLoading(true);
      try {
        const response = await VocabularyService.getUserInput(inputId);
        setInputObj(response.data.data);
      } catch (e) {
        setInputObj(null);
      } finally {
        setLoading(false);
      }
    };
    if (inputId) fetchInput();
  }, [inputId]);

  const handleEditSubmit = async (updatedInput) => {
    try {
      await VocabularyService.updateInput(updatedInput);
      // После успешного обновления — обнови данные
      const response = await VocabularyService.getUserInput(inputId);
      setInputObj(response.data.data);
      message.success("Word updated!");
    } catch (error) {
      message.error("Failed to update word");
    }
  };

  if (loading) return <Spin />;
  if (!inputObj) return <div style={{ fontSize: "18px" }}>No data found for this input.</div>;

  return (
    <div className="input-page-wrapper">
      <div className="input-back-btn-fixed" onClick={() => navigate("/vocabulary")}>
        <ArrowLeftOutlined style={{ fontSize: 28, color: "#1890ff", cursor: "pointer" }} />
      </div>
      <Card style={{ maxWidth: 600, margin: "32px auto", fontSize: "20px" }} className="input-card">
        <Title level={2} style={{ fontSize: "2.2rem", marginBottom: 8 }}>{inputObj.input}</Title>
        <Button type="default" style={{ marginBottom: 16 }} onClick={() => setIsEditModalOpen(true)}>
          Edit
        </Button>
        <Paragraph style={{ fontSize: "1.3rem", marginBottom: 8 }}>
          <b>Translation:</b> {inputObj.translate}
        </Paragraph>
        <Paragraph style={{ fontSize: "1.1rem", marginBottom: 8 }}>
          <b>Tags:</b>
          <div className="input-tags-block">
            {inputObj.tags?.map((tagObj) => (
              <Tag key={tagObj.tag} color="green" className="input-tag">{tagObj.tag}</Tag>
            ))}
          </div>
        </Paragraph>
        <Paragraph style={{ fontSize: "1.1rem", marginBottom: 8 }}>
          <b>Examples:</b>
          <ul style={{ marginLeft: 24 }}>
            {inputObj.examples?.filter(Boolean).length > 0
              ? inputObj.examples.filter(Boolean).map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))
              : <li style={{ color: "#888" }}>No examples</li>}
          </ul>
        </Paragraph>
        <Paragraph style={{ fontSize: "1.1rem", marginBottom: 0 }}>
          <b>Relations:</b>
          <div className="input-relations-block">
            {inputObj.relations && inputObj.relations.length > 0 ? (
              <Space wrap>
                {inputObj.relations.map((rel) => (
                  <Button
                    key={rel.id}
                    type="link"
                    onClick={() => navigate(`/vocabulary/input/${rel.id}`)}
                    className="input-relation-btn"
                    style={{ padding: 0, fontSize: "1.1rem" }}
                  >
                    <span className="input-relation-text">{rel.input} — {rel.translate}</span>
                    <Space size="small" style={{ marginLeft: 8 }}>
                      {rel.tags?.map((tagObj) => (
                        <Tag key={tagObj.tag} className="input-tag-blue">{tagObj.tag}</Tag>
                      ))}
                    </Space>
                  </Button>
                ))}
              </Space>
            ) : (
              <span style={{ color: "#888" }}>No relations</span>
            )}
          </div>
        </Paragraph>
      </Card>
      <EditInputModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={inputObj}
      />
    </div>
  );
};

export default Input;
import { useEffect, useState } from "react";
import { Card, Tag, Button, Spin, Space, Typography, message } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VocabularyService from "../service/VocabularyService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./Input.css";
import EditInputModal from "./EditInputModal";

const { Title, Paragraph } = Typography;

// Tag groups for styling
const baseTagGroups = {
  partOfSpeech: ['adj', 'adverb', 'idiom', 'noun', 'phrasal verb', 'phrase', 'preposition', 'verb', 'conjunction', 'determiner', 'interjection', 'numeral', 'participle', 'pronoun'],
  priority: ['high-priority', 'low-priority', 'mid-priority', 'top-priority', 'vital', 'zero-priority']
};

const Input = ({ inputId: propInputId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="input-back-btn-fixed" onClick={() => { if (location.state && location.state.from) { navigate(location.state.from); } else { navigate(-1); } }}>
        <ArrowLeftOutlined style={{ fontSize: 28, color: "#1890ff", cursor: "pointer" }} />
      </div>
      <Card style={{ maxWidth: 600, margin: "32px auto", fontSize: "20px" }} className="input-card">
        <Title level={2} style={{ fontSize: "2.2rem", marginBottom: 8 }}>{inputObj.input}</Title>
        {inputObj.transcription && (
          <Paragraph style={{ fontSize: "1.1rem", color: "#888", marginBottom: 8 }}>
            [{inputObj.transcription}]
          </Paragraph>
        )}
        <Button
          type="default"
          style={{ marginBottom: 16 }}
          onClick={() => setIsEditModalOpen(true)}
          disabled={inputObj.inputType !== "PERSONAL"}
          title={inputObj.inputType !== "PERSONAL" ? "Данное слово нельзя редактировать" : ""}
        >
          Edit
        </Button>
        <Paragraph style={{ fontSize: "1.3rem", marginBottom: 8 }}>
          <b>Translation:</b> {inputObj.translate}
        </Paragraph>
        <Paragraph style={{ fontSize: "1.1rem", marginBottom: 8 }}>
          <b>Tags:</b>
          <div className="input-tags-block">
            {inputObj.tags?.map((tagObj) => {
              const t = (tagObj.tag || '').toLowerCase();
              const cls = baseTagGroups.partOfSpeech.includes(t) ? 'input-tag-blue' : baseTagGroups.priority.includes(t) ? 'input-tag' : 'input-tag';
              return <Tag key={tagObj.tag} className={cls}>{tagObj.tag}</Tag>;
            })}
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
                    onClick={() => navigate(`/vocabulary/input/${rel.id}`, { state: { from: location.state?.from || '/vocabulary' } })}
                    className="input-relation-btn"
                    style={{ padding: 0, fontSize: "1.1rem" }}
                  >
                    <span className="input-relation-text">{rel.input} — {rel.translate}</span>
                    <Space size="small" style={{ marginLeft: 8 }}>
                      {rel.tags?.map((tagObj) => {
                        const t = (tagObj.tag || '').toLowerCase();
                        const cls = baseTagGroups.partOfSpeech.includes(t) ? 'input-tag-blue' : baseTagGroups.priority.includes(t) ? 'input-tag' : 'input-tag';
                        return <Tag key={tagObj.tag} className={cls}>{tagObj.tag}</Tag>;
                      })}
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
import { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, Tag, Space, Spin, Alert, message } from "antd";
import RelationModal from "./RelationModal";
import TagSelector from "./TagSelector";
import "./AddInputModal.css";
import VocabularyService from "../service/VocabularyService";

const baseTagGroups = {
  partOfSpeech: ['noun', 'verb', 'adj', 'adverb', 'preposition', 'idiom', 'phrasal verb', 'phrase'],
  priority: ['zero-priority', 'low-priority', 'mid-priority', 'high-priority', 'top-priority', 'vital']
};

const EditInputModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const wrapperRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [translation, setTranslation] = useState("");
  const [examples, setExamples] = useState([]);
  const [relations, setRelations] = useState([]);
  const [isTagDropdownVisible, setIsTagDropdownVisible] = useState(false);
  const [isRelationModalVisible, setIsRelationModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagGroups, setTagGroups] = useState({
    partOfSpeech: [],
    priority: [],
    custom: []
  });
  const [validation, setValidation] = useState({
    partOfSpeech: false,
    priority: false,
    isValid: false
  });

  // Для редактирования relation
  const [editingRelationIndex, setEditingRelationIndex] = useState(null);

  // Заполняем поля из initialData при открытии
  useEffect(() => {
    if (isOpen && initialData) {
      setInputValue(initialData.input || "");
      setTranslation(initialData.translate || "");
      setExamples(initialData.examples || []);
      setTags(initialData.tags || []);
      setRelations(
        (initialData.relations || []).map(rel => ({
          ...rel,
          inputValue: rel.input,
          translation: rel.translate,
          examples: rel.examples,
          tags: rel.tags,
          id: rel.id || Date.now() + Math.random()
        }))
      );
      setTagSearch("");
      setIsTagDropdownVisible(false);
      setValidation({
        partOfSpeech: false,
        priority: false,
        isValid: false
      });
      setEditingRelationIndex(null);

      // Fetch tags as before
      const fetchTags = async () => {
        try {
          const response = await VocabularyService.getUserTags();
          if (response?.data?.data) {
            const tagValues = response.data.data.map(t => t.tag).filter(Boolean);
            setAvailableTags(tagValues);

            const updatedGroups = {
              partOfSpeech: baseTagGroups.partOfSpeech.filter(tag => tagValues.includes(tag)),
              priority: baseTagGroups.priority.filter(tag => tagValues.includes(tag)),
              custom: tagValues.filter(tag =>
                ![...baseTagGroups.partOfSpeech, ...baseTagGroups.priority].includes(tag))
            };

            setTagGroups(updatedGroups);
            setValidation(validateTags(initialData.tags || [], updatedGroups));
          }
        } catch (error) {
          message.error("Failed to load tags");
        }
      };
      fetchTags();
    }
  }, [isOpen, initialData]);

  // Валидация тегов
  const validateTags = (currentTags, groups = tagGroups) => {
    const hasPartOfSpeech = groups.partOfSpeech.length > 0
      ? groups.partOfSpeech.some(tag => currentTags.some(t => t?.tag === tag))
      : true;
    const hasPriority = groups.priority.length > 0
      ? groups.priority.some(tag => currentTags.some(t => t?.tag === tag))
      : true;

    return {
      partOfSpeech: hasPartOfSpeech,
      priority: hasPriority,
      isValid: hasPartOfSpeech && hasPriority
    };
  };

  // Обработчики тегов
  const handleTagAdd = (tag) => {
    if (!tags.some(t => t.tag === tag)) {
      const newTags = [...tags, { tag }];
      setTags(newTags);
      setValidation(validateTags(newTags));
    }
    setTagSearch("");
    setIsTagDropdownVisible(false);
  };

  const handleTagRemove = (tag) => {
    const newTags = tags.filter(t => t.tag !== tag);
    setTags(newTags);
    setValidation(validateTags(newTags));
  };

  // Примеры
  const handleExampleChange = (idx, value) => {
    const newExamples = [...examples];
    newExamples[idx] = value;
    setExamples(newExamples);
  };

  const handleExampleAdd = () => {
    setExamples([...examples, ""]);
  };

  const handleExampleRemove = (idx) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };

  // Relations
  const handleAddRelation = (relationData) => {
    if (editingRelationIndex !== null) {
      // Редактирование
      const newRelations = [...relations];
      newRelations[editingRelationIndex] = {
        ...relationData,
        id: relations[editingRelationIndex].id || Date.now()
      };
      setRelations(newRelations);
    } else {
      // Добавление
      setRelations([...relations, {
        ...relationData,
        id: Date.now()
      }]);
    }
    setIsRelationModalVisible(false);
    setEditingRelationIndex(null);
  };

  const handleEditRelation = (index) => {
    setEditingRelationIndex(index);
    setIsRelationModalVisible(true);
  };

  const handleRemoveRelation = (index) => {
    setRelations(relations.filter((_, i) => i !== index));
  };

  // Сохранение
  const handleSave = async () => {
    if (!validation.isValid) {
      message.error("Please select at least one tag from each required group");
      return;
    }

    try {
      setLoading(true);
      const inputData = {
        id: initialData.id,
        input: inputValue,
        translate: translation,
        examples: examples.filter(ex => ex.trim() !== ""),
        tags: tags,
        relations: relations.map(rel => ({
          input: rel.inputValue,
          translate: rel.translation,
          examples: rel.examples,
          tags: rel.tags
        }))
      };

      await onSubmit(inputData);
      onClose();
    } catch (error) {
      message.error("Failed to save word");
    } finally {
      setLoading(false);
    }
  };

  // Для RelationModal: передавать initialData если редактируем relation
  const relationModalInitialData = editingRelationIndex !== null
    ? relations[editingRelationIndex]
    : null;

  // UI
  return (
    <>
      <Modal
        title="Edit Word"
        open={isOpen}
        onCancel={onClose}
        footer={null}
        className="add-input-modal"
        width={800}
      >
        <div ref={wrapperRef} className="modal-content">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Word"
              size="large"
              style={{ marginBottom: 12 }}
            />
            <Input
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              placeholder="Translation"
              size="large"
              style={{ marginBottom: 12 }}
            />
            <div className="field-group">
              <b>Examples:</b>
              {examples.map((ex, idx) => (
                <Space key={idx} style={{ display: "flex", marginBottom: 8 }}>
                  <Input
                    value={ex}
                    onChange={e => handleExampleChange(idx, e.target.value)}
                    placeholder={`Example ${idx + 1}`}
                    style={{ width: 400 }}
                  />
                  <Button onClick={() => handleExampleRemove(idx)}>-</Button>
                </Space>
              ))}
              <Button onClick={handleExampleAdd} style={{ marginTop: 8 }}>
                + Add Example
              </Button>
            </div>
            <div className="field-group">
              <b>Tags:</b>
              <TagSelector
                tags={tags}
                availableTags={availableTags}
                tagGroups={tagGroups}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                tagSearch={tagSearch}
                setTagSearch={setTagSearch}
                isDropdownVisible={isTagDropdownVisible}
                setDropdownVisible={setIsTagDropdownVisible}
              />
              {!validation.isValid && (
                <Alert
                  type="warning"
                  message="Select at least one tag from each required group"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
            <div className="field-group">
              <b>Relations:</b>
              {relations.map((rel, idx) => (
                <div key={rel.id} className="relation-item" style={{ marginBottom: 8 }}>
                  <Tag color="blue">{rel.inputValue}</Tag>
                  <Button size="small" onClick={() => handleEditRelation(idx)} style={{ marginLeft: 8 }}>
                    Edit
                  </Button>
                  <Button size="small" danger onClick={() => handleRemoveRelation(idx)} style={{ marginLeft: 4 }}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => { setEditingRelationIndex(null); setIsRelationModalVisible(true); }}
                style={{ marginTop: 8 }}
              >
                + Add Relation
              </Button>
            </div>
          </Space>
          <div className="modal-footer" style={{ marginTop: 24 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              disabled={!validation.isValid || loading}
              loading={loading}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
      <RelationModal
        isOpen={isRelationModalVisible}
        onCancel={() => { setIsRelationModalVisible(false); setEditingRelationIndex(null); }}
        onAdd={handleAddRelation}
        allTags={availableTags}
        tagGroups={tagGroups}
        initialData={relationModalInitialData}
      />
    </>
  );
};

export default EditInputModal;
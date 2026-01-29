import { useState, useRef, useEffect } from "react";
import { Modal, Input, Button, Tag, Space, Spin, Alert, message } from "antd";
import RelationModal from "./RelationModal";
import "./AddInputModal.css";
import VocabularyService from "../service/VocabularyService";
import TagSelector from "./TagSelector";

const baseTagGroups = {
  partOfSpeech: ['adj', 'adverb', 'idiom', 'noun', 'phrasal verb', 'phrase', 'preposition', 'verb', 'conjunction', 'determiner', 'interjection', 'numeral', 'participle', 'pronoun'],
  priority: ['high-priority', 'low-priority', 'mid-priority', 'top-priority', 'vital', 'zero-priority']
};

const AddInputModal = ({ isOpen, onClose, onSubmit }) => {
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
    priority: false
  });

  // Получаем теги из сервиса при монтировании
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setTags([]);
      setTagSearch("");
      setTranslation("");
      setExamples([]);
      setRelations([]);
      setIsTagDropdownVisible(false);
      setValidation({
        partOfSpeech: false,
        priority: false
      });
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
            setValidation(validateTags([], updatedGroups));
          }
        } catch (error) {
          console.error("Error fetching tags:", error);
          message.error("Failed to load tags");
        }
      };
      fetchTags();
    }
  }, [isOpen]);

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

  // Обработчики тегов (ограничение: только один тег в каждой группе partOfSpeech и priority)
  const handleTagSelect = (tag) => {
    if (!tag) return;

    const isPOS = tagGroups.partOfSpeech.includes(tag);
    const isPriority = tagGroups.priority.includes(tag);

    let newTags = [...tags];

    // If selecting a part-of-speech tag, replace existing one
    if (isPOS) {
      const existing = newTags.find(t => tagGroups.partOfSpeech.includes(t.tag));
      if (existing) {
        // restore previously selected tag back into available tags
        setAvailableTags(prev => Array.from(new Set([...prev, existing.tag])));
        newTags = newTags.filter(t => !tagGroups.partOfSpeech.includes(t.tag));
      }
    }

    // If selecting a priority tag, replace existing one
    if (isPriority) {
      const existing = newTags.find(t => tagGroups.priority.includes(t.tag));
      if (existing) {
        setAvailableTags(prev => Array.from(new Set([...prev, existing.tag])));
        newTags = newTags.filter(t => !tagGroups.priority.includes(t.tag));
      }
    }

    newTags = [...newTags, { tag }];
    setTags(newTags);
    setAvailableTags(prev => prev.filter(t => t !== tag));
    setTagSearch("");
    setValidation(validateTags(newTags));
  };

  const handleTagRemove = (tagToRemove) => {
    const newTags = tags.filter(tagObj => tagObj?.tag !== tagToRemove);
    setTags(newTags);
    setAvailableTags(prev => Array.from(new Set([...prev, tagToRemove])));
    setValidation(validateTags(newTags));
  };

  // Фильтрация и сортировка тегов
  const filteredAvailableTags = (availableTags || [])
    .filter(tag => {
      if (!tag) return false;
      return tag.toLowerCase().includes((tagSearch || '').toLowerCase());
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (tagGroups.partOfSpeech.includes(a) && !tagGroups.partOfSpeech.includes(b)) return -1;
      if (!tagGroups.partOfSpeech.includes(a) && tagGroups.partOfSpeech.includes(b)) return 1;
      if (tagGroups.priority.includes(a) && !tagGroups.priority.includes(b)) return -1;
      if (!tagGroups.priority.includes(a) && tagGroups.priority.includes(b)) return 1;
      return a.localeCompare(b);
    });

  // Обработчики примеров
  const handleAddExample = () => {
    setExamples([...examples, ""]);
  };

  const handleRemoveExample = (index) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleExampleChange = (index, value) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  // Обработчики связанных слов
  const handleAddRelation = (relationData) => {
    setRelations([...relations, {
      ...relationData,
      id: Date.now()
    }]);
    setIsRelationModalVisible(false);
  };

  const handleRemoveRelation = (id) => {
    setRelations(relations.filter(rel => rel.id !== id));
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
      console.error("Error saving input:", error);
      message.error("Failed to save word");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик клика вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsTagDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Modal
        title="Add Word"
        open={isOpen}
        onCancel={onClose}
        footer={null}
        className="add-input-modal"
        width={800}
      >
        <Spin spinning={loading}>
          <div className="modal-content">
            <div className="main-fields">
              <div className="field-group">
                <label className="block font-medium">Input</label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter word or phrase"
                />
              </div>

              <div className="field-group">
                <label className="block font-medium">Translate</label>
                <Input
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="Enter translation"
                />
              </div>

              <div className="field-group" ref={wrapperRef}>
                <label className="block font-medium">Tags</label>
                <TagSelector
                  value={tags}
                  availableTags={availableTags}
                  tagGroups={tagGroups}
                  search={tagSearch}
                  onSearchChange={setTagSearch}
                  onTagSelect={handleTagSelect}
                  onTagRemove={handleTagRemove}
                  onFocus={() => setIsTagDropdownVisible(true)}
                  visible={isTagDropdownVisible}
                  setVisible={setIsTagDropdownVisible}
                />

                {!validation.partOfSpeech && tagGroups.partOfSpeech.length > 0 && (
                  <Alert message="Please select at least one part of speech" type="error" showIcon />
                )}
                {!validation.priority && tagGroups.priority.length > 0 && (
                  <Alert message="Please select at least one priority level" type="error" showIcon />
                )}
              </div>
            </div>

            <div className="additional-fields">
              <div className="field-group">
                <label className="block font-medium">Examples</label>
                {examples.map((example, index) => (
                  <div key={`ex-${index}`} className="example-item">
                    <Input
                      value={example}
                      onChange={(e) => handleExampleChange(index, e.target.value)}
                      placeholder={`Example ${index + 1}`}
                    />
                    <Button onClick={() => handleRemoveExample(index)}>−</Button>
                  </div>
                ))}
                <Button onClick={handleAddExample} block>+ Add Example</Button>
              </div>

              <div className="field-group">
                <label className="block font-medium">Relations</label>
                {relations.map((rel) => (
                  <div key={rel.id} className="relation-item">
                    <span>{rel.inputValue}</span>
                    <Button onClick={() => handleRemoveRelation(rel.id)}>−</Button>
                  </div>
                ))}
                <Button
                  onClick={() => setIsRelationModalVisible(true)}
                  block
                >
                  + Add Relation
                </Button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              disabled={!validation.isValid}
            >
              Save
            </Button>
          </div>
        </Spin>
      </Modal>

      <RelationModal
        isOpen={isRelationModalVisible}
        onCancel={() => setIsRelationModalVisible(false)}
        onAdd={handleAddRelation}
        allTags={Array.from(new Set([...availableTags, ...tags.map(t => t.tag)]))}
        tagGroups={tagGroups}
      />
    </>
  );
};

export default AddInputModal;
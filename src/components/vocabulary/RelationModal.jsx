import { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, Space, Tag, message, Spin } from "antd";
import "./RelationModal.css";
import VocabularyService from "../service/VocabularyService";
import TagSelector from "./TagSelector";

const baseTagGroups = {
  partOfSpeech: ['adj', 'adverb', 'idiom', 'noun', 'phrasal verb', 'phrase', 'preposition', 'verb', 'conjunction', 'determiner', 'interjection', 'numeral', 'participle', 'pronoun'],
  priority: ['high-priority', 'low-priority', 'mid-priority', 'top-priority', 'vital', 'zero-priority']
};

const RelationModal = ({
  isOpen,
  onCancel,
  onAdd,
  allTags = [],
  tagGroups = { partOfSpeech: [], priority: [], custom: [] },
  initialData = null
}) => {
  const wrapperRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [translation, setTranslation] = useState("");
  const [examples, setExamples] = useState([]);
  const [isTagDropdownVisible, setIsTagDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // При открытии модалки заполняем поля из initialData (если есть) и обновляем доступные теги
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Если initialData есть — заполняем поля
      if (initialData) {
        setInputValue(initialData.inputValue || "");
        setTranslation(initialData.translation || "");
        setExamples(initialData.examples || []);
        setTags(initialData.tags || []);
        setTagSearch("");
      } else {
        setInputValue("");
        setTranslation("");
        setExamples([]);
        setTags([]);
        setTagSearch("");
      }
      // Доступные теги — это allTags минус выбранные
      setAvailableTags(
        (allTags || []).filter(tag => !((initialData?.tags || []).map(t => t.tag).includes(tag)))
      );
      setLoading(false);
    }
  }, [isOpen, initialData, allTags]);

  const handleTagSelect = (tag) => {
    if (!tag) return;

    const isPOS = tagGroups.partOfSpeech.includes(tag);
    const isPriority = tagGroups.priority.includes(tag);

    let newTags = [...tags];

    if (isPOS) {
      const existing = newTags.find(t => tagGroups.partOfSpeech.includes(t.tag));
      if (existing) {
        setAvailableTags(prev => Array.from(new Set([...prev, existing.tag])));
        newTags = newTags.filter(t => !tagGroups.partOfSpeech.includes(t.tag));
      }
    }
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
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tagObj => tagObj?.tag !== tagToRemove));
    setAvailableTags(prev => Array.from(new Set([...prev, tagToRemove])));
  };

  const filteredTags = (availableTags || [])
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

  const handleAddExample = () => setExamples([...examples, ""]);
  const handleRemoveExample = (index) => setExamples(examples.filter((_, i) => i !== index));

  const handleAdd = () => {
    const newRelation = {
      inputValue,
      tags,
      translation,
      examples: examples.filter(ex => ex.trim() !== ""),
      id: initialData?.id || Date.now()
    };
    onAdd(newRelation);
  };

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
    <Modal title={initialData ? "Edit Relation" : "Add Relation"} open={isOpen} onCancel={onCancel} footer={null}>
      <Spin spinning={loading}>
        <div className="modal-section">
          <label>Input</label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter related word"
          />
        </div>

        <div className="modal-section" ref={wrapperRef}>
          <label>Tags</label>
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

        </div>

        <div className="modal-section">
          <label>Translate</label>
          <Input
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="Enter translation"
          />
        </div>

        <div className="modal-section">
          <label>Examples</label>
          {examples.map((example, index) => (
            <div key={`ex-${index}`} className="example-item">
              <Input
                value={example}
                onChange={(e) => {
                  const newExamples = [...examples];
                  newExamples[index] = e.target.value;
                  setExamples(newExamples);
                }}
                placeholder={`Example ${index + 1}`}
              />
              <Button onClick={() => handleRemoveExample(index)}>−</Button>
            </div>
          ))}
          <Button onClick={handleAddExample}>+ Add Example</Button>
        </div>

        <div className="modal-footer">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleAdd}>
            {initialData ? "Save" : "Add"}
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};

export default RelationModal;
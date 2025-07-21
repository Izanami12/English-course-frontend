import { useState, useEffect, useRef } from "react";
import { Input, Button, Card, Space, Tag, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import AddInputModal from "./AddInputModal";
import UploadModal from "./UploadModal";
import "./Vocabulary.css";
import VocabularyService from "../service/VocabularyService";

const Vocabulary = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [words, setWords] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wordsResponse, tagsResponse] = await Promise.all([
        VocabularyService.getVocabularyList(),
        VocabularyService.getUserTags()
      ]);
      setWords(wordsResponse.data.data);
      const tagsArray = tagsResponse.data?.data?.map(item => item.tag) || [];
      setTagOptions(tagsArray);
    } catch (error) {
      message.error("Failed to load vocabulary data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTagOptions = tagOptions.filter(
    (tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagSelect = (tag) => {
    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const handleTagRemove = (tag) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
  };

  const handleCreateInput = async (inputData) => {
    try {
      await VocabularyService.createInput(inputData);
      message.success("Word added successfully");
      setIsModalOpen(false);
      fetchData(); // Refresh the list from backend
    } catch (error) {
      message.error("Failed to add word");
      console.error("Create error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }
    setIsSearching(true);
    setLoading(true);
    try {
      const response = await VocabularyService.searchVocabulary({ q: searchQuery });
      setWords(response.data.data.content || []);
    } catch (error) {
      message.error("Failed to search words");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="vocabulary-wrapper">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Vocabulary</h2>
        <Space>
          <Button onClick={() => setSelectedTags([])}>Reset</Button>
          <Button onClick={() => setIsUploadOpen(true)}>Import</Button>
          <Button onClick={() => navigate("/vocabulary/learn")}>Learn</Button>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>Add</Button>
        </Space>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search words..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={{ maxWidth: 300 }}
        />
        <Button type="primary" onClick={handleSearch} loading={isSearching}>
          Search
        </Button>
        {searchQuery && (
          <Button onClick={() => { setSearchQuery(""); fetchData(); }}>
            Reset
          </Button>
        )}
      </div>

      <div className="relative mb-4" ref={wrapperRef}>
        <Input
          placeholder="Click to filter by tags..."
          onClick={() => setIsDropdownOpen(true)}
          readOnly
        />

        {isDropdownOpen && (
          <div className="dropdown-panel">
            <div className="tags-panel">
              <div className="tag-search-title">Tags</div>
              <Input
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="mb-2"
              />
              <div className="tag-list">
                {filteredTagOptions.map((tag) => (
                  <div
                    key={tag}
                    className="tag-item"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </div>
                ))}
                {filteredTagOptions.length === 0 && (
                  <div className="tag-empty">No tags found</div>
                )}
              </div>
            </div>

            <div className="selected-tags-panel">
              <div className="tag-search-title">Active tags:</div>
              <Space wrap>
                {selectedTags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleTagRemove(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </div>

      <Spin spinning={loading}>
        <Card>
          {words.length > 0 ? (
            <div className="words-container">
              {words.map((word) => (
                <div key={word.id} className="word-row">
                  {/* Input on the left */}
                  <span
                    className="word-main"
                    onClick={() => navigate(`/vocabulary/input/${word.id}`)}
                  >
                    {word.input}
                  </span>
                  {/* Tags in the center */}
                  <span className="tags-list">
                    {word.tags && word.tags.length > 0 &&
                      word.tags.map(tag => (
                        <span key={`tag-${word.id}-${tag.tag}`} className="tag-text">
                          {tag.tag}
                        </span>
                      ))
                    }
                  </span>
                  {/* Relations on the right */}
                  <div className="relations-list">
                    {word.relations && word.relations.length > 0 && (
                      <>
                        <span className="relations-label">Related:</span>
                        {word.relations.map((rel, index) => (
                          <span
                            key={`rel-${word.id}-${index}`}
                            className="relation-item"
                            onClick={() => navigate(`/vocabulary/input/${rel.id}`)}
                          >
                            {rel.input}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              {loading ? "Loading..." : "No words found."}
            </div>
          )}
        </Card>
      </Spin>

      <AddInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateInput}
        tagOptions={tagOptions}
      />
      <UploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Vocabulary;
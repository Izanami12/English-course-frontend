import { useState, useEffect, useRef } from "react";
import { Input, Button, Card, Space, Tag, Spin, message, Pagination } from "antd";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AddInputModal from "./AddInputModal";
import UploadModal from "./UploadModal";
import TagSelector from "./TagSelector";
import "./Vocabulary.css";
import VocabularyService from "../service/VocabularyService";

const Vocabulary = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  const location = useLocation();

  const baseTagGroups = {
    partOfSpeech: ['adj', 'adverb', 'idiom', 'noun', 'phrasal verb', 'phrase', 'preposition', 'verb', 'conjunction', 'determiner', 'interjection', 'numeral', 'participle', 'pronoun'],
    priority: ['high-priority', 'low-priority', 'mid-priority', 'top-priority', 'vital', 'zero-priority']
  };

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
  const [page, setPage] = useState(1);
  const defaultPageSize = Number(localStorage.getItem("vocabPageSize")) || 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const [wordsResponse, tagsResponse] = await Promise.all([
        VocabularyService.getVocabularyList({
          page: (params.page || page) - 1, // Spring pageable is 0-based
          size: params.pageSize || pageSize
        }),
        VocabularyService.getUserTags()
      ]);
      setWords(wordsResponse.data.data.content || []);
      setTotal(wordsResponse.data.data.totalElements || 0);
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
    const q = searchParams.get("q") || "";
    const tagsParam = searchParams.get("tags") || "";
    const tagsArray = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
    const p = parseInt(searchParams.get("page")) || 1;
    const ps = parseInt(searchParams.get("pageSize")) || defaultPageSize;

    setSearchQuery(q);
    setSelectedTags(tagsArray);
    setPage(p);
    setPageSize(ps);

    // Sync to backend based on params
    const doFetch = async () => {
      setLoading(true);
      try {
        if (q.trim() || tagsArray.length > 0) {
          const body = {};
          if (q.trim()) body.query = q.trim();
          if (tagsArray.length) body.tags = tagsArray.map(t => ({ tag: t }));

          const [response, tagsResp] = await Promise.all([
            VocabularyService.searchVocabulary(body, { page: p - 1, size: ps }),
            VocabularyService.getUserTags()
          ]);

          setWords(response.data.data.content || []);
          setTotal(response.data.data.totalElements || 0);
          const tagsArrayFromResp = tagsResp.data?.data?.map(item => item.tag) || [];
          setTagOptions(tagsArrayFromResp);
        } else {
          await fetchData({ page: p, pageSize: ps });
        }
      } catch (error) {
        console.error("Initial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
    initializedRef.current = true;
  }, [searchParams]);



  // `TagSelector` will handle filtering; we pass `availableTags` below.

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

      const hasQuery = (searchQuery && searchQuery.trim()) || (selectedTags && selectedTags.length > 0);
      if (hasQuery) {
        // re-run search and go to first page of results
        handleSearch(1);
      } else {
        setPage(1);
        setSearchParams({ page: 1, pageSize });
        fetchData({ page: 1, pageSize });
      }
    } catch (error) {
      message.error("Failed to add word");
      console.error("Create error:", error);
    }
  };

  const handleSearch = async (pageParam = page, queryParam = searchQuery, tagsParam = selectedTags) => {
    const hasQuery = !!queryParam && queryParam.trim();
    const hasTags = tagsParam && tagsParam.length > 0;

    // If there's nothing to search by, reset to list
    if (!hasQuery && !hasTags) {
      setPage(1);
      setSearchParams({ page: 1, pageSize });
      fetchData({ page: 1, pageSize });
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const body = {};
      if (hasQuery) body.query = queryParam.trim();
      if (hasTags) body.tags = tagsParam.map(t => ({ tag: t }));

      const [response, tagsResp] = await Promise.all([
        VocabularyService.searchVocabulary(body, { page: (pageParam || page) - 1, size: pageSize }),
        VocabularyService.getUserTags()
      ]);

      setWords(response.data.data.content || []);
      setTotal(response.data.data.totalElements || 0);

      const tagsArrayFromResp = tagsResp.data?.data?.map(item => item.tag) || [];
      setTagOptions(tagsArrayFromResp);

      // Update URL params for current search
      const paramsObj = {};
      if (hasQuery) paramsObj.q = queryParam.trim();
      if (hasTags) paramsObj.tags = tagsParam.join(",");
      paramsObj.page = pageParam;
      paramsObj.pageSize = pageSize;
      setSearchParams(paramsObj);
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
          <Button onClick={() => { setSelectedTags([]); setSearchQuery(""); setPage(1); setSearchParams({ page: 1, pageSize }); fetchData({ page: 1, pageSize }); }}>Reset</Button>
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
          onPressEnter={() => handleSearch(1)}
          style={{ maxWidth: 300 }}
        />
        <Button type="primary" onClick={() => handleSearch(1)} loading={isSearching}>
          Search
        </Button>
        {(searchQuery || (selectedTags && selectedTags.length > 0)) && (
          <Button onClick={() => { setSearchQuery(""); setSelectedTags([]); setPage(1); setSearchParams({ page: 1, pageSize }); fetchData({ page: 1, pageSize }); }}>
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

              <TagSelector
                value={selectedTags.map(t => ({ tag: t }))}
                availableTags={tagOptions.filter(t => !selectedTags.includes(t))}
                tagGroups={baseTagGroups}
                search={tagSearch}
                onSearchChange={setTagSearch}
                onTagSelect={(tag) => {
                  const newTags = [...selectedTags, tag];
                  setSelectedTags(newTags);
                  handleSearch(1, searchQuery, newTags);
                }}
                onTagRemove={(tag) => {
                  const newTags = selectedTags.filter(t => t !== tag);
                  setSelectedTags(newTags);
                  handleSearch(1, searchQuery, newTags);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                visible={isDropdownOpen}
                setVisible={setIsDropdownOpen}
              />
            </div>
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="selected-tags-panel-always">
            <Space wrap>
              {selectedTags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => {
                    const newTags = selectedTags.filter(t => t !== tag);
                    setSelectedTags(newTags);
                    handleSearch(1, searchQuery, newTags);
                  }}
                  color={
                    baseTagGroups.partOfSpeech.includes(tag)
                      ? "blue"
                      : baseTagGroups.priority.includes(tag)
                        ? "green"
                        : "default"
                  }
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </div>

      <Spin spinning={loading}>
        <Card>
          {words.length > 0 ? (
            <>
              <div className="words-container">
                {words.map((word) => (
                  <div key={word.id} className="word-row">
                    {/* Input on the left */}
                    <span
                      className="word-main"
                      onClick={() => navigate(`/vocabulary/input/${word.id}`, { state: { from: location.pathname + location.search } })}
                    >
                      {word.input}
                    </span>
                    {/* Tags in the center */}
                    <span className="tags-list">
                      {word.tags && word.tags.length > 0 &&
                        word.tags.map(tag => (
                          <span key={`tag-${word.id}-${tag.tag}`} className={`tag-text ${baseTagGroups.partOfSpeech.includes(tag.tag) ? 'part-of-speech' : baseTagGroups.priority.includes(tag.tag) ? 'priority' : ''}`}>
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
                              onClick={() => navigate(`/vocabulary/input/${rel.id}`, { state: { from: location.pathname + location.search } })}
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
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                    localStorage.setItem("vocabPageSize", ps);
                    const hasQuery = (searchQuery && searchQuery.trim()) || (selectedTags && selectedTags.length > 0);
                    if (hasQuery) {
                      handleSearch(p);
                    } else {
                      setSearchParams({ page: p, pageSize: ps }); fetchData({ page: p, pageSize: ps });
                    }
                  }}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50", "100"]}
                />
              </div>
            </>
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
        onSuccess={() => {
          const hasQuery = (searchQuery && searchQuery.trim()) || (selectedTags && selectedTags.length > 0);
          if (hasQuery) {
            handleSearch(page);
          } else {
            fetchData({ page, pageSize });
          }
        }}
      />
    </div>
  );
};

export default Vocabulary;
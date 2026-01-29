import { useRef, useEffect } from "react";
import { Input, Tag, Space } from "antd";
import "./TagSelector.css";

const TagSelector = ({
  value = [],
  availableTags = [],
  tagGroups = { partOfSpeech: [], priority: [], custom: [] },
  search = "",
  onSearchChange,
  onTagSelect,
  onTagRemove,
  onFocus,
  visible,
  setVisible,
}) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, setVisible]);
  const getTagText = (tagObj) => (typeof tagObj === 'string' ? tagObj : tagObj?.tag);
  const filteredTags = (availableTags || [])
    .filter(tag => tag && tag.toLowerCase().includes((search || '').toLowerCase()))
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (tagGroups.partOfSpeech.includes(a) && !tagGroups.partOfSpeech.includes(b)) return -1;
      if (!tagGroups.partOfSpeech.includes(a) && tagGroups.partOfSpeech.includes(b)) return 1;
      if (tagGroups.priority.includes(a) && !tagGroups.priority.includes(b)) return -1;
      if (!tagGroups.priority.includes(a) && tagGroups.priority.includes(b)) return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="tag-selector" ref={wrapperRef}>
      <Input
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Search..."
        className="mb-2"
      />

      {/* Selected tags panel (shows only when some tags are selected) */}
      {value && value.length > 0 && (
        <div className="selected-tags-panel-always">
          <Space wrap>
            {value.map(tagObj => {
              const t = getTagText(tagObj);
              return (
                <Tag
                  key={t}
                  closable
                  onClose={() => onTagRemove(t)}
                  color={
                    tagGroups.partOfSpeech.includes(t) ? 'blue' :
                      tagGroups.priority.includes(t) ? 'green' : 'default'
                  }
                >
                  {t}
                </Tag>
              );
            })}
          </Space>
        </div>
      )}

      {visible && (
        <div className="dropdown-panel">
          <div className="tag-list">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <div
                  key={tag}
                  className={`tag-item ${tagGroups.partOfSpeech.includes(tag) ? 'part-of-speech' :
                    tagGroups.priority.includes(tag) ? 'priority' : 'custom'
                  }`}
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                </div>
              ))
            ) : (
              <div className="tag-empty">No tags found</div>
            )}
          </div>

          {/* Also show currently selected tags inside the dropdown for better visibility */}
          {value && value.length > 0 && (
            <div className="selected-tags-panel-dropdown">
              <div className="selected-title">Selected:</div>
              <Space wrap>
                {value.map(tagObj => {
                  const t = getTagText(tagObj);
                  return (
                    <Tag
                      key={`sel-${t}`}
                      closable
                      onClose={() => onTagRemove(t)}
                      color={tagGroups.partOfSpeech.includes(t) ? 'blue' : tagGroups.priority.includes(t) ? 'green' : 'default'}
                    >
                      {t}
                    </Tag>
                  );
                })}
              </Space>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
import { Modal, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import VocabularyService from "../service/VocabularyService";

const UploadModal = ({ open, onClose, onSuccess }) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!fileList.length) {
      message.error("Please select a file");
      return;
    }
    setLoading(true);
    try {
      await VocabularyService.uploadVocabularyFile(fileList[0]);
      message.success("File uploaded successfully");
      onSuccess?.();
      onClose();
    } catch (e) {
      message.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Upload Vocabulary (.json)"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="upload" type="primary" loading={loading} onClick={handleUpload}>Upload</Button>
      ]}
    >
      <Upload
        beforeUpload={file => {
          setFileList([file]);
          return false; // prevent auto upload
        }}
        fileList={fileList}
        accept=".json"
        maxCount={1}
        onRemove={() => setFileList([])}
      >
        <Button icon={<UploadOutlined />}>Select JSON File</Button>
      </Upload>
    </Modal>
  );
};

export default UploadModal;
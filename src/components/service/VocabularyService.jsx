import axiosInstance from "../../CustomAxios";

class VocabularyService {
    getVocabularyList(params = {}) {
        return axiosInstance.get('/vocabulary', { params });
    }

    getUserTags() {
        return axiosInstance.get('/vocabulary/tags');
    }

    createInput(inputData) {
        return axiosInstance.post(`/vocabulary`, inputData);
    }

    getUserInput(id) {
        return axiosInstance.get(`/vocabulary/${id}`);
    }

    searchVocabulary(searchParams, pagingParams = {}) {
        return axiosInstance.post('/vocabulary/search', searchParams, { params: pagingParams });
    }

    getUserInfo() {
        return axiosInstance.get('/user');
    }

    getAlgorithmInfo() {
        return axiosInstance.get('/weight-algorithm');
    }

    setAlgorithm(algorithm) {
        return axiosInstance.put(`/weight-algorithm/${algorithm}`);
    }

    addCommonInputsToUser() {
        return axiosInstance.post('/vocabulary/common');
    }

    updateInput(inputData) {
        return axiosInstance.put('/vocabulary/input', inputData);
    }

    uploadVocabularyFile(file) {
        const formData = new FormData();
        formData.append("file", file);
        return axiosInstance.post("/vocabulary/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }
}

export default new VocabularyService();
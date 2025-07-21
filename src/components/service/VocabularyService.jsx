import axiosInstance from "../../CustomAxios";

class VocabularyService {
    getVocabularyList() {
        return axiosInstance.get('/vocabulary');
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

    // Добавляем новый метод для поиска
    searchVocabulary(searchParams) {
        return axiosInstance.get('/vocabulary/search', { params: searchParams });
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
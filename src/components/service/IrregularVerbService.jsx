import axiosInstance from "../../CustomAxios"; 

class ContractDataService {
    getIrregularVerbList() {
        return axiosInstance.get('/irregular-verb');
    }

    getIrregularVerb(id) {
        return axiosInstance.get(`/irregular-verb/${id}`);
    }

    createProgress(questionCount) {
        return axiosInstance.post(`/irregular-verb/progress/${questionCount}`);
    }

    getProgressList() {
        return axiosInstance.get(`/irregular-verb/progress`);
    }

    getProgress(progressId) {
        return axiosInstance.get(`/irregular-verb/progress/${progressId}`);
    }

    getProgressHistory(progressId) {
        return axiosInstance.get(`/irregular-verb/progress/history/${progressId}`);
    }

    getProgressHistoryAnswers(historyId) {
        return axiosInstance.get(`/irregular-verb/progress/history/answers/${historyId}`);
    }

    checkProgressAnswer(data) {
        return axiosInstance.post(`/irregular-verb/progress`, data);
    }

    finishProgressTest(progressId, data) {
        return axiosInstance.post(`/irregular-verb/progress/finish-progress/${progressId}`, data, {
            headers: {
              'X-Trace-Id': localStorage.getItem("traceId") || '',  // Add traceId to request headers, or set to empty string if not found
              'Content-Type': 'application/json', // Ensure Content-Type is set
            },
          });
    }

    createTest(questionCount) {
        return axiosInstance.get(`/irregular-verb/test/${questionCount}`);
    }

    checkAnswer(data) {
        return axiosInstance.post('/irregular-verb/check-answer', data);
    }

    checkAnswers(data) {
        return axiosInstance.post('/irregular-verb/check-answer/check-test', data, {
            headers: {
              'X-Trace-Id': localStorage.getItem("traceId") || '',  // Add traceId to request headers, or set to empty string if not found
              'Content-Type': 'application/json', // Ensure Content-Type is set
            },
          });
    }

}
export default new ContractDataService();
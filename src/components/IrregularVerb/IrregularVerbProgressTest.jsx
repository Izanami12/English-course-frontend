import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import IrregularVerbService from "../service/IrregularVerbService";
import TestResultModal from "./TestResultModal";
import './IrregularVerbProgressTest.css';

const IrregularVerbProgressTest = () => {
    const location = useLocation();
    const { progressId } = location.state || {};

    const [verbList, setVerbList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [previousAnswers, setPreviousAnswers] = useState([]);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [finishVisible, setFinishVisible] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [result, setResult] = useState(null);

    const navigate = useNavigate();

    const infinitiveRef = useRef("");
    const pastSimpleRef = useRef("");
    const pastParticipleRef = useRef("");

    // ✅ Notification helper
    const openNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
        });
    };

    // ✅ Fetch verb list on component mount
    useEffect(() => {
        const fetchProgressList = async () => {
            try {
                const response = await IrregularVerbService.getProgress(progressId);
                const traceId = response.headers['x-trace-id'];
                localStorage.setItem('traceId', traceId);
                const data = response.data.data;
                setVerbList(data);

                setAnswers(data.map((verb) => ({
                    translationRu: verb.translationRu,
                    infinitive: "",
                    pastSimple: "",
                    pastParticiple: "",
                })));

                setPreviousAnswers(data.map((verb) => ({
                    translationRu: verb.translationRu,
                    infinitive: "",
                    pastSimple: "",
                    pastParticiple: "",
                })));

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProgressList();

        // Timer logic
        const timer = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [progressId]);

    // ✅ Format time
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // ✅ Handle input change
    const handleInputChange = (e, field) => {
        const value = e.target.value;
        const updatedAnswers = [...answers];
        updatedAnswers[currentIndex][field] = value;
        setAnswers(updatedAnswers);
    };

    // ✅ Submit current answer to the backend
    const putAnswer = (translationRu) => {
        const currentQuestion = answers[currentIndex];
        const previousQuestion = previousAnswers[currentIndex];

        if (
            currentQuestion.infinitive !== previousQuestion.infinitive ||
            currentQuestion.pastSimple !== previousQuestion.pastSimple ||
            currentQuestion.pastParticiple !== previousQuestion.pastParticiple
        ) {
            const updatedPreviousAnswers = [...previousAnswers];
            updatedPreviousAnswers[currentIndex] = { ...currentQuestion };
            setPreviousAnswers(updatedPreviousAnswers);

            IrregularVerbService.checkProgressAnswer(currentQuestion).then((response) => {
                const type = response.data.data ? "success" : "error";
                const description = response.data.data
                    ? "You did well"
                    : "Incorrect, try again!";
                openNotification(type, translationRu, description);
            });
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            putAnswer(verbList[currentIndex].translationRu);
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < verbList.length - 1) {
            putAnswer(verbList[currentIndex].translationRu);
            setCurrentIndex((prevIndex) => {
                const newIndex = prevIndex + 1;

                if (newIndex === verbList.length - 1) {
                    setFinishVisible(true);
                }

                return newIndex;
            });
        }
    };

    const handleFinish = () => {
        IrregularVerbService.finishProgressTest(progressId, answers)
            .then(r => {
                if (r.data && r.data.data) {
                    setResult(r.data.data);
                    setModalVisible(true);
                    console.log("API Response:", r.data.data);
                } else {
                    console.error("Unexpected API response:", r);
                    notification.error({
                        message: "Error",
                        description: "Unexpected API response. Please try again.",
                    });
                }
            })
            .catch(error => {
                console.error("API error:", error);
                notification.error({
                    message: "Error",
                    description: "Failed to finish the test. Please try again later.",
                });
            });
    };

    const handleClose = () => {
        setModalVisible(false); // Close the modal
        navigate('/irregular-verbs-progress'); // Navigate to the desired page
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex, verbList]);

    const focusInfinitiveInput = () => {
        if (infinitiveRef.current) {
            infinitiveRef.current.focus();
            setTimeout(() => {
                const length = infinitiveRef.current.value.length;
                infinitiveRef.current.setSelectionRange(length, length);
            }, 0);
        }
    };
    
    useEffect(() => {
        focusInfinitiveInput();
    }, [currentIndex]);
    
    
    


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="card-container">
            <div className="card-back-btn" onClick={() => navigate(-1)}>
                ←
            </div>

            <h1 className="card-title">{verbList[currentIndex]?.translationRu}</h1>

            <div className="card-inputs">
                <label>
                    Infinitive:
                    <input
                        ref={infinitiveRef}
                        value={answers[currentIndex]?.infinitive || ""}
                        onChange={(e) => handleInputChange(e, "infinitive")}
                    />
                </label>
                <label>
                    Past Simple:
                    <input
                        ref={pastSimpleRef}
                        value={answers[currentIndex]?.pastSimple || ""}
                        onChange={(e) => handleInputChange(e, "pastSimple")}
                    />
                </label>
                <label>
                    Past Participle:
                    <input
                        ref={pastParticipleRef}
                        value={answers[currentIndex]?.pastParticiple || ""}
                        onChange={(e) => handleInputChange(e, "pastParticiple")}
                    />
                </label>
            </div>

            <button
                className="card-nav-btn left"
                onClick={handlePrev}
                disabled={currentIndex === 0}
            >
                ←
            </button>

            <button
                className="card-nav-btn right"
                onClick={handleNext}
                disabled={currentIndex === verbList.length - 1}
            >
                →
            </button>

            {finishVisible && (
                <button className="card-finish-btn" onClick={handleFinish}>
                    Finish
                </button>
            )}

            <div className="timer">
                {formatTime(secondsElapsed)}
            </div>

            {/* ✅ Modal with data checks */}
            {modalVisible && (
                <TestResultModal
                    visible={modalVisible}
                    onClose={handleClose}
                    result={result}
                />
            )}
        </div>
    );
};

export default IrregularVerbProgressTest;

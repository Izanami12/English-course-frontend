import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification, Spin } from "antd";
import IrregularVerbService from "../service/IrregularVerbService";
import TestResultModal from "./TestResultModal";
import './IrregularVerbProgressTest.css';

const IrregularVerbTest = () => {
    const location = useLocation();
    const { questionCount } = location.state || {}; // Get questionCount from navigation state
    const navigate = useNavigate();

    const [verbList, setVerbList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [previousAnswers, setPreviousAnswers] = useState([]); // Track previous answers
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [finishVisible, setFinishVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [result, setResult] = useState(null);

    // Refs for input fields
    const infinitiveRef = useRef(null);
    const pastSimpleRef = useRef(null);
    const pastParticipleRef = useRef(null);

    // ✅ Notification helper
    const openNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
        });
    };

    // Fetch test data when component mounts
    useEffect(() => {
        const fetchTestData = async () => {
            try {
                const response = await IrregularVerbService.createTest(questionCount);
                const traceId = response.headers['x-trace-id'];
                localStorage.setItem('traceId', traceId);
                const data = response.data.data;
                setVerbList(data);

                // Initialize answers and previousAnswers arrays
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

        if (questionCount) {
            fetchTestData();
        } else {
            setError("Question count is missing.");
            setLoading(false);
        }
    }, [questionCount]);

    // Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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
            putAnswer(verbList[currentIndex].translationRu); // Check answer before moving
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < verbList.length - 1) {
            putAnswer(verbList[currentIndex].translationRu); // Check answer before moving
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
        IrregularVerbService.checkAnswers(answers)
            .then(r => {
                if (r.data && r.data.data) {
                    setResult(r.data.data);
                    setModalVisible(true);
                } else {
                    notification.error({
                        message: "Error",
                        description: "Unexpected API response. Please try again.",
                    });
                }
            })
            .catch(error => {
                notification.error({
                    message: "Error",
                    description: "Failed to finish the test. Please try again later.",
                });
            });
    };

    const handleClose = () => {
        setModalVisible(false);
        navigate('/irregular-verbs-list'); // Navigate back to VerbList
    };

    // ✅ Keyboard shortcuts for navigation between questions
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
    }, [currentIndex, verbList]); // Reattach listener when currentIndex or verbList changes

    // ✅ Keyboard shortcuts for navigation between inputs
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault(); // Prevent default scroll behavior
                switch (document.activeElement) {
                    case infinitiveRef.current:
                        pastSimpleRef.current.focus();
                        break;
                    case pastSimpleRef.current:
                        pastParticipleRef.current.focus();
                        break;
                    default:
                        break;
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault(); // Prevent default scroll behavior
                switch (document.activeElement) {
                    case pastParticipleRef.current:
                        pastSimpleRef.current.focus();
                        break;
                    case pastSimpleRef.current:
                        infinitiveRef.current.focus();
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // No dependencies, as this listener is global

    // ✅ Focus on the infinitive input field after navigation
    useEffect(() => {
        if (infinitiveRef.current) {
            // Use setTimeout to ensure the cursor is set after the DOM updates
            setTimeout(() => {
                infinitiveRef.current.focus();
                const length = infinitiveRef.current.value.length;
                infinitiveRef.current.setSelectionRange(length, length);
            }, 0);
        }
    }, [currentIndex]); // Re-focus when currentIndex changes

    if (loading) return <Spin size="large" />;
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
                {new Date(secondsElapsed * 1000).toISOString().substr(11, 8)}
            </div>

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

export default IrregularVerbTest;
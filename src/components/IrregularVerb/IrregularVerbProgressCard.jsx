import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './irregularVerbProgressCard.css';
import IrregularVerbService from "../service/IrregularVerbService";

const IrregularVerbProgressCard = () => {

    const location = useLocation();

    const { progressId } = location.state || {};

    const [verbList, setVerbList] = useState([]);

    const [loading, setLoading] = useState(true);
    // State for error handling
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0); // Track the current verb index

    const navigate = useNavigate(); // For navigation

    // Handle navigation between verbs
    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (currentIndex < verbList.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const fetchProgressList = () => {
        IrregularVerbService.getProgress(progressId).then(r => {
            const response = r.data.data;
            setVerbList(response);
            console.log(verbList);
            setLoading(false);
        }).catch(error => {
            setError(error.message);
            setLoading(false);
        })
    }

    useEffect(() => {
        fetchProgressList();
    }, []);

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

    // Display a loading message or the data
    if (loading) {
        return <div>Loading...</div>;
    }

    // Handle error
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="card-container">
            {/* Back Button */}
            <div
                className="card-back-btn"
                onClick={() => navigate(-1)} // Go back to home page
            >
                ←
            </div>

            {/* Main Content */}
            <h1 className="card-title">{verbList[currentIndex].infinitive}</h1>
            <p className="card-translation">{verbList[currentIndex].translationRu}</p>
            <ul className="card-list">
                <li>
                    <strong>Past Simple:</strong> {verbList[currentIndex].pastSimple}
                </li>
                <li>
                    <strong>Past Participle:</strong> {verbList[currentIndex].pastParticiple}
                </li>
            </ul>

            {/* Left Arrow */}
            <button
                className="card-nav-btn left"
                onClick={handlePrev}
                disabled={currentIndex === 0}
            >
                ←
            </button>

            {/* Right Arrow */}
            <button
                className="card-nav-btn right"
                onClick={handleNext}
                disabled={currentIndex === verbList.length - 1}
            >
                →
            </button>
        </div>
    );
};

export default IrregularVerbProgressCard;
import React, { useEffect, useState } from 'react';
import IrregularVerbQuestion from './IrregularVerbQuestion';
import { notification } from 'antd';
import IrregularVerbService from '../service/IrregularVerbService';


const IrregularVerbTest = ({ testQuestions, handleFinishClick }) => {

    const [questions, setQuestions] = useState(testQuestions)

    const [index, setIndex] = useState(0);

    const initialAnswers = [...questions].map(q => {
        return {
            infinitive: null,
            pastSimple: null,
            pastParticiple: null,
            translationRu: q.translationRu
        }
    });

    const [answers, setAnswers] = useState(initialAnswers);

    const [api, contextHolder] = notification.useNotification();

    const openNotification = (type, translation, description) => {
        api[type]({
            message: `Result of check: ${translation}`,
            description: description,
            
        });
    };

    const putAnswer = (translationRu, infinitive, pastSimple, pastParticiple) => {

        let answersCopy = [...answers];
        let currentQuestion = answersCopy.find(
            a => a.translationRu === translationRu
        )
        if (currentQuestion.infinitive !== infinitive ||
            currentQuestion.pastSimple !== pastSimple ||
            currentQuestion.pastParticiple !== pastParticiple
        ) {
            currentQuestion.infinitive = infinitive
            currentQuestion.pastSimple = pastSimple
            currentQuestion.pastParticiple = pastParticiple
            setAnswers(answersCopy);
            IrregularVerbService.checkAnswer(currentQuestion)
                .then(function (response) {
                    let type = response.data.data ? 'success' : 'error';
                    let description = response.data.data ? 'You did well' : `Bezdar' ebanii`;
                    openNotification(type, translationRu, description)
                })
        }
    }

    



    const handleIncrement = () => {
        if (index < [...questions].length - 1) {
            setIndex(index + 1)
        }
    };

    const handleDecrement = () => {
        if (index > 0) {
            setIndex(index - 1)
        }
    };

    const handleFinishTestClick = () => {
        handleFinishClick(answers);
        setIndex(0);
    }

    useEffect(() => {
        setQuestions(testQuestions)
    }, [testQuestions]);


    return (

        <div>
            {contextHolder}
            <IrregularVerbQuestion ind={index} testQuestion={answers[index]} onIncrement={handleIncrement}
             onDecrement={handleDecrement} onNextOrPreviousClick={putAnswer} onFinishTestClick={handleFinishTestClick} />
        </div>

    );
};
export default IrregularVerbTest;
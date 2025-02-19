import React, { useContext, useEffect, useState } from 'react';
import { Button, Form, Input, Space, Tag } from 'antd';
import { QuestionCountContext } from './IrregularVerbsList';

const IrregularVerbQuestion = ({ testQuestion, onIncrement, onDecrement, ind, onNextOrPreviousClick, onFinishTestClick }) => {

    const [infinitive, setInfinitive] = useState(testQuestion.infinitive)

    const [pastSimple, setPastSimple] = useState(testQuestion.pastSimple)

    const [pastParticiple, setPastParticiple] = useState(testQuestion.pastParticiple)

    const [isVisible, setIsVisible] = useState(false);

    const [form] = Form.useForm();

    const questionCount = useContext(QuestionCountContext);

    const handleNextClick = () => {
        onIncrement();
        onNextOrPreviousClick(testQuestion.translationRu, infinitive, pastSimple, pastParticiple);

    }

    const handlePreviousClick = () => {
        onDecrement();
        onNextOrPreviousClick(testQuestion.translationRu, infinitive, pastSimple, pastParticiple);

    }

    const handleFinishTestClick = () => {
        onNextOrPreviousClick(testQuestion.translationRu, infinitive, pastSimple, pastParticiple);
        onFinishTestClick();
    }

    useEffect(() => {
        setInfinitive(testQuestion.infinitive)
        setPastSimple(testQuestion.pastSimple)
        setPastParticiple(testQuestion.pastParticiple)
        form.setFieldValue("infinitive", testQuestion.infinitive)
        form.setFieldValue("pastSimple", testQuestion.pastSimple)
        form.setFieldValue("pastParticiple", testQuestion.pastParticiple)
    }, [testQuestion]);

    useEffect(() => {
        if(ind + 1 == questionCount) {
            setIsVisible(true)
        }
    })

    return (
        <Form form={form} name="validateOnly" layout="vertical" autoComplete="off">
            <Form.Item>
                <Space size='large'>
                    <Tag>
                        {testQuestion.translationRu}
                    </Tag>
                    Question:
                    <Tag>{ind + 1}</Tag>
                    from:
                    <Tag>{questionCount}</Tag>
                </Space>
            </Form.Item>
            <Form.Item
                name="infinitive"
                label="Infinitive"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input value={testQuestion.infinitive} onChange={e => setInfinitive(e.target.value)} />
            </Form.Item>
            <Form.Item
                name="pastSimple"
                label="Past simple"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input value={testQuestion.pastSimple} onChange={e => setPastSimple(e.target.value)} />
            </Form.Item>
            <Form.Item
                name="pastParticiple"
                label="Past particiiple"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input value={testQuestion.pastParticiple} onChange={e => setPastParticiple(e.target.value)} />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button onClick={handlePreviousClick}>Previous</Button>
                    <Button onClick={handleNextClick}>Next</Button>
                    {isVisible &&
                        <Button onClick={handleFinishTestClick}>Finish test</Button>
                    }
                </Space>
            </Form.Item>
        </Form>
    );
};
export default IrregularVerbQuestion;
import { Button, Input, Menu, Modal, Spin } from 'antd';
import IrregularVerbCard from './IrregularVerbCard';
import { createContext, useEffect, useState } from 'react';
import IrregularVerbTest from './IrregularVerbTest';
import IrregularVerbService from '../service/IrregularVerbService';
import IrregularVerbTestResult from './IrregularVerbTestResult';


function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}
const QuestionCountContext = createContext(null)

export { QuestionCountContext }

const IrregularVerbsList = () => {

    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isFullScreen, setIsFullScreen] = useState(false);

    const [isResultModalOpen, setIsResultModalOpen] = useState(false)

    const [infinitive, setInfinitive] = useState("arise")

    const [verbs, setVerbs] = useState([])

    const [verbData, setVerbData] = useState(null)

    const [questionCount, setQuestionCount] = useState(20)

    const [testQuestions, setTestQuestions] = useState([])

    const [testResult, setTestResult] = useState([])

    const onFinishTestClick = (data) => {

        IrregularVerbService.checkAnswers(data).then(r => {
            const response = r.data.data
            console.log(response)
            setTestResult([])
            setTestResult(response)
            setIsModalOpen(false)
            setIsResultModalOpen(true)
        })
    }

    const fetchVerbs = () => {
        IrregularVerbService.getIrregularVerbList().then(r => {
            const verbsResponse = r.data.data
            const menuItems = [
                getItem('Список неправильных глаголов', 'g1', null, verbsResponse.map(c => {
                    return { label: c.infinitive, key: c.infinitive }
                }), 'group'
                )
            ]
            setVerbs(menuItems)
        })
    }


    const fetchVerb = () => {
        IrregularVerbService.getIrregularVerb(infinitive).then(r => {
            setVerbData(r.data.data)
        })
    }

    const onClick = (e) => {
        setInfinitive(e.key)
    };

    const showModal = () => {
        IrregularVerbService.createTest(questionCount).then(r => {
            const traceId = r.headers['x-trace-id'];
            localStorage.setItem('traceId', traceId)
            setTestQuestions([])
            setTestQuestions(r.data.data)
            setIsModalOpen(!isModalOpen);

        })

    };

    const onTestOk = () => {
        setIsResultModalOpen(false)
    };

    const onTestCancel = () => {
        setIsResultModalOpen(false)
    };

    const toggleFullScreen = () => {
        setIsFullScreen((prev) => !prev);
    };

    useEffect(() => {
        fetchVerbs()
    }, []);

    useEffect(() => {
        setVerbData(null)
        fetchVerb()
    }, [infinitive]);

    return (

        <div className="flex">
            <div>
                <Menu
                    onClick={onClick}
                    style={{
                        width: 256,
                    }}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={verbs}
                    className="h-screen overflow-scroll"
                />
            </div>
            <div className='h-screen flex flex-col w-screen'>
                <div className='h-1/6 flex flex-col items-center justify-center'>
                    <p>Enter count of questions:</p>
                    <Input value={questionCount} type='number' onChange={e => setQuestionCount(e.target.value)} className='flex w-1/6' placeholder='20' />
                    <Button className='flex w-1/6' type='primary' onClick={showModal}>Pass test</Button>
                    <QuestionCountContext.Provider value={questionCount}>
                        <Modal title="Nice cock" maskClosable={false} closable={false} open={isModalOpen} footer={null} destroyOnClose={true}>
                            <IrregularVerbTest testQuestions={testQuestions} handleFinishClick={onFinishTestClick}></IrregularVerbTest>
                        </Modal>
                        <Modal width={screen} centered={!isFullScreen} open={isResultModalOpen} closable={false}
                            style={{
                                top: isFullScreen ? 0 : 20,
                                left: isFullScreen ? 0 : 'auto',
                                right: isFullScreen ? 0 : 'auto',
                                margin: isFullScreen ? 0 : '20px',
                                padding: 0,
                                width: isFullScreen ? '100vw' : '600px',
                                height: isFullScreen ? '100vh' : 'auto',
                                maxWidth: isFullScreen ? '100vw' : '600px',
                            }}
                            onOk={onTestOk} onCancel={onTestCancel} destroyOnClose={true}>
                            <div
                                style={{
                                    width: '100%',
                                    height: isFullScreen ? 'calc(100vh - 55px)' : 'auto',
                                    overflowY: isFullScreen ? 'auto' : 'visible',
                                    padding: '20px',
                                }}
                            >
                                <Button onClick={toggleFullScreen} style={{ marginBottom: 10 }}>
                                    {isFullScreen ? 'Exit Full Screen' : 'Expand to Full Screen'}
                                </Button>
                                <IrregularVerbTestResult result={testResult}></IrregularVerbTestResult>
                            </div>
                        </Modal>
                    </QuestionCountContext.Provider>
                </div>
                <div className='flex-1 text-center'>
                    {verbData ? <IrregularVerbCard verb={verbData} /> : <Spin size='large' />}
                </div>
            </div>
        </div>
    );
};

export default IrregularVerbsList;

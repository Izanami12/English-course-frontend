import { Input, Menu, Spin, Button } from 'antd';
import IrregularVerbCard from './IrregularVerbCard';
import { useEffect, useState } from 'react';
import IrregularVerbService from '../service/IrregularVerbService';
import { useNavigate } from 'react-router-dom';

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

const IrregularVerbList = () => {
    const [verbs, setVerbs] = useState([]);
    const [selectedVerb, setSelectedVerb] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verbList, setVerbList] = useState([]); // Store the full list of verbs
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [questionCount, setQuestionCount] = useState(20);

    const navigate = useNavigate();

    // Fetch the list of verbs on component mount
    const fetchVerbs = () => {
        setLoading(true);
        IrregularVerbService.getIrregularVerbList().then(r => {
            const verbsResponse = r.data.data;
            const menuItems = [
                getItem('Список неправильных глаголов', 'g1', null, verbsResponse.map(c => {
                    return { label: c.infinitive, key: c.infinitive };
                }), 'group')
            ];
            setVerbs(menuItems);
            setVerbList(verbsResponse); // Store the full list of verbs
            setLoading(false);

            // Automatically select the first verb
            if (verbsResponse.length > 0) {
                setSelectedVerb(verbsResponse[0]); // Set the first verb as selected
                setSelectedIndex(0);
            }
        });
    };

    // Handle menu item clicks
    const onMenuClick = (e) => {
        const index = verbList.findIndex(verb => verb.infinitive === e.key);
        if (index !== -1) {
            setSelectedIndex(index);
            setSelectedVerb(verbList[index]); // Set the selected verb from the stored list
        }
    };

    // Handle keyboard shortcuts for navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent default scroll behavior
            let newIndex;
            if (e.key === 'ArrowDown') {
                // Move to the next verb
                newIndex = (selectedIndex + 1) % verbList.length;
            } else if (e.key === 'ArrowUp') {
                // Move to the previous verb
                newIndex = (selectedIndex - 1 + verbList.length) % verbList.length;
            }
            setSelectedIndex(newIndex);
            setSelectedVerb(verbList[newIndex]); // Set the selected verb from the stored list
        }
    };

    // Add keyboard event listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIndex, verbList]); // Reattach listener when selectedIndex or verbList changes

    // Fetch verbs on mount
    useEffect(() => {
        fetchVerbs();
    }, []);

    // Navigate to the test component
    const createTest = () => {
        navigate('/irregular-verbs-test', { state: { questionCount } });
    };

    return (
        <div className="flex">
            <div>
                <Menu
                    onClick={onMenuClick}
                    style={{ width: 256 }}
                    selectedKeys={[verbList[selectedIndex]?.infinitive]} // Visually select the current verb
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={verbs}
                    className="h-screen overflow-scroll"
                />
            </div>
            <div className='h-screen flex flex-col w-screen'>
                <div className='h-1/6 flex flex-col items-center justify-center'>
                    <p>Enter count of questions:</p>
                    <Input
                        value={questionCount}
                        type='number'
                        onChange={(e) => setQuestionCount(e.target.value)}
                        className='flex w-1/6'
                        placeholder='20'
                    />
                    <Button className='flex w-1/6' type='primary' onClick={createTest}>
                        Create Test
                    </Button>
                </div>
                <div className='flex-1 text-center'>
                    {loading ? <Spin size='large' /> : selectedVerb && <IrregularVerbCard verb={selectedVerb} />}
                </div>
            </div>
        </div>
    );
};

export default IrregularVerbList;
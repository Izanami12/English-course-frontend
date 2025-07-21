import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes } from "react-router-dom";
import Home from './components/home/Home';
import Footer from './components/Navbar/Footer';
import IrregularVerbList from './components/IrregularVerb/IrregularVerbList';
import IrregularVerbProgressCard from './components/IrregularVerb/IrregularVerbProgressCard';
import IrregularVerbProgressTest from './components/IrregularVerb/IrregularVerbProgressTest';
import IrregularVerbProgressHistory from './components/IrregularVerb/IrregularVerbProgressHistory';
import "antd/dist/reset.css";
import loadingGif from './assets/images/Wheelchair_work_0.2.gif';
import TagsCloudComponent from './components/home/TagsCloudComponent';
import IrregularVerbProgressList from './components/IrregularVerb/IrregularVerbProgressList';
import IrregularVerbTest from './components/IrregularVerb/IrregularVerbTest';
import Vocabulary from './components/vocabulary/Vocabulary';
import VocabularyLearningCard from './components/vocabulary/VocabularyLearningCard';
import Input from './components/vocabulary/Input';
import UserInfo from './components/user/UserInfo';

/* 
TODO
1. fix refresh page issue somehow +
2. fix my perfect gradient in bar +
3. when test finished and you close modal should navigate back to progress list +- (didnt add another close button to modal)
4. hotkeys next question enter add pointer to first input left right arrow next/previous navigation +
5. add loading spin while you are waiting data from back
6. create normal header

new fixes
1. fix footer and header. footer should be anchored to bottom.+
2. fix inputs +
3. show verbs add hotkeys +
4. change modal in irregular verbs test
*/

const App = () => {
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
          token: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
        });
        if (authenticated) {
          console.log('Authenticated');
          localStorage.setItem('accessToken', keycloak.token);
          localStorage.setItem('refreshToken', keycloak.refreshToken);
        } else {
          console.warn('Not authenticated');
          keycloak.login();
        }
        setKeycloakInitialized(true); // Set as initialized after success
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
      }
    };
    initKeycloak();
  }, []);

  // Show loading until Keycloak is initialized
  if (!keycloakInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <img src={loadingGif} alt="Loading..." style={{ width: '150px', height: '150px' }} />
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#555' }}>Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="App flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/irregular-verbs" element={<IrregularVerbList />} />
          <Route path="/irregular-verbs-test" element={<IrregularVerbTest />} />
          <Route path="/irregular-verbs-progress" element={<IrregularVerbProgressList />} />
          <Route path="/irregular-verbs-progress-card" element={<IrregularVerbProgressCard />} />
          <Route path="/irregular-verbs-progress-test" element={<IrregularVerbProgressTest />} />
          <Route path="/irregular-verbs-progress-history" element={<IrregularVerbProgressHistory />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/vocabulary/learn" element={<VocabularyLearningCard />} />
          <Route path="/vocabulary/input/:id" element={<Input />} />
          <Route path="/user-info" element={<UserInfo />} />
        </Routes>
      </div>
      <Footer />
    </div>

  )
};

export default App;

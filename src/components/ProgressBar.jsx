import React, { useEffect, useState } from "react";
import './ProgressBar.css'; // Import the CSS for styling
import { notifications } from "./ResultNotification";


const ProgressBar = ({ progress }) => {

    const [text, setText] = useState(null);

    const setCustomText = () => {
        for (let i = 0; i < notifications.length; i++) {
          if (progress >= notifications[i].minLimit && progress < notifications[i].maxLimit) {
            setText(notifications[i].text);
          }
        }
      }

    useEffect(() => {
        setCustomText();
    })

    useEffect(() => {
        setCustomText();
    },[text])


    return (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
                <span className="progress-text">{text}, your score is {progress}%</span>
            </div>
        </div>
    );
};

export default ProgressBar;
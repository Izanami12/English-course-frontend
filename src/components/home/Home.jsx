import React, { useState, useRef, useEffect } from "react";
import TagsCloudComponent from "./TagsCloudComponent";
import VerbsCloud from "./VerbsCloud";
import "./Home.css";

const Home = () => {
    const [showTagsCloud, setShowTagsCloud] = useState(true);
    const [buttonBackground, setButtonBackground] = useState("inherit");
    const tagsCloudRef = useRef(null);
    const verbsCloudRef = useRef(null);

    const toggleComponent = () => {
        setShowTagsCloud((prev) => !prev);
    };

    // Update button background color based on the current component
    useEffect(() => {
        const currentComponent = showTagsCloud ? tagsCloudRef.current : verbsCloudRef.current;
        if (currentComponent) {
            const backgroundColor = window.getComputedStyle(currentComponent).backgroundColor;
            setButtonBackground(backgroundColor);
        }
    }, [showTagsCloud]);

    return (
        <div>
            {/* Fixed Toggle Button */}
            <button
                className="fixed-toggle-button"
                onClick={toggleComponent}
                style={{ backgroundColor: buttonBackground }}
            >
                {showTagsCloud ? "Switch to Verbs Cloud" : "Switch to Tags Cloud"}
            </button>

            {/* Conditional rendering of components */}
            <div ref={tagsCloudRef} style={{ display: showTagsCloud ? "block" : "none" }}>
                <TagsCloudComponent />
            </div>
            <div ref={verbsCloudRef} style={{ display: !showTagsCloud ? "block" : "none" }}>
                <VerbsCloud />
            </div>
        </div>
    );
};

export default Home;
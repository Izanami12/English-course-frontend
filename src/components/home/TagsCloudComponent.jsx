import React, { useEffect, useRef, useState } from 'react';
import './TagsCloud.css'; // Assuming you have a CSS file for styling
import IrregularVerbService from '../service/IrregularVerbService';

const FibonacciSphere = (N) => {
    const points = [];

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const radius = Math.sqrt(1 - y ** 2);
        const a = goldenAngle * i;
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;

        points.push([x, y, z]);
    }

    return points;
};

const TagsCloudComponent = () => {
    const tagsCloudRef = useRef(null);
    const [tags, setTags] = useState([]); // State to store the fetched tags
    const rotationAngle = useRef(0);
    const frameRequestId = useRef(null);

    // Fetch the irregular verb list from the backend
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await IrregularVerbService.getIrregularVerbList();
                const verbs = response.data.data.map(item => item.infinitive); // Map to `item.infinitive`
                const maxElements = 100; // Set the maximum number of elements
                setTags(verbs.slice(0, maxElements)); // Update the state with the first 100 tags
            } catch (error) {
                console.error('Failed to fetch irregular verbs:', error);
            }
        };

        fetchTags();
    }, []); // Empty dependency array ensures this runs only once on mount

    const updatePositions = () => {
        if (!tagsCloudRef.current) return; // Ensure the ref is available

        const rotationSpeed = 0.005; // Constant rotation speed
        rotationAngle.current += rotationSpeed;

        const sin = Math.sin(rotationAngle.current);
        const cos = Math.cos(rotationAngle.current);
        const ux = 1; // Fixed rotation axis (x-axis)
        const uy = 0; // Fixed rotation axis (y-axis)
        const uz = 0; // Fixed rotation axis (z-axis)

        const rotationMatrix = [
            [
                cos + (ux ** 2) * (1 - cos),
                ux * uy * (1 - cos) - uz * sin,
                ux * uz * (1 - cos) + uy * sin,
            ],
            [
                uy * ux * (1 - cos) + uz * sin,
                cos + (uy ** 2) * (1 - cos),
                uy * uz * (1 - cos) - ux * sin,
            ],
            [
                uz * ux * (1 - cos) - uy * sin,
                uz * uy * (1 - cos) + ux * sin,
                cos + (uz ** 2) * (1 - cos)
            ]
        ];

        const spherePoints = FibonacciSphere(tags.length);

        tags.forEach((_, i) => {
            const x = spherePoints[i][0];
            const y = spherePoints[i][1];
            const z = spherePoints[i][2];

            const transformedX =
                  rotationMatrix[0][0] * x
                + rotationMatrix[0][1] * y
                + rotationMatrix[0][2] * z;
            const transformedY =
                  rotationMatrix[1][0] * x
                + rotationMatrix[1][1] * y
                + rotationMatrix[1][2] * z;
            const transformedZ =
                  rotationMatrix[2][0] * x
                + rotationMatrix[2][1] * y
                + rotationMatrix[2][2] * z;

            const translateX = tagsCloudRef.current.offsetWidth * transformedX / 2;
            const translateY = tagsCloudRef.current.offsetWidth * transformedY / 2;
            const scale = (transformedZ + 2) / 3;
            const transform =
                  `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;
            const opacity = (transformedZ + 1.5) / 2.5;

            const tagElement = tagsCloudRef.current.children[i];
            if (tagElement) {
                tagElement.style.transform = transform;
                tagElement.style.opacity = opacity;
            }
        });
    };

    const update = () => {
        updatePositions();
        frameRequestId.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        if (tags.length > 0) { // Only start the animation if tags are loaded
            const cloudElement = tagsCloudRef.current;
            cloudElement.classList.add('-loaded');

            updatePositions();
            update();

            return () => {
                cancelAnimationFrame(frameRequestId.current);
            };
        }
    }, [tags]); // Run this effect when `tags` changes

    return (
        <div className="tags-cloud-container">
            <ul className='tags-cloud' ref={tagsCloudRef}>
                {tags.map((tag, index) => (
                    <li key={index} className='tag'>
                        <span className='wrap'>{tag}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TagsCloudComponent;
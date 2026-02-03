import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Spin, message as antdMessage } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client"; 
import { useNavigate } from "react-router-dom";
import "./VocabularyLearningCard.css";
import keycloak from "../../keycloak";

const SOCKET_URL = "http://localhost:8080/ws-memorization";

const baseTagGroups = {
  partOfSpeech: ['adj', 'adverb', 'idiom', 'noun', 'phrasal verb', 'phrase', 'preposition', 'verb', 'conjunction', 'determiner', 'interjection', 'numeral', 'participle', 'pronoun'],
  priority: ['high-priority', 'low-priority', 'mid-priority', 'top-priority', 'vital', 'zero-priority']
};

const tagStyles = {
  partOfSpeech: {
    background: "#e6f7ff",
    color: "#1890ff",
    border: "1px solid #91d5ff"
  },
  priority: {
    background: "#e6ffe6",
    color: "#389e3c",
    border: "1px solid #b7eb8f"
  },
  default: {
    background: "#f5f5f5",
    color: "#666",
    border: "1px solid #d9d9d9"
  }
};

const VocabularyLearningCard = () => {
  const [input, setInput] = useState(null);
  const [prev, setPrev] = useState(null); // store previous word for answer animation
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [flipped, setFlipped] = useState(true); // true = show back (word only), false = show front (full info)
  const [animating, setAnimating] = useState(false);
  const stompClient = useRef(null);
  const inputRef = useRef(null); // Keep ref to current input to use in closures
  const navigate = useNavigate();

  const FLIP_DURATION = 1800; // ms, should match CSS transition duration (600ms * 3)
  const animatingRef = useRef(false);
  const answeringRef = useRef(false);
  const animationTimersRef = useRef({ mid: null, end: null });
  const [waitingNext, setWaitingNext] = useState(false);

  // Update inputRef whenever input changes
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const setAnimatingState = (value) => {
    animatingRef.current = value;
    setAnimating(value);
  };

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await keycloak.updateToken(30);
        const socket = new SockJS(`${SOCKET_URL}?access_token=${keycloak.token}`);
        stompClient.current = Stomp.over(socket);

        // Включение отладки
        stompClient.current.debug = (str) => console.log('STOMP:', str);

        console.log("Opening Web Socket...");

        stompClient.current.connect(
          {},
          () => {
            console.log("Web Socket connected successfully");
            setConnectionError(false);

            // Подписка на начало сессии
            stompClient.current.subscribe("/app/start-session", (message) => {
              try {
                const body = JSON.parse(message.body);
                console.log("Received initial data:", body);
                setInput(body);
                setPrev(null); // no previous on initial load
                setFlipped(true); // start with back (word only)
                setAnimatingState(false);
                setLoading(false);
              } catch (error) {
                console.error("Error parsing initial data:", error);
                antdMessage.error("Failed to parse initial data");
                setLoading(false);
                setAnimatingState(false);
              }
            });

            // Подписка на следующие слова
            stompClient.current.subscribe("/user/queue/next-input", (message) => {
              try {
                const body = JSON.parse(message.body);
                console.log("Received next word:", body);
                console.log("answeringRef.current:", answeringRef.current, "inputRef.current:", inputRef.current);

                // Clear any pending timers
                if (animationTimersRef.current.mid) {
                  clearTimeout(animationTimersRef.current.mid);
                  animationTimersRef.current.mid = null;
                }
                if (animationTimersRef.current.end) {
                  clearTimeout(animationTimersRef.current.end);
                  animationTimersRef.current.end = null;
                }

                // If we're waiting for the next word after an answer, start the answer animation
                if (answeringRef.current && inputRef.current) {
                  console.log("Starting answer animation - prev is already set in handleAnswer");
                  
                  // Start answer animation: 90° + swap + 90°
                  // prev is already set to current word from handleAnswer
                  // First 90°: shows prev (translation side of current word)
                  setAnimatingState(true);
                  const FLIP_HALF = FLIP_DURATION / 2;
                  
                  // At midpoint: swap to next input and flip to true to show next back
                  animationTimersRef.current.mid = setTimeout(() => {
                    console.log("Midpoint: swapping to next word:", body);
                    setInput(body);
                    inputRef.current = body; // Also update ref immediately for next check
                    setFlipped(true); // show back of next (word only)
                    
                    // Second half: rotate remaining 90° to show next back fully
                    animationTimersRef.current.end = setTimeout(() => {
                      console.log("Animation complete, resetting ALL state");
                      setAnimatingState(false);
                      setPrev(null); // Clear prev after animation
                      answeringRef.current = false;
                      setWaitingNext(false);
                      animationTimersRef.current.mid = null;
                      animationTimersRef.current.end = null;
                      console.log("State reset complete - card should now be clickable");
                    }, FLIP_HALF);
                  }, FLIP_HALF);
                } else {
                  // Normal case: no answer in progress, just update
                  console.log("Normal update (no answer in progress)");
                  setInput(body);
                  inputRef.current = body; // Update ref too
                  setPrev(null); // No prev for normal updates
                  setFlipped(true); // always start with back (word only)
                  setAnimatingState(false);
                }
              } catch (error) {
                console.error("Error parsing next word:", error);
                antdMessage.error("Failed to parse next word");
                setLoading(false);
                setAnimatingState(false);
              }
            });

            // Запрашиваем начало сессии явно
            stompClient.current.send("/app/start-session", {}, JSON.stringify({}));
          },
          (error) => {
            console.error("Web Socket connection error:", error);
            setConnectionError(true);
            setLoading(false);
            antdMessage.error("Connection failed. Please try again.");
          }
        );
      } catch (error) {
        console.error("Keycloak token update or connection error:", error);
        setConnectionError(true);
        setLoading(false);
        antdMessage.error("Authentication error. Please login again.");
      }
    };

    connectWebSocket();

    return () => {
      // Clear any pending animation timers
      if (animationTimersRef.current.mid) {
        clearTimeout(animationTimersRef.current.mid);
      }
      if (animationTimersRef.current.end) {
        clearTimeout(animationTimersRef.current.end);
      }
      
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect();
        console.log("Web Socket disconnected");
      }
    };
  }, []);





  const handleAnswer = (isCorrect) => {
    if (!input || !input.id) {
      antdMessage.warning("No active word to answer");
      return;
    }

    console.log("Answer pressed for word ID:", input.id, "Correct:", isCorrect);
    console.log("Setting prev to current word:", input);

    // Save current word as prev IMMEDIATELY - this will show on card back during animation
    setPrev(input);
    
    // Mark that we're waiting for server response
    answeringRef.current = true;
    setWaitingNext(true);
    
    // Set flipped to true so animation shows back side (with prev) in first 90°
    setFlipped(true);

    try {
      stompClient.current.send(
        "/app/submit-answer",
        {},
        JSON.stringify({
          inputId: input.id,
          isCorrect,
        })
      );
      // Animation will start when server response arrives with next word
    } catch (error) {
      console.error("Error submitting answer:", error);
      antdMessage.error("Failed to submit answer");
      answeringRef.current = false;
      setWaitingNext(false);
    }
  }; 

  if (connectionError) {
    return (
      <div className="vocab-container">
        <Button onClick={() => navigate(-1)} className="absolute top-4 left-4">
          ← Back
        </Button>
        <Card style={{ maxWidth: 500, margin: "32px auto" }}>
          <h2>Connection Error</h2>
          <p>Failed to connect to the server. Please try again later.</p>
          <Button type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (loading || !input) {
    return (
      <div className="vocab-container">
        <Spin style={{ marginTop: "20vh" }} tip="Loading word..." />
      </div>
    );
  }

  return (
    <div className="vocab-container" style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "start", width: "100%", margin: "32px 0 24px 0" }}>
        <div>
          <Button onClick={() => navigate(-1)} style={{ minWidth: 80 }}>
            ← Back
          </Button>
        </div>
      </div> 

      <div style={{ maxWidth: 500, margin: "32px auto" }}>
        <div
          className={`vocab-card ${flipped ? "flipped" : ""} ${animating ? "animating" : ""}`}
          style={{ transitionDuration: `${animating ? FLIP_DURATION / 2 : FLIP_DURATION}ms` }}
          onClick={() => {
            console.log("Card clicked - loading:", loading, "animating:", animating, "waitingNext:", waitingNext);
            if (loading || animating || waitingNext) {
              console.log("Card click blocked by condition");
              return;
            }
            console.log("Card flip allowed, flipping now");
            setFlipped((s) => !s);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !loading && !animating && !waitingNext) {
              e.preventDefault();
              setFlipped((s) => !s);
            }
          }}
        >
          {/* Front: shows full info (word, translation, tags, examples) - this is the "front" the user sees */}
          <div className="vocab-card-front">
            <div
              onClick={(e) => {
                // prevent outer flip when clicking elements on the front
                e.stopPropagation();
              }}
            >
              {/* Header: always visible (word, translation, tags) */}
              <div className="back-header">
                <div className="back-word" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: 700 }}>{prev ? prev.input : input.input}</div>
                </div>

                <div className="back-meta" style={{ marginTop: 8 }}>
                  <div style={{ margin: "6px 0" }} className="back-translation">
                    <b>Translation:</b> {(prev ? prev.translate : input.translate)}
                  </div>
                  <div style={{ margin: "6px 0" }} className="tags-wrapper">
                    {(prev ? prev.tags : input.tags)?.length > 0 ? (
                      (prev ? prev.tags : input.tags).map((tagObj) => {
                        const tag = tagObj.tag;
                        const isPartOfSpeech = baseTagGroups.partOfSpeech.includes(tag);
                        const isPriority = baseTagGroups.priority.includes(tag);
                        const style = isPartOfSpeech ? tagStyles.partOfSpeech : isPriority ? tagStyles.priority : tagStyles.default;
                        return (
                          <span
                            key={tagObj.tag}
                            style={{
                              ...style,
                              borderRadius: 8,
                              padding: "2px 12px",
                              marginRight: 8,
                              fontWeight: 500,
                              fontSize: "1.1rem",
                              display: "inline-block",
                            }}
                          >
                            {tagObj.tag}
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ color: "#888" }}>No tags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body: examples scroll here if needed */}
              <div className="back-body">
                <div style={{ margin: "12px 0", textAlign: "left" }}>
                  <b>Examples:</b>
                  <ul>
                    {(prev ? prev.examples : input.examples)?.filter(Boolean).length > 0 ? (
                      (prev ? prev.examples : input.examples).filter(Boolean).map((ex, idx) => <li key={idx}>{ex}</li>)
                    ) : (
                      <li style={{ color: "#888" }}>No examples</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="vocab-buttons" style={{ pointerEvents: (loading || waitingNext) ? "none" : "auto" }}>
                <Button
                  size="large"
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(false);
                  }}
                  loading={loading || waitingNext}
                  aria-label="Incorrect"
                >
                  <CloseOutlined style={{ fontSize: 20 }} />
                </Button>
                <Button
                  size="large"
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(true);
                  }}
                  loading={loading || waitingNext}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                  aria-label="Correct"
                >
                  <CheckOutlined style={{ fontSize: 20, color: "#fff" }} />
                </Button>
              </div>
            </div>
          </div>

          {/* Back: shows only the word name - hidden initially */}
          <div className="vocab-card-back">
            <div className="vocab-word">{input.input}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyLearningCard;
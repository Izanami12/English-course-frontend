import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Spin, message as antdMessage } from "antd";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom";
import "./VocabularyLearningCard.css";
import keycloak from "../../keycloak";
import VocabularyService from "../service/VocabularyService";

const SOCKET_URL = "http://localhost:8080/ws-memorization";

const VocabularyLearningCard = () => {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [algorithm, setAlgorithm] = useState({ name: "", description: "" });
  const [availableAlgorithms, setAvailableAlgorithms] = useState([]); // исправлено: теперь массив
  const stompClient = useRef(null);
  const navigate = useNavigate();

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
                setLoading(false);
              } catch (error) {
                console.error("Error parsing initial data:", error);
                antdMessage.error("Failed to parse initial data");
                setLoading(false);
              }
            });

            // Подписка на следующие слова
            stompClient.current.subscribe("/user/queue/next-input", (message) => {
              try {
                const body = JSON.parse(message.body);
                console.log("Received next word:", body);
                setInput(body);
                setLoading(false);
              } catch (error) {
                console.error("Error parsing next word:", error);
                antdMessage.error("Failed to parse next word");
                setLoading(false);
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
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect();
        console.log("Web Socket disconnected");
      }
    };
  }, []);

  useEffect(() => {
    const fetchAlgorithm = async () => {
      try {
        const res = await VocabularyService.getAlgorithmInfo();
        setAlgorithm(res.data.data.currentAlgorithm);
        setAvailableAlgorithms(res.data.data.availableAlgorithms || []);
      } catch (e) {}
    };
    fetchAlgorithm();
  }, []);

  const handleAlgorithmChange = async (name) => {
    setLoading(true);
    try {
      const res = await VocabularyService.setAlgorithm(name);
      setAlgorithm(res.data.data.currentAlgorithm);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect) => {
    if (!input || !input.id) {
      antdMessage.warning("No active word to answer");
      return;
    }

    setLoading(true);
    console.log("Submitting answer for word ID:", input.id, "Correct:", isCorrect);

    try {
      stompClient.current.send(
        "/app/submit-answer",
        {},
        JSON.stringify({
          inputId: input.id,
          isCorrect,
        })
      );
    } catch (error) {
      console.error("Error submitting answer:", error);
      antdMessage.error("Failed to submit answer");
      setLoading(false);
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          width: "100%",
          margin: "32px 0 24px 0",
        }}
      >
        <div style={{ justifySelf: "start" }}>
          <Button onClick={() => navigate(-1)} style={{ minWidth: 80 }}>
            ← Back
          </Button>
        </div>
        <div style={{ justifySelf: "center" }}>
          {availableAlgorithms.length > 0 && (
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {availableAlgorithms.map((algo) => (
                <Button
                  key={algo.name}
                  type={algo.name === algorithm.name ? "primary" : "default"}
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    padding: "0 18px",
                    height: 40,
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleAlgorithmChange(algo.name)}
                  disabled={algo.name === algorithm.name}
                  title={algo.description}
                >
                  {algo.name}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div /> {/* пустая колонка для симметрии */}
      </div>

      <Card style={{ maxWidth: 500, margin: "32px auto" }}>
        <h2 style={{ fontSize: "2rem" }}>{input.input}</h2>
        <div style={{ margin: "16px 0" }}>
          <b>Translation:</b> {input.translate}
        </div>
        <div style={{ margin: "16px 0" }}>
          <b>Examples:</b>
          <ul>
            {input.examples?.filter(Boolean).length > 0 ? (
              input.examples.filter(Boolean).map((ex, idx) => <li key={idx}>{ex}</li>)
            ) : (
              <li style={{ color: "#888" }}>No examples</li>
            )}
          </ul>
        </div>
        <div style={{ margin: "16px 0" }}>
          <b>Tags:</b>{" "}
          {input.tags?.length > 0 ? (
            input.tags.map((tagObj) => (
              <span
                key={tagObj.tag}
                style={{
                  background: "#e6ffe6",
                  color: "#389e3c",
                  borderRadius: 8,
                  padding: "2px 12px",
                  marginRight: 8,
                  fontWeight: 500,
                  fontSize: "1.1rem",
                  border: "1px solid #b7eb8f",
                  display: "inline-block",
                }}
              >
                {tagObj.tag}
              </span>
            ))
          ) : (
            <span style={{ color: "#888" }}>No tags</span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <Button
            size="large"
            type="primary"
            danger
            onClick={() => handleAnswer(false)}
            loading={loading}
          >
            No
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => handleAnswer(true)}
            loading={loading}
          >
            Yes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VocabularyLearningCard;
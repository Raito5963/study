"use client";
import { useState, useEffect, useRef } from "react";
import { Paper, Button, Box, Container, Typography, TextField, Link, List, ListItem, ListItemText } from "@mui/material";
import { db } from "../firebase-config"; // Firebaseの初期化ファイル
import { collection, addDoc, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";

interface Message {
  username: string;
  text: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null); // チャット履歴の末尾にスクロールするための参照

  // チャットメッセージの取得
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        newMessages.push(doc.data() as Message);
      });
      setMessages(newMessages);
    });

    return () => unsubscribe(); // コンポーネントがアンマウントされたときにリスナーを解除
  }, []);

  // メッセージ送信
  const sendMessage = async () => {
    if (username && text) {
      await addDoc(collection(db, "chats"), {
        username,
        text,
        timestamp: new Date(),
      });
      setText(""); // 送信後にテキストボックスをクリア
    }
  };

  // Enterキーで送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // チャット履歴が更新されるたびに自動でスクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Container>
      <Box sx={{ m: 5 }}></Box>
        <Typography textAlign="center" fontSize={100} variant="h2" sx={{ color: "secondary.main", fontWeight: "bold" }}>
          Study GO
        </Typography>

        {/* 元々のボタン */}
        <Box sx={{ m: 5, p: 5 }} display="flex" justifyContent="center">
          <Link href="/exercize">
            <Button variant="contained" color="primary" sx={{ height: 100, width: 100, mr: 5 }}>
              Exersize
            </Button>
          </Link>
          <Link href="/management">
            <Button variant="contained" color="success" sx={{ height: 100, width: 100, ml: 5 }}>
              Create
            </Button>
          </Link>
        </Box>

        {/* チャット履歴 */}
        <Paper sx={{ m: 5, p: 5 }}>
          <Typography variant="h4">掲示板</Typography>
          <Box sx={{ m: 5, p: 5, maxHeight: 200, overflowY: 'auto' }}>
            <List>
              {messages.map((msg, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={<strong>{msg.username}:</strong>}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {msg.text}
                        </Typography>
                        <br />
                        <small>{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</small>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {/* チャット履歴の末尾にスクロール */}
            <div ref={messagesEndRef} />
          </Box>
        </Paper>

        {/* チャット入力フォーム */}
        <Box sx={{ m: 5, p: 5 }}>
          <Typography variant="h6">コメント</Typography>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mr: 2, mb: 2 }}
            fullWidth
          />
          <TextField
            label="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ mr: 2, mb: 2 }}
            fullWidth
            multiline
            rows={4}
          />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            送信
          </Button>
        </Box>
    </Container>
  );
}

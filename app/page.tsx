"use client";
import { useState, useEffect, useRef } from "react";
import { Paper, Button, Box, Container, Typography, TextField, Link, List, ListItem, ListItemText } from "@mui/material";
import { db } from "../firebase-config";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useTheme } from "@mui/material/styles";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        newMessages.push(doc.data() as Message);
      });
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (username && text) {
      await addDoc(collection(db, "chats"), {
        username,
        text,
        timestamp: new Date(),
      });
      setText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        textAlign="center"
        variant="h2"
        sx={{
          color: "secondary.main",
          fontWeight: "bold",
          fontSize: { xs: "2rem", sm: "4rem", md: "6rem" },
        }}
      >
        Study GO
      </Typography>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center", my: 4 }}>
        <Link href="/exercize" sx={{ textDecoration: "none", width: { xs: "100%", sm: "auto" } }}>
          <Button variant="contained" color="primary" sx={{ width: "100%", height: 60 }}>
            Exercize
          </Button>
        </Link>
        <Link href="/management" sx={{ textDecoration: "none", width: { xs: "100%", sm: "auto" } }}>
          <Button variant="contained" color="success" sx={{ width: "100%", height: 60 }}>
            Create
          </Button>
        </Link>
      </Box>

      <Paper sx={{ p: 3, my: 2 }}>
        <Typography variant="h5">掲示板</Typography>
        <Box sx={{ maxHeight: 300, overflowY: "auto", mt: 2 }}>
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
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">コメント</Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
          fullWidth
        />
        <TextField
          label="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={sendMessage} fullWidth>
          送信
        </Button>
      </Box>
    </Container>
  );
}

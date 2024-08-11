"use client";

import {
  AppBar,
  Box,
  Button,
  Stack,
  TextField,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PaletteIcon from '@mui/icons-material/Palette';
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [bgColor, setBgColor] = useState("#121212");
  const [chatboxColor, setChatboxColor] = useState("#1E1E1E");
  const [headerBarColor, setHeaderBarColor] = useState("#BB86FC");
  const [buttonColor, setButtonColor] = useState("#BB86FC");
  const [fontFamily, setFontFamily] = useState("Arial");
  const messagesEndRef = useRef(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const currentMessage = message.trim();
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: currentMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: currentMessage }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={bgColor}
    >
      <AppBar position="static" sx={{ bgcolor: headerBarColor }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HeadStarterHelper
          </Typography>
          <Tooltip
            title="Enter your inquiry in the chat box and click on the send button to retrieve a response from the AI Assistant"
            arrow
          >
            <IconButton color="inherit">
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Customize">
            <IconButton color="inherit" onClick={handleClick}>
              <PaletteIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem>
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Courier New">Courier New</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
            <MenuItem>
              <Stack spacing={1} width="100%">
                <Typography>Background Color:</Typography>
                <TextField
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  fullWidth
                />
              </Stack>
            </MenuItem>
            <MenuItem>
              <Stack spacing={1} width="100%">
                <Typography>Chatbox Color:</Typography>
                <TextField
                  type="color"
                  value={chatboxColor}
                  onChange={(e) => setChatboxColor(e.target.value)}
                  fullWidth
                />
              </Stack>
            </MenuItem>
            <MenuItem>
              <Stack spacing={1} width="100%">
                <Typography>Header Bar Color:</Typography>
                <TextField
                  type="color"
                  value={headerBarColor}
                  onChange={(e) => setHeaderBarColor(e.target.value)}
                  fullWidth
                />
              </Stack>
            </MenuItem>
            <MenuItem>
              <Stack spacing={1} width="100%">
                <Typography>Send Button Color:</Typography>
                <TextField
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  fullWidth
                />
              </Stack>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Stack
        direction={"column"}
        width="500px"
        height="700px"
        bgcolor={chatboxColor}
        border="1px solid #333"
        borderRadius={4}
        p={2}
        spacing={3}
        margin="auto"
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "#3C3C3C"  // Dark gray for assistant messages
                    : "#616161"  // Lighter gray for user messages
                }
                color="white"
                borderRadius={16}
                p={3}
                sx={{ fontFamily: fontFamily }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              input: { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: buttonColor,
                },
                "&:hover fieldset": {
                  borderColor: buttonColor,
                },
              },
              "& .MuiFormLabel-root": { color: buttonColor },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              bgcolor: isLoading ? "#616161" : buttonColor,
              "&:hover": {
                bgcolor: isLoading ? "#616161" : buttonColor,
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

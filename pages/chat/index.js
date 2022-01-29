import appConfig from "../../config.json";
import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import { ButtonSendSticker } from "../../src/components/ButtonSendSticker";
import { Header } from "../../src/components/Header";
import { MessageList } from "../../src/components/MessageList";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function listenForMessages(callback) {
  return supabaseClient
    .from("messages")
    .on("INSERT", (data) => {
      callback(data.new);
    })
    .subscribe();
}

export default function ChatPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (!userData || Object.keys(userData).length === 0) {
      return router.push("/");
    }

    setUserData(userData);

    supabaseClient
      .from("messages")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => setMessages(data));

    const subscription = listenForMessages((newMessage) => {
      setMessages((messages) => [newMessage, ...messages]);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleNewMessage(message) {
    const messageObj = {
      from: userData.name,
      avatar_url: userData.avatar_url,
      text: message,
    };

    supabaseClient
      .from("messages")
      .insert([messageObj])
      .then(({ data }) => {
        // setMessages([data[0], ...messages]);
      });

    setMessage("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList messages={messages} />

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();

                  handleNewMessage(event.target.value);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Button
              label="📤"
              type="button"
              colorVariant="positive"
              variant="secondary"
              styleSheet={{
                marginRight: "10px;",
                borderRadius: "50%",
                padding: "0 3px 0 0",
                minWidth: "50px",
                minHeight: "50px",
                fontSize: "20px",
                marginBottom: "8px",
              }}
              title="Enviar mensagem"
              onClick={() => {
                handleNewMessage(message);
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNewMessage(`:sticker:${sticker}`);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

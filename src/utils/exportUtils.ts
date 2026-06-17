import type { Chat, Message } from "../store/useChatStore";

export const exportChatsToCSV = (
  chats: Record<string, Chat>,
  filename: string,
) => {
  const chatArray = Object.values(chats);
  if (chatArray.length === 0) return;

  const headers = [
    "Title",
    "Backend API",
    "Model",
    "Date Created",
    "Message Count",
    "Score",
    "Notes",
    "Conversation History",
  ];

  const escapeCSV = (str: string | number | undefined) => {
    if (str === undefined || str === null) return "";
    const stringified = String(str);
    if (
      stringified.includes(",") ||
      stringified.includes('"') ||
      stringified.includes("\n")
    ) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
  };

  const formatConversation = (messages: Message[]) => {
    const formatted = [];
    let currentPair: { user?: string; system?: string } = {};

    for (const msg of messages) {
      if (msg.role === "user") {
        if (currentPair.user) {
          formatted.push(currentPair);
          currentPair = {};
        }
        currentPair.user = msg.text;
      } else if (msg.role === "assistant") {
        currentPair.system = msg.text;
        formatted.push(currentPair);
        currentPair = {};
      }
    }

    if (Object.keys(currentPair).length > 0) {
      formatted.push(currentPair);
    }

    return JSON.stringify(formatted);
  };

  const rows = chatArray.map((chat) => [
    escapeCSV(chat.title),
    escapeCSV(chat.backendId),
    escapeCSV(chat.modelId),
    escapeCSV(new Date(chat.createdAt).toLocaleString()),
    escapeCSV(chat.messages.length),
    escapeCSV(chat.score),
    escapeCSV(chat.evalNote),
    escapeCSV(formatConversation(chat.messages)),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

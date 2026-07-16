"use client";

import { useState, useEffect } from "react";

interface MessageEditorProps {
  recipientName: string;
  senderName: string;
  messageText: string;
  messageStyle?: string;
  onUpdate: (data: {
    recipientName?: string;
    senderName?: string;
    messageText?: string;
    messageStyle?: string;
  }) => void;
}

const MESSAGE_STYLES = [
  {
    key: "fade-words",
    label: "Classic",
    hint: "Words fade in gently",
    sample: "Happy birthday!",
    sampleStyle: undefined as React.CSSProperties | undefined,
  },
  {
    key: "handwritten",
    label: "Handwritten",
    hint: "Written letter by letter, like ink",
    sample: "Happy birthday!",
    sampleStyle: {
      fontFamily: "var(--font-script), 'Caveat', cursive",
      fontSize: "1.35rem",
    } as React.CSSProperties,
  },
];

export function MessageEditor({
  recipientName: initialRecipient,
  senderName: initialSender,
  messageText: initialMessage,
  messageStyle: initialStyle,
  onUpdate,
}: MessageEditorProps) {
  const [recipientName, setRecipientName] = useState(initialRecipient);
  const [senderName, setSenderName] = useState(initialSender);
  const [messageText, setMessageText] = useState(initialMessage);
  const [messageStyle, setMessageStyle] = useState(initialStyle || "fade-words");

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate({ recipientName, senderName, messageText, messageStyle });
    }, 500);
    return () => clearTimeout(timer);
  }, [recipientName, senderName, messageText, messageStyle, onUpdate]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">To</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Recipient's name"
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">From</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name"
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Your Message
        </label>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Write your personalized message here..."
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {messageText.length} characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Message Style
        </label>
        <div className="grid grid-cols-2 gap-3">
          {MESSAGE_STYLES.map((style) => (
            <button
              key={style.key}
              type="button"
              onClick={() => setMessageStyle(style.key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                messageStyle === style.key
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="text-lg leading-tight mb-1" style={style.sampleStyle}>
                {style.sample}
              </p>
              <p className="text-sm font-medium">{style.label}</p>
              <p className="text-xs text-muted-foreground">{style.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

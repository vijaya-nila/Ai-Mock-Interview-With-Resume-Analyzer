"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InputBoxProps {
  onSend: (message: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function InputBox({
  onSend,
  onSkip,
  disabled,
}: InputBoxProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex gap-2">

        {/* Answer Input */}
        <Input
          type="text"
          placeholder={
            isListening
              ? "Listening..."
              : "Type your answer or use the microphone..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />

        {/* Microphone */}
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          onClick={handleMicClick}
          disabled={disabled}
          title={isListening ? "Stop listening" : "Speak your answer"}
        >
          {isListening ? "⏹️" : "🎤"}
        </Button>

        {/* Skip */}
        <Button
          variant="outline"
          onClick={onSkip}
          disabled={disabled}
        >
          Skip
        </Button>

        {/* Send */}
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          Send
        </Button>

      </div>
    </div>
  );
}
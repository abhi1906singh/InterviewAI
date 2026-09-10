"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import {
  Mic,
  MicOff,
  Send,
  Trash2,
  HelpCircle,
  Loader2,
  SkipForward,
} from "lucide-react";
import { useSpeechToText } from "../hooks/useSpeechToText";

interface AnswerBoxProps {
  onSubmit: (answer: string) => Promise<void>;
  onAskHint?: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  questionId?: string;
  questionText?: string;
}

export default function AnswerBox({
  onSubmit,
  onAskHint,
  onSkip,
  isLoading = false,
  disabled = false,
  questionId,
  questionText,
}: AnswerBoxProps) {
  const [answer, setAnswer] = useState<string>("");
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechToText();

  // Reset answer when moving to a new question
  useEffect(() => {
    setAnswer("");
    resetTranscript();
  }, [questionId, resetTranscript]);

  // Sync transcript into answer textarea
  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAnswer(value);
    setTranscript(value);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    if (isListening) {
      stopListening();
    }
    setAnswer("");
    resetTranscript();
  };

  const handleSubmit = async () => {
    if (!answer.trim() || isLoading || disabled) return;
    if (isListening) {
      stopListening();
    }
    await onSubmit(answer.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const charCount = answer.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
      {/* Action Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          {/* Voice Input Button */}
          {isSupported ? (
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={disabled || isLoading}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse shadow-rose-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
              title={
                isListening
                  ? "Click to stop recording"
                  : "Click to speak your answer"
              }
            >
              {isListening ? (
                <>
                  <Mic className="h-4 w-4 animate-bounce" />
                  <span>Listening... (Click to stop)</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 text-indigo-600" />
                  <span>Voice Answer (STT)</span>
                </>
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <MicOff className="h-3.5 w-3.5" />
              Mic not supported on this browser
            </span>
          )}

          {isListening && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              Recording
            </span>
          )}
        </div>

        {/* Word count, Hint & Skip */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {onAskHint && (
            <button
              type="button"
              onClick={onAskHint}
              disabled={disabled || isLoading}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              STAR Hint
            </button>
          )}

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled || isLoading}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip
            </button>
          )}

          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="relative p-4">
        <textarea
          rows={6}
          value={answer}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Speak your answer using the Voice button above, or type your structured response using the STAR method (Situation, Task, Action, Result)..."
          className="w-full resize-none border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-sm sm:text-base leading-relaxed"
        />

        {/* Live Interim Speech Preview */}
        {isListening && interimTranscript && (
          <p className="mt-2 text-xs italic text-indigo-600 animate-pulse bg-indigo-50/50 p-2 rounded-lg">
            🎙️ {interimTranscript}
          </p>
        )}

        {speechError && (
          <p className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
            ⚠️ {speechError}
          </p>
        )}
      </div>

      {/* Bottom Footer Controls */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={!answer || disabled || isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs text-gray-400">
            Press{" "}
            <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 shadow-sm">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 shadow-sm">
              Enter
            </kbd>
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer.trim() || disabled || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

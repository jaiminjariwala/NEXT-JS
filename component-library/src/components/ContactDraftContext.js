"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ContactDraftContext = createContext(null);

export function ContactDraftProvider({ children }) {
  const [senderEmail, setSenderEmail] = useState("");
  const [senderSubject, setSenderSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);

  const value = useMemo(
    () => ({
      senderEmail,
      setSenderEmail,
      senderSubject,
      setSenderSubject,
      message,
      setMessage,
      attachments,
      setAttachments,
    }),
    [senderEmail, senderSubject, message, attachments]
  );

  return <ContactDraftContext.Provider value={value}>{children}</ContactDraftContext.Provider>;
}

export function useContactDraft() {
  const context = useContext(ContactDraftContext);
  if (!context) {
    throw new Error("useContactDraft must be used within ContactDraftProvider");
  }
  return context;
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useCRM, SAVED_TEMPLATES, MessageTemplate, PipelineStage } from "@/context/CRMContent";
import type { WhatsAppConversationRecord, WhatsAppMessageRecord } from "@/services/whatsapp.service";

export default function WhatsAppConsolePage() {
  const { leads, updateLead, activeCallerName } = useCRM();

  const [conversations, setConversations] = useState<WhatsAppConversationRecord[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<WhatsAppConversationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");

  // Chat Composer
  const [messageInput, setMessageInput] = useState("");
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(true);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedLeadIdForNewChat, setSelectedLeadIdForNewChat] = useState("");
  const [newChatInitialMessage, setNewChatInitialMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const loadConversations = async (selectId?: string) => {
    try {
      const res = await fetch("/api/whatsapp/conversations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.conversations && Array.isArray(data.conversations)) {
          setConversations(data.conversations);

          // Auto-select first conversation or specified ID
          const targetId = selectId || selectedConvId || data.conversations[0]?.id;
          if (targetId) {
            setSelectedConvId(targetId);
            loadConversationDetails(targetId);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load WhatsApp conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch individual conversation thread & full history
  const loadConversationDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/whatsapp/conversations/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setActiveConversation(data.conversation);
          // Mark conversation read in local list
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
          );
        }
      }
    } catch (err) {
      console.error("Failed to load conversation details:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when active conversation or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterTab === "unread" && c.unreadCount === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.leadName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.lastMessageText.toLowerCase().includes(q) ||
          c.lead?.contactPerson?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [conversations, filterTab, searchQuery]);

  // Associated Lead profile (from active conversation or CRM leads store)
  const associatedLead = useMemo(() => {
    if (!activeConversation) return null;
    if (activeConversation.lead) return activeConversation.lead;
    if (activeConversation.leadId) {
      return leads.find((l) => l.id === activeConversation.leadId) || null;
    }
    return null;
  }, [activeConversation, leads]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedConvId || isSending) return;

    const textToSend = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    // Optimistic message update
    const tempMessage: WhatsAppMessageRecord = {
      id: `temp_${Date.now()}`,
      conversationId: selectedConvId,
      senderType: "OUTBOUND",
      senderName: activeCallerName,
      text: textToSend,
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    setActiveConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempMessage] } : null
    );

    try {
      const res = await fetch(
        `/api/whatsapp/conversations/${encodeURIComponent(selectedConvId)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSend }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          // Replace optimistic message with server message
          setActiveConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              lastMessageText: textToSend,
              lastMessageAt: data.message.createdAt,
              messages: prev.messages.map((m) =>
                m.id === tempMessage.id ? data.message : m
              ),
            };
          });

          // Update snippet in list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConvId
                ? {
                    ...c,
                    lastMessageText: textToSend,
                    lastMessageAt: data.message.createdAt,
                  }
                : c
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Start new conversation from modal
  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadIdForNewChat) return;

    const targetLead = leads.find((l) => l.id === selectedLeadIdForNewChat);
    if (!targetLead) return;

    try {
      const res = await fetch("/api/whatsapp/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: targetLead.id,
          leadName: targetLead.name,
          phoneNumber: targetLead.phone,
          initialMessage: newChatInitialMessage.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setShowNewChatModal(false);
          setSelectedLeadIdForNewChat("");
          setNewChatInitialMessage("");
          await loadConversations(data.conversation.id);
        }
      }
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };

  // Quick template insert
  const handleInsertTemplate = (tmpl: MessageTemplate) => {
    let populated = tmpl.content;
    if (associatedLead) {
      populated = populated
        .replace(/{contact_name}/g, associatedLead.contactPerson || associatedLead.name)
        .replace(/{business_name}/g, associatedLead.name)
        .replace(/{caller_name}/g, activeCallerName);
    }
    setMessageInput(populated);
    setShowTemplatesDropdown(false);
  };

  // Format time (e.g. 10:45 AM or Yesterday)
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 sm:-m-6 lg:-m-8 bg-zinc-950 text-slate-100 select-none overflow-hidden">
      {/* Top Banner: WhatsApp Console & Meta Cloud API Status */}
      <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h1 className="text-sm font-black text-white tracking-wide uppercase">
              WhatsApp Console
            </h1>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Meta Cloud API Ready
          </span>
          <span className="text-xs text-zinc-400 hidden md:inline">
            • Live two-way prospect messaging &amp; conversation sync
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl transition shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <span>➕</span>
            <span className="hidden sm:inline">Start Chat with Lead</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================== */}
        {/* COLUMN 1: Conversations List */}
        {/* ======================================================== */}
        <div className="w-full sm:w-80 md:w-96 border-r border-zinc-800 bg-zinc-900/90 flex flex-col shrink-0">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-zinc-800 space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search conversations, numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterTab === "all"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All Chats ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("unread")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  filterTab === "unread"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_10px_rgba(8,199,233,0.35)] border border-cyan-400/50"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Unread</span>
                {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] flex items-center justify-center font-black">
                    {conversations.filter((c) => c.unreadCount > 0).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-850">
            {filteredConversations.map((conv) => {
              const isSelected = selectedConvId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    loadConversationDetails(conv.id);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                    isSelected
                      ? "bg-cyan-950/40 border-l-4 border-cyan-400 shadow-[inset_0_0_15px_rgba(8,199,233,0.1)]"
                      : "hover:bg-zinc-800/40"
                  }`}
                >
                  {/* Lead Avatar */}
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-cyan-300 shrink-0 text-sm shadow-sm">
                    {conv.leadName.charAt(0)}
                  </div>

                  {/* Conversation Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-white truncate">
                        {conv.leadName}
                      </h3>
                      <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {conv.phoneNumber}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p
                        className={`text-xs truncate ${
                          conv.unreadCount > 0
                            ? "font-semibold text-zinc-100"
                            : "text-zinc-400"
                        }`}
                      >
                        {conv.lastMessageText || "No messages yet"}
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center shrink-0 shadow">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && !isLoading && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No conversations found matching filters.
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: Active Chat Area */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
          {activeConversation ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-black flex items-center justify-center text-sm shadow">
                    {activeConversation.leadName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">
                        {activeConversation.leadName}
                      </h2>
                      {associatedLead?.pipeline && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(8,199,233,0.2)]">
                          {associatedLead.pipeline}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                      <span>{activeConversation.phoneNumber}</span>
                      {associatedLead?.city && (
                        <span className="text-zinc-500">• 📍 {associatedLead.city}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Call Button */}
                  {associatedLead?.id && (
                    <Link
                      href={`/calls/${associatedLead.id}`}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      title="Open Calling Workspace"
                    >
                      <span>📞</span>
                      <span className="hidden sm:inline">Call Workspace</span>
                    </Link>
                  )}

                  {/* Lead Directory Link */}
                  {associatedLead?.id && (
                    <Link
                      href="/leads"
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>👥</span>
                      <span className="hidden sm:inline">Leads</span>
                    </Link>
                  )}

                  {/* Toggle Info Drawer */}
                  <button
                    type="button"
                    onClick={() => setShowRightDrawer((prev) => !prev)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition ${
                      showRightDrawer
                        ? "bg-cyan-950/50 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(8,199,233,0.25)]"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                    title="Toggle Lead Details Drawer"
                  >
                    ℹ️
                  </button>
                </div>
              </div>

              {/* Message Thread Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Notice banner for Meta API mode */}
                <div className="text-center py-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400">
                    🔒 WhatsApp End-to-End Encrypted Sandbox • Integrated with Meta Cloud API
                  </span>
                </div>

                {activeConversation.messages.map((msg) => {
                  const isOutbound = msg.senderType === "OUTBOUND";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isOutbound ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-md sm:max-w-lg p-3 rounded-2xl text-xs leading-relaxed space-y-1 shadow-md ${
                          isOutbound
                            ? "bg-gradient-to-br from-emerald-950/90 via-teal-950/80 to-zinc-900 text-emerald-100 border border-emerald-600/40 rounded-tr-none shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                            : "bg-zinc-900 text-zinc-200 border border-zinc-800/80 rounded-tl-none shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                        }`}
                      >
                        {/* Sender Label */}
                        <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-400 font-semibold mb-0.5">
                          <span>{msg.senderName}</span>
                          {isOutbound && (
                            <span className="text-[10px] text-emerald-400">
                              Solvrex Agent
                            </span>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* Timestamp & Status */}
                        <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 pt-0.5 font-mono">
                          <span>{formatTime(msg.createdAt)}</span>
                          {isOutbound && (
                            <span className="text-emerald-400 font-bold" title={msg.status}>
                              {msg.status === "READ" ? "✓✓" : msg.status === "DELIVERED" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Templates Bar */}
              <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-zinc-400 font-bold uppercase shrink-0 px-1">
                  ⚡ Templates:
                </span>
                {SAVED_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleInsertTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-cyan-400 text-zinc-300 hover:text-cyan-300 text-[11px] whitespace-nowrap transition font-medium"
                    title={tmpl.content}
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>

              {/* Chat Composer Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-end gap-2 shrink-0"
              >
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    placeholder="Type a WhatsApp message or pick a pitch template above... (Press Enter to send)"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending}
                  className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl transition shadow-[0_2px_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5 disabled:opacity-40 shrink-0"
                >
                  <span>✈️</span>
                  <span>{isSending ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <span className="text-4xl mb-3">💬</span>
              <h3 className="text-base font-bold text-white">No Conversation Selected</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Choose a conversation from the left drawer or click &quot;Start Chat with Lead&quot; to begin outbound outreach.
              </p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: Lead Details & CRM Context Right Drawer */}
        {/* ======================================================== */}
        {showRightDrawer && associatedLead && (
          <div className="w-80 lg:w-88 border-l border-zinc-800 bg-zinc-900 overflow-y-auto p-4 space-y-4 shrink-0 hidden md:block">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>📋</span>
                <span>Prospect CRM Context</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowRightDrawer(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Lead Primary Card */}
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <h3 className="font-bold text-white text-sm">{associatedLead.name}</h3>
              <p className="text-xs text-zinc-400">
                Contact: <span className="text-zinc-200 font-semibold">{associatedLead.contactPerson}</span>
              </p>
              <p className="text-xs text-zinc-400">
                Phone: <span className="font-mono text-zinc-200">{associatedLead.phone}</span>
              </p>
              {associatedLead.email && (
                <p className="text-xs text-zinc-400 truncate">
                  Email: <span className="text-zinc-200">{associatedLead.email}</span>
                </p>
              )}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                <span>📍 {associatedLead.city || "India"}</span>
                <span>•</span>
                <span>🏢 {associatedLead.category}</span>
              </div>
            </div>

            {/* Google Rating & Online Presence */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Google Rating:</span>
                <span className="font-bold text-cyan-400">
                  ⭐ {associatedLead.googleRating || 4.5} ({associatedLead.googleReviewsCount || 100} reviews)
                </span>
              </div>
              {associatedLead.websiteUrl && (
                <div className="flex items-center justify-between truncate">
                  <span className="text-zinc-400">Website:</span>
                  <a
                    href={associatedLead.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline truncate max-w-[160px]"
                  >
                    {associatedLead.websiteUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Pipeline Stage Quick Updater */}
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <label className="text-zinc-400 block font-semibold">CRM Pipeline Stage</label>
              <select
                value={associatedLead.pipeline}
                onChange={(e) => {
                  const newStage = e.target.value as PipelineStage;
                  updateLead(associatedLead.id, { pipeline: newStage });
                  setActiveConversation((prev) =>
                    prev?.lead ? { ...prev, lead: { ...prev.lead, pipeline: newStage } } : prev
                  );
                }}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-cyan-400 font-semibold"
              >
                <option value="Lead">Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Meeting Booked">Meeting Booked</option>
                <option value="Won">Won (Deal Closed)</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Scheduled Follow-up */}
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Scheduled Follow-up:</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {associatedLead.followUpDate || "None set"}
                </span>
              </div>
              {associatedLead.followUpTime && (
                <div className="text-right text-[11px] text-zinc-500 font-mono">
                  ⏰ {associatedLead.followUpTime}
                </div>
              )}
            </div>

            {/* CRM Prospect Notes */}
            {associatedLead.notes && (
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 text-xs">
                <span className="text-zinc-400 font-semibold block">Prospect Notes:</span>
                <p className="text-zinc-300 italic text-[11px] leading-relaxed">
                  &ldquo;{associatedLead.notes}&rdquo;
                </p>
              </div>
            )}

            {/* Meta Cloud API Integration Card */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <span>🤖</span>
                <span>Meta WhatsApp Cloud API</span>
              </span>
              <p className="text-zinc-400 text-[10px] leading-relaxed">
                Backend routes &amp; PostgreSQL tables are fully structured. Provide `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` in `.env` to switch from development sandbox to live Meta Cloud broadcast.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>💬</span>
                <span>Start WhatsApp Conversation</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="text-zinc-400 hover:text-white text-lg p-1 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">
                  Select Lead from CRM *
                </label>
                <select
                  required
                  value={selectedLeadIdForNewChat}
                  onChange={(e) => setSelectedLeadIdForNewChat(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                >
                  <option value="">-- Choose a Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.phone}) - {l.contactPerson}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">
                  Initial Outbound Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Hello! Following up regarding your inquiry..."
                  value={newChatInitialMessage}
                  onChange={(e) => setNewChatInitialMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800/80 text-zinc-300 font-semibold hover:bg-zinc-750 border border-zinc-700/80 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedLeadIdForNewChat}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold transition shadow-[0_2px_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getConversationMessages,
  getConversations,
  markConversationNotificationsAsRead,
  sendConversationMessage,
} from "../services/api";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function Conversations() {
  const navigate = useNavigate();
  const { isArabic, language } = useLanguage();

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const messageFormRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = [
  "😊", "😂", "😍", "🥰", "😎", "😢", "😡", "👍",
  "👎", "🙏", "👏", "🔥", "❤️", "💔", "✅", "❌",
  "🚲", "📦", "💬", "💰", "🎉", "⭐", "😅", "😉"
  ];

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("hayding-user") || "{}");
    } catch {
      return {};
    }
  }

  function getUserName(user) {
    return (
      user?.fullName ||
      user?.email ||
      text("Unbekannt", "غير معروف", "Unknown")
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";

    try {
      return new Intl.DateTimeFormat(language === "AR" ? "ar" : "de-DE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateValue));
    } catch {
      return dateValue;
    }
  }

  function getConversationDate(conversation) {
    return (
      conversation?.lastMessageAt ||
      conversation?.updatedAt ||
      conversation?.createdAt ||
      conversation?.product?.createdAt
    );
  }

  function getUnreadCountForConversation(conversation) {
    return Number(conversation?.unreadCount || 0);
  }

  function getLastMessageText(conversation) {
    return (
      conversation?.lastMessageContent ||
      conversation?.lastMessage?.content ||
      conversation?.lastMessagePreview ||
      ""
    );
  }

  function getConversationPreview(conversation) {
    return (
      getLastMessageText(conversation) ||
      text("Keine Vorschau", "لا توجد معاينة", "No preview")
    );
  }

  function getOtherUser(conversation) {
    const currentUser = getCurrentUser();

    return Number(currentUser?.id) === Number(conversation?.buyer?.id)
      ? conversation?.seller
      : conversation?.buyer;
  }

  function notifyNavbarToRefreshNotifications() {
    window.dispatchEvent(new Event("hayding-notifications-updated"));
  }

  function scrollMessagesToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  function markConversationAsReadInState(conversationId) {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        Number(conversation.id) === Number(conversationId)
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  }

  async function loadConversationMessages(conversationId, markAsRead = true) {
    if (!conversationId) return;

    try {
      setIsLoadingMessages(true);
      setError("");

      const messagesData = await getConversationMessages(conversationId);
      const loadedMessages = messagesData?.data || messagesData || [];

      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);

      if (markAsRead) {
        markConversationAsReadInState(conversationId);

        try {
          await markConversationNotificationsAsRead(conversationId);
          notifyNavbarToRefreshNotifications();
        } catch {
          // Silent fail: backend getMessages already marks message read.
        }
      }

      scrollMessagesToBottom();
    } catch (err) {
      setError(
        err.message ||
          text(
            "Nachrichten konnten nicht geladen werden.",
            "تعذر تحميل الرسائل.",
            "Could not load messages."
          )
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }

  async function loadConversations(showLoading = false) {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      setError("");

      const conversationsData = await getConversations();
      const items = conversationsData?.data || conversationsData || [];
      const loadedConversations = Array.isArray(items) ? items : [];

      setConversations(loadedConversations);

      setSelectedConversationId((currentSelectedId) => {
        if (currentSelectedId) return currentSelectedId;

        const firstUnreadConversation = loadedConversations.find(
          (conversation) => getUnreadCountForConversation(conversation) > 0
        );

        return firstUnreadConversation?.id || loadedConversations[0]?.id || null;
      });
    } catch (err) {
      setError(
        err.message ||
          text(
            "Konversationen konnten nicht geladen werden.",
            "تعذر تحميل المحادثات.",
            "Could not load conversations."
          )
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      navigate("/login");
      return;
    }

    loadConversations(true);

    function handleNotificationsUpdated() {
      loadConversations(false);
    }

    window.addEventListener(
      "hayding-notifications-updated",
      handleNotificationsUpdated
    );

    const intervalId = setInterval(() => {
      loadConversations(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);

      window.removeEventListener(
        "hayding-notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [navigate]);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversationMessages(selectedConversationId, true);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showEmojiPicker &&
        messageFormRef.current &&
        !messageFormRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  async function handleSelectConversation(conversationId) {
    setSelectedConversationId(conversationId);
    markConversationAsReadInState(conversationId);
  }

  function addEmoji(emoji) {
    setMessageText((currentText) => `${currentText}${emoji}`);
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage || !selectedConversationId || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const data = await sendConversationMessage(
        selectedConversationId,
        cleanMessage
      );

      const savedMessage = data?.data || data;

      if (savedMessage) {
        setMessages((currentMessages) => [...currentMessages, savedMessage]);
      }

      setMessageText("");

      await loadConversations(false);
      await loadConversationMessages(selectedConversationId, false);
    } catch (err) {
      setError(
        err.message ||
          text(
            "Nachricht konnte nicht gesendet werden.",
            "تعذر إرسال الرسالة.",
            "Could not send message."
          )
      );
    } finally {
      setIsSending(false);
    }
  }

  const currentUser = getCurrentUser();

  const selectedConversation = conversations.find(
    (conversation) => Number(conversation.id) === Number(selectedConversationId)
  );

  const selectedOtherUser = selectedConversation
    ? getOtherUser(selectedConversation)
    : null;

  const selectedProduct = selectedConversation?.product;

  const totalUnreadCount = conversations.reduce(
    (total, conversation) => total + getUnreadCountForConversation(conversation),
    0
  );

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="inbox-page">
        <section className="inbox-layout">
          <aside className="inbox-list-panel">
            <header className="inbox-list-header">
              <div>
                <p className="eyebrow">
                  {text("Nachrichten", "الرسائل", "Messages")}
                </p>

                <h1>{text("Inbox", "صندوق الرسائل", "Inbox")}</h1>
              </div>

              {totalUnreadCount > 0 && <span>{totalUnreadCount}</span>}
            </header>

            {isLoading && (
              <p className="inbox-loading">
                {text("Wird geladen...", "جارٍ التحميل...", "Loading...")}
              </p>
            )}

            {error && <p className="auth-message auth-error">{error}</p>}

            {!isLoading && !error && conversations.length === 0 && (
              <div className="inbox-empty">
                <div>💬</div>
                <strong>
                  {text(
                    "Noch keine Nachrichten.",
                    "لا توجد رسائل بعد.",
                    "No messages yet."
                  )}
                </strong>
              </div>
            )}

            {!isLoading && !error && conversations.length > 0 && (
              <div className="inbox-conversation-list">
                {conversations.map((conversation) => {
                  const product = conversation.product;
                  const otherUser = getOtherUser(conversation);
                  const unreadCount =
                    getUnreadCountForConversation(conversation);
                  const isUnread = unreadCount > 0;
                  const isActive =
                    Number(selectedConversationId) === Number(conversation.id);

                  return (
                    <button
                      className={`inbox-conversation-item ${
                        isActive ? "active" : ""
                      } ${isUnread ? "unread" : ""}`}
                      type="button"
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="inbox-avatar-wrap">
                        <UserAvatar user={otherUser} size="medium" />

                        {isUnread && <span className="inbox-avatar-dot" />}
                      </div>

                      <div className="inbox-item-main">
                        <div className="inbox-item-top">
                          <strong>{getUserName(otherUser)}</strong>

                          <time dateTime={getConversationDate(conversation) || ""}>
                            {formatDate(getConversationDate(conversation))}
                          </time>
                        </div>

                        <p className="inbox-item-product">
                          {product?.title ||
                            text(
                              "Anzeige nicht verfügbar",
                              "الإعلان غير متاح",
                              "Listing unavailable"
                            )}
                        </p>

                        <p className="inbox-item-preview">
                          {getConversationPreview(conversation)}
                        </p>
                      </div>

                      {isUnread && (
                        <span className="inbox-unread-badge">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="inbox-chat-panel">
            {!selectedConversation && (
              <div className="inbox-chat-empty">
                <div>💬</div>

                <h2>
                  {text(
                    "Wähle eine Konversation",
                    "اختر محادثة",
                    "Select a conversation"
                  )}
                </h2>

                <p>
                  {text(
                    "Klicke links auf eine Konversation, um den Chat zu öffnen.",
                    "اضغط على محادثة من القائمة لفتح الدردشة.",
                    "Choose a conversation from the list to open the chat."
                  )}
                </p>
              </div>
            )}

            {selectedConversation && (
              <>
                <header className="inbox-chat-header">
                  <div className="inbox-chat-user">
                    <UserAvatar user={selectedOtherUser} size="medium" />

                    <div>
                      <h2>{getUserName(selectedOtherUser)}</h2>

                      <p>
                        {selectedProduct?.title ||
                          text(
                            "Anzeige nicht verfügbar",
                            "الإعلان غير متاح",
                            "Listing unavailable"
                          )}
                      </p>
                    </div>
                  </div>

                  {selectedProduct?.id && (
                    <button
                      className="btn btn-secondary inbox-product-link"
                      type="button"
                      onClick={() => navigate(`/products/${selectedProduct.id}`)}
                    >
                      {text("Anzeige", "الإعلان", "Listing")}
                    </button>
                  )}
                </header>

                <div className="inbox-chat-messages">
                  {isLoadingMessages && (
                    <p className="inbox-loading">
                      {text(
                        "Nachrichten werden geladen...",
                        "جارٍ تحميل الرسائل...",
                        "Loading messages..."
                      )}
                    </p>
                  )}

                  {!isLoadingMessages && messages.length === 0 && (
                    <div className="inbox-chat-empty small">
                      <div>👋</div>

                      <p>
                        {text(
                          "Noch keine Nachrichten in diesem Chat.",
                          "لا توجد رسائل في هذه المحادثة بعد.",
                          "No messages in this chat yet."
                        )}
                      </p>
                    </div>
                  )}

                  {!isLoadingMessages &&
                    messages.map((message) => {
                      const isMine =
                        Number(message.sender?.id) === Number(currentUser?.id);

                      return (
                        <div
                          className={`inbox-message-row ${
                            isMine ? "mine" : "theirs"
                          }`}
                          key={message.id}
                        >
                          <div className="inbox-message-bubble">
                            <p>{message.content}</p>

                            <time dateTime={message.createdAt || ""}>
                              {formatDate(message.createdAt)}
                            </time>
                          </div>
                        </div>
                      );
                    })}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  ref={messageFormRef}
                  className="inbox-message-form"
                  onSubmit={handleSendMessage}
                  >
                  <button
  className="inbox-emoji-btn"
  type="button"
  onClick={() => setShowEmojiPicker((currentValue) => !currentValue)}
  aria-label="Open emoji picker"
>
  😊
</button>

{showEmojiPicker && (
  <div className="inbox-emoji-picker">
    {emojis.map((emoji) => (
      <button
        type="button"
        key={emoji}
        onClick={() => addEmoji(emoji)}
      >
        {emoji}
      </button>
    ))}
  </div>
)}

                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder={text(
                      "Schreibe hier deine Nachricht",
                      "اكتب رسالتك هنا",
                      "Write your message here"
                    )}
                    rows="1"
                  />

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                  >
                    {isSending
                      ? text("...", "...", "...")
                      : text("Senden", "إرسال", "Send")}
                  </button>
                </form>
              </>
            )}
          </section>

          <aside className="inbox-ad-space">
            <span>{text("Werbung", "إعلان", "Ad")}</span>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default Conversations;
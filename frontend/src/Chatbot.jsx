import {
  useEffect,
  useRef,
  useState
} from "react";


const API_URL =
  "http://127.0.0.1:8000";


function Chatbot({ token }) {

  const [open, setOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const [messages, setMessages] =
    useState([
      {
        sender: "ai",

        text:
          "Hi! 😊 I'm your AI Expense Assistant. " +
          "Ask me about your expenses or ask " +
          "me a general question."
      }
    ]);


  const bottomRef = useRef(null);


  // ========================================
  // AUTO SCROLL
  // ========================================

  useEffect(() => {

    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth"
      }
    );

  }, [messages, loading]);


  // ========================================
  // SEND MESSAGE
  // ========================================

  async function sendMessage(event) {

    event.preventDefault();


    const cleanMessage =
      message.trim();


    if (!cleanMessage) {
      return;
    }


    setMessages(
      (previousMessages) => [
        ...previousMessages,

        {
          sender: "user",
          text: cleanMessage
        }
      ]
    );


    setMessage("");

    setLoading(true);


    try {

      const response = await fetch(
        `${API_URL}/chat`,

        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify(
            {
              message:
                cleanMessage
            }
          )
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "AI assistant failed"
        );
      }


      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            sender: "ai",
            text: data.reply
          }
        ]
      );


    } catch (error) {

      console.error(
        "Chat error:",
        error
      );


      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            sender: "ai",

            text:
              "Sorry 😕 I couldn't answer " +
              "that right now."
          }
        ]
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <>

      {/* FLOATING HAPPY FACE */}

      <button
        className="ai-float-button"

        onClick={() =>
          setOpen(!open)
        }

        title="AI Expense Assistant"

        aria-label={
          "Open AI Expense Assistant"
        }
      >

        <span className="floating-face">
          😊
        </span>

        {!open && (

          <span className="ai-label">
            AI
          </span>

        )}

      </button>


      {/* CHAT WINDOW */}

      {open && (

        <div className="chat-box">


          {/* HEADER */}

          <div className="chat-header">

            <div
              className="chat-header-info"
            >

              <span
                className="chat-header-face"
              >
                😊
              </span>


              <div>

                <strong>
                  AI Expense Assistant
                </strong>

                <small>
                  ● Online
                </small>

              </div>

            </div>


            <button
              type="button"

              className={
                "chat-close-button"
              }

              onClick={() =>
                setOpen(false)
              }
            >
              ×
            </button>

          </div>


          {/* MESSAGES */}

          <div className="chat-messages">

            {messages.map(
              (item, index) => (

                <div
                  key={index}

                  className={
                    item.sender ===
                    "user"
                      ? "message-row user-row"
                      : "message-row ai-row"
                  }
                >

                  {item.sender ===
                    "ai" && (

                    <div
                      className={
                        "message-ai-face"
                      }
                    >
                      😊
                    </div>

                  )}


                  <div
                    className={
                      item.sender ===
                      "user"
                        ? "chat-message user-message"
                        : "chat-message ai-message"
                    }
                  >

                    {item.text}

                  </div>

                </div>

              )
            )}


            {loading && (

              <div
                className={
                  "message-row ai-row"
                }
              >

                <div
                  className={
                    "message-ai-face"
                  }
                >
                  😊
                </div>


                <div
                  className={
                    "chat-message ai-message"
                  }
                >
                  Thinking...
                </div>

              </div>

            )}


            <div
              ref={bottomRef}
            />

          </div>


          {/* INPUT */}

          <form
            className="chat-input-area"

            onSubmit={sendMessage}
          >

            <input
              type="text"

              placeholder={
                "Ask me something..."
              }

              value={message}

              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }

              disabled={loading}
            />


            <button
              type="submit"

              disabled={loading}
            >
              ➤
            </button>

          </form>

        </div>

      )}

    </>
  );
}


export default Chatbot;
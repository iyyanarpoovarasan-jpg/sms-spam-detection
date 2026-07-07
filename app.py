import os
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "spam.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            label TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


def classify_sms(text: str) -> str:
    if not text or not text.strip():
        return "Ham"
    lower_text = text.lower()
    spam_keywords = ["free", "win", "prize", "claim", "urgent", "click", "offer", "lottery", "cash"]
    if any(keyword in lower_text for keyword in spam_keywords):
        return "Spam"
    return "Ham"


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    label = classify_sms(text)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO messages (text, label) VALUES (?, ?)", (text, label))
    conn.commit()
    conn.close()

    return jsonify({"text": text, "label": label})


@app.route("/messages", methods=["GET"])
def messages():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, text, label FROM messages ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    result = [{"id": row[0], "text": row[1], "label": row[2]} for row in rows]
    return jsonify(result)


@app.route("/messages/<int:message_id>", methods=["DELETE"])
def delete_message(message_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE id = ?", (message_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "id": message_id})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import api from "./api";

function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [autoClearTimer, setAutoClearTimer] = useState(null);

  // Clear password and timer on unmount
  useEffect(() => {
    return () => {
      if (autoClearTimer) clearTimeout(autoClearTimer);
    };
  }, [autoClearTimer]);
 
    const generatePassword = async () => {
      setIsLoading(true);
      setError(null);
      setCopied(false);
    
      try {
        const response = await api.get("/generate-password", { params: { length } });
        setPassword(response.data.password);
    
        setAutoClearTimer(
          setTimeout(() => {
            setPassword("");
            setAutoClearTimer(null);
          }, 120000)
        );
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Password generation failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="password-generator-container">
      <div className="password-generator-card">
        <div className="card-header">
          <h2>🔐 Secure Password Generator</h2>
          <p className="subtitle">
            {password 
              ? "This password will auto-clear in 2 minutes" 
              : "Create cryptographically strong passwords"}
          </p>
        </div>

        <div className="card-body">
          <div className="input-group">
            <label htmlFor="length">Password Length</label>
            <select
              id="length"
              value={length}
              onChange={(e) => setLength(Math.min(Math.max(parseInt(e.target.value), 8), 20))}
              disabled={isLoading}
            >
              {Array.from({ length: 13 }, (_, i) => i + 8).map((val) => (
                <option key={val} value={val}>
                  {val} characters
                </option>
              ))}
            </select>
          </div>

          <button
               onClick={generatePassword}
               className={`generate-button ${isLoading ? "loading" : ""}`}
               disabled={isLoading}
               aria-busy={isLoading}
          > {isLoading ? (
               <>
             <span className="spinner" aria-hidden="true"></span>
              Generating...
                 </>
              ) : (
               "✨ Generate Password"
                  )}
       </button>

          {error && (
            <div className="error-message" role="alert">
              ⚠️ {error}
            </div>
          )}

          {password ? (
            <div className="generated-password-section">
              <div className="password-display">
                <span className="password-label">Your Secure Password:</span>
                <div className="password-value" aria-live="polite">
                  {password}
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className="copy-button"
                aria-label={copied ? "Copied!" : "Copy to clipboard"}
                disabled={isLoading}
              >
                {copied ? "✅ Copied!" : "📋 Copy Password"}
              </button>
            </div>
          ) : (
            <div className="password-placeholder">
              {isLoading ? "Generating your secure password..." : "Your generated password will appear here"}
            </div>
          )}
        </div>

        <div className="card-footer">
          <p className="tip-text">
            <strong>Security Tip:</strong> Never reuse passwords across sites.
          </p>
        </div>
      </div>
    </div>
  );
}
export default PasswordGenerator;
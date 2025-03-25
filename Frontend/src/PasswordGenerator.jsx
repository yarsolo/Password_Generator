// import React, { useState } from "react";
// import axios from "axios";
// import "./App.css";

// function PasswordGenerator() {
//   const [password, setPassword] = useState("");
//   const [length, setLength] = useState(12);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [copied, setCopied] = useState(false); // New state for copy feedback

//   const handleLengthChange = (e) => {
//     setLength(parseInt(e.target.value, 10));
//   };

//   const generatePassword = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(`http://localhost:8081/generate-password`, {
//         params: { length }
//       });
//       setPassword(response.data.password);
//       setCopied(false); // Reset copy status on new generation
//     } catch (error) {
//       console.error("Error generating password", error);
//       setError("Failed to generate password. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(password);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
//   };

//   return (   
//       <div className="password-generator-card">
//         <div className="card-header">
//           <h2>🔐 Password Generator</h2>
//           <p className="subtitle">Create strong, secure passwords instantly</p>
//         </div>

//         <div className="card-body">
//           {/* Password Length Selector */}
//           <div className="input-group">
//             <label htmlFor="length">Password Length:</label>
//             <select
//               id="length"
//               value={length}
//               onChange={handleLengthChange}
//               disabled={isLoading}
//             >
//               {Array.from({ length: 13 }, (_, i) => i + 8).map((val) => (
//                 <option key={val} value={val}>{val}</option>
//               ))}
//             </select>
//           </div>

//           {/* Generate Button */}
//           <button
//             onClick={generatePassword}
//             className={`generate-button ${isLoading ? "loading" : ""}`}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <span className="spinner"></span> Generating...
//               </>
//             ) : (
//               "✨ Generate Password"
//             )}
//           </button>

//           {/* Error Handling */}
//           {error && <div className="error-message">⚠️ {error}</div>}

//           {/* Generated Password Section */}
//           {password && (
//             <div className="generated-password-section">
//               <div className="password-display">
//                 <span className="password-label">Your Password:</span>
//                 <div className="password-value">{password}</div>
//               </div>
//               <button
//                 onClick={copyToClipboard}
//                 className="copy-button"
//                 aria-label="Copy to clipboard"
//               >
//                 {copied ? "✅ Copied!" : "📋 Copy"}
//               </button>
//             </div>
//           )}
//         </div>

        
//         <div className="card-footer">
//           <p className="tip-text">
//             <strong>Tip:</strong> Use a password manager to store this securely.
//           </p>
//         </div>
//       </div>
//   );
// }

// export default PasswordGenerator;
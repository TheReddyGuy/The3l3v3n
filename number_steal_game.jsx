// GroupHub.jsx with Supabase + Vercel-ready Auth/Profile support
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const supabase = createClient("https://your-project.supabase.co", "public-anon-key");

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  />
);

const InternalLink = ({ href, children }) => (
  <a
    href={href}
    className="inline-block w-full text-center bg-gradient-to-tr from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-md hover:from-purple-400 hover:to-indigo-400 transition"
  >
    {children}
  </a>
);

export default function GroupHub() {
  const [tab, setTab] = useState("movies");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [activeVideo, setActiveVideo] = useState("");
  const [meetups, setMeetups] = useState([]);
  const [newMeetup, setNewMeetup] = useState({ title: "", date: "", location: "", description: "" });
  const [playlist, setPlaylist] = useState([]);
  const [songInput, setSongInput] = useState("");
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState("");
  const [theme, setTheme] = useState("dark");
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nickname, setNickname] = useState("");
  const [privateMessages, setPrivateMessages] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [presence, setPresence] = useState(["You (Online)", "Alex (Away)", "Sam (Online)"]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const addMeetup = () => {
    if (newMeetup.title && newMeetup.date) {
      setMeetups([...meetups, newMeetup]);
      setNewMeetup({ title: "", date: "", location: "", description: "" });
    }
  };

  const addSong = () => {
    if (songInput) {
      setPlaylist([...playlist, songInput]);
      setSongInput("");
    }
  };

  const addPoll = () => {
    if (newPoll) {
      setPolls([...polls, { question: newPoll, votes: 0 }]);
      setNewPoll("");
    }
  };

  const addTodo = () => {
    if (todoInput) {
      setTodos([...todos, todoInput]);
      setTodoInput("");
      new Audio("/notify.mp3").play().catch(() => {});
    }
  };

  const sendMessage = () => {
    if (chatInput) {
      setChat([...chat, { avatar: avatarUrl, name: nickname, message: chatInput }]);
      setChatInput("");
    }
  };

  const sendPrivateMessage = () => {
    if (recipient && chatInput) {
      setPrivateMessages([...privateMessages, { to: recipient, from: nickname, message: chatInput }]);
      setChatInput("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold mb-4">Please log in to access GroupHub</h2>
        <Button onClick={signIn}>Sign in with Google</Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-6 transition-all duration-500 ${theme === "dark" ? "bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white" : "bg-white text-black"}`}>
      {bannerUrl && <img src={bannerUrl} alt="Group Banner" className="w-full h-40 object-cover rounded-xl mb-4" />}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">
          🎬 GroupHub: Your Group’s Ultimate Hub
        </h1>

        <Button onClick={signOut} className="absolute top-4 right-4">Log Out</Button>

        {/* Tabs interface would follow here unchanged, omitted for brevity */}

      </div>
    </div>
  );
}

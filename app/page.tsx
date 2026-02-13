  "use client";

  import { useEffect, useState } from "react";
  import { supabase } from "@/lib/supabase";

  export default function Home() {
    const [session, setSession] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [bookmarks, setBookmarks] = useState<any[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");


    useEffect(() => {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    }, []);

    useEffect(() => {
      if (session) {
        fetchBookmarks();

        const channel = supabase
          .channel("realtime-bookmarks")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookmarks" },
            () => {
              fetchBookmarks();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }, [session]);

    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      setBookmarks(data || []);
    };

    const addBookmark = async () => {
    if (!title || !url) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title,
          url,
          user_id: session.user.id,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    setBookmarks((prev) => [...(data || []), ...prev]);

    setTitle("");
    setUrl("");
  };


    const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  };

  const updateBookmark = async (id: string) => {
    if (!editTitle || !editUrl) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .update({
        title: editTitle,
        url: editUrl,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error(error);
      return;
    }

    // 🔥 Update state instantly
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, ...data?.[0] } : bookmark
      )
    );

    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };



    if (!session) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-6">
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-10 w-full max-w-md text-center text-white">
      
      <h1 className="text-3xl font-bold mb-4">Smart Bookmark</h1>
      <p className="text-white/70 mb-8">
        Save and manage your favorite links securely.
      </p>

      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({ provider: "google" })
        }
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="22px"
          height="22px"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.04 1.53 7.42 2.81l5.48-5.48C33.74 4.09 29.34 2 24 2 14.82 2 6.89 7.48 3.23 15.44l6.66 5.18C11.56 14.04 17.23 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.92-2.18 5.4-4.66 7.07l7.18 5.59C43.93 37.6 46.1 31.53 46.1 24.5z"
          />
          <path
            fill="#FBBC05"
            d="M9.89 28.62A14.48 14.48 0 019.5 24c0-1.6.27-3.15.75-4.62l-6.66-5.18A23.95 23.95 0 002 24c0 3.77.9 7.34 2.59 10.38l6.66-5.18z"
          />
          <path
            fill="#34A853"
            d="M24 46c6.48 0 11.92-2.14 15.89-5.82l-7.18-5.59c-2 1.34-4.57 2.13-8.71 2.13-6.77 0-12.44-4.54-14.11-10.62l-6.66 5.18C6.89 40.52 14.82 46 24 46z"
          />
        </svg>
        Continue with Google
      </button>

    </div>
  </div>
      );
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-wide">
            Smart Bookmark
          </h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white/20 border border-white/30 p-3 rounded-lg flex-1 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-white/20 border border-white/30 p-3 rounded-lg flex-1 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={addBookmark}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 rounded-lg font-semibold transition"
          >
            Add
          </button>
        </div>

        {bookmarks.map((bookmark) => (
    <div
      key={bookmark.id}
      className="flex justify-between items-center bg-white/10 border border-white/20 p-4 mb-3 rounded-xl hover:bg-white/20 transition"
    >
      {editingId === bookmark.id ? (
  <div className="flex w-full gap-3 items-center">
    <input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      className="bg-white/20 border border-white/30 p-2 rounded-lg flex-1 text-white"
    />
    <input
      value={editUrl}
      onChange={(e) => setEditUrl(e.target.value)}
      className="bg-white/20 border border-white/30 p-2 rounded-lg flex-1 text-white"
    />

    <div className="flex gap-3">
      <button
        onClick={() => updateBookmark(bookmark.id)}
        className="px-3 py-1 bg-green-500 hover:bg-green-400 rounded-lg text-sm"
      >
        Save
      </button>
      <button
        onClick={() => setEditingId(null)}
        className="px-3 py-1 bg-gray-500 hover:bg-gray-400 rounded-lg text-sm"
      >
        Cancel
      </button>
    </div>
  </div>
) : (

        <>
          <a
            href={bookmark.url}
            target="_blank"
            className="text-indigo-300 hover:underline flex-1"
          >
            {bookmark.title}
          </a>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingId(bookmark.id);
                setEditTitle(bookmark.title);
                setEditUrl(bookmark.url);
              }}
              className="text-yellow-400 hover:text-yellow-300"
            >
              Edit
            </button>

            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  ))}


      </div>
    </div>
  )
  }

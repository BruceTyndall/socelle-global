import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, User, CheckCircle } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface Comment {
  id: string;
  user_id: string;
  author: string;
  content: string;
  likes: number;
  created_at: string;
  user_has_liked?: boolean;
}

interface GlobalCommentThreadProps {
  topicId: string; // The ID of the Product, Signal, or Course this thread belongs to
  title?: string;
  className?: string;
}

export function GlobalCommentThread({ topicId, title = 'Discussion', className = '' }: GlobalCommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [topicId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('global_comments')
      .select(`
        id,
        user_id,
        content,
        likes,
        created_at,
        profiles!inner ( first_name, last_name )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((c: any) => ({
        ...c,
        author: `${c.profiles.first_name} ${c.profiles.last_name}`.trim() || 'User',
      }));
      setComments(mapped);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    const { error } = await supabase.from('global_comments').insert({
      topic_id: topicId,
      user_id: user.id,
      content: newComment.trim()
    });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const toggleLike = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    setComments(prev => prev.map(c => 
      c.id === id 
        ? { ...c, likes: c.user_has_liked ? c.likes - 1 : c.likes + 1, user_has_liked: !c.user_has_liked }
        : c
    ));

    await supabase.rpc('toggle_comment_like', { target_comment_id: id });
    fetchComments(); // Refresh state
  };

  return (
    <div className={`bg-mn-surface rounded-2xl p-6 border border-graphite/5 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-graphite/60" />
        <h3 className="text-base font-sans font-semibold text-graphite">{title}</h3>
        <span className="text-xs font-sans text-graphite/40 ml-2">{comments.length} comments</span>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="mb-8 relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add to the discussion..."
          className="w-full bg-white border border-graphite/10 rounded-xl px-4 py-3 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent resize-none placeholder:text-graphite/30"
          rows={3}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="absolute bottom-3 right-3 w-8 h-8 bg-accent text-white rounded-lg flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Thread */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-graphite/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-graphite/40" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-sans font-semibold text-graphite">{comment.author}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-signal-up" />
                <span className="text-xs font-sans text-graphite/40 ml-auto">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-sans text-graphite/70 leading-relaxed mb-2">
                {comment.content}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleLike(comment.id)}
                  disabled={!user}
                  className={`flex items-center gap-1.5 text-xs font-sans transition-colors group ${comment.user_has_liked ? 'text-signal-warn' : 'text-graphite/40 hover:text-signal-warn'}`}
                >
                  <Heart className={`w-3.5 h-3.5 transition-all ${comment.user_has_liked ? 'fill-signal-warn' : 'group-hover:fill-signal-warn'}`} />
                  <span>{comment.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

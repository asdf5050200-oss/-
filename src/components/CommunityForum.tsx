/**
 * Community Discussion & Pattern Sharing Forum (討論交流與版路牌支分享)
 * 
 * Requirement 8:
 * 討論交流，用戶可以分享最水的版路和牌支
 */
import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, Sparkles, Send, PlusCircle, ArrowUpRight, Flame } from 'lucide-react';
import { ForumPost } from '../types/markSix';
import { MarkSixBall } from './MarkSixBall';

interface CommunityForumProps {
  initialPosts: ForumPost[];
  onImportToKeypad: (numbers: number[]) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  initialPosts,
  onImportToKeypad,
}) => {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ForumPost['patternType']>('特碼分析');
  const [newNumbersStr, setNewNumbersStr] = useState('');

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const categories = [
    { label: '全部版路', value: 'all' },
    { label: '特碼分析', value: '特碼分析' },
    { label: '尾數拖牌', value: '尾數拖牌' },
    { label: '波色五行', value: '波色五行' },
    { label: '九宮連號', value: '九宮連號' },
  ];

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.patternType === activeCategory);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newC = {
          id: `c_${Date.now()}`,
          author: '熱心彩民',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lucky_fan',
          text,
          time: '剛剛',
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newC],
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    // Parse numbers like "4, 18, 24, 30"
    const parsedNums = newNumbersStr
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 49);

    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      author: '香港發哥',
      authorBadge: '常中彩友',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hk_fat_gor',
      title: newTitle.trim(),
      content: newContent.trim(),
      patternType: newCategory,
      recommendedPicks: parsedNums.length > 0 ? parsedNums : [7, 18, 24, 33, 42, 49],
      likes: 1,
      commentsCount: 0,
      comments: [],
      createdAt: '剛剛',
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewNumbersStr('');
    setShowNewPostModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span className="text-base font-bold text-white">技術交流社區 · 版路心水推薦</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            各路大師分享最水牌支與連開版路，點擊號碼可一鍵導入小鍵盤自動核獎！
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPostModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#176FC1] hover:bg-[#155ea5] text-white font-semibold text-xs shadow-md shadow-blue-900/30 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>發佈版路牌支</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3">
        {categories.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setActiveCategory(c.value)}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === c.value
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 mt-2">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
          >
            {/* Author info & tags */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200">{post.author}</span>
                    {post.authorBadge && (
                      <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded font-medium border border-amber-800/40">
                        {post.authorBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{post.createdAt}</span>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {post.patternType}
              </span>
            </div>

            {/* Post Title & Content */}
            <h4 className="text-sm font-bold text-slate-100 mt-2 mb-1 leading-snug">
              {post.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {post.content}
            </p>

            {/* Recommended Picks (牌支) Strip with Import button */}
            {post.recommendedPicks && post.recommendedPicks.length > 0 && (
              <div className="mt-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    推薦牌支:
                  </span>
                  {post.recommendedPicks.map((n) => (
                    <MarkSixBall key={n} number={n} size="xs" />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onImportToKeypad(post.recommendedPicks)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/40 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>導入小鍵盤核對</span>
                </button>
              </div>
            )}

            {/* Post Interactions (Likes & Comments) */}
            <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.likes} 讚</span>
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} 回覆</span>
                </span>
              </div>
            </div>

            {/* Comments list if any */}
            {post.comments && post.comments.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-900 space-y-1.5">
                {post.comments.map((c) => (
                  <div key={c.id} className="text-[11px] bg-slate-900/60 p-2 rounded-lg flex items-start gap-2">
                    <img src={c.avatar} alt={c.author} className="w-5 h-5 rounded-full shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">{c.author}</span>
                        <span className="text-[9px] text-slate-500">{c.time}</span>
                      </div>
                      <div className="text-slate-400 mt-0.5">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                placeholder="寫下你的版路見解與回覆..."
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleAddComment(post.id)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Publish New Post */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">分享我的版路與牌支</h3>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">版路類型</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ForumPost['patternType'])}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2"
                >
                  <option value="特碼分析">特碼分析</option>
                  <option value="波色五行">波色五行</option>
                  <option value="尾數拖牌">尾數拖牌</option>
                  <option value="九宮連號">九宮連號</option>
                  <option value="綜合心水">綜合心水</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">貼文標題</label>
                <input
                  type="text"
                  required
                  placeholder="例：【精準版路】雙龍出海，本期必出特碼..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">推薦號碼牌支 (以逗號或空格分隔 1-49)</label>
                <input
                  type="text"
                  placeholder="例：7, 18, 24, 33, 42"
                  value={newNumbersStr}
                  onChange={(e) => setNewNumbersStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">版路分析心得</label>
                <textarea
                  rows={4}
                  required
                  placeholder="詳細描述您的出號規律、連號推演或生肖五行依據..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#176FC1] hover:bg-[#155ea5] text-white font-bold shadow-md cursor-pointer"
                >
                  確認發佈
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

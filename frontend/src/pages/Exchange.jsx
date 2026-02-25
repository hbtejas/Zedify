import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
};

const Exchange = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await exchangeAPI.getMyExchanges();
        setExchanges(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRespond = async (exchangeId, action) => {
    try {
      const { data } = await exchangeAPI.respondExchange(exchangeId, action);
      setExchanges((prev) => prev.map((e) => (e._id === exchangeId ? data.data : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await exchangeAPI.completeExchange(id);
      setExchanges((prev) => prev.map((e) => (e._id === id ? { ...e, status: 'completed' } : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = filter === 'all' ? exchanges : exchanges.filter((e) => e.status === filter);
  const counts = {
    all: exchanges.length,
    pending: exchanges.filter((e) => e.status === 'pending').length,
    accepted: exchanges.filter((e) => e.status === 'accepted').length,
    completed: exchanges.filter((e) => e.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Skill Exchanges</h1>
          <Link to="/" className="btn-secondary text-sm">Find Students</Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[['all', 'All'], ['pending', 'Pending'], ['accepted', 'Active'], ['completed', 'Completed']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === val ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label} {counts[val] > 0 && <span className="ml-1 opacity-80">({counts[val]})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">🔄</div>
            <p className="font-medium text-gray-600">No exchanges {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
            {filter === 'all' && (
              <p className="text-sm mt-1">Visit a student's profile to send your first exchange request!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ex) => {
              const isSender = ex.senderId?._id === user._id;
              const otherUser = isSender ? ex.receiverId : ex.senderId;

              return (
                <div key={ex._id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${otherUser?._id}`}>
                        {otherUser?.profilePicture ? (
                          <img src={otherUser.profilePicture} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {otherUser?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link to={`/profile/${otherUser?._id}`} className="font-semibold text-gray-900 hover:underline text-sm">
                          {otherUser?.name}
                        </Link>
                        <p className="text-xs text-gray-500">{isSender ? 'You sent this' : 'Sent to you'} • {new Date(ex.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[ex.status]}`}>
                      {ex.status.charAt(0).toUpperCase() + ex.status.slice(1)}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{ex.skillOffered}</span>
                    <span className="text-gray-400 font-bold">⇌</span>
                    <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">{ex.skillRequested}</span>
                  </div>

                  {ex.message && (
                    <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 rounded-lg px-3 py-2">"{ex.message}"</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {/* Receiver actions on pending */}
                    {!isSender && ex.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRespond(ex._id, 'accepted')}
                          className="flex-1 btn-primary text-sm py-2"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => handleRespond(ex._id, 'rejected')}
                          className="flex-1 btn-secondary text-sm py-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          ❌ Decline
                        </button>
                      </>
                    )}
                    {/* Mark complete if accepted */}
                    {ex.status === 'accepted' && (
                      <>
                        <Link to={`/chat/${otherUser?._id}`} className="flex-1 btn-secondary text-sm py-2 text-center">
                          💬 Chat
                        </Link>
                        <button
                          onClick={() => handleComplete(ex._id)}
                          className="flex-1 btn-primary text-sm py-2"
                        >
                          🏆 Mark Complete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exchange;

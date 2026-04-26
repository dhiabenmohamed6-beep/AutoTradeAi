import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminAPI, supportAPI } from '../services/api';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [analyses, setAnalyses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [activeAdminTicket, setActiveAdminTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeAdminTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeAdminTicket?._id, activeAdminTicket?.messages?.length]);

  useEffect(() => {
    fetchData();
  }, []);

  const activeAdminTicketId = activeAdminTicket?._id;

  useEffect(() => {
    if (activeTab === 'support') {
      const fetchSupportTickets = async () => {
        try {
          const res = await supportAPI.getAllTickets();
          setSupportTickets(res.data);
          if (activeAdminTicketId) {
            const updated = res.data.find(t => t._id === activeAdminTicketId);
            if (updated) setActiveAdminTicket(updated);
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchSupportTickets();
      const interval = setInterval(fetchSupportTickets, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeAdminTicketId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, analysesRes, contactsRes, subsRes, supportRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getAnalyses(),
        adminAPI.getContacts(),
        adminAPI.getPendingSubscriptions(),
        supportAPI.getAllTickets()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAnalyses(analysesRes.data);
      setContacts(contactsRes.data);
      setPendingSubs(subsRes.data);
      setSupportTickets(supportRes.data);
      if (activeAdminTicket) {
        const updated = supportRes.data.find(t => t._id === activeAdminTicket._id);
        if (updated) setActiveAdminTicket(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveSubscription(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectSubscription(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupportReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeAdminTicket) return;
    try {
      const res = await supportAPI.replyToTicket(activeAdminTicket._id, { message: replyMessage });
      const updated = res.data;
      setSupportTickets(supportTickets.map(t => t._id === updated._id ? updated : t));
      setActiveAdminTicket(updated);
      setReplyMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTicket = async (id) => {
    try {
      const res = await supportAPI.closeTicket(id);
      const updated = res.data.ticket;
      setSupportTickets(supportTickets.map(t => t._id === updated._id ? updated : t));
      if (activeAdminTicket?._id === updated._id) setActiveAdminTicket(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-outfit text-4xl font-bold text-white mb-8">
          {t('admin.title')}
        </h1>

        <div className="flex gap-4 mb-8 flex-wrap">
          {['stats', 'users', 'subscriptions', 'analyses', 'contacts', 'support'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-accent text-black'
                  : 'bg-card text-gray-300 hover:bg-accent/10'
              }`}
            >
              {t(`admin.${tab}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <p className="text-gray-400 text-sm mb-2">{t('admin.totalUsers')}</p>
                  <p className="font-outfit text-4xl font-bold text-white">{stats.totalUsers || 0}</p>
                </div>
                <div className="card">
                  <p className="text-gray-400 text-sm mb-2">{t('admin.activeSubs')}</p>
                  <p className="font-outfit text-4xl font-bold text-accent">{stats.activeSubscriptions || 0}</p>
                </div>
                <div className="card">
                  <p className="text-gray-400 text-sm mb-2">{t('admin.pendingPayments')}</p>
                  <p className="font-outfit text-4xl font-bold text-yellow-500">{stats.pendingPayments || 0}</p>
                </div>
                <div className="card">
                  <p className="text-gray-400 text-sm mb-2">{t('admin.totalAnalyses')}</p>
                  <p className="font-outfit text-4xl font-bold text-white">{stats.totalAnalyses || 0}</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">Role</th>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">Trial</th>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="px-4 py-3 text-white">{u.name}</td>
                          <td className="px-4 py-3 text-gray-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-gray-700 text-gray-300'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.trialActive && u.trialExpiresAt && new Date(u.trialExpiresAt) > new Date() ? (
                              <span className="text-accent">Active</span>
                            ) : (
                              <span className="text-gray-400">Expired</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              {t('admin.delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="card overflow-hidden">
                {pendingSubs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No pending subscriptions</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">User</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Plan</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Method</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pendingSubs.map((sub) => (
                          <tr key={sub._id}>
                            <td className="px-4 py-3 text-white">
                              {sub.userId?.name}<br/>
                              <span className="text-gray-400 text-sm">{sub.userId?.email}</span>
                            </td>
                            <td className="px-4 py-3 text-white">{sub.plan}</td>
                            <td className="px-4 py-3 text-gray-400">{sub.paymentMethod}</td>
                            <td className="px-4 py-3 text-gray-400">
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleApprove(sub._id)}
                                className="text-accent hover:text-accent/80 text-sm mr-4"
                              >
                                {t('admin.approve')}
                              </button>
                              <button
                                onClick={() => handleReject(sub._id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                {t('admin.reject')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analyses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((analysis) => (
                  <div key={analysis._id} className="card">
                    <img
                      src={analysis.imageUrl}
                      alt="Chart"
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <p className={`font-bold ${
                      analysis.result.signal === 'Buy' ? 'signal-buy' :
                      analysis.result.signal === 'Sell' ? 'signal-sell' : 'signal-hold'
                    }`}>
                      {analysis.result.signal}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {analysis.userId?.name || 'Unknown'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact._id} className={`card ${!contact.read ? 'border-l-4 border-l-accent' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-outfit font-semibold text-white">{contact.name}</p>
                        <p className="text-gray-400 text-sm">{contact.email}</p>
                        <p className="text-white mt-2">{contact.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'support' && (
              <div className="flex gap-6 h-[600px]">
                <div className="w-1/3 bg-secondary border border-border rounded-xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="text-white font-bold">Support Tickets</h2>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {supportTickets.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 text-sm">No tickets found.</div>
                    ) : (
                      supportTickets.map(ticket => (
                        <div 
                          key={ticket._id}
                          onClick={() => setActiveAdminTicket(ticket)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${activeAdminTicket?._id === ticket._id ? 'bg-accent/20 border border-accent/50' : 'bg-card hover:bg-card/80 border border-transparent'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-white font-medium truncate pr-2">{ticket.subject}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs truncate">
                            {ticket.userId?.name || 'Unknown User'}
                          </p>
                          <p className="text-gray-500 text-[10px] mt-1">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="w-2/3 bg-secondary border border-border rounded-xl flex flex-col overflow-hidden">
                  {activeAdminTicket ? (
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b border-border bg-card flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold text-white">{activeAdminTicket.subject}</h2>
                          <p className="text-sm text-gray-400">
                            By {activeAdminTicket.userId?.name} ({activeAdminTicket.userId?.email})
                          </p>
                        </div>
                        {activeAdminTicket.status === 'open' && (
                          <button 
                            onClick={() => handleCloseTicket(activeAdminTicket._id)}
                            className="btn-secondary text-sm py-1 px-3"
                          >
                            Close Ticket
                          </button>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-primary/30">
                        {activeAdminTicket.messages.map((msg, index) => (
                          <div key={index} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.sender === 'admin' ? 'bg-accent text-black rounded-tr-none' : 'bg-card border border-border text-gray-200 rounded-tl-none'
                            }`}>
                              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 mx-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="p-4 border-t border-border bg-card">
                        <form onSubmit={handleSupportReply} className="flex gap-2">
                          <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type a reply to the user..."
                            className="input-field flex-1 !py-3"
                          />
                          <button type="submit" disabled={!replyMessage.trim()} className="btn-primary !px-6">
                            Reply
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      Select a ticket to view and reply
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;

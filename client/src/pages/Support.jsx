import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supportAPI } from '../services/api';

const Support = () => {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // Reply state
  const [replyMessage, setReplyMessage] = useState('');
  const messagesEndRef = useRef(null);

  const activeTicketId = activeTicket?._id;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await supportAPI.getUserTickets();
        setTickets(res.data);
        if (activeTicketId) {
          const updatedActive = res.data.find(t => t._id === activeTicketId);
          if (updatedActive) setActiveTicket(updatedActive);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [activeTicketId]);

  useEffect(() => {
    if (activeTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?._id, activeTicket?.messages?.length]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await supportAPI.createTicket({ subject: newSubject, message: newMessage });
      setTickets([res.data, ...tickets]);
      setActiveTicket(res.data);
      setIsCreating(false);
      setNewSubject('');
      setNewMessage('');
      alert('Support ticket submitted successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit ticket. Please ensure your backend server has been restarted.');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    try {
      const res = await supportAPI.replyToTicket(activeTicket._id, { message: replyMessage });
      const updatedTicket = res.data;
      setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
      setActiveTicket(updatedTicket);
      setReplyMessage('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send reply. Please ensure your backend server has been restarted.');
    }
  };

  return (
    <div className="min-h-screen bg-primary pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
        <h1 className="font-outfit text-3xl font-bold text-white mb-6">
          Support Inbox
        </h1>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Left Panel: Ticket List */}
          <div className="w-1/3 bg-secondary border border-border rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="text-white font-bold">Your Conversations</h2>
              <button 
                onClick={() => { setIsCreating(true); setActiveTicket(null); }}
                className="btn-primary py-1 px-3 text-sm"
              >
                + New
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {loading ? (
                 <div className="text-center text-gray-400 py-4">Loading...</div>
              ) : tickets.length === 0 ? (
                 <div className="text-center text-gray-500 py-8 text-sm">No conversations yet.</div>
              ) : (
                tickets.map(ticket => (
                  <div 
                    key={ticket._id}
                    onClick={() => { setActiveTicket(ticket); setIsCreating(false); }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${activeTicket?._id === ticket._id ? 'bg-accent/20 border border-accent/50' : 'bg-card hover:bg-card/80 border border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-white font-medium truncate pr-2">{ticket.subject}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      {ticket.messages[ticket.messages.length - 1]?.content || 'No messages'}
                    </p>
                    <p className="text-gray-500 text-[10px] mt-2">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Active Ticket / New Ticket Form */}
          <div className="w-2/3 bg-secondary border border-border rounded-xl flex flex-col overflow-hidden">
            {isCreating ? (
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-6">Open a New Support Ticket</h2>
                <form onSubmit={handleCreateTicket} className="space-y-4 flex-1">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Subject</label>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="input-field"
                      placeholder="Briefly describe your issue"
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-gray-400 text-sm mb-2">Message</label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="input-field flex-1 resize-none min-h-[200px]"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary mr-3">Cancel</button>
                    <button type="submit" className="btn-primary">Submit Ticket</button>
                  </div>
                </form>
              </div>
            ) : activeTicket ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border bg-card">
                  <h2 className="text-xl font-bold text-white">{activeTicket.subject}</h2>
                  <p className="text-sm text-gray-400">Started on {new Date(activeTicket.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-primary/30">
                  {activeTicket.messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'user' ? 'bg-accent text-black rounded-tr-none' : 'bg-card border border-border text-gray-200 rounded-tl-none'
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
                  {activeTicket.status === 'closed' ? (
                    <div className="text-center text-gray-400 py-2">
                      This ticket is closed. If you have a new issue, please open a new ticket.
                    </div>
                  ) : (
                    <form onSubmit={handleReply} className="flex gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="input-field flex-1 !py-3"
                      />
                      <button type="submit" disabled={!replyMessage.trim()} className="btn-primary !px-6">
                        Send
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Select a conversation or start a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

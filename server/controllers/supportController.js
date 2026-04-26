const SupportTicket = require('../models/SupportTicket');
const db = require('../config/db');

// Helper to format ticket for frontend
const formatTicket = (ticket) => {
  if (!ticket) return null;
  return {
    _id: ticket.id.toString(),
    userId: ticket.user_id ? { id: ticket.user_id, name: ticket.user_name, email: ticket.user_email } : null,
    subject: ticket.subject,
    status: ticket.status,
    messages: ticket.messages || [],
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at
  };
};

// Format without user details (for user-facing)
const formatTicketSimple = (ticket) => {
  if (!ticket) return null;
  return {
    _id: ticket.id.toString(),
    userId: ticket.user_id,
    subject: ticket.subject,
    status: ticket.status,
    messages: ticket.messages || [],
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at
  };
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      subject,
      message
    });

    res.status(201).json(formatTicketSimple(ticket));
  } catch (error) {
    console.error('Support ticket creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findByUser(req.user.id);
    res.json(tickets.map(formatTicketSimple));
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll();
    res.json(tickets.map(formatTicket));
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isAdmin = req.user.is_admin;
    const isOwner = ticket.user_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    if (ticket.status === 'closed' && !isAdmin) {
      return res.status(400).json({ message: 'Cannot reply to a closed ticket' });
    }

    const sender = isAdmin ? 'admin' : 'user';

    // Add message
    let updatedTicket = await SupportTicket.addMessage(id, sender, message);

    // If user replied and ticket was closed, reopen it
    if (!isAdmin && ticket.status === 'closed') {
      await db.query("UPDATE support_tickets SET status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
      updatedTicket.status = 'open';
    }

    // Format response based on who is replying
    const formatted = isAdmin ? formatTicket(updatedTicket) : formatTicketSimple(updatedTicket);
    res.json(formatted);
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Only admins can close tickets' });
    }

    const closedTicket = await SupportTicket.close(id);
    res.json({ message: 'Ticket closed successfully', ticket: formatTicket(closedTicket) });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ message: error.message });
  }
};

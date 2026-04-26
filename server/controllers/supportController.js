const SupportTicket = require('../models/SupportTicket');

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = new SupportTicket({
      userId: req.user._id,
      subject,
      messages: [{ sender: 'user', content: message }]
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate('userId', 'name email').sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
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

    // Authorization: User can only reply to their own tickets. Admins can reply to any.
    const isAdmin = req.user.role === 'admin';
    const isOwner = ticket.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    if (ticket.status === 'closed' && !isAdmin) {
      return res.status(400).json({ message: 'Cannot reply to a closed ticket' });
    }

    const sender = isAdmin ? 'admin' : 'user';
    
    // If admin replies, and the ticket was closed, maybe reopen it automatically or keep it closed? 
    // Usually if user replies, it should definitely reopen. But let's just push the message.
    if (!isAdmin && ticket.status === 'closed') {
       ticket.status = 'open'; // Reopen if user replies
    }

    ticket.messages.push({ sender, content: message });
    await ticket.save();

    res.json(ticket);
  } catch (error) {
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

    ticket.status = 'closed';
    await ticket.save();
    
    res.json({ message: 'Ticket closed successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

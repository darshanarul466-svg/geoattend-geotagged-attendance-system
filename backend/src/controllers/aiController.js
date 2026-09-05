const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getDatabase } = require('../config/database');

/**
 * Handle AI Library Chatbot queries
 */
exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.'
      });
    }

    const db = getDatabase();

    // Pull live context from catalog
    const books = db.prepare('SELECT book_id, title, author, category, available_copies, total_copies, shelf_location FROM books').all();
    const stats = db.prepare('SELECT COUNT(*) as total_titles, SUM(total_copies) as total_copies, SUM(available_copies) as available_copies FROM books').get();

    const catalogContext = books.map(b => 
      `- [${b.book_id}] "${b.title}" by ${b.author} | Cat: ${b.category} | Avail: ${b.available_copies}/${b.total_copies} | Location: ${b.shelf_location}`
    ).join('\n');

    const systemPrompt = `You are "LibraBot", the intelligent AI assistant for the LibraHub SRMIST Library.
You assist librarians and students with book recommendations, finding shelf locations, checking real-time book availability, and explaining library loan regulations.

Here is the current live library catalog and inventory:
${catalogContext}

General Library Rules:
- Standard student loan duration: 14 days.
- Overdue fine: ₹5.00 per day after the due date.
- Books can be checked out or returned using QR code scanning at the librarian desk.
- Total distinct titles in library: ${stats.total_titles}, Total physical copies: ${stats.total_copies}.

Instructions:
- Be concise, professional, warm, and helpful.
- When recommending or discussing books, mention their exact title, author, and Book ID if they exist in our catalog.
- If a book is in our catalog, clearly tell the user how many copies are currently available and where it is located.
- If asked for something not in the catalog, give insightful academic recommendations and suggest asking the librarian to procure it.`;

    const apiKey = (req.body.apiKey && req.body.apiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        apiKeyRequired: true,
        reply: "⚠️ Gemini AI is not configured. Please enter your Gemini API key in the AI drawer settings or configure GEMINI_API_KEY in your server environment to enable live generative responses."
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
      const reply = result.response.text();
      return res.json({
        success: true,
        provider: 'Google Gemini (gemini-1.5-flash)',
        reply
      });
    } catch (geminiError) {
      console.warn('[Gemini AI] API error:', geminiError.message);
      return res.status(500).json({
        success: false,
        message: `Gemini AI Error: ${geminiError.message}. Please check your API key.`
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * AI Auto-Fill / Auto-categorize book by Title or ISBN
 */
exports.autoFillBookMetadata = async (req, res, next) => {
  try {
    const { title, isbn } = req.body;

    if (!title && !isbn) {
      return res.status(400).json({
        success: false,
        message: 'Book Title or ISBN is required for AI autofill.'
      });
    }

    const apiKey = (req.body.apiKey && req.body.apiKey.trim()) || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Given the book title "${title || ''}" or ISBN "${isbn || ''}", provide a JSON object with:
- "author": likely author name(s)
- "category": choose the most fitting among ["Computer Science", "Engineering", "AI & Data Science", "Mathematics", "Fiction", "Self-Help", "General Science"]
- "shelf_location": a sensible shelf code like "Rack CS-02-B" or "Rack AI-01-A"
- "description": a concise 2-sentence synopsis
Respond ONLY with a valid JSON block.`;

        const result = await model.generateContent(prompt);
        let jsonText = result.response.text().trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?/, '').trim();
        }
        const data = JSON.parse(jsonText);
        return res.json({ success: true, metadata: data });
      } catch (err) {
        console.warn('[Gemini AI] Metadata generation fallback:', err.message);
      }
    }

    // Local heuristic fallback for common titles
    const query = (title || isbn || '').toLowerCase();
    let author = 'Unknown Author';
    let category = 'Computer Science';
    let shelf = 'Rack CS-01-A';
    let description = 'Academic reference volume for university curriculum.';

    if (query.includes('algorithm') || query.includes('clrs')) {
      author = 'T. Cormen, C. Leiserson, R. Rivest, C. Stein';
      category = 'Mathematics';
      shelf = 'Rack CS-03-A';
      description = 'Definitive reference covering algorithms, data structures, dynamic programming, and complexity.';
    } else if (query.includes('python') || query.includes('ai') || query.includes('learning')) {
      author = 'Stuart Russell & Peter Norvig';
      category = 'AI & Data Science';
      shelf = 'Rack AI-01-B';
      description = 'Core exploration of machine learning, heuristic search, neural networks, and modern intelligence systems.';
    } else if (query.includes('system') || query.includes('network')) {
      author = 'Andrew S. Tanenbaum';
      category = 'Computer Science';
      shelf = 'Rack CS-02-B';
      description = 'Fundamental guide to operating systems, networking protocols, and distributed architecture.';
    }

    res.json({
      success: true,
      metadata: {
        author,
        category,
        shelf_location: shelf,
        description
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Heuristic response generator when no Gemini API key is set
 */
function generateLocalResponse(message, books) {
  const query = message.toLowerCase();

  if (query.includes('fine') || query.includes('rule') || query.includes('due') || query.includes('policy')) {
    return `📚 **Library Loan Policy**:
- **Loan Duration**: 14 calendar days from the date of issue.
- **Overdue Penalty**: ₹5.00 per calendar day for unreturned books.
- **Renewals**: Can be processed via the librarian desk or by presenting the book QR code.
- **Damage/Loss**: Subject to replacement cost plus administrative fees.`;
  }

  if (query.includes('how many') || query.includes('total') || query.includes('count')) {
    const totalAvail = books.reduce((sum, b) => sum + b.available_copies, 0);
    return `Currently, we have **${books.length} distinct book titles** in the catalog with a total of **${totalAvail} copies available** for immediate checkout across Computer Science, Engineering, Mathematics, AI, and Literature.`;
  }

  // Check if searching for a specific book in our catalog
  const matching = books.filter(b => 
    query.includes(b.title.toLowerCase()) || 
    b.title.toLowerCase().includes(query) ||
    query.includes(b.category.toLowerCase())
  );

  if (matching.length > 0) {
    const top = matching.slice(0, 3);
    const list = top.map(b => 
      `• **${b.title}** by *${b.author}* (ID: \`${b.book_id}\`)\n  - Status: ${b.available_copies > 0 ? `🟢 **${b.available_copies} of ${b.total_copies} available**` : '🔴 **Currently checked out**'}\n  - Location: \`${b.shelf_location}\``
    ).join('\n\n');
    return `Here is what I found in our library collection:\n\n${list}\n\nYou can issue any available title by scanning its QR code at the desk!`;
  }

  if (query.includes('recommend') || query.includes('suggest') || query.includes('study')) {
    return `💡 **Recommended Reading from our Collection**:
1. **Clean Code** by Robert C. Martin (ID: \`BK00123\`) — Essential for software engineering best practices.
2. **Introduction to Algorithms (CLRS)** (ID: \`BK01314\`) — Ideal for data structures, campus interview prep, and competitive programming.
3. **Designing Data-Intensive Applications** by Martin Kleppmann (ID: \`BK02025\`) — The gold standard for modern distributed backend systems.

Would you like to check the shelf location or issue status of any of these?`;
  }

  return `Hello! I am **LibraBot**, your library AI assistant. 
I can help you check real-time availability, find book shelf locations, recommend titles for your studies, or answer questions about borrowing rules and overdue fines. 

What book or topic would you like to explore today?`;
}

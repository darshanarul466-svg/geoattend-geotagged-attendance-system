import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './pages/DashboardView';
import BooksView from './pages/BooksView';
import MembersView from './pages/MembersView';
import TransactionsView from './pages/TransactionsView';
import LoginPage from './pages/LoginPage';
import QRScannerModal from './components/QRScannerModal';
import QRBadgeModal from './components/QRBadgeModal';
import IssueModal from './components/IssueModal';
import ReturnModal from './components/ReturnModal';
import AddBookModal from './components/AddBookModal';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import CommandPalette from './components/CommandPalette';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('librahub_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('librahub_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data states
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState([]);
  const [usageTrend, setUsageTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isQRBadgeOpen, setIsQRBadgeOpen] = useState(false);
  const [selectedQRBook, setSelectedQRBook] = useState(null);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [selectedIssueBook, setSelectedIssueBook] = useState(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedReturnBook, setSelectedReturnBook] = useState(null);
  const [selectedReturnLoan, setSelectedReturnLoan] = useState(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  // Sync dark mode class with DOM and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('librahub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('librahub_theme', 'light');
    }
  }, [darkMode]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, booksData, borrowersData, txData] = await Promise.all([
        api.getDashboardStats(),
        api.getBooks(),
        api.getBorrowers(),
        api.getTransactions()
      ]);

      setStats(dashData.stats);
      setCategories(dashData.categories || []);
      setRecentTransactions(dashData.recentTransactions || []);
      setRecentlyAddedBooks(dashData.recentlyAddedBooks || []);
      setUsageTrend(dashData.usageTrend || []);

      setBooks(booksData.books || []);
      setBorrowers(borrowersData.borrowers || []);
      setTransactions(txData.transactions || []);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('librahub_current_user', JSON.stringify(user));
    showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = () => {
    localStorage.removeItem('librahub_current_user');
    setCurrentUser(null);
    showToast('Signed out successfully.');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleScannerAction = (actionType, data) => {
    if (actionType === 'ISSUE') {
      setSelectedIssueBook(data.book);
      setIsIssueOpen(true);
    } else if (actionType === 'RETURN') {
      setSelectedReturnBook(data.book);
      setSelectedReturnLoan(data.loan);
      setIsReturnOpen(true);
    }
  };

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
  };

  // If not logged in, render the Login Page!
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700/50 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        overdueCount={stats ? stats.overdueCount : 0}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          overdueCount={stats ? stats.overdueCount : 0}
          onOpenAI={() => setIsAIOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              categories={categories}
              recentTransactions={recentTransactions}
              recentlyAddedBooks={recentlyAddedBooks}
              usageTrend={usageTrend}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenAddBook={() => setIsAddBookOpen(true)}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              onNavigate={handleNavigate}
              onOpenAI={() => setIsAIOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'books' && (
            <BooksView
              books={books}
              categories={categories.map(c => c.category || c)}
              onOpenAddBook={() => setIsAddBookOpen(true)}
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectQRBook={(book) => {
                setSelectedQRBook(book);
                setIsQRBadgeOpen(true);
              }}
              onSelectIssueBook={(book) => {
                setSelectedIssueBook(book);
                setIsIssueOpen(true);
              }}
              onRefresh={loadData}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              borrowers={borrowers}
              onRefresh={loadData}
              isAddModalOpen={isAddMemberOpen}
              setIsAddModalOpen={setIsAddMemberOpen}
            />
          )}

          {(activeTab === 'transactions' || activeTab === 'reports') && (
            <TransactionsView
              transactions={transactions}
              onRefresh={loadData}
              onTriggerReturn={(book, loan) => {
                setSelectedReturnBook(book);
                setSelectedReturnLoan(loan);
                setIsReturnOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectAction={handleScannerAction}
        booksList={books}
      />

      <QRBadgeModal
        isOpen={isQRBadgeOpen}
        onClose={() => {
          setIsQRBadgeOpen(false);
          setSelectedQRBook(null);
        }}
        book={selectedQRBook}
      />

      <IssueModal
        isOpen={isIssueOpen}
        onClose={() => {
          setIsIssueOpen(false);
          setSelectedIssueBook(null);
        }}
        book={selectedIssueBook}
        borrowersList={borrowers}
        onSuccess={(msg) => {
          showToast(msg);
          loadData();
        }}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => {
          setIsReturnOpen(false);
          setSelectedReturnBook(null);
          setSelectedReturnLoan(null);
        }}
        book={selectedReturnBook}
        preSelectedLoan={selectedReturnLoan}
        onSuccess={(msg) => {
          showToast(msg);
          loadData();
        }}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          loadData();
        }}
      />

      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        books={books}
        borrowers={borrowers}
        onNavigate={handleNavigate}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
      />
    </div>
  );
}

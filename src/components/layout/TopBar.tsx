import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { projects, setMobileSidebarOpen } = useProjectStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  const searchResults = searchQuery.length > 1 ? {
    projects: projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))),
    tickets: projects.flatMap(p => p.tickets.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.code.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ ...t, projectName: p.name, pId: p.id }))),
  } : null;

  return (
    <header className="h-14 bg-surface-primary border-b border-brd-subtle flex items-center justify-between px-3 sm:px-6 gap-2 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 -ml-1 rounded-md text-txt-secondary hover:text-txt-primary hover:bg-surface-card transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-mono text-base sm:text-lg font-semibold text-txt-primary truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <button onClick={() => setSearchOpen(!searchOpen)} className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-surface-card border border-brd-subtle text-txt-secondary text-xs hover:border-brd-medium transition-colors" aria-label="Search">
            <Search size={14} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline ml-2 px-1 py-0.5 rounded bg-surface-secondary text-[10px] text-txt-muted border border-brd-subtle">/</kbd>
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-10 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-surface-modal border border-brd-medium rounded-lg shadow-lg z-50 animate-modal-in">
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, tickets..."
                className="w-full px-4 py-3 bg-transparent text-sm text-txt-primary border-b border-brd-subtle outline-none placeholder:text-txt-muted"
              />
              {searchResults && (
                <div className="max-h-64 overflow-y-auto scrollbar-thin p-2">
                  {searchResults.projects.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-txt-muted px-2">Projects</span>
                      {searchResults.projects.map(p => (
                        <button key={p.id} onClick={() => { navigate(`/project/${p.id}`); setSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-txt-secondary hover:bg-surface-card rounded transition-colors">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tickets.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] uppercase tracking-wider text-txt-muted px-2">Tickets</span>
                      {searchResults.tickets.slice(0, 8).map((t: any) => (
                        <button key={t.id} onClick={() => { navigate(`/project/${t.pId}`); setSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-txt-secondary hover:bg-surface-card rounded transition-colors">
                          <span className="font-code text-txt-muted">{t.code}</span>
                          <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.projects.length === 0 && searchResults.tickets.length === 0 && (
                    <p className="text-xs text-txt-muted px-2 py-4 text-center">No results found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button className="hidden sm:flex p-2 rounded-md text-txt-muted hover:text-txt-secondary hover:bg-surface-card transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-card border border-brd-subtle flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-txt-secondary" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;

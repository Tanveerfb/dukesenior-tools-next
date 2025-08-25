"use client";
import Link from 'next/link';
import { Navbar, Nav, Container, Dropdown, Button, Badge, InputGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { FaCalendarAlt, FaSearch, FaSun, FaMoon, FaUserCircle, FaTools, FaChevronRight, FaChevronDown, FaSitemap, FaListOl, FaChartBar, FaPlayCircle, FaFont, FaPlus, FaMinus, FaUndo } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import SearchModal from '@/components/navigation/SearchModal';
// taggedManifest import removed (unused)

// Simple classification using tags; later can fetch /api for dynamic updates
interface EffectiveMeta { path:string; staticTags:string[]; effective:string[]; title:string; }

function mapHref(path:string){ return path.replace(/\[id\]/,'example-id'); }

export default function MainNavbar(){
  const { user, logout, admin } = useAuth();
  const { theme, toggleTheme, fontScale, increaseFont, decreaseFont, resetFont } = useTheme();
  const [showSearch,setShowSearch] = useState(false);
  const [effective,setEffective] = useState<EffectiveMeta[]>([]);
  const [loading,setLoading] = useState(true);
  const [registry,setRegistry] = useState<{name:string;data:{color?:string}}[]>([]);
  const [expanded,setExpanded] = useState(false); // navbar collapse state
  const pathname = usePathname();
  useEffect(()=>{ (async()=>{ try { const res = await fetch('/api/tags/effective'); if(res.ok){ setEffective(await res.json()); } const reg = await fetch('/api/tags/registry'); if(reg.ok){ setRegistry(await reg.json()); } } finally { setLoading(false); } })(); },[]);
  // tagColor unused after design simplification; remove to satisfy linter.

  // Group tournament pages (exclude run/detail pages needing an id)
  type Grouped = Record<string, EffectiveMeta[]>;
  const currentGroups: Grouped = {};
  const pastGroups: Grouped = {};
  function tournamentKey(path:string, eff:string[]): string | null {
    const tag = eff.find(t => /^PhasmoTourney\d+$/i.test(t));
    if(tag) return tag.replace('PhasmoTourney','Tourney ');
    // fallback path heuristics
    if(/tourney4/i.test(path)) return 'Tourney 4';
    if(/tourney3/i.test(path)) return 'Tourney 3';
    if(/tourney2/i.test(path)) return 'Tourney 2';
    if(/tourney1|phasmotourneyData/i.test(path)) return 'Tourney 1';
    return null;
  }
  effective.filter(m => m.effective.includes('Event')).forEach(m => {
    // Exclude dynamic detail pages (any route containing a dynamic segment)
    if(m.path.includes('[')) return;
    const key = tournamentKey(m.path, m.effective);
    if(!key) return;
    const target = m.effective.includes('Current') ? currentGroups : pastGroups;
    if(!target[key]) target[key] = [];
    target[key].push(m);
  });
  // Sort groups by tournament number desc for current, asc for past
  function sortGroupKeys(groups: Grouped, reverse=false){
    return Object.keys(groups).sort((a,b)=>{
      const na = parseInt(a.replace(/\D/g,''))||0;
      const nb = parseInt(b.replace(/\D/g,''))||0;
      return reverse ? nb - na : na - nb;
    });
  }
  const currentKeys = sortGroupKeys(currentGroups, true);
  const pastKeys = sortGroupKeys(pastGroups, true); // newest first
  const [openGroup,setOpenGroup] = useState<Record<string,boolean>>({});
  const toggleGroup = (name:string) => setOpenGroup(s => ({...s, [name]: !s[name]}));
  const resetGroups = useCallback(()=> setOpenGroup({}), []);

  // Collapse navbar & reset tournament group state on route change
  useEffect(()=> { setExpanded(false); resetGroups(); }, [pathname, resetGroups]);
  function labelFor(meta: EffectiveMeta){
  // Unified runs list (e.g., /phasmotourney-series/phasmotourney3/runs)
  if(/\/runs$/i.test(meta.path)) return 'Runs';
    if(/standings/i.test(meta.path)) return 'Standings';
    if(/recordedruns|records/i.test(meta.path)) return 'Recorded Runs';
    if(/stats/i.test(meta.path)) return 'Stats';
    if(/bracket/i.test(meta.title||'')) return 'Bracket';
    // Root bracket pages: tourney4, phasmoTourney3
    if(/tourney4$|phasmoTourney3$/i.test(meta.path)) return 'Bracket';
    return meta.title || meta.path;
  }
  function iconFor(label:string){
    switch(label){
      case 'Bracket': return <FaSitemap className="me-1" />;
      case 'Standings': return <FaListOl className="me-1" />;
      case 'Stats': return <FaChartBar className="me-1" />;
      case 'Recorded Runs': return <FaPlayCircle className="me-1" />;
      default: return null;
    }
  }
  const tools = effective.filter(m => m.effective.includes('Tool'));

  // No custom mount / mobile handling (keep logic minimal)

  // Only collapse via route change effect; do not auto-hide when clicking inside
  function handleSearchOpen(){ setShowSearch(true); setExpanded(false); }

  // Dynamic styling based on current theme (light/dark)
  const navbarStyle: React.CSSProperties = theme === 'dark' ? {
    background: 'linear-gradient(100deg, #6c1e70 0%, #5a1d62 30%, #245f46 90%)'
  } : {
    background: 'linear-gradient(100deg, #f2eefb 0%, #ffffff 40%, #e3f7ef 100%)',
    borderBottom: '1px solid rgba(0,0,0,0.08)'
  };

  return (
    <>
      {/* Redesigned nav: gradient background, clearer sectioning, minimal custom styling */}
      <Navbar
        expand="lg"
        fixed="top"
        expanded={expanded}
        onToggle={(val)=> setExpanded(!!val)}
        className="shadow-sm border-0"
        style={navbarStyle}
      >
        <Container fluid className="py-1">
          <div className="d-flex align-items-center gap-3">
            <Navbar.Brand as={Link} href="/" className="fw-semibold d-flex align-items-center gap-2" style={theme==='dark'?{color:'#fff'}:{color:'#3b2a47'}}>
              <span style={{fontSize:'1.15rem'}}>The Lair of Evil Tools</span>
              <Badge bg={theme==='dark'? 'secondary':'success'} pill className="d-none d-md-inline">Beta</Badge>
            </Navbar.Brand>
            <Navbar.Toggle aria-label="Toggle navigation" className="border-0" />
          </div>
          <Navbar.Collapse>
            <Nav className="me-auto align-items-lg-stretch gap-lg-1 mt-3 mt-lg-0">
              {admin && (
                <Nav.Item>
                  <Nav.Link as={Link} href="/admin/cms" className="fw-semibold">CMS Admin</Nav.Link>
                </Nav.Item>
              )}
              <Dropdown as={Nav.Item} className="nav-item-compact">
                <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-1 px-3 rounded-3">
                  <FaCalendarAlt /> <span className="d-lg-none">Events</span>
                  <span className="d-none d-lg-inline fw-medium">Events</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2" style={{minWidth:'22rem'}}>
                  <div className="small text-uppercase fw-bold text-muted px-2 pb-1">Current Events</div>
                  {loading && <div className="px-2 py-1"><Spinner size="sm" animation="border" className="me-2" />Loading…</div>}
                  {!loading && !currentKeys.length && <div className="px-2 py-1 text-muted">None</div>}
                  {currentKeys.map(k => {
                    const list = currentGroups[k].sort((a,b)=> a.path.localeCompare(b.path));
                    const open = !!openGroup[k];
                    return (
                      <div key={k} className="mb-1 rounded-2 overflow-hidden">
                        <button
                          type="button"
                          className="dropdown-item py-2 d-flex justify-content-between align-items-center bg-body-secondary bg-opacity-10"
                          onClick={()=> toggleGroup(k)}
                          aria-expanded={open}
                          style={{fontWeight:600}}
                        >
                          <span className="d-flex align-items-center">{open ? <FaChevronDown className="me-1"/> : <FaChevronRight className="me-1"/>}{k}</span>
                          <span>{list[0].effective.filter(t=> t.startsWith('PhasmoTourney')).slice(0,1).map(t=> <Badge key={t} bg="secondary" pill>{t.replace('PhasmoTourney','T')}</Badge>)}</span>
                        </button>
                        {open && (
                          <div className="bg-dark bg-opacity-10 border-start border-2 border-secondary-subtle">
                            {list.map(m => { const lbl = labelFor(m); return (
                              <Dropdown.Item key={m.path} as={Link} href={mapHref(m.path)} className="ps-5 d-flex align-items-center gap-1 small py-1">
                                {iconFor(lbl)}{lbl}
                              </Dropdown.Item>
                            ); })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="small text-uppercase fw-bold text-muted px-2 pt-2">Past Events</div>
                  {!pastKeys.length && <div className="px-2 py-1 text-muted">None</div>}
                  {pastKeys.map(k => {
                    const list = pastGroups[k].sort((a,b)=> a.path.localeCompare(b.path));
                    const open = !!openGroup[k];
                    return (
                      <div key={k} className="mb-1 rounded-2 overflow-hidden">
                        <button
                          type="button"
                          className="dropdown-item py-2 d-flex justify-content-between align-items-center bg-body-secondary bg-opacity-10"
                          onClick={()=> toggleGroup(k)}
                          aria-expanded={open}
                          style={{fontWeight:600}}
                        >
                          <span className="d-flex align-items-center">{open ? <FaChevronDown className="me-1"/> : <FaChevronRight className="me-1"/>}{k}</span>
                          <span>{list[0].effective.filter(t=> t.startsWith('PhasmoTourney')).slice(0,1).map(t=> <Badge key={t} bg="secondary" pill>{t.replace('PhasmoTourney','T')}</Badge>)}</span>
                        </button>
                        {open && (
                          <div className="bg-dark bg-opacity-10 border-start border-2 border-secondary-subtle">
                            {list.map(m => { const lbl = labelFor(m); return (
                              <Dropdown.Item key={m.path} as={Link} href={mapHref(m.path)} className="ps-5 d-flex align-items-center gap-1 small py-1">
                                {iconFor(lbl)}{lbl}
                              </Dropdown.Item>
                            ); })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown as={Nav.Item} className="nav-item-compact">
                <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-1 px-3 rounded-3">
                  <FaTools /> <span className="d-lg-none">Tools</span>
                  <span className="d-none d-lg-inline fw-medium">Tools</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2" style={{minWidth:'18rem'}}>
                  {tools.length === 0 && <div className="px-2 py-1 text-muted small">No tools</div>}
                  {tools.map(m=> (
                    <Dropdown.Item key={m.path} as={Link} href={mapHref(m.path)} className="d-flex justify-content-between align-items-center rounded-2">
                      <span className="small">{m.title || m.path}</span>
                      <span className="d-flex gap-1">{m.effective.filter(t=> ['AI','ToDo'].includes(t)).slice(0,2).map(t=> <Badge key={t} bg="secondary" className="text-uppercase small" style={{fontSize:'0.55rem'}}>{t}</Badge>)}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
            <div className="d-lg-flex align-items-center gap-3 ms-lg-3 mt-3 mt-lg-0">
              <div className="d-flex align-items-center gap-2">
                <InputGroup size="sm" className="search-trigger" role="search">
                  <Button
                    variant={theme==='dark'? 'outline-light':'outline-secondary'}
                    onClick={handleSearchOpen}
                    className="d-flex align-items-center gap-1 bg-opacity-75"
                    style={theme==='light'?{borderColor:'#bbb', color:'#333'}:undefined}
                  >
                    <FaSearch /> <span className="d-none d-xl-inline small">Search</span>
                  </Button>
                </InputGroup>
                <Dropdown align="end" as={Nav.Item} className="a11y-dropdown">
                  <Dropdown.Toggle
                    as={Button}
                    size="sm"
                    variant={theme==='dark'? 'outline-light':'outline-secondary'}
                    className="d-flex align-items-center gap-1"
                    style={theme==='light'?{borderColor:'#bbb', color:'#333'}:undefined}
                  ><FaFont /> <span className="d-none d-xl-inline">A11y</span></Dropdown.Toggle>
                  <Dropdown.Menu className="p-2 small" data-bs-theme={theme==='dark'?'dark':'light'}>
                    <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                      <span className="fw-semibold">Text Size</span>
                      <span className="text-muted">{Math.round(fontScale*100)}%</span>
                    </div>
                    <div className="d-flex gap-2 mb-2">
                      <Button size="sm" variant="secondary" onClick={decreaseFont} aria-label="Decrease text size"><FaMinus /></Button>
                      <Button size="sm" variant="secondary" onClick={increaseFont} aria-label="Increase text size"><FaPlus /></Button>
                      <Button size="sm" variant="outline-secondary" onClick={resetFont} aria-label="Reset text size"><FaUndo /></Button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-1 px-1">
                      <span className="fw-semibold">Theme</span>
                      <Button size="sm" variant={theme==='dark'?'light':'secondary'} onClick={toggleTheme} aria-label="Toggle dark mode">{theme==='dark'? <FaSun /> : <FaMoon />}</Button>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
                {user ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle size="sm" variant="secondary" className="d-flex align-items-center gap-1">
                      <FaUserCircle /> <span className="d-none d-xl-inline">{user.displayName || 'Profile'}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="small">
                      <Dropdown.Item as={Link} href="/profile">Profile</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Link href="/login" className="text-decoration-none"><Button size="sm" variant="secondary">Login</Button></Link>
                )}
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Spacer to offset fixed navbar height */}
      <div style={{height:'70px'}} />
      <SearchModal show={showSearch} onHide={()=> setShowSearch(false)} />
    </>
  );
}

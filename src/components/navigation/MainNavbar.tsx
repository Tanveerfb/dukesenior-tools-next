"use client";
import Link from 'next/link';
import InlineLink from '@/components/ui/InlineLink';
import { Navbar, Nav, Container, Dropdown, Button, Badge, InputGroup, Spinner, Accordion, OverlayTrigger, Popover } from 'react-bootstrap';
import { Offcanvas } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import {
  FaCalendarAlt,
  FaSearch,
  FaSun,
  FaMoon,
  FaUserCircle,
  FaTools,
  FaSitemap,
  FaListOl,
  FaChartBar,
  FaPlayCircle,
  FaFont,
  FaPlus,
  FaMinus,
  FaUndo,
} from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { getUserByUID } from '@/lib/services/users';
import { usePathname, useRouter } from 'next/navigation';
import SearchModal from '@/components/navigation/SearchModal';
// taggedManifest import removed (unused)

// Simple classification using tags; later can fetch /api for dynamic updates
interface EffectiveMeta { path:string; staticTags:string[]; effective:string[]; title:string; }

function mapHref(path:string){ return path.replace(/\[id\]/,'example-id'); }

export default function MainNavbar(){
  const { user, logout, admin } = useAuth();
  const [profileHref, setProfileHref] = useState('/profile');
  const { theme, toggleTheme, fontScale, increaseFont, decreaseFont, resetFont } = useTheme();
  const [showSearch,setShowSearch] = useState(false);
  const [effective,setEffective] = useState<EffectiveMeta[]>([]);
  const [loading,setLoading] = useState(true);
  const [registry,setRegistry] = useState<{name:string;data:{color?:string}}[]>([]);
  const [expanded,setExpanded] = useState(false); // navbar collapse state
  const [eventsShow,setEventsShow] = useState(false);
  const [toolsShow,setToolsShow] = useState(false);
  const [adminShow,setAdminShow] = useState(false);
  const [communityShow,setCommunityShow] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(()=>{ (async()=>{ try { const res = await fetch('/api/tags/effective'); if(res.ok){ setEffective(await res.json()); } const reg = await fetch('/api/tags/registry'); if(reg.ok){ setRegistry(await reg.json()); } } finally { setLoading(false); } })(); },[]);

  // Resolve user -> public username if available so navbar links to /profile/[username]
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        if(!user?.uid){ if(mounted) setProfileHref('/profile'); return; }
        const doc = await getUserByUID(user.uid);
        if(!mounted) return;
        if(doc?.username) setProfileHref(`/profile/${doc.username}`);
        else setProfileHref('/profile');
      }catch(_){ if(mounted) setProfileHref('/profile'); }
    })();
    return ()=>{ mounted = false; };
  }, [user?.uid]);
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
  useEffect(()=> { setExpanded(false); resetGroups(); setEventsShow(false); setToolsShow(false); setAdminShow(false); setCommunityShow(false); }, [pathname, resetGroups]);
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
          <div className="d-flex align-items-center w-100">
            {/* Left: Brand (no Beta) */}
            <div className="left-brand d-flex align-items-center mx-2">
              <Navbar.Brand as={InlineLink} href="/" className="fw-semibold d-flex align-items-center gap-2 mx-2" style={theme==='dark'?{color:'#fff'}:{color:'#3b2a47'}}>
                <span style={{fontSize:'1.15rem'}}>The Lair of Evil Tools</span>
              </Navbar.Brand>
            </div>

            {/* Center: Nav links (visible on lg) */}
            <div className="center-nav flex-grow-1 d-none d-lg-flex justify-content-center">
              <Nav className="align-items-lg-stretch gap-lg-1 mt-0">
                {admin && (
                  <Dropdown as={Nav.Item} className="nav-item-compact" show={adminShow} onToggle={(next)=> setAdminShow(!!next)}>
                    <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-1 px-3 rounded-3">
                      <FaUserCircle /> <span className="d-none d-lg-inline fw-medium">Admin</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="p-2" style={{minWidth:'14rem'}}>
                      <Dropdown.Item as={InlineLink} href="/admin/cms" className="fw-semibold" onClick={()=>{ setAdminShow(false); setExpanded(false); }}>CMS Admin</Dropdown.Item>
                      <Dropdown.Item as={InlineLink} href="/admin/suggestions" className="fw-semibold" onClick={()=>{ setAdminShow(false); setExpanded(false); }}>Suggestions</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}

                <Dropdown as={Nav.Item} className="nav-item-compact" show={communityShow} onToggle={(next)=> setCommunityShow(!!next)}>
                  <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-1 px-3 rounded-3">
                    <FaSitemap /> <span className="d-none d-lg-inline fw-medium">Community</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="p-2" style={{minWidth:'12rem'}}>
                    <Dropdown.Item as={InlineLink} href="/posts" onClick={()=>{ setCommunityShow(false); setExpanded(false); }}>Posts</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown as={Nav.Item} className="nav-item-compact" show={eventsShow} onToggle={(next)=> setEventsShow(!!next)}>
                  <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-1 px-3 rounded-3">
                    <FaCalendarAlt /> <span className="d-none d-lg-inline fw-medium">Events</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="p-3" style={{minWidth:'28rem'}}>
                    <div className="small text-uppercase fw-bold text-muted">Events</div>
                    {loading && <div className="px-2 py-1"><Spinner size="sm" animation="border" className="me-2" />Loading…</div>}
                    <Accordion flush>
                      {currentKeys.map((k, idx) => {
                        const list = currentGroups[k].sort((a,b)=> a.path.localeCompare(b.path));
                        const badge = list[0]?.effective.filter(t=> t.startsWith('PhasmoTourney')).slice(0,1)[0];
                        return (
                          <Accordion.Item eventKey={`current-${idx}`} key={k}>
                            <Accordion.Header className="fw-semibold">{k} {badge && <Badge bg="secondary" pill className="ms-2">{badge.replace('PhasmoTourney','T')}</Badge>}</Accordion.Header>
                            <Accordion.Body className="p-0">
                              <div className="list-group list-group-flush">
                                {list.map(m => (
                                  <Link key={m.path} href={mapHref(m.path)} className="list-group-item list-group-item-action small ps-3 d-flex align-items-center gap-1" onClick={()=>{ setEventsShow(false); setExpanded(false); }}>
                                    {iconFor(labelFor(m))}{labelFor(m)}
                                  </Link>
                                ))}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                      <Accordion.Item eventKey="past">
                        <Accordion.Header className="fw-semibold">Past Events</Accordion.Header>
                        <Accordion.Body className="p-0">
                          <div className="list-group list-group-flush">
                            {!pastKeys.length && <div className="px-3 py-2 text-muted small">None</div>}
                            {pastKeys.map(k => {
                              const list = pastGroups[k].sort((a,b)=> a.path.localeCompare(b.path));
                              return (
                                <div key={k} className="px-0">
                                  <div className="small text-muted px-3 py-2 fw-medium">{k} <span className="ms-2">{list[0].effective.filter(t=> t.startsWith('PhasmoTourney')).slice(0,1).map(t=> <Badge key={t} bg="secondary" pill className="ms-1">{t.replace('PhasmoTourney','T')}</Badge>)}</span></div>
                                  {list.map(m => (
                                    <Link key={m.path} href={mapHref(m.path)} className="list-group-item list-group-item-action small ps-4 d-flex align-items-center gap-1" onClick={()=>{ setEventsShow(false); setExpanded(false); }}>
                                      {iconFor(labelFor(m))}{labelFor(m)}
                                    </Link>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown as={Nav.Item} className="nav-item-compact">
                  <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-1 px-3 rounded-3">
                    <FaTools /> <span className="d-none d-lg-inline fw-medium">Tools</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="p-2" style={{minWidth:'18rem'}}>
                    <Dropdown.Item as={InlineLink} href="/todolist" className="d-flex justify-content-between align-items-center rounded-2" onClick={()=>{ setToolsShow(false); setExpanded(false); }}>To‑Do</Dropdown.Item>
                    {tools.length === 0 && <div className="px-2 py-1 text-muted small">No tools</div>}
                    {tools.map(m=> (
                      <Dropdown.Item key={m.path} as={InlineLink} href={mapHref(m.path)} className="d-flex justify-content-between align-items-center rounded-2" onClick={()=>{ setToolsShow(false); setExpanded(false); }}>
                        <span className="small">{m.title || m.path}</span>
                        <span className="d-flex gap-1">{m.effective.filter(t=> ['AI','ToDo'].includes(t)).slice(0,2).map(t=> <Badge key={t} bg="secondary" className="text-uppercase small" style={{fontSize:'0.55rem'}}>{t}</Badge>)}</span>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </div>

            {/* Right: controls + toggle */}
            <div className="right-controls d-flex align-items-center ms-auto gap-2">
              <Navbar.Toggle aria-label="Toggle navigation" className="border-0" onClick={()=> setShowOffcanvas(true)} />
              <div className="d-flex align-items-center gap-2">
                {/* Search first on large screens (hidden on mobile) */}
                <Button size="lg" variant={theme==='dark'? 'outline-light':'outline-secondary'} className="d-none d-lg-inline-flex d-flex align-items-center gap-2" onClick={handleSearchOpen} style={theme==='light'?{borderColor:'#bbb', color:'#333'}:undefined}>
                  <FaSearch />
                </Button>
                {/* On large screens these are visible; on mobile the search is inside collapse */}
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={
                    <Popover id="a11y-popover" className="shadow-lg" style={{minWidth:220}} data-bs-theme={theme==='dark'?'dark':'light'}>
                      <Popover.Header as="h3" className="fw-semibold">Accessibility</Popover.Header>
                      <Popover.Body>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-semibold">Text Size</span>
                          <span className="text-muted">{Math.round(fontScale*100)}%</span>
                        </div>
                        <div className="d-flex gap-2 mb-2">
                          <Button size="sm" variant="secondary" onClick={decreaseFont} aria-label="Decrease text size"><FaMinus /></Button>
                          <Button size="sm" variant="secondary" onClick={increaseFont} aria-label="Increase text size"><FaPlus /></Button>
                          <Button size="sm" variant="outline-secondary" onClick={resetFont} aria-label="Reset text size"><FaUndo /></Button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold">Theme</span>
                          <Button size="sm" variant={theme==='dark'?'light':'secondary'} onClick={toggleTheme} aria-label="Toggle dark mode">{theme==='dark'? <FaSun /> : <FaMoon />}</Button>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <Button size="lg" variant={theme==='dark'? 'outline-light':'outline-secondary'} className="d-flex align-items-center gap-2" style={theme==='light'?{borderColor:'#bbb', color:'#333'}:undefined}>
                    <FaFont />
                  </Button>
                </OverlayTrigger>

                {user ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle size="lg" variant="secondary" className="d-flex align-items-center gap-2">
                      <FaUserCircle />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="small">
                      <Dropdown.Item as={InlineLink} href={profileHref}>Profile</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Button size="lg" variant="secondary" onClick={()=> router.push('/login')}>login'</Button>
                )}
              </div>
            </div>
          </div>

          {/* Collapse: visible on mobile when toggled - contains nav and search */}
          {/* Mobile: use Offcanvas for a richer mobile menu */}
          <Offcanvas show={showOffcanvas} onHide={()=>{ setShowOffcanvas(false); setExpanded(false); }}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>The Lair of Evil Tools</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="navbar-nav">
                {admin && (
                  <Accordion flush className="w-100 mb-2">
                    <Accordion.Item eventKey="admin">
                      <Accordion.Header className="d-flex align-items-center gap-2"><FaUserCircle /> <span className="fw-medium">Admin</span></Accordion.Header>
                      <Accordion.Body className="p-0">
                        <div className="list-group list-group-flush">
                          <InlineLink href="/admin/cms" className="list-group-item list-group-item-action" onClick={()=>{ setShowOffcanvas(false); }}>
                            CMS Admin
                          </InlineLink>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )}
                <Accordion flush className="w-100 mb-2">
                  <Accordion.Item eventKey="community">
                    <Accordion.Header className="d-flex align-items-center gap-2"><FaSitemap /> <span className="fw-medium">Community</span></Accordion.Header>
                    <Accordion.Body className="p-0">
                      <div className="list-group list-group-flush">
                        <InlineLink href="/posts" className="list-group-item list-group-item-action" onClick={()=> setShowOffcanvas(false)}>Posts</InlineLink>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                <Accordion flush className="w-100 mb-2">
                  <Accordion.Item eventKey="events">
                    <Accordion.Header className="fw-semibold d-flex align-items-center gap-2"><FaCalendarAlt /> <span className="fw-medium">Events</span></Accordion.Header>
                    <Accordion.Body className="p-0">
                      <div className="small text-uppercase fw-bold text-muted px-3 pt-2">Events</div>
                      {loading && <div className="px-3 py-1"><Spinner size="sm" animation="border" className="me-2" />Loading…</div>}
                      <Accordion flush>
                        {currentKeys.map((k, idx) => {
                          const list = currentGroups[k].sort((a,b)=> a.path.localeCompare(b.path));
                          return (
                            <Accordion.Item eventKey={`c-${idx}`} key={k}>
                              <Accordion.Header className="fw-semibold">{k}</Accordion.Header>
                              <Accordion.Body className="p-0">
                                {list.map(m => (
                                  <InlineLink key={m.path} href={mapHref(m.path)} className="list-group-item list-group-item-action small ps-3" onClick={()=>{ setShowOffcanvas(false); }}>{labelFor(m)}</InlineLink>
                                ))}
                              </Accordion.Body>
                            </Accordion.Item>
                          );
                        })}
                        <Accordion.Item eventKey="c-past">
                          <Accordion.Header className="fw-semibold">Past Events</Accordion.Header>
                          <Accordion.Body className="p-0">
                            {pastKeys.map(k => (
                              <div key={k} className="px-0">
                                <div className="small text-muted px-3 py-2 fw-medium">{k}</div>
                                {pastGroups[k].map(m => (
                                  <InlineLink key={m.path} href={mapHref(m.path)} className="list-group-item list-group-item-action small ps-3" onClick={()=>{ setShowOffcanvas(false); }}>{labelFor(m)}</InlineLink>
                                ))}
                              </div>
                            ))}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                <Accordion flush className="w-100 mb-2">
                  <Accordion.Item eventKey="tools">
                    <Accordion.Header className="d-flex align-items-center gap-2"><FaTools /> <span className="fw-medium">Tools</span></Accordion.Header>
                    <Accordion.Body className="p-0">
                      <div className="list-group list-group-flush">
                        <InlineLink href="/todolist" className="list-group-item list-group-item-action" onClick={()=> setShowOffcanvas(false)}>To‑Do</InlineLink>
                        {tools.map(m => (
                          <InlineLink key={m.path} href={mapHref(m.path)} className="list-group-item list-group-item-action" onClick={()=> setShowOffcanvas(false)}>{m.title || m.path}</InlineLink>
                        ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Nav>

              <div className="mt-3 px-2">
                <InputGroup className="w-100" role="search">
                  <Button size="lg" variant={theme==='dark'? 'outline-light':'outline-secondary'} onClick={()=>{ handleSearchOpen(); setShowOffcanvas(false); }} className="w-100 text-start"> 
                    <FaSearch /> <span className="ms-2">Search something...</span>
                  </Button>
                </InputGroup>
              </div>

              <div className="mt-4 d-flex gap-2">
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={
                    <Popover id="a11y-popover-mobile" className="shadow-lg" style={{minWidth:220}} data-bs-theme={theme==='dark'?'dark':'light'}>
                      <Popover.Header as="h3" className="fw-semibold">Accessibility</Popover.Header>
                      <Popover.Body>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-semibold">Text Size</span>
                          <span className="text-muted">{Math.round(fontScale*100)}%</span>
                        </div>
                        <div className="d-flex gap-2 mb-2">
                          <Button size="sm" variant="secondary" onClick={decreaseFont} aria-label="Decrease text size"><FaMinus /></Button>
                          <Button size="sm" variant="secondary" onClick={increaseFont} aria-label="Increase text size"><FaPlus /></Button>
                          <Button size="sm" variant="outline-secondary" onClick={resetFont} aria-label="Reset text size"><FaUndo /></Button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold">Theme</span>
                          <Button size="sm" variant={theme==='dark'?'light':'secondary'} onClick={toggleTheme} aria-label="Toggle dark mode">{theme==='dark'? <FaSun /> : <FaMoon />}</Button>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <Button size="lg" variant={theme==='dark'? 'outline-light':'outline-secondary'} className="d-flex align-items-center gap-2">
                    <FaFont /> <span className="d-none d-md-inline">A11y</span>
                  </Button>
                </OverlayTrigger>

                {user ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle size="lg" variant="secondary" className="d-flex align-items-center gap-2">
                      <FaUserCircle /> <span className="d-none d-md-inline">{user.displayName || user.email || 'Profile'}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="small">
                      <Dropdown.Item as={InlineLink} href={profileHref}>Profile</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={()=>{ logout(); setShowOffcanvas(false); }}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Button size="lg" variant="secondary" onClick={()=>{ router.push('/login'); setShowOffcanvas(false); }}>login'</Button>
                )}
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </Container>
      </Navbar>
      {/* Spacer to offset fixed navbar height */}
      <div style={{height:'70px'}} />
      <SearchModal show={showSearch} onHide={()=> setShowSearch(false)} />
    </>
  );
}

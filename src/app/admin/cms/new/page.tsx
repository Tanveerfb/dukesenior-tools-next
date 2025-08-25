"use client";
import { useState, useEffect } from 'react';
import { Container, Form, Button, Badge, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { createPost, listPosts, updatePost, getPost } from '@/lib/services/cms';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { useSearchParams, useRouter } from 'next/navigation';

// Shared editor page for new or existing (via ?id=)
export default function NewPostPage(){
  const { user, admin } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const editId = params.get('id');
  const [loading,setLoading] = useState(false); // retains loading spinner control
  const [saving,setSaving] = useState(false);
  const [title,setTitle] = useState('');
  const [content,setContent] = useState('');
  const [bannerUrl,setBannerUrl] = useState('');
  const [allTags,setAllTags] = useState<string[]>([]);
  const [tagQuery,setTagQuery] = useState('');
  const [selectedTags,setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown,setShowTagDropdown] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [uploadsCount,setUploadsCount] = useState(0);
  const maxImages = 10;
  const [preview,setPreview] = useState(true);

  useEffect(()=>{
    async function init(){
      if(!admin) return; setLoading(true);
      try {
        const existing = await listPosts(500); // gather tags
        const tagSet = new Set<string>(); existing.forEach(p=> (p.tags||[]).forEach((t:string)=> tagSet.add(t)));
        setAllTags(Array.from(tagSet).sort());
        if(editId){
          const post = await getPost(editId); if(post){
            setTitle(post.title); setContent(post.content); setBannerUrl(post.bannerUrl||''); setSelectedTags(post.tags||[]);
          }
        }
      } finally { setLoading(false); }
    }
    init();
  },[editId,admin]);

  if(!admin) return <Container className="py-5"><Alert variant="danger">Admin only</Alert></Container>;
  if(loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  function addTag(tag:string){ const t = tag.trim(); if(!t) return; setSelectedTags(prev => prev.includes(t)? prev : [...prev, t]); setTagQuery(''); setShowTagDropdown(false); }
  function removeTag(tag:string){ setSelectedTags(prev => prev.filter(t=> t!==tag)); }
  const filtered = allTags.filter(t=> t.toLowerCase().includes(tagQuery.toLowerCase()) && !selectedTags.includes(t)).slice(0,8);

  function insert(snippet:string){
    const el = document.getElementById('cms-editor-area') as HTMLTextAreaElement | null;
    if(!el){ setContent(c=> c+snippet); return; }
    const start = el.selectionStart; const end = el.selectionEnd;
    const updated = content.slice(0,start)+snippet+content.slice(end);
    setContent(updated);
    requestAnimationFrame(()=> { el.focus(); const pos = start + snippet.length; el.selectionStart = el.selectionEnd = pos; });
  }
  const toolbar = [
    { label:'Bold', key:'B', snippet:'**bold**' },
    { label:'Italic', key:'I', snippet:'*italic*' },
    { label:'Heading', key:'H', snippet:'\n\n## Heading\n\n' },
    { label:'List', key:'L', snippet:'\n- item 1\n- item 2\n' },
    { label:'Code', key:'C', snippet:'\n```txt\ncode here\n```\n' },
    { label:'Quote', key:'Q', snippet:'\n> quote here\n' },
    { label:'Link', key:'K', snippet:'[title](https://example.com)' },
    { label:'Image', key:'M', snippet:'![alt text](https://url/image.png)' },
    { label:'YouTube', key:'Y', snippet:'\n<!-- YT: https://www.youtube.com/watch?v=VIDEO_ID -->\n' },
    { label:'Twitch', key:'T', snippet:'\n<!-- TWITCH: channel_name -->\n' }
  ];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>){
    const files = Array.from(e.target.files||[]); if(!files.length) return; const remaining = maxImages - uploadsCount; const slice = files.slice(0,remaining); setUploading(true);
    try { for(const f of slice){ const blob = await optimize(f,1600,0.82); const id = uuid(); const storageRef = ref(storage, `cms_uploads/${id}_${f.name.replace(/[^a-zA-Z0-9_.-]/g,'_')}`); await uploadBytes(storageRef, blob, { contentType: f.type }); const url = await getDownloadURL(storageRef); insert(`\n![${f.name}](${url})\n`); setUploadsCount(c=> c+1); if(uploadsCount+1>=maxImages) break; } } finally { setUploading(false); e.target.value=''; }
  }
  async function optimize(file: File, maxWidth:number, quality:number): Promise<Blob>{ if(!file.type.startsWith('image/')) return file; const bmp = await createImageBitmap(file); const scale = Math.min(1, maxWidth/bmp.width); if(scale>=1) return file; const canvas = document.createElement('canvas'); canvas.width=Math.round(bmp.width*scale); canvas.height=Math.round(bmp.height*scale); const ctx=canvas.getContext('2d'); if(!ctx) return file; ctx.drawImage(bmp,0,0,canvas.width,canvas.height); return await new Promise(r=> canvas.toBlob(b=> r(b||file),'image/jpeg',quality)); }

  async function save(){ if(!user) return; if(!title.trim()) return; setSaving(true); try { if(editId){ await updatePost({ id: editId, title, content, bannerUrl, tags:selectedTags }); } else { await createPost(user.uid, user.email||'unknown', { title, content, bannerUrl, tags: selectedTags }); } router.push('/admin/cms'); } finally { setSaving(false); } }

  return (
    <Container className="py-4">
      <h1 className="mb-3">{editId? 'Edit Post':'New Post'}</h1>
      <Form.Group className="mb-2"><Form.Label>Title</Form.Label><Form.Control value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post title" /></Form.Group>
      <Form.Group className="mb-2"><Form.Label>Banner Image URL</Form.Label><Form.Control value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="https://..." /></Form.Group>
      <Form.Group className="mb-3 position-relative">
        <Form.Label>Tags</Form.Label>
        <div className="d-flex flex-wrap gap-2 mb-2">{selectedTags.map(t=> <Badge key={t} bg="info" className="d-flex align-items-center gap-1" style={{fontSize:'0.75rem'}}>{t}<button type="button" className="btn-close btn-close-white btn-sm ms-1" onClick={()=> removeTag(t)} aria-label={`Remove tag ${t}`}></button></Badge>)}{selectedTags.length===0 && <span className="text-muted small">No tags selected</span>}</div>
        <Form.Control value={tagQuery} placeholder="Type to search or create tag" onChange={e=> { setTagQuery(e.target.value); setShowTagDropdown(true); }} onKeyDown={e=> { if(e.key==='Enter'){ e.preventDefault(); addTag(tagQuery);} if(e.key==='Escape') setShowTagDropdown(false); }} onFocus={()=> setShowTagDropdown(true)} />
        {showTagDropdown && (filtered.length>0 || tagQuery.trim()) && (
          <div className="position-absolute w-100 bg-body border rounded shadow-sm mt-1 p-1" style={{zIndex:30, maxHeight:200, overflowY:'auto'}}>
            {filtered.map(t=> <button key={t} className="dropdown-item small" type="button" onClick={()=> addTag(t)}>{t}</button>)}
            {tagQuery.trim() && !allTags.includes(tagQuery.trim()) && !selectedTags.includes(tagQuery.trim()) && <button type="button" className="dropdown-item small text-success" onClick={()=> addTag(tagQuery.trim())}>Add new tag "{tagQuery.trim()}"</button>}
          </div>
        )}
      </Form.Group>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {toolbar.map(btn => <OverlayTrigger key={btn.label} placement="top" overlay={<Tooltip>{btn.label} (Ctrl+{btn.key})</Tooltip>}><Button size="sm" variant="secondary" onClick={()=> insert(btn.snippet)}>{btn.label}</Button></OverlayTrigger>)}
        <div className="ms-auto d-flex align-items-center gap-2"><Form.Label className="mb-0 small text-nowrap">Images ({uploadsCount}/{maxImages})</Form.Label><Form.Control type="file" multiple accept="image/*" size="sm" onChange={handleUpload} disabled={uploading || uploadsCount>=maxImages} style={{maxWidth:220}} />{uploading && <Spinner size="sm" animation="border" />}</div>
      </div>
      <Form.Group className="mb-2"><Form.Label>Content (Markdown)</Form.Label><Form.Control id="cms-editor-area" as="textarea" rows={18} value={content} onChange={e=>setContent(e.target.value)} placeholder="Write markdown here..." /></Form.Group>
      <div className="small text-muted mb-3"><strong>Shortcuts:</strong> {toolbar.map(t=> <code key={t.key} className="me-2">Ctrl+{t.key}</code>)} | Enter to add tag.</div>
      <div className="d-flex gap-2 mb-4"><Button disabled={!title.trim()||saving} onClick={save}>{saving? 'Saving...': (editId? 'Update Post':'Publish Post')}</Button><Button variant="secondary" onClick={()=> setPreview(p=> !p)}>{preview? 'Hide Preview':'Show Preview'}</Button><Button variant="outline-secondary" onClick={()=> router.push('/admin/cms')}>Back</Button></div>
      {preview && <div className="p-3 border rounded bg-dark-subtle" style={{maxHeight:'70vh', overflowY:'auto'}}><h5>Live Preview</h5>{content.trim()? <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}>{content}</ReactMarkdown>: <div className="text-muted small fst-italic">Start typing...</div>}</div>}
    </Container>
  );
}

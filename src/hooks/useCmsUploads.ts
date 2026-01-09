import { useState } from 'react';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

export function useCmsUploads(){
  const [uploading, setUploading] = useState(false);

  async function optimize(file: File, maxWidth:number, quality:number): Promise<Blob>{
    if(!file.type.startsWith('image/')) return file as unknown as Blob;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bmp.width);
    if(scale >= 1) return file as unknown as Blob;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext('2d');
    if(!ctx) return file as unknown as Blob;
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>(r => canvas.toBlob(b => r(b || (file as unknown as Blob)), 'image/jpeg', quality));
  }

  async function uploadImages(
    files: File[],
    onUploaded: (url:string, name:string)=>void,
    onProgress?: (name:string, percent:number)=>void,
    onError?: (name:string, err: any)=>void,
    maxWidth=1600,
    quality=0.82
  ): Promise<{ cancelAll: ()=>void, cancel: (name:string)=>void }> {
    if(!files || files.length===0) return Promise.resolve({ cancelAll: ()=>{}, cancel: ()=>{} });
    setUploading(true);
    const tasks = new Map<string, UploadTask>();
    let cancelled = false;
    const cancel = (name: string) => { const t = tasks.get(name); if(t){ try{ t.cancel(); }catch{} tasks.delete(name); } };
    const cancelAll = () => { cancelled = true; tasks.forEach(t=> { try{ t.cancel(); }catch{} }); tasks.clear(); };
  (async ()=>{
      try{
        for(const f of files){
          if(cancelled) break;
          try{
            const blob = await optimize(f, maxWidth, quality);
            const id = uuid();
            const safe = f.name.replace(/[^a-zA-Z0-9_.-]/g,'_');
            const storageRef = ref(storage, `cms_uploads/${id}_${safe}`);
            const task = uploadBytesResumable(storageRef, blob, { contentType: f.type });
            tasks.set(f.name, task);
            await new Promise<void>((resolve, reject) => {
              task.on('state_changed', (snapshot) => {
                if(onProgress && snapshot.totalBytes) {
                  const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                  onProgress(f.name, pct);
                }
              }, (error) => {
                tasks.delete(f.name);
                if(onError) onError(f.name, error);
                reject(error);
              }, async () => {
                try{ const url = await getDownloadURL(task.snapshot.ref); tasks.delete(f.name); onUploaded(url, f.name); resolve(); } catch(e){ tasks.delete(f.name); if(onError) onError(f.name, e); reject(e); }
              });
            });
          } catch(err){ if(onError) onError(f.name, err); }
        }
      }finally{ setUploading(false); }
  })();
  return Promise.resolve({ cancelAll, cancel });
  }

  async function uploadBanner(file: File, onProgress?: (percent:number)=>void, maxWidth=1600, quality=0.82): Promise<{url:string, cancel: ()=>void}>{
    const blob = await optimize(file, maxWidth, quality);
    const id = uuid();
    const safe = file.name.replace(/[^a-zA-Z0-9_.-]/g,'_');
    const storageRef = ref(storage, `cms_banners/${id}_${safe}`);
    const task = uploadBytesResumable(storageRef, blob, { contentType: file.type });
    const cancel = ()=> { try{ task.cancel(); }catch{} };
    await new Promise<void>((resolve, reject)=>{
      task.on('state_changed', (snapshot)=>{
        if(onProgress && snapshot.totalBytes){
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      }, (err)=> reject(err), ()=> resolve());
    });
    const url = await getDownloadURL(task.snapshot.ref);
    return { url, cancel };
  }

  return { uploading, optimize, uploadImages, uploadBanner } as const;
}

export default useCmsUploads;

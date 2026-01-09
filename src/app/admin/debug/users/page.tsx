import React from 'react';
import Link from 'next/link';
import { getUserByUID, getUserByUsername } from '@/lib/services/users';
import { adminDb } from '@/lib/firebase/admin';

export default async function Page(props: any) {
  const id = props?.searchParams?.id || '';
  let results: { type: string; data: any }[] = [];
  if (id) {
    // try username mapping
    const byName = await getUserByUsername(id);
    if (byName) results.push({ type: 'username', data: byName });

    // try uid
    const byUid = await getUserByUID(id);
    if (byUid) results.push({ type: 'uid', data: byUid });

    // direct doc at users/{id}
    try {
      const snap = await adminDb.collection('users').doc(id).get();
      if (snap.exists) results.push({ type: 'doc(users/{id})', data: snap.data() });
    } catch {
      // ignore lookup failure
    }

    // query by uid field
    try {
      const s = await adminDb.collection('users').where('uid', '==', id).get();
      s.forEach((d: any) => results.push({ type: 'query: uid field', data: d.data() }));
    } catch {
      // ignore query errors
    }

    // query by uppercase UID field (legacy)
    try {
      const sUID = await adminDb.collection('users').where('UID', '==', id).get();
      sUID.forEach((d: any) => results.push({ type: 'query: UID field', data: d.data() }));
    } catch {
      // ignore query errors
    }

    // query by Email / email
    try {
      const s2 = await adminDb.collection('users').where('Email', '==', id).get();
      s2.forEach((d: any) => results.push({ type: 'query: Email field', data: d.data() }));
    } catch {
      // ignore query errors
    }
    try {
      const s3 = await adminDb.collection('users').where('email', '==', id).get();
      s3.forEach((d: any) => results.push({ type: 'query: email field', data: d.data() }));
    } catch {
      // ignore query errors
    }

    // username mapping doc
    try {
      const mapSnap = await adminDb.collection('usernames').doc(id.toLowerCase()).get();
      if (mapSnap.exists) results.push({ type: 'usernames mapping', data: mapSnap.data() });
    } catch {
      // ignore mapping lookup errors
    }
  }

  return (
    <div className="container py-4">
      <h3>Admin: User Lookup Debug</h3>
      <p className="text-muted">Enter an identifier (username, UID, or legacy email) as <code>?id=...</code></p>
      <div className="mb-3">
        <Link href="/admin/debug/users?id=BFZ1ty8xTIYNnjQRAXFtOyl5iG42">Test Dukesenior UID</Link>
      </div>
      {id ? (
        <div>
          <h5>Results for: {id}</h5>
          {results.length === 0 && <p className="text-muted">No matches found.</p>}
          {results.map((r, i) => (
            <div key={i} className="card mb-2">
              <div className="card-body">
                <strong>{r.type}</strong>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(r.data, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted">No id provided.</div>
      )}
    </div>
  );
}

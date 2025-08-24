import { CMSPost } from '@/types/cms';

// Sample fallback posts used when Firestore has no content.
// These are read-only and reactions / comments are disabled.

const now = Date.now();

export const samplePosts: CMSPost[] = [
  {
    id: 'sample-1',
    title: 'Grafton Farmhouse Rework - Phasmophobia v0.14.0.0',
    slug: 'grafton-farmhouse-rework-phasmophobia-v0-14-0-0',
    content: `> NOTE: This is a sample post shown because no real posts exist yet.\n\n` +
      `The long-awaited Grafton Farmhouse rework has arrived with **Phasmophobia v0.14.0.0**. ` +
      `This overhaul modernizes layout clarity, improves investigation flow, and adds new ambient audio zones to heighten tension.\n\n` +
      `### Headline Changes\n` +
      `- Refreshed room geometry & improved navigation sightlines\n` +
      `- Unique hiding spot variance (per difficulty)\n` +
      `- Adjusted cursed possession spawn logic\n` +
      `- Lighting & volumetric fog tuning for mood without obscuring evidence\n\n` +
      `### Investigator Tips\n` +
      `1. Prioritize early sound sensor coverage in restructured hall junctions.\n` +
      `2. Temperature sweeps are faster: fewer dead-end pockets.\n` +
      `3. Track breaker accessibility — repositioned for slightly higher early risk.\n\n` +
      `### Performance Notes\n` +
      `Optimizations to prop batching and occlusion mean smoother frame times even on mid-tier GPUs.\n\n` +
      `<!-- YT: https://www.youtube.com/watch?v=dQw4w9WgXcQ -->\n` +
      `*(Demo YouTube embed placeholder above — replaced at runtime)*\n\n` +
      `Let us know what strategies you discover with the new layout!`,
    createdAt: now - 1000 * 60 * 60 * 24 * 2,
    updatedAt: now - 1000 * 60 * 60 * 24 * 2,
    authorUID: 'sample',
    authorName: 'System',
    bannerUrl: 'https://clan.akamai.steamstatic.com/images//37002678/748ac2aec2824da18ccd4bd38a7cfcc2cb0d3783.jpg',
    tags: ['Phasmophobia','Update','PatchNotes','Horror'],
    pinned: true,
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
  },
  {
    id: 'sample-2',
    title: 'GRN SSJ2 Kefla in Dragon Ball Legends',
    slug: 'grn-ssj2-kefla-in-dragon-ball-legends',
    content: `> Sample meta spotlight.\n\n` +
      `The new **GRN Super Saiyan 2 Kefla** enters the meta with oppressive mid-range pressure and flexible vanish bait tools.\n\n` +
      `### Kit Highlights\n` +
      `- Card draw speed ramp tied to combo length\n` +
      `- Conditional Ki restore on strike chain extension\n` +
      `- Ultimate with sustained cut penetration scaling by defeated allies\n\n` +
      `### Team Synergy\n` +
      `Pair with: \n` +
      `- PUR support buffers (for ramp economy)\n` +
      `- YEL endurance anchor to absorb late-game Rising Rush pressure\n\n` +
      `### Rotation Concept\n` +
      `Open with safe Blast cancel > drift > Strike to trigger early draw speed. Preserve vanish for bait into green card reposition.\n\n` +
      `<!-- TWITCH: dragonballfighterz -->\n` +
      `*(Demo Twitch embed placeholder above — replaced at runtime)*\n\n` +
      `Early verdict: High ceiling, benefits from patient neutral rather than reckless rush.`,
    createdAt: now - 1000 * 60 * 60 * 12,
    updatedAt: now - 1000 * 60 * 60 * 12,
    authorUID: 'sample',
    authorName: 'System',
    bannerUrl: 'https://i.pinimg.com/736x/8a/52/2a/8a522a5f6c1bb39c98f8c09194211ebd.jpg',
    tags: ['DragonBallLegends','Character','Meta','Guide'],
    pinned: false,
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
  }
];

export function getSamplePostBySlug(slug: string){
  return samplePosts.find(p=> p.slug === slug);
}

export function getAllSamplePosts(){
  return samplePosts.slice();
}

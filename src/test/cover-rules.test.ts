import { describe, expect, it } from 'vitest';
import { COVER_FULL_MAX, COVER_THUMB_WIDTH, COVER_OG_WIDTH, COVER_OG_HEIGHT, cropRect } from '@/lib/cover-image';
import { checkFile, MAX_UPLOAD_BYTES } from '@/lib/image-resize';
import { counterpart, headFor } from '@/lib/seo';
import { ownerEntries } from '@/lib/legal';
describe('Cover rules', () => {
  it('limits full covers to 1600 px', () => expect(COVER_FULL_MAX).toBe(1600));
  it('makes 480 px thumbnails', () => expect(COVER_THUMB_WIDTH).toBe(480));
  it('makes social images 1200 by 630', () => expect([COVER_OG_WIDTH, COVER_OG_HEIGHT]).toEqual([1200,630]));
  it('keeps edge focal crops within the original', () => expect(cropRect(1600,1000,1200/630,100,100)).toEqual({x:0,y:160,width:1600,height:840}));
  it('rejects non-images', () => expect(checkFile(new File(['text'],'file.txt',{type:'text/plain'}))).not.toBeNull());
  it('rejects uploads over 15 MB', () => expect(checkFile({name:'large.jpg',type:'image/jpeg',size:MAX_UPLOAD_BYTES+1} as File)).not.toBeNull());
});
describe('Legal page rules', () => {
  it('maps Italian terms to English terms', () => expect(counterpart('it','termini')).toBe('/en/terms'));
  it('hides empty controller fields from visitors', () => expect(ownerEntries({name:'',address:'',email:'',phone:'',license:'',retention:'',transfers:'',law:''},'it')).toEqual([]));
  it('uses the actual package cover for social images', () => { const head=headFor('it','Test','Test','/it/safari/test',undefined,'/api/public/img/covers/abc-og.webp'); expect(head.meta.find(m=>'property' in m&&m.property==='og:image')?.content).toBe('https://ecotoursandsafaris.it/api/public/img/covers/abc-og.webp'); });
});

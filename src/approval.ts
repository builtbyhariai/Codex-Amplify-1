import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import type {Approval,TargetConfig} from './types.js';
// Recursive key-sorted JSON. (An array replacer would silently drop nested keys from the hash.)
const canonical=(x:unknown):unknown=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>[k,canonical(v)])):x;
export const stableHash=(x:unknown)=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const payload=(a:Omit<Approval,'signature'>)=>[a.candidateId,a.actorId,a.action,a.approvedBy,a.issuedAt,a.expiresAt,a.configHash].join('|');
export function signApproval(a:Omit<Approval,'signature'>,secret:string):Approval { return {...a,signature:createHmac('sha256',secret).update(payload(a)).digest('hex')}; }
export function verifyApproval(a:Approval,t:TargetConfig,secret:string):void { if(a.action!=='publish-paid'||a.actorId!==t.id||a.configHash!==stableHash(t)||!(Date.parse(a.expiresAt)>Date.now())) throw new Error('Approval scope, hash, or expiry invalid'); const unsigned={candidateId:a.candidateId,actorId:a.actorId,action:a.action,approvedBy:a.approvedBy,issuedAt:a.issuedAt,expiresAt:a.expiresAt,configHash:a.configHash} as const; const expected=createHmac('sha256',secret).update(payload(unsigned)).digest(); const got=Buffer.from(a.signature,'hex'); if(got.length!==expected.length||!timingSafeEqual(got,expected)) throw new Error('Approval signature invalid'); }

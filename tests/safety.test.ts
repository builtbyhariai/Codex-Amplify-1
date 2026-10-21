import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs'; import YAML from 'yaml';
import {signApproval,stableHash,verifyApproval} from '../src/approval.js'; import {assertTargetSafe,ComplianceError} from '../src/compliance.js'; import {classifyFailure} from '../src/maintenance.js'; import {rankCandidates} from '../src/scanner.js'; import type {Candidate,TargetConfig} from '../src/types.js';
const target=YAML.parse(readFileSync('catalog/targets/us-public-procurement.yaml','utf8')) as TargetConfig;
const clone=()=>structuredClone(target);
const approval=(expiresAt:string,t=target)=>signApproval({candidateId:'c',actorId:t.id,action:'publish-paid',approvedBy:'owner',issuedAt:new Date().toISOString(),expiresAt,configHash:stableHash(t)},'secret');
const future=()=>new Date(Date.now()+60000).toISOString();

test('stableHash ignores key order but detects nested changes',()=>{
 assert.equal(stableHash({a:1,b:{c:2,d:3}}),stableHash({b:{d:3,c:2},a:1}));
 const t=clone();t.source.allowedHosts=['evil.example'];assert.notEqual(stableHash(t),stableHash(target));
 const u=clone();u.pricing.events[0]!.priceUsd=99;assert.notEqual(stableHash(u),stableHash(target));
});
test('approval bound to nested config cannot be reused after a nested edit',()=>{
 const a=approval(future());const t=clone();t.request.rateLimitPerMinute=120;
 assert.throws(()=>verifyApproval(a,t,'secret'),/scope, hash, or expiry/);
});
test('approval rejects expired, unparseable expiry, wrong secret and tampered signature',()=>{
 assert.throws(()=>verifyApproval(approval(new Date(Date.now()-1000).toISOString()),target,'secret'));
 assert.throws(()=>verifyApproval(approval('not-a-date'),target,'secret'));
 assert.throws(()=>verifyApproval(approval(future()),target,'other'),/signature/);
 assert.throws(()=>verifyApproval({...approval(future()),signature:'zz'},target,'secret'),/signature/);
});

const bad=(mut:(t:TargetConfig)=>void,re:RegExp)=>{const t=clone();mut(t);assert.throws(()=>assertTargetSafe(t),(e)=>e instanceof ComplianceError&&re.test(e.message));};
test('target safety rejects risky configs',()=>{
 bad(t=>{t.id='../../etc'},/id/);
 bad(t=>{t.request.rateLimitPerMinute=0},/rate/);
 bad(t=>{t.request.maxConcurrency=11},/rate/);
 bad(t=>{t.output.maxItemsDefault=10,t.output.maxItemsHard=5},/limits/);
 bad(t=>{t.request.startUrls=['https://elsewhere.example/x']},/allowlist/);
 bad(t=>{t.request.startUrls=['http://api.usaspending.gov/x']},/https/);
 bad(t=>{t.source.allowedHosts=[]},/allowlist/);
});

test('classifyFailure covers each failure kind',()=>{
 for(const [m,k] of [['429 rate limit','rate_limited'],['request timed out','timeout'],['401 bad token','auth'],['apify build failed','platform'],['weird','unknown']] as const)assert.equal(classifyFailure(m),k);
});

test('rankCandidates sorts best first',()=>{
 const c=(id:string,demand:number)=>({id,title:id,category:'x',queries:[],buyer:'b',demand:[{source:'s',observedAt:'2026-01-01',value:demand}],competitors:1,medianCompetitorQuality:30,estimatedValuePerThousandUsd:200,implementationDays:2,publicOrPermitted:true,tosReviewed:true,robotsReviewed:true,personalData:false,durability:90,risk:'low',lifecycle:'approved'}) as Candidate;
 assert.deepEqual(rankCandidates([c('lo',10),c('hi',90)]).map(r=>r.candidate.id),['hi','lo']);
});

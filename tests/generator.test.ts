import test from 'node:test'; import assert from 'node:assert/strict'; import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs'; import {join} from 'node:path';
import {generateActor,loadTarget} from '../src/generator.js'; import {validateActor} from '../src/validate.js'; import type {TargetConfig} from '../src/types.js';
const TARGET='catalog/targets/us-public-procurement.yaml';
const withTmp=async(fn:(dir:string)=>Promise<void>)=>{mkdirSync('generated',{recursive:true});const d=mkdtempSync('generated/test-');try{await fn(d);}finally{rmSync(d,{recursive:true,force:true});}};

test('generated actor validates and has a dataset schema',()=>withTmp(async d=>{
 const out=await generateActor(await loadTarget(TARGET),d);
 assert.deepEqual(await validateActor(out),[]);
 const ds=JSON.parse(readFileSync(join(out,'.actor/dataset_schema.json'),'utf8'));
 assert.deepEqual(ds.views.overview.transformation.fields,['awardId','recipient','amountUsd','startDate','awardingAgency']);
}));

test('titles with quotes and ampersands still produce valid JSON',()=>withTmp(async d=>{
 const t={...(await loadTarget(TARGET)),title:'Tom "&" Jerry <Awards>'} as TargetConfig;
 const out=await generateActor(t,d);
 assert.equal(JSON.parse(readFileSync(join(out,'.actor/actor.json'),'utf8')).title,t.title);
 assert.deepEqual(await validateActor(out),[]);
}));

test('validate reports every problem found',()=>withTmp(async d=>{
 const out=await generateActor(await loadTarget(TARGET),d);
 const f=join(out,'.actor/INPUT_SCHEMA.json');const s=JSON.parse(readFileSync(f,'utf8'));s.properties.maxItems.default=999999;writeFileSync(f,JSON.stringify(s));
 writeFileSync(join(out,'README.md'),'no title');
 const errs=await validateActor(out);
 assert.equal(errs.length,2);assert.match(errs.join('\n'),/maxItems/);assert.match(errs.join('\n'),/README/);
}));

test('validate reports missing files instead of crashing',async()=>{
 const errs=await validateActor('does-not-exist');assert.ok(errs.length>=1);assert.match(errs[0]!,/actor\.json/);
});

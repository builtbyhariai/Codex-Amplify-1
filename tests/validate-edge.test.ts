import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,unlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {generateActor,loadTarget} from '../src/generator.js';
import {validateActor} from '../src/validate.js';

const TARGET='catalog/targets/us-public-procurement.yaml';
// generateActor writes to <outRoot>/<target id>, so the actor folder is one level down.
const withActor=async(fn:(dir:string)=>Promise<void>)=>{
 const d=await mkdtemp(join(tmpdir(),'validate-edge-'));
 try{await fn(join(d,'us-public-procurement'));}finally{await rm(d,{recursive:true,force:true});}
};

test('validate reports a missing generated file by name',()=>withActor(async dir=>{
 await generateActor(await loadTarget(TARGET),dirname(dir));
 await unlink(join(dir,'.actor/INPUT_SCHEMA.json'));
 const errs=await validateActor(dir);
 assert.ok(errs.length>=1);
 assert.match(errs.join('\n'),/INPUT_SCHEMA\.json/);
}));

test('validate reports invalid JSON in two .actor files and names both',()=>withActor(async dir=>{
 await generateActor(await loadTarget(TARGET),dirname(dir));
 await writeFile(join(dir,'.actor/actor.json'),'{not json');
 await writeFile(join(dir,'.actor/INPUT_SCHEMA.json'),'[1,');
 const errs=await validateActor(dir);
 assert.equal(errs.length,2);
 assert.match(errs.join('\n'),/actor\.json/);
 assert.match(errs.join('\n'),/INPUT_SCHEMA\.json/);
}));

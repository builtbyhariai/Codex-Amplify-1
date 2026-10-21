import {readFile} from 'node:fs/promises';
const json=async(root:string,p:string,errs:string[])=>{try{return JSON.parse(await readFile(`${root}/${p}`,'utf8'));}catch(e){errs.push(`${p}: ${(e as Error).message}`);return undefined;}};
/** Returns a list of problems for a generated actor folder; empty means valid. */
export async function validateActor(root:string):Promise<string[]>{
 const errs:string[]=[];const need=(ok:unknown,m:string)=>{if(!ok)errs.push(m);};
 try{
  const actor=await json(root,'.actor/actor.json',errs),input=await json(root,'.actor/INPUT_SCHEMA.json',errs),ds=await json(root,'.actor/dataset_schema.json',errs),target=await json(root,'target.json',errs),pkg=await json(root,'package.json',errs);
  if(errs.length)return errs; // structural checks need every file loaded
  need(actor.actorSpecification===1,'actor.json: actorSpecification must be 1');
  for(const k of ['name','title','description','version'])need(typeof actor[k]==='string'&&actor[k],`actor.json: missing ${k}`);
  need(actor.name===target.id,'actor.json: name must match target.json id');
  need(actor.storages?.dataset==='./dataset_schema.json','actor.json: storages.dataset must reference dataset_schema.json');
  need(input.schemaVersion===1&&input.type==='object'&&input.properties,'INPUT_SCHEMA.json: needs schemaVersion 1, type object, properties');
  const m=input.properties?.maxItems;need(m&&m.default>=m.minimum&&m.default<=m.maximum&&m.maximum<=target.output.maxItemsHard,'INPUT_SCHEMA.json: maxItems default/limits must be consistent and within maxItemsHard');
  need(ds.actorSpecification===1&&ds.views&&Object.keys(ds.views).length>0,'dataset_schema.json: needs actorSpecification 1 and at least one view');
  const fields=Object.keys(target.extraction.fields);
  for(const v of Object.values<any>(ds.views??{}))for(const f of v.transformation?.fields??[])need(fields.includes(f),`dataset_schema.json: view field "${f}" is not an extraction field`);
  need(pkg.scripts?.start,'package.json: missing start script');
  need(target.extraction.identityFields.every((f:string)=>fields.includes(f)),'target.json: identityFields must be extraction fields');
  const readme=await readFile(`${root}/README.md`,'utf8');need(readme.startsWith('# '),'README must start with a title');
 }catch(e){errs.push((e as Error).message);}
 return errs;
}

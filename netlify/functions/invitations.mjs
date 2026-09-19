import { getStore } from "@netlify/blobs";

const store = getStore("ari-digital-invitations");

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Edit-Token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS"
};

const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers});

function slugify(v){
  return String(v||"undangan").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,55) || "undangan";
}
function cleanData(d={}){
  const keys=[
    "bride","groom","guest","coverTitle","brideParents","groomParents","date","time","venue","address","maps","bridePhoto","groomPhoto",
    "storyIntro","story1Date","story1Title","story1Text","story1Photo","story2Date","story2Title","story2Text","story2Photo",
    "story3Date","story3Title","story3Text","story3Photo","story4Date","story4Title","story4Text","story4Photo",
    "story5Date","story5Title","story5Text","story5Photo","gallery1","gallery2","gallery3"
  ];
  const longKeys=new Set(["storyIntro","story1Text","story2Text","story3Text","story4Text","story5Text"]);
  const out={};
  for(const k of keys){
    const max=longKeys.has(k)?5000:1500;
    out[k]=typeof d[k]==="string"?d[k].slice(0,max):"";
  }
  return out;
}

export default async (req) => {
  if(req.method==="OPTIONS") return new Response("", {status:204, headers});
  const url=new URL(req.url);
  const slug=url.searchParams.get("slug");

  if(req.method==="GET"){
    if(!slug) return json({error:"slug wajib diisi"},400);
    const item=await store.get(slug,{type:"json"});
    if(!item) return json({error:"Undangan tidak ditemukan"},404);
    // Never expose the edit token publicly.
    return json({slug, data:item.data, createdAt:item.createdAt, updatedAt:item.updatedAt});
  }

  if(req.method==="POST"){
    let body;
    try{body=await req.json()}catch{return json({error:"JSON tidak valid"},400)}
    const data=cleanData(body.data);
    const base=slugify(`${data.bride}-${data.groom}`);
    let finalSlug=base;
    for(let i=2;i<100;i++){
      if(!(await store.get(finalSlug,{type:"json"}))) break;
      finalSlug=base+"-"+i;
    }
    const editToken=crypto.randomUUID()+"-"+crypto.randomUUID();
    const now=new Date().toISOString();
    await store.setJSON(finalSlug,{data,editToken,createdAt:now,updatedAt:now});
    return json({slug:finalSlug, editToken, data},201);
  }

  if(req.method==="PUT"){
    if(!slug) return json({error:"slug wajib diisi"},400);
    const token=req.headers.get("x-edit-token")||"";
    const item=await store.get(slug,{type:"json"});
    if(!item) return json({error:"Undangan tidak ditemukan"},404);
    if(!token || token!==item.editToken) return json({error:"Token edit tidak valid"},403);
    let body;
    try{body=await req.json()}catch{return json({error:"JSON tidak valid"},400)}
    const data=cleanData(body.data);
    const now=new Date().toISOString();
    await store.setJSON(slug,{...item,data,updatedAt:now});
    return json({slug,data,updatedAt:now});
  }

  return json({error:"Method tidak didukung"},405);
};

export const config = { path: "/api/invitations" };

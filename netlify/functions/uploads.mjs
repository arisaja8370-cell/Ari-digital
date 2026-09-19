import { getStore } from "@netlify/blobs";

const store = getStore("ari-digital-uploads");
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{...headers,"Content-Type":"application/json; charset=utf-8"}});

function safeName(name){
  return String(name||"foto").toLowerCase().replace(/[^a-z0-9._-]+/g,"-").slice(-80) || "foto";
}

export default async (req)=>{
  if(req.method==='OPTIONS') return new Response('',{status:204,headers});
  const url=new URL(req.url);
  if(req.method==='POST'){
    try{
      const form=await req.formData();
      const file=form.get('file');
      if(!(file instanceof File)) return json({error:'File foto belum dipilih'},400);
      if(!file.type.startsWith('image/')) return json({error:'Hanya file gambar yang diperbolehkan'},400);
      if(file.size>8*1024*1024) return json({error:'Ukuran foto maksimal 8 MB'},400);
      const ext=(file.name.match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase();
      const key=`${crypto.randomUUID()}-${safeName(file.name)}`;
      const bytes=await file.arrayBuffer();
      await store.set(key,bytes,{metadata:{contentType:file.type,name:file.name}});
      return json({key,url:`${url.origin}/api/uploads?key=${encodeURIComponent(key)}`,name:file.name},201);
    }catch(e){ return json({error:e?.message||'Upload gagal'},500); }
  }
  if(req.method==='GET'){
    const key=url.searchParams.get('key');
    if(!key) return json({error:'key wajib diisi'},400);
    const item=await store.getWithMetadata(key,{type:'arrayBuffer'});
    if(!item) return new Response('Foto tidak ditemukan',{status:404,headers});
    const type=item.metadata?.contentType||'image/jpeg';
    return new Response(item.data,{status:200,headers:{...headers,'Content-Type':type,'Cache-Control':'public, max-age=31536000, immutable'}});
  }
  return json({error:'Method tidak didukung'},405);
};

export const config={path:'/api/uploads'};

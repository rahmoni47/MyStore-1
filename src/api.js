import {useEffect,useState} from 'react';
const BASE=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
export const CUR=import.meta.env.VITE_CURRENCY||'';
export const STORE=import.meta.env.VITE_STORE_NAME||'Store';
export const money=n=>`${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}${CUR?' '+CUR:''}`;

async function req(path,{params,signal,method='GET',body}={}){
  const url=new URL(BASE+path,window.location.origin);
  Object.entries(params||{}).forEach(([k,v])=>v!=null&&url.searchParams.set(k,v));
  let res;
  const headers={'Accept':'application/json',...(body?{'Content-Type':'application/json'}:{})};
  try{res=await fetch(url,{method,signal,headers,body:body?JSON.stringify(body):undefined});}
  catch(e){if(e.name==='AbortError')throw e;throw new Error('Could not reach the store server. Check your connection and try again.');}
  if(!res.ok){
    let m;try{const j=await res.json();m=j.message||j.error||j.detail;}catch{/* no body */}
    throw new Error(m||(res.status===404?'Not found.':`Request failed (${res.status}).`));
  }
  const t=await res.text();return t?JSON.parse(t):null;
}
// Customer-facing endpoints only
export const getProducts=(p,signal)=>req('/api/v1/products',{params:p,signal});            // GET paged list (page,size,sort)
export const getProduct=(id,signal)=>req(`/api/v1/products/${id}`,{signal});               // GET details
export const getCategories=signal=>req('/api/v1/categories/all',{signal});                 // GET all categories
export const getCategory=(id,signal)=>req(`/api/v1/categories/${id}`,{signal});            // GET category + its products
export const getStates=signal=>req('/api/v1/states/available',{signal});                   // GET delivery states
export const createOrder=body=>req('/api/v1/orders',{method:'POST',body});                 // POST order

export function useAsync(fn,deps){
  const [s,set]=useState({loading:true});const [n,setN]=useState(0);
  useEffect(()=>{
    let active=true;
    set({loading:true});
    fn().then(
      data=>{if(active)set({data,loading:false});},
      e=>{if(active)set({error:e.message,loading:false});}
    );
    return ()=>{active=false;};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[...deps,n]);
  return {...s,retry:()=>setN(x=>x+1)};
}

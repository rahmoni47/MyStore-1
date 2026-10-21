import {createContext,useContext,useEffect,useState} from 'react';
const Ctx=createContext(null);export const useCart=()=>useContext(Ctx);
const KEY='store-cart-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[];}catch{return [];}};
export function CartProvider({children}){
  const [items,setItems]=useState(load);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{/* storage unavailable */}},[items]);
  const keyOf=i=>`${i.productId}|${i.color||''}|${i.size||''}`;
  const add=it=>setItems(l=>{const k=keyOf(it);const f=l.find(x=>keyOf(x)===k);
    return f?l.map(x=>keyOf(x)===k?{...x,quantity:x.quantity+it.quantity}:x):[...l,it];});
  const setQty=(k,q)=>setItems(l=>l.map(x=>keyOf(x)===k?{...x,quantity:Math.max(1,q||1)}:x));
  const remove=k=>setItems(l=>l.filter(x=>keyOf(x)!==k));
  const count=items.reduce((a,i)=>a+i.quantity,0);
  const subtotal=items.reduce((a,i)=>a+i.quantity*i.price,0);
  return <Ctx.Provider value={{items,add,setQty,remove,clear:()=>setItems([]),count,subtotal,keyOf}}>{children}</Ctx.Provider>;
}

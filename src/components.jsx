import {useState} from 'react';
import {Link} from 'react-router-dom';
import {money} from './api.js';

export function Img({src,alt,className}){
  const [bad,setBad]=useState(false);
  if(!src||bad)return <div className={`ph ${className||''}`} role="img" aria-label={alt||'No image available'}>No image</div>;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={()=>setBad(true)}/>;
}
export function Status({s,empty,rows=4,children}){
  if(s.loading)return <div className="grid" aria-busy="true">{Array.from({length:rows},(_,i)=><div key={i} className="skel"/>)}</div>;
  if(s.error)return <div role="alert" className="note"><p>{s.error}</p><button className="btn ghost" onClick={s.retry}>Try again</button></div>;
  if(empty)return <p className="note">{empty}</p>;
  return children();
}
export function ProductCard({p}){
  const out=p.available===false;
  return <Link to={`/products/${p.id}`} className="card">
    <div className="frame"><Img src={p.mainImg} alt={p.name}/>{out&&<span className="tag">Sold out</span>}</div>
    <h3>{p.name}</h3><p className="price">{money(p.price)}</p>
  </Link>;
}

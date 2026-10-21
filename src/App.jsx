import {useState,useEffect} from 'react';
import {Link,NavLink,Route,Routes,useLocation} from 'react-router-dom';
import {STORE} from './api.js';import {useCart} from './cart.jsx';
import {Home,Products,ProductPage,Cart} from './pages.jsx';
export default function App(){
  const {count}=useCart();const [open,setOpen]=useState(false);const {pathname}=useLocation();
  useEffect(()=>setOpen(false),[pathname]);
  return <>
    <header className="bar"><div className="container nav">
      <Link to="/" className="brand">{STORE}</Link>
      <button className="burger" aria-expanded={open} aria-controls="menu" onClick={()=>setOpen(o=>!o)}>{open?'Close':'Menu'}</button>
      <nav id="menu" className={open?'open':''}><NavLink to="/" end>Home</NavLink><NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart{count>0&&<span className="badge" aria-label={`${count} items`}>{count}</span>}</NavLink></nav>
    </div></header>
    <main><Routes><Route path="/" element={<Home/>}/><Route path="/products" element={<Products/>}/>
      <Route path="/products/:id" element={<ProductPage/>}/><Route path="/cart" element={<Cart/>}/>
      <Route path="*" element={<div className="container"><p className="note">Page not found. <Link to="/">Back to home</Link></p></div>}/></Routes></main>
    <footer><div className="container"><b>{STORE}</b><nav><Link to="/products">Products</Link><Link to="/cart">Cart</Link></nav></div></footer>
  </>;
}

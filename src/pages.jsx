import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAsync, getProducts, getProduct, getCategories, getCategory, getStates, createOrder, money } from './api.js';
import { useCart } from './cart.jsx';
import { Img, Status, ProductCard } from './components.jsx';

export function Home() {
  const cats = useAsync(s => getCategories(s), []);
  const prods = useAsync(s => getProducts({ page: 0, size: 8, sort: 'createdAt,desc' }, s), []);
  const list = (prods.data?.content || []).filter(p => p.available !== false);
  return <>
    <section className="container hero">
      <div><h1>Find it, pick your size, order in minutes.</h1>
        <p>Browse by category or see everything in the catalog. Pay on delivery details are confirmed once your order is placed.</p>
        <Link className="btn" to="/products">Shop all products</Link></div>
      {list[0]?.mainImg && <Link to={`/products/${list[0].id}`} className="hero-img"><Img src={list[0].mainImg} alt={list[0].name} /></Link>}
    </section>
    <section className="container"><h2>Shop by category</h2>
      <Status s={cats} rows={3} empty={!cats.data?.length && 'No categories available yet.'}>{() =>
        <div className="cats">{cats.data.map(c => <Link key={c.id} className="cat" to={`/products?category=${c.id}`}>
          <Img src={c.img} alt="" /><span>{c.name}</span></Link>)}</div>}</Status></section>
    <section className="container"><div className="row"><h2>New in</h2><Link to="/products">View all products</Link></div>
      <Status s={prods} rows={4} empty={!list.length && 'No products available yet.'}>{() =>
        <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>}</Status></section>
  </>;
}

export function Products() {
  const [sp, setSp] = useSearchParams(); const cat = sp.get('category'); const page = Math.max(0, +sp.get('page') || 0);
  const cats = useAsync(s => getCategories(s), []);
  const res = useAsync(s => cat ? getCategory(cat, s) : getProducts({ page, size: 12, sort: 'createdAt,desc' }, s), [cat, page]);
  const items = (cat ? res.data?.products : res.data?.content) || [];
  const total = res.data?.page?.totalPages || 1;
  const go = o => { setSp(o); window.scrollTo({ top: 0 }); };
  return <div className="container">
    <h1 className="pg">{cat ? (res.data?.name || 'Category') : 'All products'}</h1>
    {cat && res.data?.description && <p className="lead">{res.data.description}</p>}
    <nav className="chips" aria-label="Categories">
      <button className={!cat ? 'on' : ''} aria-pressed={!cat} onClick={() => go({})}>All</button>
      {(cats.data || []).map(c => <button key={c.id} className={cat === c.id ? 'on' : ''} aria-pressed={cat === c.id} onClick={() => go({ category: c.id })}>{c.name}</button>)}
    </nav>
    <Status s={res} rows={8} empty={!items.length && (cat ? 'No products in this category yet.' : 'No products available yet.')}>{() => <>
      <div className="grid">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
      {!cat && total > 1 && <div className="pager"><button className="btn ghost" disabled={page === 0} onClick={() => go({ page: page - 1 })}>Previous</button>
        <span>Page {page + 1} of {total}</span><button className="btn ghost" disabled={page + 1 >= total} onClick={() => go({ page: page + 1 })}>Next</button></div>}
    </>}</Status>
  </div>;
}

function Detail({ p }) {
  const { add } = useCart();
  const [color, setColor] = useState(p.colors?.length === 1 ? p.colors[0] : '');
  const [size, setSize] = useState(p.sizes?.length === 1 ? p.sizes[0] : '');
  const [qty, setQty] = useState(1); const [err, setErr] = useState(''); const [done, setDone] = useState(false);
  const [big, setBig] = useState(p.mainImg);
  const imgs = [p.mainImg, ...(p.extraImgs || [])].filter(Boolean);
  const out = p.available === false;
  const submit = () => {
    if (p.colors?.length && !color) return setErr('Choose a color.');
    if (p.sizes?.length && !size) return setErr('Choose a size.');
    setErr(''); add({ productId: p.id, name: p.name, img: p.mainImg, price: p.price, color: color || undefined, size: size || undefined, quantity: qty });
    setDone(true); setTimeout(() => setDone(false), 2000);
  };
  const Pick = ({ label, opts, val, set }) => opts?.length > 0 && <fieldset className="pick"><legend>{label}</legend>
    {opts.map(o => <button type="button" key={o} className={val === o ? 'on' : ''} aria-pressed={val === o} onClick={() => set(o)}>{o}</button>)}</fieldset>;
  return <div className="container detail">
    <div><div className="frame big"><Img src={big} alt={p.name} /></div>
      {imgs.length > 1 && <div className="thumbs">{imgs.map(i => <button key={i} onClick={() => setBig(i)} aria-label="Show image"><Img src={i} alt="" /></button>)}</div>}</div>
    <div><p className="crumb"><Link to="/products">Products</Link>{p.category && <> / <Link to={`/products?category=${p.categoryId}`}>{p.category}</Link></>}</p>
      <h1>{p.name}</h1><p className="price lg">{money(p.price)}</p>
      {p.description && <p className="desc">{p.description}</p>}
      {out ? <p className="note">This product is sold out.</p> : <>
        <Pick label="Color" opts={p.colors} val={color} set={setColor} /><Pick label="Size" opts={p.sizes} val={size} set={setSize} />
        <div className="qty"><label htmlFor="q">Quantity</label><button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">−</button>
          <input id="q" type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, +e.target.value || 1))} /><button onClick={() => setQty(q => q + 1)} aria-label="Increase">+</button></div>
        {err && <p role="alert" className="err">{err}</p>}
        <button className="btn wide" onClick={submit}>Add to cart</button>
        <p aria-live="polite" className="ok">{done && <>Added. <Link to="/cart">Go to cart</Link></>}</p></>}
    </div></div>;
}
export function ProductPage() {
  const { id } = useParams(); const s = useAsync(sig => getProduct(id, sig), [id]);
  return s.data ? <Detail key={id} p={s.data} /> : <div className="container"><Status s={s} rows={2}>{() => null}</Status></div>;
}

export function Cart() {
  const { items, setQty, remove, clear, subtotal, keyOf } = useCart();
  const states = useAsync(s => getStates(s), []);
  const [f, setF] = useState({ customerFirstName: '', customerLastName: '', customerPhone: '', shippingAddress: '', state: '' });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [fail, setFail] = useState(''); const [order, setOrder] = useState(null);
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }));
  const validate = () => {
    const e = {};
    if (!f.customerFirstName.trim()) e.customerFirstName = 'Enter your first name.';
    if (!f.customerLastName.trim()) e.customerLastName = 'Enter your last name.';
    if (!f.customerPhone.trim()) e.customerPhone = 'Enter a phone number.';
    if (!f.shippingAddress.trim()) e.shippingAddress = 'Enter a delivery address.';
    if (!f.state) e.state = 'Choose your state.'; return e;
  };
  const submit = async ev => {
    ev.preventDefault(); if (busy) return; const e = validate(); setErrs(e); if (Object.keys(e).length) return;
    setBusy(true); setFail('');
    try {
      const r = await createOrder({
        ...f, state: Number(f.state),
        orderItems: items.map(i => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity, price: i.price }))
      });
      setOrder(r); clear();
    } catch (x) { setFail(x.message); } finally { setBusy(false); }
  };
  if (order) return <div className="container narrow"><h1 className="pg">Order placed</h1>
    <p className="ok">Thank you, {order.customerFirstName}. Your order has been received.</p>
    <dl className="sum"><dt>Order reference</dt><dd>{order.id}</dd><dt>Status</dt><dd>{order.status}</dd>
      <dt>Products</dt><dd>{money(order.productsPrice)}</dd><dt>Delivery</dt><dd>{money(order.deliveryPrice)}</dd><dt>Total</dt><dd><b>{money(order.totalPrice)}</b></dd></dl>
    <Link className="btn" to="/products">Keep shopping</Link></div>;
  if (!items.length) return <div className="container narrow"><h1 className="pg">Your cart</h1><p className="note">Your cart is empty.</p><Link className="btn" to="/products">Browse products</Link></div>;
  const Field = ({ k, label, type = 'text', auto }) => <div className="field"><label htmlFor={k}>{label}</label>
    <input id={k} type={type} autoComplete={auto} value={f[k]} onChange={set(k)} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? k + 'e' : undefined} />
    {errs[k] && <p id={k + 'e'} className="err">{errs[k]}</p>}</div>;
  return <div className="container cart"><div><h1 className="pg">Your cart</h1>
    <ul className="lines">{items.map(i => {
      const k = keyOf(i); return <li key={k}>
        <div className="thumb"><Img src={i.img} alt="" /></div>
        <div><Link to={`/products/${i.productId}`}>{i.name}</Link><p className="muted">{[i.color, i.size].filter(Boolean).join(' · ')}</p>
          <div className="qty"><button aria-label="Decrease" onClick={() => setQty(k, i.quantity - 1)}>−</button><span>{i.quantity}</span><button aria-label="Increase" onClick={() => setQty(k, i.quantity + 1)}>+</button>
            <button className="link" onClick={() => remove(k)}>Remove</button></div></div>
        <b>{money(i.price * i.quantity)}</b></li>;
    })}</ul></div>
    <form className="checkout" onSubmit={submit} noValidate><h2>Delivery details</h2>
      <Field k="customerFirstName" label="First name" auto="given-name" /><Field k="customerLastName" label="Last name" auto="family-name" />
      <Field k="customerPhone" label="Phone number" type="tel" auto="tel" /><Field k="shippingAddress" label="Delivery address" auto="street-address" />
      <div className="field"><label htmlFor="state">State</label>
        <select id="state" value={f.state} onChange={set('state')} aria-invalid={!!errs.state} disabled={!states.data}>
          <option value="">{states.error ? 'Could not load states' : 'Select a state'}</option>
          {(states.data || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        {states.error && <button type="button" className="link" onClick={states.retry}>Retry</button>}{errs.state && <p className="err">{errs.state}</p>}</div>
      <p className="sub"><span>Subtotal</span><b>{money(subtotal)}</b></p><p className="muted">Delivery is calculated by the store when you place the order.</p>
      {fail && <p role="alert" className="err">{fail}</p>}
      <button className="btn wide" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button></form></div>;
}

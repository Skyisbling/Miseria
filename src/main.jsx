import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const products=[
 {id:'salted',name:'Classic Salted',desc:'The familiar roasted-peanut crunch with a simple salted finish.',sizes:'20g / 100g',price:'₹30 / ₹160',image:'/assets/classic-salted.png'},
 {id:'caramel',name:'Creamy Caramelized',desc:'Roasted peanuts with a sweet, creamy caramel-inspired flavour.',sizes:'20g / 100g',price:'₹30 / ₹160',image:'/assets/creamy-caramelized.png'},
 {id:'chocolate',name:'Earthy Chocolate',desc:'A rich chocolate twist built around the crunch of roasted peanuts.',sizes:'20g / 100g',price:'₹30 / ₹160',image:'/assets/earthy-chocolate.png'},
 {id:'peri',name:'Hot Peri-Peri',desc:'Bold seasoning and a fiery kick for snack lovers who like heat.',sizes:'20g / 100g',price:'₹30 / ₹160',image:'/assets/hot-peri-peri.png'},
 {id:'nutfuel',name:'NutFuel Chocolate Nut Bar',desc:'A compact chocolate-peanut bar for quick breaks and busy days.',sizes:'30g',price:'₹60',image:'/assets/nutfuel-bar.png'},
 {id:'nutspread',name:'NutSpread Classic Creamy',desc:'Classic creamy peanut butter made for spreading, dipping and everyday goodness.',sizes:'340g',price:'Coming soon',image:'/assets/nutspread.png'}
];

function usePresentationMotion(){
 useEffect(()=>{
  const revealEls=[...document.querySelectorAll('.reveal')];
  const observer=new IntersectionObserver((entries)=>{
   entries.forEach(entry=>{
    if(entry.isIntersecting){
     entry.target.classList.add('is-visible');
     observer.unobserve(entry.target);
    }
   });
  },{threshold:.16,rootMargin:'0px 0px -8% 0px'});
  revealEls.forEach(el=>observer.observe(el));
  return()=>observer.disconnect();
 },[]);
}

function App(){
 usePresentationMotion();

 const [cart,setCart]=useState([]),[drawer,setDrawer]=useState(false),[menu,setMenu]=useState(false),[toast,setToast]=useState('');
 const [progress,setProgress]=useState(0);
 useEffect(()=>{
  const onScroll=()=>{
   const max=document.documentElement.scrollHeight-window.innerHeight;
   setProgress(max>0 ? (window.scrollY/max)*100 : 0);
  };
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
  return()=>window.removeEventListener('scroll',onScroll);
 },[]);
 const add=p=>{setCart(c=>[...c,p]);setToast(`${p.name} added to your bag`);setTimeout(()=>setToast(''),1800)};
 return <div className="site"><div className="scroll-progress"><span style={{width:`${progress}%`}}></span></div>
  {toast&&<div className="toast">{toast}</div>}
  <div className="topline">SNACKS FOR A BRIGHTER YOU <span>•</span> SMALL BITE. BIG HAPPINESS.</div>
  <header className="header">
   <button className="hamb" onClick={()=>setMenu(!menu)}>MENU</button>
   <a className="logo-wrap" href="#home"><img src="/assets/logo.png" alt="Miseria — Snacks for a Brighter You"/></a>
   <nav className={menu?'nav open':'nav'}>
    <a href="#products" onClick={()=>setMenu(false)}>Our Products</a><a href="#about" onClick={()=>setMenu(false)}>About</a><a href="#why" onClick={()=>setMenu(false)}>Why Miseria</a><a href="#contact" onClick={()=>setMenu(false)}>Contact</a>
   </nav>
   <button className="bag" onClick={()=>setDrawer(true)}>Bag <span>{cart.length}</span></button>
  </header>

  <main id="home">
   <section className="hero">
    <div className="hero-copy"><div className="label reveal hero-reveal r1">COLLEGE STARTUP • PEANUT-FIRST SNACKS</div><h1 className="reveal hero-reveal r2">Snacks for a<br/><strong>Brighter You.</strong></h1><p className="reveal hero-reveal r3">One core ingredient. Multiple possibilities. Miseria reimagines peanuts into flavourful, convenient snacks made for college, work, travel, fitness and everyday cravings.</p><div className="hero-actions reveal hero-reveal r4"><a className="btn yellow" href="#products">Explore Products</a><a className="text-link" href="#about">Our Story →</a></div><div className="hero-note reveal hero-reveal r5"><span>Peanut-first</span><span>Real ingredients</span></div></div>
    <div className="hero-art reveal hero-reveal r3"><div className="yellow-circle"></div><img src="/assets/product-lineup.png" alt="Miseria Crunches and NutFuel product lineup"/></div>
   </section>

   <section className="little-proof reveal"><div className="proof-item" style={{animationDelay:'0ms'}}><img src="/assets/crunch-mark.svg" alt=""/><div><b>4</b><span>Crunches flavours</span></div></div><div className="proof-item" style={{animationDelay:'120ms'}}><img src="/assets/bite-mark.svg" alt=""/><div><b>30g</b><span>Easy snack packs</span></div></div><div className="proof-item" style={{animationDelay:'240ms'}}><img src="/assets/spark-mark.svg" alt=""/><div><b>20g</b><span>Protein NutFuel</span></div></div><div className="proof-item" style={{animationDelay:'360ms'}}><img src="/assets/peanut-mark.svg" alt=""/><div><b>1</b><span>Peanut-first platform</span></div></div></section>

   <section id="products" className="section products-section"><div className="section-head reveal"><div><div className="section-kicker"><img src="/assets/peanut-mark.svg" alt=""/><div className="label">OUR PRODUCTS</div></div><h2>Peanuts, <span>reimagined.</span></h2></div><p className="reveal delay-1">A growing peanut-first range spanning crunchy snacks, a chocolate nut bar and a creamy peanut butter spread.</p></div><div className="product-grid">{products.map((p,i)=><article className="product-card reveal" style={{transitionDelay:`${i*90}ms`}} key={p.id}><div className="product-photo"><img src={p.image} alt={p.name}/></div><div className="product-copy"><h3>{p.name}</h3><p>{p.desc}</p><div className="product-meta"><span>{p.sizes}</span><b>{p.price}</b></div><button className="add" onClick={()=>add(p)} disabled={p.id==='nutspread'}>{p.id==='nutspread'?'Coming soon':'Add to bag'} {!['nutspread'].includes(p.id)&&<span>+</span>}</button></div></article>)}</div></section>

   <section id="about" className="about section"><div className="about-image reveal"><div className="about-badge"><img src="/assets/leaf-mark.svg" alt=""/><span>PEANUT<br/>FIRST</span></div><img src="/assets/product-lineup.png" alt="Miseria product range"/></div><div className="about-copy reveal delay-1"><div className="section-kicker"><img src="/assets/leaf-mark.svg" alt=""/><div className="label">ABOUT MISERIA</div></div><h2>One core ingredient.<br/><span>Multiple possibilities.</span></h2><p>Miseria is a college startup concept built around a simple idea: the humble peanut can become much more than a traditional snack. We combine familiar ingredients with modern flavours, convenient formats and a youthful brand experience — from Crunches and NutFuel to our NutSpread peanut butter.</p><div className="about-points reveal delay-2"><div><img src="/assets/peanut-mark.svg" alt=""/><b>Peanut-first</b><small>A focused product identity around one versatile ingredient.</small></div><div><img src="/assets/bite-mark.svg" alt=""/><b>Everyday occasions</b><small>Designed for study breaks, travel, work, fitness and quick cravings.</small></div><div><img src="/assets/spark-mark.svg" alt=""/><b>Flavour variety</b><small>Classic, sweet, chocolate and spicy choices in one range.</small></div><div><img src="/assets/leaf-mark.svg" alt=""/><b>Scalable idea</b><small>A platform that can grow into more peanut-based formats.</small></div></div></div></section>

   <section id="why" className="why"><div className="why-head reveal"><div className="section-kicker"><img src="/assets/spark-mark.svg" alt=""/><div className="label">WHY MISERIA</div></div><h2>Built around <span>real snack moments.</span></h2></div><div className="why-grid"><div className="reveal" style={{transitionDelay:'80ms'}}><div className="why-icon"><img src="/assets/crunch-mark.svg" alt=""/></div><i>01</i><h3>More flavour</h3><p>Move beyond one traditional peanut taste with a portfolio that gives consumers more ways to snack.</p></div><div className="reveal" style={{transitionDelay:'200ms'}}><div className="why-icon"><img src="/assets/bite-mark.svg" alt=""/></div><i>02</i><h3>Made to go</h3><p>Small, convenient packs make it easy to carry a snack to class, work, travel or a quick break.</p></div><div className="reveal" style={{transitionDelay:'320ms'}}><div className="why-icon"><img src="/assets/leaf-mark.svg" alt=""/></div><i>03</i><h3>One ingredient, many formats</h3><p>Crunches and NutFuel show how a peanut-first platform can create different products and occasions.</p></div></div></section>

   <section className="quote"><div className="quote-mark quote-mark-left"><img src="/assets/peanut-mark.svg" alt=""/></div><div className="quote-mark quote-mark-right"><img src="/assets/spark-mark.svg" alt=""/></div><p className="reveal">“The opportunity isn't a lack of peanuts — it's creating a trusted, innovative and scalable peanut-first brand.”</p></section>

   <section id="contact" className="contact"><div className="reveal"><div className="section-kicker"><img src="/assets/bite-mark.svg" alt=""/><div className="label">CONNECT WITH MISERIA</div></div><h2>Follow our <span>journey.</span></h2><p>See our products, branding, updates and startup journey.</p></div><a className="btn blue reveal delay-1" href="#home">Instagram ↗</a></section>
  </main>
  <footer><div><img src="/assets/logo.png" alt="Miseria"/><p>Snacks for a Brighter You.<br/>Small Bite. Big Happiness.</p></div><div><b>EXPLORE</b><a href="#products">Our Products</a><a href="#about">About</a><a href="#why">Why Miseria</a></div><div><b>CONNECT</b><a href="#contact">Instagram ↗</a><a href="#home">Contact</a></div><small>© 2026 Miseria • Snacks for a Brighter You</small></footer>

  <aside className={drawer?'drawer show':'drawer'}><div className="drawer-panel"><div className="drawer-head"><h2>Your bag <span>{cart.length}</span></h2><button onClick={()=>setDrawer(false)}>×</button></div>{cart.length===0?<div className="empty"><div className="empty-mark">M</div><h3>Your bag is empty.</h3><p>Pick a flavour and let's fix that.</p><a className="btn yellow" href="#products" onClick={()=>setDrawer(false)}>Explore Products</a></div>:<><div className="bag-items">{cart.map((p,i)=><div className="bag-item" key={i}><img src={p.image} alt=""/><div><b>{p.name}</b><small>{p.sizes} · {p.price}</small></div><button onClick={()=>setCart(c=>c.filter((_,j)=>j!==i))}>×</button></div>)}</div><button className="checkout">Continue to checkout →</button></>}</div></aside>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdirSync} from 'node:fs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({path:new URL('./.env',import.meta.url)});

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||5050);
const JWT_SECRET=process.env.JWT_SECRET||'';
const FRONTEND_URL=process.env.FRONTEND_URL||'http://localhost:5173';
if(!JWT_SECRET){console.error('Missing JWT_SECRET. Create server/.env from server/.env.example.');process.exit(1)}

const dataDir=path.join(__dirname,'data');
mkdirSync(dataDir,{recursive:true});
const db=new Database(path.join(dataDir,'miseria.db'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 total INTEGER NOT NULL,
 payment_method TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'placed',
 shipping_json TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS order_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER NOT NULL,
 product_id TEXT NOT NULL,
 product_name TEXT NOT NULL,
 quantity INTEGER NOT NULL,
 unit_price INTEGER NOT NULL,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
)`);

const app=express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin:FRONTEND_URL,credentials:false}));
app.use(express.json({limit:'20kb'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,max:30,standardHeaders:true,legacyHeaders:false,message:{message:'Too many authentication attempts. Please try again later.'}}));

const normalizeEmail=email=>String(email||'').trim().toLowerCase();
const publicUser=row=>({id:row.id,name:row.name,email:row.email,createdAt:row.created_at});
const signToken=user=>jwt.sign({sub:user.id,email:user.email},JWT_SECRET,{expiresIn:'7d'});
function auth(req,res,next){
 const header=req.headers.authorization||'';
 const token=header.startsWith('Bearer ')?header.slice(7):null;
 if(!token)return res.status(401).json({message:'Please log in to continue.'});
 try{const payload=jwt.verify(token,JWT_SECRET);const user=db.prepare('SELECT * FROM users WHERE id=?').get(payload.sub);if(!user)return res.status(401).json({message:'Account not found.'});req.user=user;next()}
 catch{res.status(401).json({message:'Your session has expired. Please log in again.'})}
}

function createMailTransport(){
 const provider=String(process.env.MAIL_PROVIDER||'gmail').trim().toLowerCase();
 if(provider!=='gmail') return null;
 const user=String(process.env.SMTP_USER||'').trim();
 const pass=String(process.env.SMTP_APP_PASSWORD||'').replace(/\s+/g,'').trim();
 if(!user||!pass){
  console.warn('Email skipped: SMTP_USER or SMTP_APP_PASSWORD is not configured.');
  return null;
 }
 return nodemailer.createTransport({
  service:'gmail',
  auth:{user,pass}
 });
}

const mailTransport=createMailTransport();

async function sendEmail({to,subject,html}){
 if(!mailTransport)return false;
 const from=process.env.MAIL_FROM||`Miseria <${process.env.SMTP_USER}>`;
 await mailTransport.sendMail({from,to,subject,html});
 return true;
}

async function sendWelcomeEmail({name,email}){
 const html=`<!doctype html><html><body style="margin:0;background:#fffaf0;font-family:Arial,sans-serif;color:#13243a"><div style="max-width:620px;margin:0 auto;padding:44px 24px"><div style="background:#1167d8;border-radius:18px;padding:32px;color:#fff"><div style="font-size:11px;letter-spacing:2px;font-weight:700">MISERIA</div><h1 style="font-size:42px;line-height:1;margin:18px 0 10px">Welcome to Miseria, ${escapeHtml(name.split(' ')[0])}.</h1><p style="font-size:17px;line-height:1.6;margin:0">Your account is ready. Four flavours, one big crunch, and plenty more to come.</p></div><div style="background:#fff;padding:28px 4px"><p style="font-size:16px;line-height:1.7">Thanks for joining us. Your Miseria account is now active, so you're ready to explore Classic Salted, Creamy Caramelized, Earthy Chocolate and Hot Peri-Peri.</p><a href="${escapeHtml(process.env.FRONTEND_URL||'http://localhost:5173')}/products" style="display:inline-block;background:#ffd447;color:#13243a;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:8px">Explore the range</a><p style="color:#637083;font-size:13px;line-height:1.6;margin-top:28px">Small bite. Big happiness.<br/>Team Miseria</p></div></div></body></html>`;
 return sendEmail({to:email,subject:'Welcome to Miseria',html});
}

async function sendOrderEmail({name,email,order}){
 const rows=order.items.map(i=>`<tr><td style="padding:10px 0;border-bottom:1px solid #dbe3ee">${escapeHtml(i.product_name)}</td><td style="padding:10px 0;border-bottom:1px solid #dbe3ee;text-align:center">${i.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #dbe3ee;text-align:right">₹${i.unit_price*i.quantity}</td></tr>`).join('');
 const html=`<!doctype html><html><body style="margin:0;background:#fffaf0;font-family:Arial,sans-serif;color:#13243a"><div style="max-width:620px;margin:0 auto;padding:44px 24px"><div style="background:#1167d8;border-radius:18px;padding:32px;color:#fff"><div style="font-size:11px;letter-spacing:2px;font-weight:700">MISERIA</div><h1 style="font-size:38px;line-height:1;margin:18px 0 10px">Order #${order.id} is placed.</h1><p style="font-size:16px;line-height:1.6;margin:0">Thanks, ${escapeHtml(name.split(' ')[0])}. We're getting your crunch ready.</p></div><div style="background:#fff;padding:28px 4px"><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table><p style="font-size:18px;font-weight:700;text-align:right;margin:20px 0">Order total: ₹${order.total}</p><p style="color:#637083;font-size:13px;line-height:1.6">Payment: Cash on delivery.<br/>Delivery to: ${escapeHtml(order.shipping.line1)}, ${escapeHtml(order.shipping.city)}, ${escapeHtml(order.shipping.state)} - ${escapeHtml(order.shipping.pincode)}</p><p style="color:#637083;font-size:13px">Small bite. Big happiness.<br/>Team Miseria</p></div></div></body></html>`;
 return sendEmail({to:email,subject:`Miseria order #${order.id} confirmed`,html});
}

function cleanShipping(value){
 const s=value||{};
 return {name:String(s.name||'').trim(),phone:String(s.phone||'').trim(),line1:String(s.line1||'').trim(),city:String(s.city||'').trim(),state:String(s.state||'').trim(),pincode:String(s.pincode||'').trim()};
}
function validateShipping(s){return s.name.length>=2&&s.phone.length>=8&&s.line1.length>=5&&s.city.length>=2&&s.state.length>=2&&/^\d{6}$/.test(s.pincode)}
function orderShape(row,items){return {id:row.id,total:row.total,paymentMethod:row.payment_method,status:row.status,shipping:JSON.parse(row.shipping_json),createdAt:row.created_at,items}}

function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

app.get('/api/health',(req,res)=>res.json({ok:true,service:'miseria-api'}));
app.post('/api/auth/register',async(req,res)=>{
 const name=String(req.body?.name||'').trim();
 const email=normalizeEmail(req.body?.email);
 const password=String(req.body?.password||'');
 if(name.length<2)return res.status(400).json({message:'Please enter your full name.'});
 if(!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({message:'Please enter a valid email address.'});
 if(password.length<8)return res.status(400).json({message:'Password must be at least 8 characters.'});
 const existing=db.prepare('SELECT id FROM users WHERE email=?').get(email);
 if(existing)return res.status(409).json({message:'An account with that email already exists. Try logging in.'});
 const hash=await bcrypt.hash(password,12);
 const result=db.prepare('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)').run(name,email,hash);
 const user=db.prepare('SELECT * FROM users WHERE id=?').get(result.lastInsertRowid);
 let welcomeEmailSent=false;
 try{welcomeEmailSent=await sendWelcomeEmail({name,email})}catch(error){console.error('Welcome email failed:',error.message)}
 res.status(201).json({token:signToken(user),user:publicUser(user),welcomeEmailSent});
});
app.post('/api/auth/login',async(req,res)=>{
 const email=normalizeEmail(req.body?.email);const password=String(req.body?.password||'');
 if(!email||!password)return res.status(400).json({message:'Email and password are required.'});
 const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
 if(!user||!(await bcrypt.compare(password,user.password_hash)))return res.status(401).json({message:'Email or password is incorrect.'});
 res.json({token:signToken(user),user:publicUser(user)});
});
app.get('/api/auth/me',auth,(req,res)=>res.json({user:publicUser(req.user)}));

app.get('/api/orders',auth,(req,res)=>{
 const rows=db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC').all(req.user.id);
 const itemStmt=db.prepare('SELECT product_id,product_name,quantity,unit_price FROM order_items WHERE order_id=?');
 res.json({orders:rows.map(row=>orderShape(row,itemStmt.all(row.id)))});
});

app.post('/api/orders',auth,async(req,res)=>{
 const items=Array.isArray(req.body?.items)?req.body.items:[];
 const shipping=cleanShipping(req.body?.shipping);
 const paymentMethod=String(req.body?.paymentMethod||'cod');
 if(!items.length)return res.status(400).json({message:'Your bag is empty.'});
 if(!validateShipping(shipping))return res.status(400).json({message:'Please complete your delivery details.'});
 if(paymentMethod!=='cod')return res.status(400).json({message:'Online payments are not enabled yet. Please choose cash on delivery.'});
 const cleanItems=items.map(i=>({productId:String(i.productId||''),name:String(i.name||'').trim(),quantity:Math.max(1,Math.min(99,Number(i.quantity)||1)),unitPrice:Math.max(0,Number(i.unitPrice)||0)})).filter(i=>i.productId&&i.name&&i.unitPrice>0);
 if(!cleanItems.length)return res.status(400).json({message:'No valid products were found in your bag.'});
 const total=cleanItems.reduce((sum,i)=>sum+i.quantity*i.unitPrice,0);
 const tx=db.transaction(()=>{
  const result=db.prepare('INSERT INTO orders(user_id,total,payment_method,shipping_json) VALUES(?,?,?,?)').run(req.user.id,total,paymentMethod,JSON.stringify(shipping));
  const stmt=db.prepare('INSERT INTO order_items(order_id,product_id,product_name,quantity,unit_price) VALUES(?,?,?,?,?)');
  cleanItems.forEach(i=>stmt.run(result.lastInsertRowid,i.productId,i.name,i.quantity,i.unitPrice));
  return result.lastInsertRowid;
 });
 const id=tx();
 const row=db.prepare('SELECT * FROM orders WHERE id=?').get(id);
 const order=orderShape(row,db.prepare('SELECT product_id,product_name,quantity,unit_price FROM order_items WHERE order_id=?').all(id));
 try{await sendOrderEmail({name:req.user.name,email:req.user.email,order})}catch(error){console.error('Order email failed:',error.message)}
 res.status(201).json({order});
});

app.use((req,res)=>res.status(404).json({message:'Route not found.'}));
app.listen(PORT,()=>console.log(`Miseria API running on http://localhost:${PORT}`));

const express=require("express");
const http=require("http");
const path=require("path");
const cors=require("cors");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
const PORT=process.env.PORT||10000;
const JWT_SECRET=process.env.JWT_SECRET||"rescuegrid-change-this-secret";

app.use(cors());
app.use(express.json({limit:"8mb"}));
app.use(express.static(path.join(__dirname,"public")));

const users=[];
const incidents=[
 {id:"RG-1001",name:"Medical assistance",place:"North Academic Block",sev:"HIGH",age:"2 min",skill:"Medical",status:"ASSIGNED",lat:16.3067,lng:80.4365,createdAt:Date.now()-120000},
 {id:"RG-1002",name:"Security concern",place:"Hostel Zone B",sev:"HIGH",age:"5 min",skill:"Security",status:"OPEN",lat:16.3075,lng:80.4381,createdAt:Date.now()-300000},
 {id:"RG-1003",name:"Minor injury",place:"Sports Ground",sev:"MED",age:"8 min",skill:"Medical",status:"OPEN",lat:16.3055,lng:80.4351,createdAt:Date.now()-480000}
];

const safeUser=u=>({id:u.id,name:u.name,email:u.email,role:u.role});
function auth(req,res,next){
 const h=req.headers.authorization||"";
 if(!h.startsWith("Bearer "))return res.status(401).json({error:"Authentication required"});
 try{req.user=jwt.verify(h.slice(7),JWT_SECRET);next()}catch{res.status(401).json({error:"Session expired"})}
}
app.get("/api/health",(req,res)=>res.json({ok:true,service:"RescueGrid Response Network",time:new Date().toISOString()}));
app.post("/api/auth/register",async(req,res)=>{
 const {name,email,password,role="Student"}=req.body;
 if(!name||!email||!password)return res.status(400).json({error:"Name, email and password are required"});
 if(users.some(u=>u.email===email.toLowerCase()))return res.status(409).json({error:"Account already exists"});
 const user={id:"U-"+Date.now(),name,email:email.toLowerCase(),password:await bcrypt.hash(password,12),role};
 users.push(user);
 const token=jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},JWT_SECRET,{expiresIn:"24h"});
 res.json({token,user:safeUser(user)});
});
app.post("/api/auth/login",async(req,res)=>{
 const {email,password,role}=req.body;
 const user=users.find(u=>u.email===String(email||"").toLowerCase()&&u.role===role);
 if(!user||!(await bcrypt.compare(password||"",user.password)))return res.status(401).json({error:"Invalid email, password or role"});
 const token=jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},JWT_SECRET,{expiresIn:"24h"});
 res.json({token,user:safeUser(user)});
});
app.get("/api/incidents",(req,res)=>res.json({incidents}));
app.post("/api/incidents",auth,(req,res)=>{
 const {category,description,location,lat,lng,evidence}=req.body;
 const sev=["Fire","Security","Medical","Accident"].includes(category)?"HIGH":category==="Harassment"?"MED":"LOW";
 const incident={id:"RG-"+Date.now().toString().slice(-7),name:category+" emergency",place:location||"Campus Central",sev,age:"now",skill:category,status:"OPEN",description:description||"",lat:lat||null,lng:lng||null,evidence:evidence||null,reporter:req.user.name,createdAt:Date.now()};
 incidents.unshift(incident);
 io.emit("incident:new",incident);
 res.status(201).json({incident});
});
app.patch("/api/incidents/:id",auth,(req,res)=>{
 const i=incidents.find(x=>x.id===req.params.id);
 if(!i)return res.status(404).json({error:"Incident not found"});
 Object.assign(i,req.body);
 i.updatedAt=Date.now();
 io.emit("incident:update",i);
 res.json({incident:i});
});
app.get("/api/stats",(req,res)=>res.json({active:incidents.filter(i=>i.status!=="RESOLVED").length,respondersOnline:12,networkHealth:99,averageResponse:"02:14"}));
io.on("connection",socket=>{socket.emit("system:ready",{message:"RescueGrid realtime channel connected"})});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
server.listen(PORT,()=>console.log("RescueGrid live server listening on "+PORT));
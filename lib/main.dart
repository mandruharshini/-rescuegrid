import 'dart:async';
import 'dart:math' as math;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

void main() => runApp(const RescueGridApp());

class RescueGridApp extends StatefulWidget {
  const RescueGridApp({super.key});
  @override State<RescueGridApp> createState() => _RescueGridAppState();
}
class _RescueGridAppState extends State<RescueGridApp> {
  final c = RescueController();
  @override void initState(){super.initState();c.start();}
  @override void dispose(){c.dispose();super.dispose();}
  @override Widget build(BuildContext context)=>AnimatedBuilder(
    animation:c,
    builder:(_,__)=>MaterialApp(
      debugShowCheckedModeBanner:false,
      title:'RescueGrid',
      theme:ThemeData(brightness:Brightness.dark,useMaterial3:true,scaffoldBackgroundColor:const Color(0xFF071019),colorScheme:ColorScheme.fromSeed(seedColor:const Color(0xFF18D7C2),brightness:Brightness.dark)),
      home:c.loggedIn?Home(c:c):Login(c:c),
    ),
  );
}

enum Role{student,responder,admin}
enum Category{medical,fire,security,hazard}
enum Status{reported,assigned,accepted,enRoute,onScene,resolved}

extension CategoryX on Category{
  String get label=>switch(this){Category.medical=>'Medical',Category.fire=>'Fire',Category.security=>'Security',Category.hazard=>'Hazard'};
  IconData get icon=>switch(this){Category.medical=>Icons.medical_services,Category.fire=>Icons.local_fire_department,Category.security=>Icons.shield,Category.hazard=>Icons.warning_amber};
}
extension StatusX on Status{String get label=>switch(this){Status.reported=>'Reported',Status.assigned=>'Assigned',Status.accepted=>'Accepted',Status.enRoute=>'En route',Status.onScene=>'On scene',Status.resolved=>'Resolved'};}

class EventLog{
  EventLog(this.title,this.actor,this.time);
  final String title,actor;final DateTime time;
}
class Incident{
  Incident({required this.id,required this.category,required this.location,required this.description,required this.created,this.photo,this.reporter='You',this.priority=2,this.lat,this.lng});
  final String id,location,description,reporter;final Category category;final DateTime created;final Uint8List? photo;final int priority;final double? lat,lng;
  Status status=Status.reported;String? assigned;bool backup=false;final events=<EventLog>[];
  String get priorityText=>priority>=3?'CRITICAL':priority==2?'HIGH':'NORMAL';
}
class Responder{
  Responder(this.name,this.unit,this.skills,this.distance,this.available);
  final String name,unit;final List<String> skills;final double distance;bool available;
}

class RescueController extends ChangeNotifier{
  bool loggedIn=false;Role role=Role.student;Position? position;String location='Campus GPS not locked';bool locating=false;Uint8List? photo;
  final incidents=<Incident>[];final alerts=<String>[];
  final responders=<Responder>[
    Responder('Jordan Lee','MED-02',['Medical','First Aid'],0.4,true),
    Responder('Aisha Khan','SEC-01',['Security','Crowd'],0.7,true),
    Responder('Ravi Kumar','FIRE-03',['Fire','Hazard'],1.1,true),
    Responder('Maya Chen','MED-04',['Medical'],1.8,false),
  ];
  Timer? timer;
  void start(){timer=Timer.periodic(const Duration(seconds:12),(_)=>notifyListeners());}
  @override void dispose(){timer?.cancel();super.dispose();}
  void login(Role r){role=r;loggedIn=true;notifyListeners();}
  void logout(){loggedIn=false;notifyListeners();}
  Future<void> gps()async{
    locating=true;notifyListeners();
    try{
      if(!await Geolocator.isLocationServiceEnabled())throw Exception();
      var p=await Geolocator.checkPermission();
      if(p==LocationPermission.denied)p=await Geolocator.requestPermission();
      if(p==LocationPermission.denied||p==LocationPermission.deniedForever)throw Exception();
      position=await Geolocator.getCurrentPosition();
      location='GPS locked • ±10 m';
    }catch(_){location='Demo GPS • Central Campus';}
    locating=false;notifyListeners();
  }
  Future<void> camera()async{
    final x=await ImagePicker().pickImage(source:ImageSource.camera,imageQuality:70);
    if(x!=null)photo=await x.readAsBytes();notifyListeners();
  }
  void clearPhoto(){photo=null;notifyListeners();}
  Incident report(Category cat,String desc){
    final id='RG-\${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final i=Incident(id:id,category:cat,location:location,description:desc.isEmpty?'Emergency reported from campus.':desc,created:DateTime.now(),photo:photo,priority:(cat==Category.fire||cat==Category.medical)?3:2,lat:position?.latitude,lng:position?.longitude);
    i.events.add(EventLog('Emergency reported','Student',i.created));incidents.insert(0,i);photo=null;alerts.insert(0,'New \${cat.label} incident \$id');assign(i);notifyListeners();return i;
  }
  void assign(Incident i){
    final list=responders.where((r)=>r.available&&(r.skills.contains(i.category.label)||(i.category==Category.medical&&r.skills.contains('First Aid')))).toList()..sort((a,b)=>a.distance.compareTo(b.distance));
    if(list.isEmpty)return;
    final r=list.first;r.available=false;i.assigned=r.name;i.status=Status.assigned;i.events.add(EventLog('Responder assigned',r.name,DateTime.now()));alerts.insert(0,'\${r.unit} assigned to \${i.id}');
  }
  void status(Incident i,Status s){
    i.status=s;i.events.add(EventLog(s.label,i.assigned??'Command Center',DateTime.now()));
    if(s==Status.resolved&&i.assigned!=null){for(final r in responders){if(r.name==i.assigned)r.available=true;}}
    alerts.insert(0,'\${i.id}: \${s.label}');notifyListeners();
  }
  void backup(Incident i){i.backup=true;i.events.add(EventLog('Backup requested',i.assigned??'Responder',DateTime.now()));alerts.insert(0,'Backup requested for \${i.id}');notifyListeners();}
}

class Login extends StatelessWidget{
  const Login({super.key,required this.c});final RescueController c;
  @override Widget build(BuildContext context)=>Scaffold(body:Stack(children:[
    const Positioned.fill(child:CustomPaint(painter:GridPainter())),
    Center(child:SingleChildScrollView(padding:const EdgeInsets.all(22),child:ConstrainedBox(constraints:const BoxConstraints(maxWidth:520),child:Glass(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Row(children:[Container(padding:const EdgeInsets.all(11),decoration:BoxDecoration(color:Colors.redAccent.withOpacity(.12),borderRadius:BorderRadius.circular(14)),child:const Icon(Icons.radar,color:Colors.redAccent)),const SizedBox(width:12),const Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('RESCUEGRID',style:TextStyle(fontSize:22,fontWeight:FontWeight.w900,letterSpacing:2)),Text('CAMPUS RESPONSE NETWORK',style:TextStyle(fontSize:9,letterSpacing:2,color:Colors.white38))])]),
      const SizedBox(height:32),const Text('Emergency response,',style:TextStyle(fontSize:30,fontWeight:FontWeight.w900)),const Text('connected in real time.',style:TextStyle(fontSize:30,fontWeight:FontWeight.w900,color:Color(0xFF18D7C2))),const SizedBox(height:10),const Text('Flutter-only RescueGrid demo with student, responder and command roles.',style:TextStyle(color:Colors.white54)),
      const SizedBox(height:26),...Role.values.map((r)=>Padding(padding:const EdgeInsets.only(bottom:10),child:RoleButton(r,()=>c.login(r)))),
    ]))))),
  ]));
}

class RoleButton extends StatelessWidget{
  const RoleButton(this.role,this.tap,{super.key});final Role role;final VoidCallback tap;
  @override Widget build(BuildContext context){final icon=role==Role.student?Icons.school:role==Role.responder?Icons.health_and_safety:Icons.admin_panel_settings;final name=role==Role.student?'Student':role==Role.responder?'Responder':'Command Admin';final sub=role==Role.student?'Report emergency with GPS and photo':role==Role.responder?'Receive assignments and navigate':'Monitor incidents and manage response';return InkWell(onTap:tap,borderRadius:BorderRadius.circular(16),child:Ink(decoration:BoxDecoration(color:Colors.white.withOpacity(.04),borderRadius:BorderRadius.circular(16),border:Border.all(color:Colors.white10)),padding:const EdgeInsets.all(16),child:Row(children:[Icon(icon,color:const Color(0xFF18D7C2)),const SizedBox(width:14),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(name,style:const TextStyle(fontWeight:FontWeight.w800)),const SizedBox(height:3),Text(sub,style:const TextStyle(fontSize:11,color:Colors.white45))])),const Icon(Icons.arrow_forward_ios,size:14,color:Colors.white38)])));}
}

class Home extends StatefulWidget{
  const Home({super.key,required this.c});final RescueController c;
  @override State<Home> createState()=>_HomeState();
}
class _HomeState extends State<Home>{
  int tab=0;RescueController get c=>widget.c;
  @override Widget build(BuildContext context){
    final labels=c.role==Role.student?['SOS','My Reports']:c.role==Role.responder?['Assignments','Live Map','History']:['Command','Analytics','History'];
    final pages=c.role==Role.student?[Student(c:c),Reports(c:c)]:c.role==Role.responder?[ResponderView(c:c),MapView(c:c),History(c:c)]:[Command(c:c),Analytics(c:c),History(c:c)];
    return Scaffold(
      appBar:AppBar(backgroundColor:const Color(0xCC071019),title:const Row(children:[Icon(Icons.radar,color:Colors.redAccent),SizedBox(width:8),Text('RESCUE',style:TextStyle(fontWeight:FontWeight.w900)),Text('GRID',style:TextStyle(color:Colors.redAccent,fontWeight:FontWeight.w900))]),actions:[
        if(c.alerts.isNotEmpty)IconButton(onPressed:()=>showModalBottomSheet(context:context,backgroundColor:const Color(0xFF101D27),builder:(_)=>ListView(padding:const EdgeInsets.all(18),children:[const Text('LIVE NOTIFICATIONS',style:TextStyle(letterSpacing:2,fontWeight:FontWeight.w800)),const SizedBox(height:12),...c.alerts.take(12).map((x)=>ListTile(leading:const Icon(Icons.circle,size:8,color:Colors.redAccent),title:Text(x),subtitle:const Text('RescueGrid signal',style:TextStyle(color:Colors.white38)))])),icon:Badge(label:Text('\${c.alerts.length}'),child:const Icon(Icons.notifications_outlined))),
        PopupMenuButton<Role>(initialValue:c.role,onSelected:(r){c.role=r;tab=0;c.notifyListeners();},itemBuilder:(_)=>const[PopupMenuItem(value:Role.student,child:Text('Student')),PopupMenuItem(value:Role.responder,child:Text('Responder')),PopupMenuItem(value:Role.admin,child:Text('Command Admin'))]),
        IconButton(onPressed:c.logout,icon:const Icon(Icons.logout)),
      ]),
      body:IndexedStack(index:tab,children:pages),
      bottomNavigationBar:NavigationBar(selectedIndex:tab,onDestinationSelected:(i)=>setState(()=>tab=i),destinations:labels.map((x)=>NavigationDestination(icon:Icon(navIcon(x)),label:x)).toList()),
    );
  }
  IconData navIcon(String x)=>switch(x){'SOS'=>Icons.sos,'My Reports'=>Icons.history,'Assignments'=>Icons.assignment,'Live Map'=>Icons.map,'Command'=>Icons.dashboard,'Analytics'=>Icons.bar_chart,_=>Icons.history};
}

class Student extends StatefulWidget{const Student({super.key,required this.c});final RescueController c;@override State<Student> createState()=>_StudentState();}
class _StudentState extends State<Student>{
  Category cat=Category.medical;final desc=TextEditingController();bool sent=false;
  @override void dispose(){desc.dispose();super.dispose();}
  @override Widget build(BuildContext context){
    if(sent)return Success(onAgain:()=>setState(()=>sent=false));
    return ListView(padding:const EdgeInsets.all(18),children:[
      const TitleBlock('EMERGENCY REPORT','What is happening?','Choose the situation. RescueGrid attaches your location and alerts the matching response team.'),
      const SizedBox(height:18),Wrap(spacing:9,runSpacing:9,children:Category.values.map((x)=>ChoiceChip(label:Padding(padding:const EdgeInsets.symmetric(vertical:9),child:Row(mainAxisSize:MainAxisSize.min,children:[Icon(x.icon,size:18),const SizedBox(width:7),Text(x.label)])),selected:cat==x,onSelected:(_)=>setState(()=>cat=x))).toList()),
      const SizedBox(height:16),Glass(child:Column(children:[
        ListTile(leading:const Icon(Icons.location_on,color:Color(0xFF18D7C2)),title:const Text('Incident location'),subtitle:Text(widget.c.location),trailing:FilledButton.tonalIcon(onPressed:widget.c.locating?null:widget.c.gps,icon:widget.c.locating?const SizedBox(width:16,height:16,child:CircularProgressIndicator(strokeWidth:2)):const Icon(Icons.gps_fixed),label:const Text('GPS'))),
        const Divider(color:Colors.white10),TextField(controller:desc,maxLines:4,decoration:const InputDecoration(border:InputBorder.none,contentPadding:EdgeInsets.all(16),hintText:'Optional description')),
        const Divider(color:Colors.white10),if(widget.c.photo!=null)Padding(padding:const EdgeInsets.all(12),child:Row(children:[ClipRRect(borderRadius:BorderRadius.circular(10),child:Image.memory(widget.c.photo!,width:65,height:65,fit:BoxFit.cover)),const SizedBox(width:12),const Expanded(child:Text('Evidence photo attached')),IconButton(onPressed:widget.c.clearPhoto,icon:const Icon(Icons.close))]) else ListTile(leading:const Icon(Icons.camera_alt_outlined),title:const Text('Attach photograph'),subtitle:const Text('Optional evidence'),onTap:widget.c.camera),
      ])),
      const SizedBox(height:15),SizedBox(height:56,child:FilledButton.icon(style:FilledButton.styleFrom(backgroundColor:Colors.redAccent),onPressed:(){widget.c.report(cat,desc.text);setState(()=>sent=true);},icon:const Icon(Icons.sos),label:const Text('SEND EMERGENCY ALERT',style:TextStyle(fontWeight:FontWeight.w900,letterSpacing:.5)))),
      const SizedBox(height:16),Glass(child:Row(children:[const Icon(Icons.psychology,color:Colors.amber),const SizedBox(width:12),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Text('SEVERITY ENGINE',style:TextStyle(fontSize:9,letterSpacing:1.8,color:Colors.white45)),const SizedBox(height:4),Text(cat==Category.fire||cat==Category.medical?'High / Critical priority detected':'Normal / High priority detected',style:const TextStyle(fontWeight:FontWeight.w700)),const Text('Category + location risk + context',style:TextStyle(fontSize:10,color:Colors.white38))]))])),
    ]);
  }
}

class Reports extends StatelessWidget{const Reports({super.key,required this.c});final RescueController c;@override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(18),children:[const TitleBlock('STUDENT SAFETY','My reports','Track assignment, responder progress and resolution.'),const SizedBox(height:16),if(c.incidents.isEmpty)const Empty('No emergency reports yet.')else...c.incidents.map((i)=>IncidentCard(i:i,expanded:true))]);}

class ResponderView extends StatelessWidget{
  const ResponderView({super.key,required this.c});final RescueController c;
  @override Widget build(BuildContext context){final active=c.incidents.where((i)=>i.status!=Status.resolved).toList();return ListView(padding:const EdgeInsets.all(18),children:[const TitleBlock('FIELD UNIT • MED-02','Responder console','Assignments rank severity, skill match and distance.'),const SizedBox(height:16),Metrics(items:[('ACTIVE','\${active.length}',Colors.redAccent),('AVAILABLE','\${c.responders.where((r)=>r.available).length}',Colors.greenAccent),('ETA','03:42',Colors.cyanAccent)]),const SizedBox(height:16),if(active.isEmpty)const Empty('No active assignments. Stay ready.')else...active.map((i)=>ResponderCard(c:c,i:i))]);}
}
class ResponderCard extends StatelessWidget{
  const ResponderCard({super.key,required this.c,required this.i});final RescueController c;final Incident i;
  @override Widget build(BuildContext context)=>Padding(padding:const EdgeInsets.only(bottom:12),child:Glass(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
    Row(children:[Icon(i.category.icon,color:Colors.redAccent),const SizedBox(width:9),Expanded(child:Text(i.category.label,style:const TextStyle(fontWeight:FontWeight.w800,fontSize:16))),Priority(i.priorityText)]),
    const SizedBox(height:7),Text(i.location,style:const TextStyle(color:Colors.white65)),const SizedBox(height:5),Text(i.description,style:const TextStyle(fontSize:11,color:Colors.white45)),const SizedBox(height:13),StatusBar(i:i),const SizedBox(height:13),
    Wrap(spacing:8,runSpacing:8,children:[
      if(i.status==Status.assigned)FilledButton(onPressed:()=>c.status(i,Status.accepted),child:const Text('Accept')),
      if(i.status==Status.accepted)FilledButton(onPressed:()async{c.status(i,Status.enRoute);await openMap(i);},child:const Text('Navigate')),
      if(i.status==Status.enRoute)FilledButton(onPressed:()=>c.status(i,Status.onScene),child:const Text('On scene')),
      if(i.status==Status.onScene)FilledButton(onPressed:()=>c.status(i,Status.resolved),child:const Text('Resolve')),
      OutlinedButton(onPressed:()=>c.backup(i),child:Text(i.backup?'Backup requested':'Request backup')),
    ]),
  ])));
}

class Command extends StatelessWidget{
  const Command({super.key,required this.c});final RescueController c;
  @override Widget build(BuildContext context){final active=c.incidents.where((i)=>i.status!=Status.resolved).toList();return ListView(padding:const EdgeInsets.all(18),children:[const TitleBlock('UNIFIED COMMAND • SECTOR 01','Emergency operations','Monitor incidents and response units across campus.'),const SizedBox(height:16),Metrics(items:[('ACTIVE','\${active.length}',Colors.redAccent),('UNITS','\${c.responders.length}',Colors.cyanAccent),('READY','\${c.responders.where((r)=>r.available).length}',Colors.greenAccent)]),const SizedBox(height:16),SizedBox(height:370,child:CampusMap(incidents:active)),const SizedBox(height:16),if(active.isEmpty)const Empty('Campus clear. Waiting for signals.')else...active.map((i)=>IncidentCard(i:i,expanded:true))]);}
}
class Analytics extends StatelessWidget{
  const Analytics({super.key,required this.c});final RescueController c;
  @override Widget build(BuildContext context){final total=c.incidents.length;return ListView(padding:const EdgeInsets.all(18),children:[const TitleBlock('COMMAND ANALYTICS','Response intelligence','Operational statistics from the incident timeline.'),const SizedBox(height:16),Metrics(items:[('REPORTS','$total',Colors.cyanAccent),('CRITICAL','\${c.incidents.where((i)=>i.priority>=3).length}',Colors.redAccent),('RESOLVED','\${c.incidents.where((i)=>i.status==Status.resolved).length}',Colors.greenAccent)]),const SizedBox(height:16),Glass(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Text('INCIDENT CATEGORIES',style:TextStyle(fontSize:10,letterSpacing:1.5,color:Colors.white45)),const SizedBox(height:16),...Category.values.map((cat){final n=c.incidents.where((i)=>i.category==cat).length;final ratio=total==0?0:n/total;return Padding(padding:const EdgeInsets.only(bottom:14),child:Row(children:[SizedBox(width:85,child:Text(cat.label,style:const TextStyle(fontSize:12))),Expanded(child:ClipRRect(borderRadius:BorderRadius.circular(8),child:LinearProgressIndicator(value:ratio,minHeight:9))),const SizedBox(width:10),Text('$n')]);})]))]);}
}
class History extends StatelessWidget{const History({super.key,required this.c});final RescueController c;@override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(18),children:[const TitleBlock('AUDIT TRAIL','Incident timeline','Chronological record of reporting, scoring, assignment, acceptance, arrival and resolution.'),const SizedBox(height:16),...c.incidents.map((i)=>IncidentCard(i:i,expanded:true))]);}
class MapView extends StatelessWidget{const MapView({super.key,required this.c});final RescueController c;@override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(18),children:[const TitleBlock('LIVE RESPONSE MAP','Campus tactical view','Incident locations and responder progress.'),const SizedBox(height:16),SizedBox(height:540,child:CampusMap(incidents:c.incidents.where((i)=>i.status!=Status.resolved).toList()))]);}

class CampusMap extends StatelessWidget{
  const CampusMap({super.key,required this.incidents});final List<Incident> incidents;
  @override Widget build(BuildContext context)=>ClipRRect(borderRadius:BorderRadius.circular(20),child:Stack(children:[const Positioned.fill(child:CustomPaint(painter:CampusPainter())),const Positioned(top:16,left:16,child:MapTag()),...List.generate(math.min(incidents.length,5),(n)=>Positioned(left:60.0+(n*67)%230,top:100.0+(n*81)%260,child:Pulse(color:n==0?Colors.redAccent:Colors.cyanAccent)),),const Positioned(left:16,right:16,bottom:16,child:MapLegend())]));}
class CampusPainter extends CustomPainter{
  const CampusPainter();
  @override void paint(Canvas canvas,Size s){canvas.drawRect(Offset.zero& s,Paint()..color=const Color(0xFF08141D));final grid=Paint()..color=const Color(0xFF15313A)..strokeWidth=1;for(double x=0;x<s.width;x+=32)canvas.drawLine(Offset(x,0),Offset(x,s.height),grid);for(double y=0;y<s.height;y+=32)canvas.drawLine(Offset(0,y),Offset(s.width,y),grid);final road=Paint()..color=const Color(0xFF1B3440)..strokeWidth=20..strokeCap=StrokeCap.round;canvas.drawLine(Offset(s.width*.04,s.height*.8),Offset(s.width*.45,s.height*.25),road);canvas.drawLine(Offset(s.width*.45,s.height*.25),Offset(s.width*.94,s.height*.72),road);canvas.drawLine(Offset(s.width*.1,s.height*.2),Offset(s.width*.84,s.height*.35),road);final b=Paint()..color=const Color(0xFF10232D);for(final r in [Rect.fromLTWH(s.width*.1,s.height*.48,100,65),Rect.fromLTWH(s.width*.57,s.height*.15,110,72),Rect.fromLTWH(s.width*.68,s.height*.5,130,80)])canvas.drawRRect(RRect.fromRectAndRadius(r,const Radius.circular(8)),b);}
  @override bool shouldRepaint(covariant CustomPainter oldDelegate)=>false;
}
class Pulse extends StatefulWidget{const Pulse({super.key,required this.color});final Color color;@override State<Pulse> createState()=>_PulseState();}
class _PulseState extends State<Pulse>with SingleTickerProviderStateMixin{late AnimationController a;@override void initState(){super.initState();a=AnimationController(vsync:this,duration:const Duration(milliseconds:1400))..repeat();}@override void dispose(){a.dispose();super.dispose();}@override Widget build(BuildContext context)=>AnimatedBuilder(animation:a,builder:(_,__)=>Container(width:28+12*a.value,height:28+12*a.value,decoration:BoxDecoration(shape:BoxShape.circle,color:widget.color.withOpacity(.12),border:Border.all(color:widget.color.withOpacity(1-a.value),width:2))));}
class MapTag extends StatelessWidget{const MapTag({super.key});@override Widget build(BuildContext c)=>Container(padding:const EdgeInsets.symmetric(horizontal:12,vertical:9),decoration:BoxDecoration(color:Colors.black54,borderRadius:BorderRadius.circular(10),border:Border.all(color:Colors.white12)),child:const Row(children:[Icon(Icons.radar,size:15,color:Colors.cyanAccent),SizedBox(width:7),Text('LIVE CAMPUS TELEMETRY',style:TextStyle(fontSize:9,letterSpacing:1.5))]));}
class MapLegend extends StatelessWidget{const MapLegend({super.key});@override Widget build(BuildContext c)=>Container(padding:const EdgeInsets.all(12),decoration:BoxDecoration(color:Colors.black54,borderRadius:BorderRadius.circular(12)),child:const Row(mainAxisAlignment:MainAxisAlignment.spaceAround,children:[LegendDot(Colors.redAccent,'CRITICAL'),LegendDot(Colors.cyanAccent,'RESPONDING'),LegendDot(Colors.greenAccent,'AVAILABLE')]);}}
class LegendDot extends StatelessWidget{const LegendDot(this.color,this.text,{super.key});final Color color;final String text;@override Widget build(BuildContext c)=>Row(children:[Container(width:7,height:7,decoration:BoxDecoration(color:color,shape:BoxShape.circle)),const SizedBox(width:5),Text(text,style:const TextStyle(fontSize:8,color:Colors.white54))]);}

class IncidentCard extends StatelessWidget{
  const IncidentCard({super.key,required this.i,this.expanded=false});final Incident i;final bool expanded;
  @override Widget build(BuildContext context)=>Padding(padding:const EdgeInsets.only(bottom:10),child:Glass(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
    Row(children:[Icon(i.category.icon,color:Colors.redAccent),const SizedBox(width:9),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(i.category.label,style:const TextStyle(fontWeight:FontWeight.w800)),Text(i.location,style:const TextStyle(fontSize:10,color:Colors.white45))])),Priority(i.priorityText)]),const SizedBox(height:8),Text(i.description,style:const TextStyle(fontSize:12,color:Colors.white65)),const SizedBox(height:11),StatusBar(i:i),
    if(expanded)...[const Divider(color:Colors.white10),...i.events.map((e)=>ListTile(contentPadding:EdgeInsets.zero,dense:true,leading:const Icon(Icons.check_circle_outline,size:16,color:Colors.cyanAccent),title:Text(e.title,style:const TextStyle(fontSize:12)),subtitle:Text(e.actor,style:const TextStyle(fontSize:10,color:Colors.white38)),trailing:Text(timeText(e.time),style:const TextStyle(fontSize:9,color:Colors.white38))))],
  ])));
}
class StatusBar extends StatelessWidget{const StatusBar({super.key,required this.i});final Incident i;@override Widget build(BuildContext c){final n=Status.values.indexOf(i.status);return Row(children:Status.values.map((s){final done=Status.values.indexOf(s)<=n;return Expanded(child:Container(margin:const EdgeInsets.only(right:3),height:6,decoration:BoxDecoration(color:done?Colors.cyanAccent:Colors.white10,borderRadius:BorderRadius.circular(9))));}).toList());}}
class Priority extends StatelessWidget{const Priority(this.text,{super.key});final String text;@override Widget build(BuildContext c)=>Container(padding:const EdgeInsets.symmetric(horizontal:8,vertical:5),decoration:BoxDecoration(color:(text=='CRITICAL'?Colors.redAccent:Colors.amber).withOpacity(.12),borderRadius:BorderRadius.circular(20)),child:Text(text,style:TextStyle(fontSize:9,fontWeight:FontWeight.w900,color:text=='CRITICAL'?Colors.redAccent:Colors.amber)));}
class Metrics extends StatelessWidget{const Metrics({super.key,required this.items});final List<(String,String,Color)> items;@override Widget build(BuildContext c)=>Row(children:items.map((x)=>Expanded(child:Padding(padding:const EdgeInsets.only(right:8),child:Glass(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(x.$1,style:const TextStyle(fontSize:9,color:Colors.white45,letterSpacing:1)),const SizedBox(height:6),Text(x.$2,style:TextStyle(fontSize:23,fontWeight:FontWeight.w900,color:x.$3))])))).toList());}}
class TitleBlock extends StatelessWidget{const TitleBlock(this.eyebrow,this.title,this.subtitle,{super.key});final String eyebrow,title,subtitle;@override Widget build(BuildContext c)=>Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(eyebrow,style:const TextStyle(fontSize:9,letterSpacing:2,color:Colors.cyanAccent)),const SizedBox(height:6),Text(title,style:const TextStyle(fontSize:28,fontWeight:FontWeight.w900)),const SizedBox(height:5),Text(subtitle,style:const TextStyle(fontSize:12,color:Colors.white45,height:1.45))]);}
class Glass extends StatelessWidget{const Glass({super.key,required this.child});final Widget child;@override Widget build(BuildContext c)=>Container(padding:const EdgeInsets.all(16),decoration:BoxDecoration(color:Colors.white.withOpacity(.045),borderRadius:BorderRadius.circular(18),border:Border.all(color:Colors.white.withOpacity(.08)),boxShadow:[BoxShadow(color:Colors.black.withOpacity(.28),blurRadius:24,offset:const Offset(0,12))]),child:child);}
class Empty extends StatelessWidget{const Empty(this.text,{super.key});final String text;@override Widget build(BuildContext c)=>Glass(child:SizedBox(width:double.infinity,child:Column(children:[const Icon(Icons.check_circle_outline,color:Colors.greenAccent,size:46),const SizedBox(height:10),Text(text,style:const TextStyle(color:Colors.white54))])));}
class Success extends StatelessWidget{const Success({super.key,required this.onAgain});final VoidCallback onAgain;@override Widget build(BuildContext c)=>Center(child:Padding(padding:const EdgeInsets.all(22),child:Glass(child:Column(mainAxisSize:MainAxisSize.min,children:[const Icon(Icons.verified,color:Colors.greenAccent,size:70),const SizedBox(height:16),const Text('HELP IS BEING DISPATCHED',style:TextStyle(fontSize:19,fontWeight:FontWeight.w900,letterSpacing:1)),const SizedBox(height:8),const Text('Your emergency report and location are now in the response network.',textAlign:TextAlign.center,style:TextStyle(color:Colors.white54)),const SizedBox(height:20),FilledButton(onPressed:onAgain,child:const Text('Create another report'))])));}
class GridPainter extends CustomPainter{const GridPainter();@override void paint(Canvas c,Size s){c.drawRect(Offset.zero&s,Paint()..color=const Color(0xFF071019));final p=Paint()..color=const Color(0xFF102831)..strokeWidth=1;for(double x=0;x<s.width;x+=34)c.drawLine(Offset(x,0),Offset(x,s.height),p);for(double y=0;y<s.height;y+=34)c.drawLine(Offset(0,y),Offset(s.width,y),p);}@override bool shouldRepaint(covariant CustomPainter oldDelegate)=>false;}
String timeText(DateTime t)=>'\${t.hour.toString().padLeft(2,'0')}:\${t.minute.toString().padLeft(2,'0')}';
Future<void> openMap(Incident i)async{if(i.lat==null||i.lng==null)return;final u=Uri.parse('https://www.google.com/maps/dir/?api=1&destination=\${i.lat},\${i.lng}');if(await canLaunchUrl(u))await launchUrl(u,mode:LaunchMode.externalApplication);}

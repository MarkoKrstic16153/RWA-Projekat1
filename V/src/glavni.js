import {interval, range, Observable, Subscription, Subject, fromEvent, from, forkJoin, zip} from "rxjs";
import { filter,map,distinct,take, takeUntil ,takeWhile, retry, sampleTime, debounceTime, switchMap, pairwise, scan} from "rxjs/operators";
import {Pitanje} from "./Pitanje.js";
import {Odgovor} from "./Odgovor.js"
import{User} from "./User.js";
let ime="";
let idUser="";
let listaPitanja=[];
let listaSubPitanja=[];
let rii=true;
let een=true;
let ups=true;
let controlStream=new Subject();
controlStream.subscribe(x=>console.log(x));
let riiStream;
let eenStream;
let upsStream;
function generisiNaslov()
{
    const naslov=document.createElement("h2");
    naslov.innerHTML="ePitalica?";
    document.body.appendChild(naslov); 
    if(ime!="")
    {
        const otac=document.createElement("div");
        const logoutButton=document.createElement("button");
        logoutButton.innerHTML="Log out";
        logoutButton.className="OGLOC";
        logoutButton.style.display="inline";
        const mojaPitanja=document.createElement("button");
        mojaPitanja.innerHTML="Moja Pitanja";
        mojaPitanja.className="OGLOC";
        const clearDugme = document.createElement("button");
        clearDugme.innerHTML="Clear";
        clearDugme.className="OGLOC";
        clearDugme.onclick=()=>{listaPitanja=[]; nacrtajPitanja(document.querySelector(".pitanja"));}
        document.body.appendChild(otac);
        otac.appendChild(logoutButton);
        otac.appendChild(mojaPitanja);
        otac.appendChild(clearDugme);
        logoutButton.onclick= (ev) => {
            
            const podaci={      
                method:"put",
                headers: new Headers({
                  'Content-Type': 'application/json', // <-- Specifying the Content-Type
            }),
                body: JSON.stringify(ime)
            };
            from(
                fetch("http://localhost:3000/users/"+idUser,podaci)//("http://localhost:3000/users/"+idUser,podaci)
                .then(response => response.json())
            ).subscribe(user=>{ console.log(user)});
            document.body.innerHTML="";
            ime="";
            generisiNaslov();
            generisiLogin();
            generisiSignUp();

        }
        mojaPitanja.onclick= (ev)=>{
            listaPitanja=[];
            document.querySelector(".pitanja").innerHTML="";
            from(
                fetch("http://localhost:3000/pitanja?autor="+ime.username)
                .then(response => response.json())
            ).subscribe(user=>{ dodajPitanja(user,document.querySelector(".pitanja"))});
        }
    }
}
function generisiLogin(){
    const otac=document.createElement("div");
    otac.className="init";
    const par=document.createElement("p");
    par.innerHTML="Dobrodosli nazad, Ulogujte se ...";
const userNameDom=document.createElement("input");
userNameDom.name="user";
const passwordDom=document.createElement("input");
passwordDom.name="pass";
passwordDom.type="password";
const div=document.createElement("div");
div.appendChild(par);
let labela1=document.createElement("label");
labela1.innerHTML="Username";
let labela2=document.createElement("label");
labela2.innerHTML="Password";
let div1=document.createElement("div");
let div2=document.createElement("div");
div1.appendChild(labela1);
div1.appendChild(userNameDom);
div2.appendChild(labela2);
div2.appendChild(passwordDom);
div.appendChild(div1);
div.appendChild(div2);
otac.appendChild(div);
document.body.appendChild(otac);
const loginKomentar=document.createElement("article");
div.appendChild(loginKomentar);
const dugme=document.createElement("button");
dugme.innerHTML="Login";
div.appendChild(dugme);
dugme.onclick=(ev)=>
{
    login();
}
}
function generisiSignUp()
{
    let otac=document.querySelector(".init");
    const par=document.createElement("p");
    par.innerHTML="Nemate Nalog, napravite ga ";
    const userNameDom=document.createElement("input");
userNameDom.name="user1";
const passwordDom=document.createElement("input");
passwordDom.name="pass1";
passwordDom.type="password";

const div=document.createElement("div");
div.appendChild(par);
let labela1=document.createElement("label");
labela1.innerHTML="Username";
let labela2=document.createElement("label");
labela2.innerHTML="Password";
let div1=document.createElement("div");
let div2=document.createElement("div");
div1.appendChild(labela1);
div1.appendChild(userNameDom);
div2.appendChild(labela2);
div2.appendChild(passwordDom);
div.appendChild(div1);
div.appendChild(div2);
otac.appendChild(div);
//document.body.appendChild(otac);
const loginKomentar=document.createElement("article");
div.appendChild(loginKomentar);
dodajKontrolu(passwordDom,userNameDom,loginKomentar);
const dugme=document.createElement("button");
dugme.innerHTML="Sign Up";
div.appendChild(dugme);
dugme.onclick=(ev)=>
{
    signUp();
}
}
function dodajKontrolu(input,input2,labela)
{
    fromEvent(input,"input").pipe(
        debounceTime(500),//da saceka 500 ms
        map(ev => ev.target.value.trim())
    ).subscribe(val=>{refreshLabel(val,labela," password!")});

    fromEvent(input2,"input").pipe(
        debounceTime(500),//da saceka 500 ms
        map(ev => ev.target.value.trim())
    ).subscribe(val=>{refreshLabel(val,labela," username!")});
}
function refreshLabel(val,labela,poruka)
{
if(val.length<4)
{
labela.innerHTML="Nedovoljno dug"+poruka;
}
else
{
labela.innerHTML="";
}
}
function login()
{
let username=document.querySelector("input[name='user']").value;
let password=document.querySelector("input[name='pass']").value;
console.log(password+" "+username);
if(username.length>=4 && password.length>=4){
from(
    fetch("http://localhost:3000/users?username="+username+"&password="+password)
    .then(response => response.json())
).subscribe(user=>{vidiUser(user);console.log(user);});
}
else
{
    document.querySelector("article").innerHTML="Nevalidan Unos!";
    console.log("Nevalidan Unos!");
}
}

function signUp()
{
let username=document.querySelector("input[name='user1']").value;
let password=document.querySelector("input[name='pass1']").value;
console.log(password+" "+username);
if(username.trim().length>=4 && password.trim().length>=4){
    from(
        fetch("http://localhost:3000/users?username="+username+"&password="+password)
        .then(response => response.json())
    ).subscribe(user=>{signUser(user);console.log(user)});
    }
    else
    {
        document.querySelectorAll("article")[1].innerHTML="Nevalidan Unos!";
        console.log("Nevalidan Unos!");
    }
}
function signUser(user)
{
    let dom=document.querySelectorAll("article")[1];
    if(user.length==0)
    {//upis novog accounta
        let username=document.querySelector("input[name='user1']").value;
let password=document.querySelector("input[name='pass1']").value;
let niz=[];
let noviUser=new User(username,password,niz);
const payload={
    username:username,
    password:password
}
ime=noviUser;
const podaci={      
    method:"post",
    headers: new Headers({
      'Content-Type': 'application/json', // <-- Specifying the Content-Type
}),
    body: JSON.stringify(noviUser)
};
        from(
            fetch("http://localhost:3000/users",podaci)
            .then(response => response.json())
        ).subscribe(user=>{dom.innerHTML="Uspesno stvoren novi account!";napuniSignInId();pokreni(user)});
    }
    else
    {
dom.innerHTML="Username/Password kombinacija je zauzeta!";
    }
}
function napuniSignInId()
{
    from(
        fetch("http://localhost:3000/users?username="+ime.username)
        .then(response => response.json())
    ).subscribe(user=>{idUser=user[0]["id"];console.log("UVACEN ID JE "+idUser)});
}
function vidiUser(user)
{
let dom=document.querySelector("article");
if(user.length==0)
{
dom.innerHTML="Pogersan Username/Password!";
}
else{
    dom.innerHTML="Uspesan Login, Sacekajte....";
    //ime=user["username"];
    ime=new User(user[0]["username"],user[0]["password"],user[0]["lajkovaniOdg"]);
    idUser=user[0]["id"];
    console.log("USername je :"+ime.username);
    pokreni(user);
}
}
generisiNaslov();
generisiLogin();
generisiSignUp();
//kom
function start(user)
{
    return new Promise((resolve,reject)=>
    {
        const number=parseInt(Math.random()*5);
        setTimeout(()=> resolve(user),1500);
    });
}
//kom
function pokreni(user)
{
    start()
    .then((user)=>ucitaj(user))
    .catch((reason)=> console.log(reason));
}
function ucitaj(user)
{
    document.body.innerHTML="";
    generisiNaslov();
    generisiprofil(user);
}
function generisiprofil(user)
{
    const profil=document.createElement("p");
    profil.innerHTML="* Dobrodosli "+ime.username+" *!";
    profil.className="str";
    document.body.appendChild(profil);
    const main=document.createElement("div");
    main.className="main";
    const pitanja=document.createElement("div");
    pitanja.className="pitanja";
    const forma=document.createElement("div");
    forma.className="forma";
    main.appendChild(pitanja);
    main.appendChild(forma);
    document.body.appendChild(main);
    napuniFormu(forma);
}
function napuniFormu(forma)
{
    let div1=document.createElement("div");
    forma.appendChild(div1);
    let labela1=document.createElement("label");
    labela1.innerHTML="Pretrazite pitanja po nazivu predmeta : ";
    div1.appendChild(labela1);
    const pretragaDom=document.createElement("input");
    pretragaDom.name="search";
    div1.appendChild(pretragaDom);
    const but=document.createElement("button");
    but.innerHTML="Pretrazi";
    but.className="src";
    div1.appendChild(but);
    but.onclick= (ev) => {
        listaPitanja=[];
        vratiPitanjaPredmet(pretragaDom.value.trim());
    }
    let div2=document.createElement("div");
    forma.appendChild(div2);
    let labela2=document.createElement("label");
    labela2.innerHTML="Pretrazite pitanja po kljucnim recima : ";
    div2.appendChild(labela2);
    const pretragaDom2=document.createElement("input");
    pretragaDom2.name="search2";
    pretragaDom2.style.display="inline";
    div2.appendChild(pretragaDom2);

dodajEvente(pretragaDom2);
dodajSubButtone(forma);
dodajPoljeZaUnos(forma);
dodajElementePitanja(forma);
dodajStream(forma);
}
function dodajStream(forma)
{
    const linija=document.createElement("hr");
forma.appendChild(linija);
    let streamNaslov=document.createElement("p");
    streamNaslov.innerHTML="*** Stream ***";
    streamNaslov.className="str";
    forma.appendChild(streamNaslov);
    const divStream=document.createElement("div");
    divStream.className="stream";
    forma.appendChild(streamNaslov);
    forma.appendChild(divStream);
}
function dodajEvente(inp2)
{
    console.log("aa");
    fromEvent(inp2,"input").pipe(
        debounceTime(500),//da saceka 500 ms
        map(ev => ev.target.value.trim()),
        filter(text=> text.length >=4)
    ).subscribe(val=>{listaPitanja=[];vratiPitanjaSadrzaj(val)});
}
function vratiPitanjaSadrzaj(val)
{
    const div=document.querySelector(".pitanja");
    const inp=document.querySelector("input[name='search']");
    let s=inp.value.trim();
    console.log("S je "+s);
    if(s==""){
    div.innerHTML="";
        fetch("http://localhost:3000/pitanja?q="+val)
        .then(response => response.json())
        .then(movies=>dodajPitanja(movies,div));
    }
    else{
        div.innerHTML="";
        fetch("http://localhost:3000/pitanja?predmet="+ s+"&q="+val)
        .then(response => response.json())
        .then(movies=>dodajPitanja(movies,div));
    }
}
function vratiPitanjaPredmet(val)
{
    const div=document.querySelector(".pitanja");
    div.innerHTML="";
        fetch("http://localhost:3000/pitanja?predmet="+val)
        .then(response => response.json())
        .then(movies=>dodajPitanja(movies,div));
}
function dodajPitanja(pitanja,host)
{
pitanja.forEach(element => {
    let pitanje=new Pitanje(element["text"],element["autor"],element["katedra"],element["predmet"],element["id"]);
    let odg=element["odgovori"];
    odg.forEach(el=>{
        let odgovor=new Odgovor(el["autorr"],el["sadrzaj"],el["poeni"]);
        pitanje.dodajOdgovor(odgovor);
    });
    listaPitanja.push(pitanje);
});
console.log(listaPitanja);
nacrtajPitanja(host);
}
function nacrtajPitanja(host)
{
    host.innerHTML="";
    let flag;
    listaPitanja.forEach(pitanje=>{
        flag=false;
    let div=document.createElement("div");
    div.className="question";
    host.appendChild(div);
    let autorLabela=document.createElement("label");
    autorLabela.className="autor";
    autorLabela.innerHTML="*Autor: "+pitanje.autor+" *Katedra "+pitanje.katedra+ " *Predmet "+pitanje.predmet+"*";
    let labela=document.createElement("label");
    labela.innerHTML=pitanje.text;
    labela.className="questxt";
    let dugme=document.createElement("button");
    dugme.innerHTML="Odgovori";
    //dugme.style.display="inline";
    dugme.id=pitanje.id;
    dugme.onclick = (ev) =>
    {
        prikaziOdgovore(ev.target.id);

    }
    let deleteButton;
    if(pitanje.autor==ime.username)
    {
        flag=true;
        deleteButton=document.createElement("button");
        deleteButton.innerHTML="Obrisi";
        deleteButton.style.display="inline";
        deleteButton.id=pitanje.id;
        deleteButton.onclick=(ev)=>{
            console.log(ev.target.id);
            listaPitanja.forEach((element,index) => {
                if(element.id==ev.target.id)
                {
                    listaPitanja.splice(index,1);
                }                
            });
            const podaci={      
                method:"delete",
                headers: new Headers({
                  'Content-Type': 'application/json', // <-- Specifying the Content-Type
            })
               
        }
            from(
                fetch("http://localhost:3000/pitanja/"+ev.target.id,podaci)
                .then(response => response.json())
            ).subscribe(user=>{document.querySelector(".pitanja").innerHTML="";nacrtajPitanja(document.querySelector(".pitanja"));});
        }
    }
    div.appendChild(autorLabela);
    div.appendChild(labela);
    if(flag==true)
    div.appendChild(deleteButton);
    div.appendChild(dugme);
   });
}
function dodajSubButtone(forma)
{
const div=document.createElement("div");
let niz=["RII","EEN","UPS"];
niz.forEach(element => {
let dugme= document.createElement("button");
dugme.innerHTML="Sub "+element;
dugme.style.display="inline";
div.appendChild(dugme);
dugme.id=element;
dugme.className="subbutton";
dugme.onclick=(ev)=>{
resiSubUnsub(ev.target);
}

});

const unsubButton = document.createElement("button");
unsubButton.innerHTML="Unsub All";
unsubButton.style.display="inline";
unsubButton.onclick= (ev)=>{
    controlStream.next(2);
    rii=true;
    een=true;
    ups=true;
    let i;
    for(i=0;i<3;i++){
    let dug=document.querySelectorAll(".subbutton")[i];
    dug.innerHTML="Sub "+dug.id;
    }
}
div.appendChild(unsubButton);
forma.appendChild(div);
const linija=document.createElement("hr");
forma.appendChild(linija);
}
function resiSubUnsub(dugme)
{
 if(dugme.id=="RII")
 {
if(rii==true)
{
from(
    fetch("http://localhost:3000/pitanja?katedra=RII")
    .then(response => response.json())
).subscribe(user=>{prikaziStream(user,user.length,"RII")});
dugme.innerHTML="Unsub RII";
}
else
{
riiStream.unsubscribe();
riiStream=null;
dugme.innerHTML="Sub RII";
}
rii=!rii;
 }
 else if(dugme.id=="EEN")
 {
if(een==true)
{
    dugme.innerHTML="Unsub EEN";
    from(
        fetch("http://localhost:3000/pitanja?katedra=EEN")
        .then(response => response.json())
    ).subscribe(user=>{prikaziStream(user,user.length,"EEN")});
}
else
{
    eenStream.unsubscribe();
    eenStream=null;
    dugme.innerHTML="Sub EEN";
}
een=!een;
 }
 else
 {
    if(ups==true)
    {
        from(
            fetch("http://localhost:3000/pitanja?katedra=UPS")
            .then(response => response.json())
        ).subscribe(user=>{prikaziStream(user,user.length,"UPS")});
        dugme.innerHTML="Unsub UPS";
    }
    else
    {
        upsStream.unsubscribe();
        upsStream=null;
        dugme.innerHTML="Sub UPS";
    }
    ups=!ups;
 }
}
function dodajPoljeZaUnos(forma)
{
const par= document.createElement("p");
par.innerHTML="Unesite sadrzaj Vaseg pitanja ovde:"
forma.appendChild(par);
const textInput=document.createElement("textarea");
textInput.name="sadrzaj";
textInput.rows=6;
textInput.cols=25;
forma.appendChild(textInput);
}
function dodajElementePitanja(forma)
{
    const selDiv=document.createElement("div");
    let niz=["RII","EEN","UPS"];
    let lab=document.createElement("label");
    lab.innerHTML="Selektujte Katedru za pitanje :";
    selDiv.appendChild(lab);
    const selekt=document.createElement("select");
    niz.forEach(element=>{
        let opcija=document.createElement("option");
        opcija.innerHTML=element;
        opcija.value=element;
        selekt.appendChild(opcija);
    });
    selDiv.appendChild(selekt);
    forma.appendChild(selDiv);
    const div=document.createElement("div");
    forma.appendChild(div);
    const label=document.createElement("label");
    label.innerHTML="Unesite naziv Predmeta :";
    const nazivPredmeta = document.createElement("input");
    nazivPredmeta.name="imePredmeta";
    div.appendChild(label);
    div.appendChild(nazivPredmeta);
    forma.appendChild(div);
    const dugme=document.createElement("button");
    dugme.innerHTML="Dodaj";
    dugme.style.marginLeft="75%";
    forma.appendChild(dugme);
    dugme.onclick=(ev)=>{
        proslediPitanje(forma);
    }
}
function proslediPitanje(forma)
{
let katedra=forma.querySelector("select").value;
let text=forma.querySelector("textarea").value;
let nazivPredmeta=forma.querySelector("input[name='imePredmeta']").value;
if(!text || !nazivPredmeta)
return ;
console.log(katedra+ " "+text+" "+nazivPredmeta);
let novoPitanje=new Pitanje(text,ime.username,katedra,nazivPredmeta);
let odg=[];
const payload={
    autor:ime.username,
    predmet:nazivPredmeta,
    katedra:katedra,
    text:text,
    odgovori:odg
}
const podaci={      
    method:"post",
    headers: new Headers({
      'Content-Type': 'application/json', // <-- Specifying the Content-Type
}),
    body: JSON.stringify(payload)
};
        from(
            fetch("http://localhost:3000/pitanja",podaci)
            .then(response => response.json())
        ).subscribe(user=>{console.log(user);listaPitanja=[];vratiPitanjaPredmet(novoPitanje.predmet)});

}
function prikaziOdgovore(id,drugi)
{
    console.log(id);
    if(!drugi){
    from(listaPitanja).pipe(
        filter(el=>el.id==id)
    ).subscribe(pitanje=>odstampajPitanjeIOdgovore(pitanje))
    }
    else{
        from(listaSubPitanja).pipe(
            filter(el=>el.id==id)
        ).subscribe(pitanje=>odstampajPitanjeIOdgovore(pitanje))
    }
}
function odstampajPitanjeIOdgovore(pitanje)
{
    let flag=true;
    //let flag1=true;
    console.log(pitanje);
    let kon=document.querySelector(".pitanja");
    kon.innerHTML="";
    let div=document.createElement("div");
    div.className="question";
    kon.appendChild(div);
    let autorLabela=document.createElement("label");
    autorLabela.className="autor";
    autorLabela.innerHTML="*Autor: "+pitanje.autor+" *Katedra "+pitanje.katedra+ " *Predmet "+pitanje.predmet+" *Broj Odgovora "+pitanje.odgovori.length+" *";
    let labela=document.createElement("label");
    labela.innerHTML=pitanje.text;
    labela.className="questxt";
    div.appendChild(autorLabela);
    div.appendChild(labela);
    const otacOdgovori=document.createElement("div");
    otacOdgovori.className="LIFO";
    pitanje.odgovori.forEach((element,index) => {
        flag=true;
       //flag1=true;
        let odgDiv=document.createElement("div");
        odgDiv.className="question";
        let headerOdg=document.createElement("label");
        headerOdg.innerHTML="*Odgovor : Autor "+element.autorr+" *Rejting "+element.poeni+"*";
        headerOdg.className="autor";
        odgDiv.appendChild(headerOdg);
        let bodyOdg=document.createElement("label");
        bodyOdg.className="questxt"
        bodyOdg.innerHTML=element.sadrzaj;
        ime.lajkovaniOdg.forEach(el=>{
                if(el==element.sadrzaj)
                flag=false;
        });
        let upvoteButton;
        if(flag==true){
         upvoteButton = document.createElement("button");
        upvoteButton.innerHTML="Upvote";
        upvoteButton.id=index;
        upvoteButton.onclick=(ev)=>{
                pitanje.odgovori[ev.target.id].poeni++;
                ime.lajkovaniOdg.push(pitanje.odgovori[ev.target.id].sadrzaj);
                ev.target.style.display="none";
        }
    }
        odgDiv.appendChild(bodyOdg);
        if(flag==true && upvoteButton)
        odgDiv.appendChild(upvoteButton);
        otacOdgovori.appendChild(odgDiv);
        div.appendChild(otacOdgovori);
    });
    const l=document.createElement("p");
    l.innerHTML="Dodajte Vas Odgovor ...";
    kon.appendChild(l);
    const odgovorArea=document.createElement("textarea");
    odgovorArea.rows=5;
    kon.appendChild(odgovorArea);
    const divButton=document.createElement("div");
    const dajOdgovor=document.createElement("button");
    dajOdgovor.innerHTML="Daj Odgovor";
    dajOdgovor.style.display="inline";
    dajOdgovor.onclick=(ev)=>{
        posaljiKomentar(pitanje);
    }
    divButton.appendChild(dajOdgovor);
    const dugme=document.createElement("button");
    dugme.innerHTML="Nazad";
    divButton.appendChild(dugme);
    dugme.onclick=(ev)=>{
       kon.innerHTML="";
       //
       const podaci={      
        method:"put",
        headers: new Headers({
          'Content-Type': 'application/json', // <-- Specifying the Content-Type
    }),
        body: JSON.stringify(pitanje)
    };
    from(
        fetch("http://localhost:3000/pitanja/"+pitanje.id,podaci)
        .then(response => response.json())
    ).subscribe(user=>{ console.log("Nazad")});
       //

        nacrtajPitanja(kon);  
    }
    kon.appendChild(divButton);
}
function posaljiKomentar(pitanje)
{
    let sadrzaj=document.querySelector(".pitanja").querySelector("textarea").value;
    if(sadrzaj.trim()=="")
    retrun;
    let noviOdgovor=new Odgovor(ime.username,sadrzaj,0);
    pitanje.dodajOdgovor(noviOdgovor);
    const payload={
    autor:ime.username,
    predmet:pitanje.nazivPredmeta,
    katedra:pitanje.katedra,
    text:pitanje.text,
    odgovori:pitanje.odgovori,
    }
    const podaci={      
        method:"put",
        headers: new Headers({
          'Content-Type': 'application/json', // <-- Specifying the Content-Type
    }),
        body: JSON.stringify(pitanje)
    };
    from(
        fetch("http://localhost:3000/pitanja/"+pitanje.id,podaci)
        .then(response => response.json())
    ).subscribe(user=>{ document.querySelector(".pitanja").innerHTML="";odstampajPitanjeIOdgovore(user);});
}
function prikaziStream(stream,duz,katedra)
{
    let niz=[];
    stream.forEach(element => {
        niz.push(element);
    });
 let a=Observable.create(generator=>
        {
           setInterval( ()=> generator.next(parseInt(Math.random()*duz)),2000);
        })
        
let tok=a.pipe(
    takeUntil(controlStream),
    distinct()
).subscribe(x=>{console.log(x);addSubPitanje(stream[x])});
if(katedra=="RII")
{
    riiStream=tok
}
else if (katedra=="EEN")
{
eenStream=tok;
}
else
{
    upsStream=tok;
}
}
function strimuj(el,duz)
{
    getRanAsync(duz)
        .then(br=>
    console.log(el));
}
function getRanAsync(duz)
{
    return new Promise((resolve,reject)=>
    {
        const number=parseInt((Math.random()*duz)+1);
        setTimeout(()=> resolve(number),1500);
    });
}
function addSubPitanje(element)
{
    if(!element)
    return;
    let pitanje=new Pitanje(element["text"],element["autor"],element["katedra"],element["predmet"],element["id"]);
    let odg=element["odgovori"];
    odg.forEach(el=>{
        let odgovor=new Odgovor(el["autorr"],el["sadrzaj"],el["poeni"]);
        pitanje.dodajOdgovor(odgovor);
    });

    listaSubPitanja.push(pitanje);
    let parent=document.querySelector(".stream");
    const divPitanje=document.createElement("div");
    divPitanje.className="question";
    parent.appendChild(divPitanje);
    let autorLabela=document.createElement("label");
    autorLabela.className="autor";
    autorLabela.innerHTML="*Autor: "+pitanje.autor+" *Katedra "+pitanje.katedra+ " *Predmet "+pitanje.predmet+"*";
    let labela=document.createElement("label");
    labela.innerHTML=pitanje.text;
    labela.className="questxt";
    let dugme=document.createElement("button");
    dugme.innerHTML="Odgovori";
    dugme.id=pitanje.id;
    dugme.onclick = (ev) =>
    {
        prikaziOdgovore(ev.target.id,listaSubPitanja.length);
    }
    divPitanje.appendChild(autorLabela);
    divPitanje.appendChild(labela);
    divPitanje.appendChild(dugme);
}
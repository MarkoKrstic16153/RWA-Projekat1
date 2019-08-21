import { Observable, Subject, fromEvent, from, forkJoin, zip, interval} from "rxjs";
import { filter,map,distinct, takeUntil ,take, debounceTime, switchMap, pairwise, scan,mapTo,exhaustMap,mergeMap, concatMap, takeLast} from "rxjs/operators";
import { Pitanje } from "./Pitanje.js";
import { Odgovor } from "./Odgovor.js";
import { User } from "./User.js";
const url = "http://localhost:3000";
let trenutniUser = "";
let trenutniId = "";
let listaPitanja = [];
let rii = true;
let een = true;
let ups = true;
let riiStream;
let eenStream;
let upsStream;
let brojPitanja;
let controlStream = new Subject();
function generisiNaslov()
{
    const naslov = document.createElement("h2");
    naslov.innerHTML = "ePitalica?";
    document.body.appendChild(naslov); 
    if(trenutniUser != "") {
        const otac = document.createElement("div");
        const logoutButton = document.createElement("button");
        logoutButton.innerHTML = "Log out";
        logoutButton.className = "OGLOC";
        logoutButton.style.display = "inline";
        const mojaPitanja = document.createElement("button");
        mojaPitanja.innerHTML = "Moja Pitanja";
        mojaPitanja.className = "OGLOC";
        const clearDugme = document.createElement("button");
        clearDugme.innerHTML = "Clear";
        clearDugme.className = "OGLOC";
        clearDugme.onclick = () => {
            listaPitanja = [];
            nacrtajPitanja(document.querySelector(".pitanja"));
            nacrtajPitanja(document.querySelector(".stream"));
        }
        document.body.appendChild(otac);
        otac.appendChild(logoutButton);
        otac.appendChild(mojaPitanja);
        otac.appendChild(clearDugme);
        logoutButton.onclick = () => {       
            const podaci = {      
                method : "put",
                headers : new Headers({
                    'Content-Type': 'application/json',
            }),
                body : JSON.stringify(trenutniUser)
            };
            from(
                fetch(url+"/users/"+trenutniId,podaci)
                .then(response => response.json())
            )
            document.body.innerHTML = "";
            trenutniUser = "";
            generisiNaslov();
            generisiLogin();
            generisiSignUp();
        }
        mojaPitanja.onclick = () => {
            listaPitanja = [];
            document.querySelector(".pitanja").innerHTML = "";
            from(
                fetch(url + "/pitanja?autor=" + trenutniUser.username)
                .then(response => response.json())
            ).subscribe(user => dodajPitanja(user,document.querySelector(".pitanja")));
        }
    }
}
function generisiLogin(){
    const otac = document.createElement("div");
    otac.className = "init";
    const par = document.createElement("p");
    par.innerHTML = "Dobrodosli nazad, Ulogujte se ...";
    const userNameDom = document.createElement("input");
    userNameDom.name = "user";
    const passwordDom = document.createElement("input");
    passwordDom.name = "pass";
    passwordDom.type = "password";
    const div = document.createElement("div");
    div.appendChild(par);
    let labela1 = document.createElement("label");
    labela1.innerHTML = "Username";
    let labela2 = document.createElement("label");
    labela2.innerHTML = "Password";
    let div1 = document.createElement("div");
    let div2 = document.createElement("div");
    div1.appendChild(labela1);
    div1.appendChild(userNameDom);
    div2.appendChild(labela2);
    div2.appendChild(passwordDom);
    div.appendChild(div1);
    div.appendChild(div2);
    otac.appendChild(div);
    document.body.appendChild(otac);
    const loginKomentar = document.createElement("article");
    div.appendChild(loginKomentar);
    const dugme = document.createElement("button");
    dugme.innerHTML = "Login";
    div.appendChild(dugme);
    dugme.onclick = () => login();
}
function generisiSignUp()
{
    let otac = document.querySelector(".init");
    const par = document.createElement("p");
    par.innerHTML = "Nemate Nalog, napravite ga ";
    const userNameDom = document.createElement("input");
    userNameDom.name = "user1";
    const passwordDom = document.createElement("input");
    passwordDom.name = "pass1";
    passwordDom.type = "password";
    const div = document.createElement("div");
    div.appendChild(par);
    let labela1 = document.createElement("label");
    labela1.innerHTML = "Username";
    let labela2 = document.createElement("label");
    labela2.innerHTML = "Password";
    let div1 = document.createElement("div");
    let div2 = document.createElement("div");
    div1.appendChild(labela1);
    div1.appendChild(userNameDom);
    div2.appendChild(labela2);
    div2.appendChild(passwordDom);
    div.appendChild(div1);
    div.appendChild(div2);
    otac.appendChild(div);
    const loginKomentar=document.createElement("article");
    div.appendChild(loginKomentar);
    dodajKontrolu(passwordDom,userNameDom,loginKomentar);
    const dugme = document.createElement("button");
    dugme.innerHTML = "Sign Up";
    div.appendChild(dugme);
    dugme.onclick = () => signUp();
}
function dodajKontrolu(input,input2,labela)
{
    fromEvent(input,"input").pipe(
        debounceTime(500),
        map(ev => ev.target.value.trim())
    ).subscribe(value => refreshLabel(value,labela," password!"));
    fromEvent(input2,"input").pipe(
        debounceTime(500),
        map(ev => ev.target.value.trim())
    ).subscribe(value => refreshLabel(value,labela," username!"));
}
function refreshLabel(val,labela,poruka)
{
    if(val.length<4)
        labela.innerHTML = "Nedovoljno dug"+poruka;
    else
        labela.innerHTML = "";
}
function login()
{
    let username = document.querySelector("input[name='user']").value;
    let password = document.querySelector("input[name='pass']").value;
    if(username && password){
        from(
            fetch(url + "/users?username=" + username + "&password=" + password)
            .then(response => response.json())
        ).subscribe(user => vidiUser(user));
    }
    else
        document.querySelector("article").innerHTML = "Nevalidan Unos!"; 
}
function signUp()
{
    let username = document.querySelector("input[name='user1']").value;
    let password = document.querySelector("input[name='pass1']").value;
    if(username.trim().length >= 4 && password.trim().length >= 4){
       from(
            fetch(url + "/users?username=" + username + "&password=" + password)
            .then(response => response.json())
        ).subscribe(user => signUser(user));
    }
    else
        document.querySelectorAll("article")[1].innerHTML="Nevalidan Unos!";  
}
function signUser(user)
{
    let dom = document.querySelectorAll("article")[1];
    if(user.length == 0) {
        let username = document.querySelector("input[name='user1']").value;
        let password = document.querySelector("input[name='pass1']").value;
        let niz = [];
        let noviUser = new User(username,password,niz);
        trenutniUser = noviUser;
        const podaci = {      
            method : "post",
            headers : new Headers({
                'Content-Type': 'application/json', 
            }),
            body : JSON.stringify(noviUser)
            };
        from(
            fetch(url + "/users", podaci)
            .then(response => response.json())
        ).subscribe(user => {
                                dom.innerHTML = "Uspesno stvoren novi account!";
                                napuniSignInId();
                                pokreni(user)
                            });
    }
    else
        dom.innerHTML = "Username/Password kombinacija je zauzeta!";
}
function napuniSignInId()
{
    from(
        fetch(url + "/users?username=" + trenutniUser.username)
        .then(response => response.json())
    ).subscribe(user => trenutniId = user[0]["id"]);
}
function vidiUser(user)
{
    let dom = document.querySelector("article");
    if(user.length == 0)
        dom.innerHTML = "Pogersan Username/Password!";
    else
    {
        dom.innerHTML = "Uspesan Login, Sacekajte....";
        trenutniUser = new User(user[0]["username"], user[0]["password"], user[0]["lajkovaniOdg"]);
        trenutniId = user[0]["id"];
        pokreni(user);
    }
}
function start(user)
{
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(user),1500);
    });
}
function pokreni()
{
    start()
    .then((user) => ucitaj(user))
    .catch((reason) => console.log(reason));
}
function ucitaj(user)
{
    document.body.innerHTML = "";
    generisiNaslov();
    generisiProfil(user);
}
function generisiProfil()
{
    const profil = document.createElement("p");
    profil.innerHTML = "* Dobrodosli " + trenutniUser.username + " *!";
    profil.className = "str";
    document.body.appendChild(profil);
    const main = document.createElement("div");
    main.className = "main";
    const pitanja = document.createElement("div");
    pitanja.className = "pitanja";
    const forma = document.createElement("div");
    forma.className = "forma";
    main.appendChild(pitanja);
    main.appendChild(forma);
    document.body.appendChild(main);
    napuniFormu(forma);
}
function napuniFormu(forma)
{
    let div1 = document.createElement("div");
    forma.appendChild(div1);
    let labela1 = document.createElement("label");
    labela1.innerHTML = "Pretrazite pitanja po nazivu predmeta : ";
    div1.appendChild(labela1);
    const pretragaDom = document.createElement("input");
    div1.appendChild(pretragaDom);
    let wrapDiv = document.createElement("div");
    let pretragaLabel = document.createElement("label");
    pretragaLabel.className = "brpret";
    pretragaLabel.innerHTML = "Ukupan Broj Pretraga je : 0";
    const but = document.createElement("button");
    but.innerHTML = "Pretrazi";
    but.className = "src";
    but.style.display = "inline";
    wrapDiv.appendChild(pretragaLabel);
    wrapDiv.appendChild(but); 
    div1.appendChild(wrapDiv);
    but.onclick = () => {
        listaPitanja = [];
        vratiPitanjaPredmet(pretragaDom.value.trim());
    }
    let div2 = document.createElement("div");
    forma.appendChild(div2);
    let labela2 = document.createElement("label");
    labela2.innerHTML = "Pretrazite pitanja po kljucnim recima : ";
    div2.appendChild(labela2);
    const pretragaDom2 = document.createElement("input");
    pretragaDom2.style.display = "inline";
    const div3 = document.createElement("div");
    forma.appendChild(div3);
    const randDom3 = document.createElement("button");
    randDom3.style.display = "inline";
    randDom3.innerHTML = "5 Pitanja";
    div3.appendChild(randDom3);
    div2.appendChild(pretragaDom2);
    randomStream(randDom3);
    dodajEvente(pretragaDom2,but,pretragaDom);
    dodajSubButtone(forma);
    dodajPoljeZaUnos(forma);
    dodajElementePitanja(forma);
    dodajStream(forma);
}
function randomStream(dugme)
{
    const randomClick = fromEvent(dugme,"click");
    const randNumber = Observable.create(generator => {
       setInterval(() => generator.next(parseInt(Math.random()*brojPitanja+1)),2000);
    })
    const exhaustStream = randomClick.pipe(
        exhaustMap(ev => randNumber.pipe(
                        distinct(),
                        take(5))
                    )
    );
    exhaustStream.subscribe(x => dobavi(x));
}
function dodajStream(forma)
{
    const linija = document.createElement("hr");
    forma.appendChild(linija);
    let kontejner = document.createElement("div");
    kontejner.className = "kontej";
    let streamNaslov = document.createElement("p");
    streamNaslov.innerHTML = "*** Stream ***";
    streamNaslov.className = "str";  
    const clearDugme = document.createElement("button");
    clearDugme.innerHTML = "Ocisti";
    clearDugme.className = "clrr";
    clearDugme.style.display = "inline";
    clearDugme.onclick = () => {
        listaPitanja = [];
        let dok = document.querySelector(".stream");
        dok.innerHTML = "";
    }
    kontejner.appendChild(streamNaslov);
    kontejner.appendChild(clearDugme); 
    forma.appendChild(kontejner);
    const divStream = document.createElement("div");
    divStream.className = "stream";
    forma.appendChild(streamNaslov);
    forma.appendChild(divStream);
}
function dodajEvente(inp2, dugme, inp1)
{
    let control = new Subject();
    const seed = 0;
    const predmet$ = fromEvent(inp1,"input").pipe(
        debounceTime(1000),
        map(ev => ev.target.value.trim())
    );
    const reci$ = fromEvent(inp2,"input").pipe(
            debounceTime(500),
            map(ev => ev.target.value.trim()),
            filter(text => text.length >= 4)
    );
    labelaRefresh(predmet$, reci$, control);
    predmet$.pipe(
        mergeMap(predmet => reci$.pipe(map(rec => predmet + "  " + rec)))
        ).subscribe(x => pitanjaPretraga(x.split("  ")));
    const clicks = fromEvent(dugme, 'click');
    clicks.subscribe(x => control.next(x));
    const jedinice = control.pipe(mapTo(1));
    const brojacStream = jedinice.pipe(scan((acc, el) => acc + el, seed));
    brojacStream.subscribe(broj => document.querySelector(".brpret").innerHTML = "Ukupan Broj Pretraga je : " + broj);  
}
function pitanjaPretraga(param)
{
    const div = document.querySelector(".pitanja");
    div.innerHTML = "";
    from(
        fetch(url + "/pitanja?predmet=" + param[0] + "&q=" + param[1])
        .then(response => response.json())
    ).subscribe(pitanja => {listaPitanja = []; dodajPitanja(pitanja,div)});
}
function vratiPitanjaPredmet(val)
{
    const div = document.querySelector(".pitanja");
    div.innerHTML = "";
    from(
        fetch(url + "/pitanja?predmet=" + val)
        .then(response => response.json())
    ).subscribe(pitanja => dodajPitanja(pitanja, div));
}
function dodajPitanja(pitanja, host)
{
    pitanja.forEach(element => {
        let pitanje = new Pitanje(element["text"], element["autor"], element["katedra"], element["predmet"], element["id"]);
        let odg = element["odgovori"];
        odg.forEach(el => {
            let odgovor = new Odgovor(el["autorr"], el["sadrzaj"], el["poeni"]);
            pitanje.dodajOdgovor(odgovor);
        });
        listaPitanja.push(pitanje);
    });
    nacrtajPitanja(host);
}
function nacrtajPitanja(host)
{
    host.innerHTML = "";
    let flag;
    listaPitanja.forEach(pitanje => {
        flag = false;
        let div = document.createElement("div");
        div.className = "question";
        host.appendChild(div);
        let autorLabela = document.createElement("label");
        autorLabela.className = "autor";
        autorLabela.innerHTML = "*Autor: " + pitanje.autor + " *Katedra " + pitanje.katedra + " *Predmet " + pitanje.predmet + " *Broj Odgovora " + pitanje.odgovori.length + "*";
        let labela = document.createElement("label");
        labela.innerHTML = pitanje.text;
        labela.className = "questxt";
        let dugme = document.createElement("button");
        dugme.innerHTML = "Odgovori";
        dugme.id = pitanje.id;
        dugme.onclick = (ev) => prikaziOdgovore(ev.target.id);
        let deleteButton;
        if(pitanje.autor == trenutniUser.username) {
            flag = true;
            deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Obrisi";
            deleteButton.style.display = "inline";
            deleteButton.id = pitanje.id;
            deleteButton.onclick = (ev) => {
                listaPitanja.forEach((element, index) => {
                    if(element.id == ev.target.id) {
                        listaPitanja.splice(index, 1);
                    }                
                });
                const podaci = {      
                    method : "delete",
                    headers : new Headers({
                    'Content-Type' : 'application/json',
                    })             
                }
                from(
                    fetch(url + "/pitanja/" + ev.target.id, podaci)
                    .then(response => response.json())
                ).subscribe(() => {
                                    document.querySelector(".pitanja").innerHTML="";
                                    nacrtajPitanja(document.querySelector(".pitanja"))
                                  });
            }
        }   
        div.appendChild(autorLabela);
        div.appendChild(labela);
        if(flag == true)
            div.appendChild(deleteButton);
        div.appendChild(dugme);
   });
}
function dobavi(id)
{
    from(
        fetch(url + "/pitanja/" + id)
        .then(response => response.json())
    ).subscribe(pitanje => { 
                            if(pitanje.autor)
                                listaPitanja.push(pitanje);
                            nacrtajPitanja(document.querySelector(".stream")); 
                });
}
function dodajSubButtone(forma)
{
    const div = document.createElement("div");
    const div1 = document.createElement("div");
    const novoDugme = document.createElement("button");
    novoDugme.innerHTML = "Nova Pitanja";
    novoDugme.className = "subbutton";
    novoDugme.style.display = "inline";
    novoDugme.onclick = () => najnovija(1);
    const subAll = document.createElement("button");
    subAll.innerHTML = "SubAll";
    subAll.className = "subbutton";
    subAll.style.display = "inline";
    subAll.onclick= () => najnovija(2);
    const redom = document.createElement("button");
    redom.innerHTML = "Ispocetka";
    redom.className = "subbutton";
    redom.style.display = "inline";
    ispocetka(redom);
    redom.onclick = () => listaPitanja = [];
    const paroviDugme = document.createElement("button");
    paroviDugme.innerHTML = "U paru";
    paroviDugme.className = "subbutton";
    paroviDugme.style.display = "inline";
    paroviDugme.onclick = () => {
        let randStream = Observable.create(generator => {
           setInterval(() => generator.next(parseInt(Math.random()*brojPitanja+1)),1700);
        })
        let jedinstveni = randStream.pipe(
            distinct(),
            pairwise(),
            takeUntil(controlStream)
        )
        jedinstveni.subscribe(par => vratiParPitanja(par));
    }
    div1.appendChild(novoDugme);
    div1.appendChild(subAll);
    div1.appendChild(redom);
    div1.appendChild(paroviDugme);
    let niz = ["RII","EEN","UPS"];
    niz.forEach(element => {
        let dugme = document.createElement("button");
        dugme.innerHTML = "Sub "+element;
        dugme.style.display = "inline";
        div.appendChild(dugme);
        dugme.id = element;
        dugme.className = "subbutton";
        dugme.onclick = (ev) => resiSubUnsub(ev.target);    
    });
    const unsubButton = document.createElement("button");
    unsubButton.innerHTML = "Unsub All";
    unsubButton.style.display = "inline";
    unsubButton.onclick = () => {
        controlStream.next(2);
        rii = true;
        een = true;
        ups = true;
        let i;
        for(i = 0;i < 3;i++) {
            let dug = document.querySelectorAll(".subbutton")[i];
            dug.innerHTML = "Sub " + dug.id;
        }
        ispocetka(redom);
    }
    div.appendChild(unsubButton);
    forma.appendChild(div);
    forma.appendChild(div1);
    const linija = document.createElement("hr");
    forma.appendChild(linija);
}
function ispocetka(dugme)
{
    const clicks = fromEvent(dugme, 'click');
    const result = clicks.pipe(switchMap((ev) => interval(2000)), takeUntil(controlStream));
    result.subscribe(x => dobavi(x+1));
}
function vratiParPitanja(par)
{
    const prvoPitanje = from(
        fetch(url + "/pitanja/" + par[0])
        .then(response => response.json()));
    const drugoPitanje = from(
        fetch(url + "/pitanja/" + par[1])
        .then(response => response.json()));
    const forkjoin = forkJoin([
        prvoPitanje,
        drugoPitanje
        ]);
    forkjoin.subscribe({
        next: value => {listaPitanja = value; nacrtajPitanja(document.querySelector(".stream"))},
        complete: () => console.log('Kraj!')
    });
}
function najnovija(broj)
{
    const riiStr$ = from(
        fetch(url + "/pitanja?katedra=RII")
        .then(response => response.json())
    ).subscribe(pitanja => stvoriObservablePitanja(pitanja, "RII", broj));
   const eenStr$ = from(
        fetch(url + "/pitanja?katedra=EEN")
        .then(response => response.json())
    ).subscribe(pitanja => stvoriObservablePitanja(pitanja, "EEN", broj)); 
    let upsStr$ = from(
        fetch(url + "/pitanja?katedra=UPS")
        .then(response => response.json())
    ).subscribe(pitanja => stvoriObservablePitanja(pitanja, "UPS", broj));  
}
function stvoriObservablePitanja(pitanja, katedra, broj)
{
    if(katedra == "RII") {
        riiStream = from(pitanja);
        if(broj == 1)
            riiStream = riiStream.pipe( takeLast(1) );
    }
    else if(katedra == "EEN"){
        eenStream = from(pitanja);
        if(broj == 1)
            eenStream = eenStream.pipe( takeLast(1) );
    }
    else {
        upsStream = from(pitanja);
        if(broj == 1) {
            upsStream = upsStream.pipe( takeLast(1) );
            forkJoinStreamove();
        }
        else
            zipujStreamove();
    }
}
function forkJoinStreamove()
{
    const forkjoin = forkJoin([
        riiStream,
        eenStream,
        upsStream
      ]);
      forkjoin.subscribe({
       next: value => {listaPitanja = value; nacrtajPitanja(document.querySelector(".stream"))},
       complete: () => console.log('Kraj!')
      });
}
function zipujStreamove()
{
    let obs = interval(2300);
    obs.subscribe();
    zip(riiStream, eenStream, upsStream, obs).pipe(
        map(([rii, een, ups]) => ([ rii, een, ups ])),
        takeUntil(controlStream)
    ).subscribe(nizOdTri => {
                listaPitanja = nizOdTri;
                nacrtajPitanja(document.querySelector(".stream"))
            });
}
function resiSubUnsub(dugme)
{
    if(dugme.id == "RII") {
        if(rii == true) {
            from(
                fetch(url + "/pitanja?katedra=RII")
                .then(response => response.json())
                ).subscribe(pitanja => prikaziStream(pitanja, pitanja.length, "RII"));
            dugme.innerHTML = "Unsub RII";
        }
        else {
            riiStream.unsubscribe();
            dugme.innerHTML = "Sub RII";
        }
        rii = !rii;
    }
    else if(dugme.id == "EEN") {
        if(een == true) {
            dugme.innerHTML = "Unsub EEN";
            from(
                fetch(url + "/pitanja?katedra=EEN")
                .then(response => response.json())
                ).subscribe(pitanja => prikaziStream(pitanja, pitanja.length, "EEN"));
        }
        else {
            eenStream.unsubscribe();
            dugme.innerHTML = "Sub EEN";
        }
        een = !een;
    }
    else {
        if(ups == true) {
            from(
                fetch(url + "/pitanja?katedra=UPS")
                .then(response => response.json())
                ).subscribe(pitanja => prikaziStream(pitanja, pitanja.length, "UPS"));
            dugme.innerHTML = "Unsub UPS";
        }
        else {
            upsStream.unsubscribe();
            dugme.innerHTML = "Sub UPS";
        }
    ups = !ups;
    }
}
function dodajPoljeZaUnos(forma)
{
    const par = document.createElement("p");
    par.innerHTML = "Unesite sadrzaj Vaseg pitanja ovde:"
    forma.appendChild(par);
    const textInput = document.createElement("textarea");
    textInput.name = "sadrzaj";
    textInput.rows = 6;
    textInput.cols = 25;
    forma.appendChild(textInput);
}
function dodajElementePitanja(forma)
{
    const selDiv = document.createElement("div");
    let niz = ["RII","EEN","UPS"];
    let lab = document.createElement("label");
    lab.innerHTML = "Selektujte Katedru za pitanje :";
    selDiv.appendChild(lab);
    const selekt = document.createElement("select");
    niz.forEach(element => {
        let opcija = document.createElement("option");
        opcija.innerHTML = element;
        opcija.value = element;
        selekt.appendChild(opcija);
    });
    selDiv.appendChild(selekt);
    forma.appendChild(selDiv);
    const div = document.createElement("div");
    forma.appendChild(div);
    const label = document.createElement("label");
    label.innerHTML = "Unesite naziv Predmeta :";
    const nazivPredmeta = document.createElement("input");
    nazivPredmeta.name = "imePredmeta";
    div.appendChild(label);
    div.appendChild(nazivPredmeta);
    forma.appendChild(div);
    const dugme = document.createElement("button");
    dugme.innerHTML = "Dodaj";
    dugme.style.marginLeft = "75%";
    forma.appendChild(dugme);
    dugme.onclick = () => proslediPitanje(forma); 
}
function labelaRefresh(predmet$, reci$, control)
{
    predmet$.pipe(
                concatMap(() => reci$)
    ).subscribe(x => control.next(x));
}
function proslediPitanje(forma)
{
    let katedra = forma.querySelector("select").value;
    let text = forma.querySelector("textarea").value;
    let nazivPredmeta = forma.querySelector("input[name='imePredmeta']").value;
    if(!text || !nazivPredmeta)
        return;
    let novoPitanje = new Pitanje(text, trenutniUser.username, katedra, nazivPredmeta);
    const podaci = {      
        method : "post",
        headers : new Headers({
            'Content-Type': 'application/json',
        }),
        body : JSON.stringify(novoPitanje)
    };
    from(
        fetch(url + "/pitanja", podaci)
        .then(response => response.json())
        ).subscribe(() => {
                listaPitanja = []; 
                vratiPitanjaPredmet(novoPitanje.predmet);
        });
}
function prikaziOdgovore(id)
{
    from(listaPitanja).pipe(
        filter(el => el.id == id)
        ).subscribe(pitanje => odstampajPitanjeIOdgovore(pitanje));
}
function odstampajPitanjeIOdgovore(pitanje)
{
    let flag = true;
    let kon = document.querySelector(".pitanja");
    kon.innerHTML = "";
    let div = document.createElement("div");
    div.className = "question";
    kon.appendChild(div);
    let autorLabela = document.createElement("label");
    autorLabela.className = "autor";
    autorLabela.innerHTML = "*Autor: " + pitanje.autor + " *Katedra " + pitanje.katedra + " *Predmet " + pitanje.predmet + " *Broj Odgovora " + pitanje.odgovori.length + " *";
    let labela = document.createElement("label");
    labela.innerHTML = pitanje.text;
    labela.className = "questxt";
    div.appendChild(autorLabela);
    div.appendChild(labela);
    const otacOdgovori = document.createElement("div");
    otacOdgovori.className = "LIFO";
    pitanje.odgovori.forEach((element, index) => {
        flag = true;
        let odgDiv = document.createElement("div");
        odgDiv.className = "question";
        let headerOdg = document.createElement("label");
        headerOdg.innerHTML = "*Odgovor : Autor " + element.autorr + " *Rejting " + element.poeni + "*";
        headerOdg.className = "autor";
        odgDiv.appendChild(headerOdg);
        let bodyOdg = document.createElement("label");
        bodyOdg.className = "questxt"
        bodyOdg.innerHTML = element.sadrzaj;
        trenutniUser.lajkovaniOdg.forEach( el => {
                if(el == element.sadrzaj)
                    flag = false;
        });
        let upvoteButton;
        if(flag == true){
            upvoteButton = document.createElement("button");
            upvoteButton.innerHTML = "Upvote";
            upvoteButton.id = index;
            upvoteButton.onclick = (ev) => {
                pitanje.odgovori[ev.target.id].poeni++;
                trenutniUser.lajkovaniOdg.push(pitanje.odgovori[ev.target.id].sadrzaj);
                posaljiKomentar(pitanje, 1);
            }
        }
        odgDiv.appendChild(bodyOdg);
        if(flag == true && upvoteButton)
        odgDiv.appendChild(upvoteButton);
        otacOdgovori.appendChild(odgDiv);
        div.appendChild(otacOdgovori);
    });
    const l = document.createElement("p");
    l.innerHTML = "Dodajte Vas Odgovor ...";
    kon.appendChild(l);
    const odgovorArea = document.createElement("textarea");
    odgovorArea.rows = 5;
    kon.appendChild(odgovorArea);
    const divButton = document.createElement("div");
    const dajOdgovor = document.createElement("button");
    dajOdgovor.innerHTML = "Daj Odgovor";
    dajOdgovor.style.display = "inline";
    dajOdgovor.onclick = () => posaljiKomentar(pitanje);
    divButton.appendChild(dajOdgovor);
    const dugme = document.createElement("button");
    dugme.innerHTML = "Nazad";
    divButton.appendChild(dugme);
    dugme.onclick = () => nacrtajPitanja(kon);  
    kon.appendChild(divButton);
}
function posaljiKomentar(pitanje, lajk)
{
    let sadrzaj = document.querySelector(".pitanja").querySelector("textarea").value;
    if(sadrzaj.trim() == "" && !lajk)
        return;
    if(!lajk) {
        let noviOdgovor = new Odgovor(trenutniUser.username, sadrzaj, 0);
        pitanje.odgovori.push(noviOdgovor);
    }
    const podaci = {      
        method : "put",
        headers : new Headers({
            'Content-Type': 'application/json', 
        }),
        body : JSON.stringify(pitanje)
    };
    from(
        fetch(url + "/pitanja/" + pitanje.id, podaci)
        .then(response => response.json())
    ).subscribe(pitanjeObj => {
                                  document.querySelector(".pitanja").innerHTML="";
                                  odstampajPitanjeIOdgovore(pitanjeObj);
                });
}
function prikaziStream(stream, duz, katedra)
{
    let randStream = Observable.create(generator => {
           setInterval(() => generator.next(parseInt(Math.random()*duz)), 2000);
        })   
    let tok = randStream.pipe(
        takeUntil(controlStream),
        distinct()
    ).subscribe(ind => {
                    listaPitanja.push(stream[ind]); 
                    nacrtajPitanja(document.querySelector(".stream"));
                });
    if(katedra == "RII")
        riiStream = tok;
    else if(katedra == "EEN")
        eenStream = tok;
    else if(katedra == "UPS")
        upsStream = tok;
}
from(
    fetch(url + "/brojPitanja")
    .then(response => response.json())
).subscribe(brojPit => brojPitanja=brojPit.broj);
generisiNaslov();
generisiLogin();
generisiSignUp();
import {interval, range, Observable, Subscription, Subject} from "rxjs";
import { filter,map,distinct,take, takeUntil ,takeWhile, retry} from "rxjs/operators";
/*const naslov=document.createElement("h2");
naslov.innerHTML="Babel";

//interval(500).subscribe(x=>console.log(x));


/*interval(500).pipe(
    filter(x=>x%2===1),
    map(x=>x+=2),
    take(10)
).subscribe(x=>console.log(x));*/


/*function executeInterval(){
return interval(500).pipe(
    filter(x=>x%2===1),
    map(x=>x+=2),
    distinct()
)
}
const n=executeInterval();
//n.subscribe(x=>console.log(x));
/*function executeRange()
{
    interval(500).range(10,30).subscribe(x=>console.log(x));
}
executeRange();*/
/*let uslov=-1;
let uslov1=-1;
function getRandomNumbers()
{
  return Observable.create(generator=>
        {

           setInterval( ()=> generator.next(parseInt(Math.random()*10)),500);
        })//.subscribe(x=>console.log(x));
    //range(10,30).subscribe(x=>console.log(x));
}
const niz=getRandomNumbers();
let sub=niz.subscribe(x=>{console.log(x);uslov=x;});
//const niz1=getRandomNumbers();
//const sub1=niz1.subscribe(x=>console.log(x));
function getTenEvenNumbers()
{
   return getRandomNumbers().pipe(
        filter(x=>x%2===0),
        map(x=>x+=10),
        takeWhile(() =>uslov<=8),
        distinct()
    )
}
const a=getTenEvenNumbers();
a.subscribe(x=>console.log(x));

let bo=true;
createUnsubButton(sub);



//niz.subscribe(x=>console.log(x));

function createSubject$ ()
{
    const subject$=new Subject();
    subject$.subscribe(x=>console.log("sub "+x));
    subject$.next(4);
    subject$.next(6);
    return subject$;
}
createSubject$();*/
let bo=true;
function f(){
return Observable.create(generator=>
    {

       setInterval( ()=> generator.next(parseInt(Math.random()*10)),500);
    })
}
let a=f();
//let aa=a.subscribe(x=>console.log(x));
function vratiStream()
{
    return interval(500).pipe(
        filter(x=>x%2===1),
        map(x=>x=parseInt(Math.random()*20)),
        distinct()
       
    );
}
let niz=vratiStream();
let fili=niz.subscribe(x=>console.log(x));
//niz.subscribe(x=>console.log(x));
function createUnsubButton(subb)
{
    let aaa=subb;
    const but=document.createElement("button");
    but.innerHTML="UNSUB";
    document.body.appendChild(but);
    but.innerHTML="UNSUB";
    but.onclick=()=>{if(bo==true)fili.unsubscribe();else {niz=vratiStream();   fili=niz.subscribe(x=>{console.log(x);});}if(bo==true)bo=false;else bo=true;}
}
createUnsubButton(niz);
//observable.subscribe(val => console.log(val))

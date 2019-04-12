import {MovieSet} from "./MovieSet.js";
import {Movie,uporedi} from "./Movie.js";
const naslov=document.createElement("h2");
naslov.innerHTML="Babel";
document.body.appendChild(naslov);
const naslov1=document.createElement("h3");
naslov1.innerHTML="Babel3";
document.body.appendChild(naslov1);
function getRanAsync()
{
    return new Promise((resolve,reject)=>
    {
        const number=parseInt(Math.random()*5);
        setTimeout(()=> resolve(number),1500);
    });
}
//napravi klasu MovieServis koja ima metode get koja vracaa niz filmova 
//getByIndex(index) vraca film po indexu 
//obe su asinshone
//vrati film po slucajnov indexu
//i pritom koristiti get random koja je asinrona
/*async function loguj()*/
let slucajniFilm;
let nizFilmova;
let prviIndex,drugiIndex;
function AsyncMovieSet()
{
    return new Promise((resolve,reject)=>
    {
    const prvi=new Movie("Die Hard","1980",9);
    const drugi=new Movie("Spectre","2015",8.9);
    const treci=new Movie("Mission Imposible","2009",8);
    const cetvrti=new Movie("Guardian","2008",9);
    const peti=new Movie("Far Away","1999",8.1);
    const set=new MovieSet();
    set.dodaj(prvi);
    set.dodaj(drugi);
    set.dodaj(treci);
    set.dodaj(cetvrti);
    set.dodaj(peti);
         setInterval(()=>resolve(set),2000);
    });
}
AsyncMovieSet()
.then(filmovi =>{console.log(filmovi);nizFilmova=filmovi;
getRanAsync()
.then(broj=> {slucajniFilm=filmovi.vratiIndex(broj);
console.log(slucajniFilm);
getRanAsync()
.then(broj1 =>{prviIndex=broj1;console.log("Prvi index je"+broj1);
    getRanAsync()
    .then(broj2 =>{drugiIndex=broj2; console.log("Drugi index je"+broj2);
        if(uporedi(filmovi.listaFilmova[broj1],filmovi.listaFilmova[broj2])==true)
        console.log("Ocene su iste "+filmovi.listaFilmova[broj1]+filmovi.listaFilmova[broj2]);
        else
        console.log("Ocene su razlicite "+filmovi.listaFilmova[broj1]+filmovi.listaFilmova[broj2]);
    })
    .catch();
})
.catch();
})
.catch(reason => console.log("JBG"));
})







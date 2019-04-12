export class Pitanje
{
    constructor(text,autor,katedra,predmet,id)
    {
        this.odgovori=[];
        this.text=text;
        this.autor=autor;
        this.katedra=katedra;
        this.predmet=predmet;
        this.id=id;
    }
    dodajOdgovor(odg)
    {
        this.odgovori.push(odg);
    }
}
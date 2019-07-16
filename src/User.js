export class User{
    constructor(ime,sif,odgovori)
    {
        this.username=ime;
        this.password=sif;
        this.lajkovaniOdg=odgovori;
    }
    dodajLajkovaniOdg(odg)
    {
        this.lajkovaniOdg.push(odg);
    }
}
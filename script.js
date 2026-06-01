    let search = document.getElementById("search");
    let prijavljen = false;

    let btn = document.getElementById("kupi");
    let btnObrisi = document.getElementById("obrisi");

    btn.addEventListener("click", dodajUKosaricu);
    btnObrisi.addEventListener("click", obrisiKosaricu);
    search.addEventListener("keyup", pretragaProizvoda);
    document.getElementById("placanje").addEventListener("click", idiNaPlacanje);
    document.getElementById("odjava").addEventListener("click", odjavaKorisnika);
    document.getElementById("prijava").addEventListener("click", prijaviKorisnika);

    // klik na cijelu karticu proizvoda
    let proizvodiDivovi = document.querySelectorAll(".proizvod");

    proizvodiDivovi.forEach(div => {
        div.addEventListener("click", function (e) {

            // ako je klik direktno na checkbox ili number input, ne radi ništa
            if (e.target.type === "checkbox" || e.target.type === "number") return;

            let checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            updateQtyInputState();
        });
    });

    // omogućiti/onemogućiti quantity input kada se checkbox promijeni
    document.addEventListener("change", function(e) {
        if (e.target.type === "checkbox" && e.target.name === "proizvodi") {
            if (!prijavljen) {
                e.target.checked = false;
                alert("Morate se prijaviti prije nego što možete dodavati proizvode u košaricu");
                return;
            }
            updateQtyInputState();
        }
    });

    function updateQtyInputState() {
        let checkboxes = document.querySelectorAll('input[name="proizvodi"]');
        checkboxes.forEach(checkbox => {
            let qtyInput = checkbox.parentElement.querySelector('.qty-input');
            if (qtyInput) {
                qtyInput.disabled = !checkbox.checked;
            }
        });
    }

    // gumb za micanje
    document.addEventListener("click", function(e){

        if(e.target.classList.contains("remove")){

            let title = e.target.dataset.title;

            let proizvodi = document.querySelectorAll('input[name="proizvodi"]');

            proizvodi.forEach(p => {

                if(p.title === title){
                    p.checked = false;
                    updateQtyInputState();
                }

            });

            // refresh košarice bez popup alerta
            dodajUKosaricu(true);
            return;
        }
    });

    // dodavanje u košaricu
    function dodajUKosaricu(brisanje = false){

        let proizvodi = document.querySelectorAll('input[name="proizvodi"]');

        let brojac = 0;

        let kupac = document.getElementById("kupac").value;
        let prezime = document.getElementById("prezime").value;

        let rezultat_naziv = [];

        let rezultat = "<ul>";

        let ukupno = 0;

        proizvodi.forEach(item => {

            if(item.checked){

                let qtyInput = item.parentElement.querySelector('.qty-input');
                let qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
                let itemTotal = parseFloat(item.value) * qty;

                rezultat_naziv.push(item.title);

                rezultat += 
                    `<li>
                        <span>${item.title} x${qty} - ${itemTotal.toFixed(2)} €</span>

                        <button 
                            class="remove" 
                            data-title="${item.title}">X
                        </button>
                    </li>`;

                ukupno += itemTotal;
                brojac += qty;
            }

        });

        rezultat += "</ul>";

        //validacija
        if(!prijavljen){

            alert("Morate se prijaviti prije kupnje");

            return;
        }

        // ako nista nije odabrano
       if(rezultat_naziv.length === 0){
        
        document.getElementById("rezultat").innerHTML =
        `<div class="empty">
            Niste odabrali niti jedan proizvod
        </div>`;

        document.getElementById("total").innerText = "Ukupno: 0 €";
        document.getElementById("broj_proizvoda").innerText = "Broj odabranih proizvoda: 0";
        document.getElementById("kupac_ispis").innerText = "Kupac:";
        return;
    }
       
        // prikaz košarice
        document.getElementById("rezultat").innerHTML = rezultat;

        document.getElementById("total").innerText =
        "Ukupno: " + ukupno.toFixed(2) + " €";

        document.getElementById("broj_proizvoda").innerText =
        "Broj odabranih proizvoda: " + brojac;

        document.getElementById("kupac_ispis").innerText =
        "Kupac: " + kupac + " " + prezime;
    }

    // čišćenje košarice
    function obrisiKosaricu(){

        let proizvodi =
        document.querySelectorAll('input[name="proizvodi"]');

        proizvodi.forEach(item => {

            item.checked = false;

        });

        updateQtyInputState();

        document.getElementById("rezultat").innerHTML =
        `<div class="empty">
            Trenutno nije odabran niti jedan proizvod
        </div>`;

        document.getElementById("total").innerText = "Ukupno: 0 €";

        document.getElementById("broj_proizvoda").innerText =
        "Broj odabranih proizvoda: 0";

    }

    // pretraga po proizvodima
    function pretragaProizvoda(){

        let unos = document.getElementById("search").value.toLowerCase();
        let sviProizvodi = document.querySelectorAll(".proizvod");

        sviProizvodi.forEach(item => {

            let naziv = item.dataset.naziv.toLowerCase();

            let tekst = item.innerText.toLowerCase();

            if(naziv.includes(unos) || tekst.includes(unos)){

                item.style.display = "block";

            }
            else{

                item.style.display = "none";

            }
        });

    }

    //fja za idi na plaćanje
    function idiNaPlacanje(){

        let kupac = document.getElementById("kupac").value;
        let prezime = document.getElementById("prezime").value;

        if(!prijavljen){

            alert("Morate se prijaviti prije plaćanja");

            return;
        }

        let proizvodi = document.querySelectorAll('input[name="proizvodi"]:checked');
        
        if(proizvodi.length === 0){
            alert("Košarica je prazna. Dodajte proizvode prije plaćanja.");
            return;
        }

        let ukupno = 0;
        let lista = "";

        proizvodi.forEach(p => {
            let qtyInput = p.parentElement.querySelector('.qty-input');
            let qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
            let itemTotal = parseFloat(p.value) * qty;
            
            lista += `<li>${p.title} x${qty} - ${itemTotal.toFixed(2)} €</li>`;
            ukupno += itemTotal;
        });

        document.getElementById("checkout").classList.remove("hidden");

        document.getElementById("checkout").innerHTML = `
            <div class="checkout-content">
                <h2>Checkout</h2>
                <p><b>Kupac:</b> ${kupac} ${prezime}</p>

                <ul>${lista}</ul>

                <h3>Ukupno: ${ukupno.toFixed(2)} €</h3>

                <button class="confirm" onclick="potvrdiNarudzbu()">Potvrdi narudžbu</button>
                <button onclick="zatvoriCheckout()">Natrag u shop</button>
            </div>
        `;
    }

    function zatvoriCheckout(){
        document.getElementById("checkout").classList.add("hidden");
    }

    function potvrdiNarudzbu(){

        document.getElementById("checkout").innerHTML = `
            <div class="checkout-content">
                <h2><i class="bi bi-check-circle-fill">
                    </i> Narudžba uspješna!</h2>
                <p>Hvala na kupnji.</p>
                <button onclick="nastaviKupnju()">
                    Nastavi kupnju
                </button>

                <button class="logout-btn" onclick="odjavaNakonKupnje()">
                    <i class="bi bi-box-arrow-left"></i> Odjava
                </button>
            </div>
        `;

        // reset košarice
        let proizvodi = document.querySelectorAll('input[name="proizvodi"]');
        proizvodi.forEach(p => p.checked = false);

        updateQtyInputState();

        document.getElementById("rezultat").innerHTML =
        `<div class="empty">Trenutno nije odabran niti jedan proizvod</div>`;

        document.getElementById("total").innerText = "Ukupno: 0 €";
        document.getElementById("broj_proizvoda").innerText = "Broj odabranih proizvoda: 0";
        document.getElementById("kupac_ispis").innerText = "Kupac:";

    }

    //prijava korisnika
    function prijaviKorisnika(){

        let kupac = document.getElementById("kupac").value;
        let prezime = document.getElementById("prezime").value;

        if(kupac === "" || prezime === ""){
            alert("Unesite ime i prezime prije prijave");
            return;
        }

        prijavljen = true;

        //UI login status
        document.getElementById("loginInfo").innerText =
            "Prijavljen: " + kupac + " " + prezime;

        document.getElementById("odjava").style.display = "inline-block";

        //zalokiraj input odmah na prijavi
        document.getElementById("kupac").disabled = true;
        document.getElementById("prezime").disabled = true;

        //odmah prikaži kupca u košarici
        document.getElementById("kupac_ispis").innerText =
            "Kupac: " + kupac + " " + prezime;
    }
    //odjava korisnika
    function odjavaKorisnika(){
        
        prijavljen = false;

        document.getElementById("kupac").value = "";
        document.getElementById("prezime").value = "";

        document.getElementById("kupac").disabled = false;
        document.getElementById("prezime").disabled = false;

        document.getElementById("loginInfo").innerText =
            "Niste prijavljeni";

        document.getElementById("odjava").style.display = "none";

        // reset košarice
        let proizvodi = document.querySelectorAll('input[name="proizvodi"]');
        proizvodi.forEach(p => p.checked = false);

        // reset količina na 1
        let qtyInputs = document.querySelectorAll('.qty-input');
        qtyInputs.forEach(qty => qty.value = 1);

        updateQtyInputState();

        document.getElementById("rezultat").innerHTML =
            `<div class="empty">Trenutno nije odabran niti jedan proizvod</div>`;

        document.getElementById("total").innerText = "Ukupno: 0 €";
        document.getElementById("broj_proizvoda").innerText = "Broj odabranih proizvoda: 0";
        document.getElementById("kupac_ispis").innerText = "Kupac:";
    }

    function nastaviKupnju(){

        document.getElementById("checkout").classList.add("hidden");

        document.getElementById("rezultat").innerHTML =
        `<div class="empty">
            Trenutno nije odabran niti jedan proizvod
        </div>`;

        document.getElementById("total").innerText = "Ukupno: 0 €";

        document.getElementById("broj_proizvoda").innerText =
        "Broj odabranih proizvoda: 0";
    }

    function odjavaNakonKupnje(){
        zatvoriCheckout();
        odjavaKorisnika();
    }
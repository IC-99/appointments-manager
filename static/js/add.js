window.onload = function () {
    console.log('Window loaded!');

    // Fallback nel caso in cui `pywebviewready` non funzioni
    setTimeout(() => {
        if (window.pywebview && window.pywebview.api) {
            console.log('API disponibile:', window.pywebview.api);
            console.log('PyWebView API pronta!');

            // Assegna l'evento al form per aggiungere appuntamenti
            document.getElementById('appointment-form').addEventListener('submit', async function (e) {
                e.preventDefault();

                const date = new Date();

                let day = date.getDate();
                if (day < 10) {
                    day = '0' + day;
                }
                let month = date.getMonth() + 1;
                if (month < 10) {
                    month = '0' + month;
                }
                let year = date.getFullYear();

                let currentDate = `${year}-${month}-${day}`;

                const appointment = {
                    nome: document.getElementById('nome').value,
                    cognome: document.getElementById('cognome').value,
                    indirizzo: document.getElementById('indirizzo').value,
                    zona: document.getElementById('zona').value,
                    telefono: document.getElementById('telefono').value,
                    telefono2: document.getElementById('telefono2').value,
                    email: document.getElementById('email').value,
                    data_creazione: currentDate,
                    ultima_modifica: currentDate,
                    data_appuntamento: document.getElementById('data_appuntamento').value,
                    ora_appuntamento: document.getElementById('ora_appuntamento').value,
                    marca: document.getElementById('marca').value,
                    modello: document.getElementById('modello').value,
                    matricola: document.getElementById('matricola').value,
                    difetto: document.getElementById('difetto').value,
                    garanzia: document.getElementById('garanzia').value,
                    note: document.getElementById('note').value,
                    stato_intervento: "in corso",
                };

                try {
                    await window.pywebview.api.add_appointment(appointment);
                    console.log('Appuntamento aggiunto:', appointment);
                    
                    window.pywebview.api.close_window();
                } catch (error) {
                    console.error('Errore nell\'aggiunta dell\'appuntamento:', error);
                }
            });
        } else {
            console.error('API non trovata dopo il timeout.');
        }
    }, 100);  // Aspetta 1 secondo prima di fare il check
};
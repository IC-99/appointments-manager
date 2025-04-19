window.onload = function () {
    console.log('Window loaded!');

    // Fallback nel caso in cui `pywebviewready` non funzioni
    setTimeout(async () => {  // ⬅️ Rendi la funzione async
        if (window.pywebview && window.pywebview.api) {
            console.log('API disponibile:', window.pywebview.api);
            console.log('PyWebView API pronta!');

            try {
                const appointment_json = await get_data();
                console.log(appointment_json);
                const appointment = JSON.parse(appointment_json);
                console.log(appointment);
                console.log(appointment.nome);

                // Precompilare i campi del form con i dati dell'appuntamento
                document.getElementById('nome').value = appointment.nome || '';
                document.getElementById('cognome').value = appointment.cognome || '';
                document.getElementById('indirizzo').value = appointment.indirizzo || '';
                document.getElementById('zona').value = appointment.zona || '';
                document.getElementById('telefono').value = appointment.telefono || '';
                document.getElementById('telefono2').value = appointment.telefono2 || '';
                document.getElementById('email').value = appointment.email || '';
                document.getElementById('data_appuntamento').value = appointment.data_appuntamento || '';
                document.getElementById('ora_appuntamento').value = appointment.ora_appuntamento || '';
                document.getElementById('marca').value = appointment.marca || '';
                document.getElementById('modello').value = appointment.modello || '';
                document.getElementById('matricola').value = appointment.matricola || '';
                document.getElementById('difetto').value = appointment.difetto || '';
                document.getElementById('garanzia').value = appointment.garanzia || '';
                document.getElementById('note').value = appointment.note || '';
                document.getElementById('stato_intervento').value = appointment.stato_intervento || '';
                document.getElementById('data_creazione').textContent = appointment.data_creazione || '';
                document.getElementById('ultima_modifica').textContent = appointment.ultima_modifica || '';

                // Assegna l'evento al form per aggiungere appuntamenti
                document.getElementById('appointment-form').addEventListener('submit', function (e) {
                    e.preventDefault();

                    const date = new Date();
                    let day = String(date.getDate()).padStart(2, '0');
                    let month = String(date.getMonth() + 1).padStart(2, '0');
                    let year = date.getFullYear();
                    let currentDate = `${year}-${month}-${day}`;

                    const updated_appointment = {
                        id: appointment.id,
                        nome: document.getElementById('nome').value,
                        cognome: document.getElementById('cognome').value,
                        indirizzo: document.getElementById('indirizzo').value,
                        zona: document.getElementById('zona').value,
                        telefono: document.getElementById('telefono').value,
                        telefono2: document.getElementById('telefono2').value,
                        email: document.getElementById('email').value,
                        data_creazione: appointment.data_creazione,
                        ultima_modifica: currentDate,
                        data_appuntamento: document.getElementById('data_appuntamento').value,
                        ora_appuntamento: document.getElementById('ora_appuntamento').value,
                        marca: document.getElementById('marca').value,
                        modello: document.getElementById('modello').value,
                        matricola: document.getElementById('matricola').value,
                        difetto: document.getElementById('difetto').value,
                        garanzia: document.getElementById('garanzia').value,
                        note: document.getElementById('note').value,
                        stato_intervento: document.getElementById('stato_intervento').value,
                    };

                    try {
                        window.pywebview.api.update_appointment(updated_appointment);
                        console.log('Appuntamento modificato:', updated_appointment);
                        window.pywebview.api.close_window();
                    } catch (error) {
                        console.error('Errore nella modifica dell\'appuntamento:', error);
                    }
                });
            } catch (error) {
                console.error('Errore nel recupero dei dati:', error);
            }

        } else {
            console.error('API non trovata dopo il timeout.');
        }
    }, 100);
};

async function get_data() {
    return await window.pywebview.api.get_appointment();
}

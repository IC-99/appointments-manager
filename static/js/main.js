window.onload = function () {
    console.log('Window loaded!');

    // Fallback nel caso in cui `pywebviewready` non funzioni
    setTimeout(() => {
        if (window.pywebview && window.pywebview.api) {
            console.log('API disponibile:', window.pywebview.api);
            filterAppointments();  // Carica gli appuntamenti se l'API è disponibile
        } else {
            console.error('API non trovata dopo il timeout.');
        }
    }, 100);  // Aspetta 1 secondo prima di fare il check
};

function escapeHtml(str) {
    return str.replace(/[&<>"'òàèìù]/g, function (match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            case 'ò': return '&ograve;';
            case 'à': return '&agrave;';
            case 'è': return '&egrave;';
            case 'ì': return '&igrave;';
            case 'ù': return '&ugrave;';
            // Aggiungi altri caratteri speciali se necessario
            default: return match;
        }
    });
}

function getReadableDate(dateStr) {
    const yearStr = dateStr.slice(0, 4);
    const monthStr = dateStr.slice(5, 7);
    const dayStr = dateStr.slice(8, 10);
    const day = Number(dayStr);
    var res = day.toString() + " ";

    switch(monthStr) {
        case "01":
            res += "Gennaio";
            break;
        case "02":
            res += "Febbraio";
            break;
        case "03":
            res += "Marzo";
            break;
        case "04":
            res += "Aprile";
            break;
        case "05":
            res += "Maggio";
            break;
        case "06":
            res += "Giugno";
            break;
        case "07":
            res += "Luglio";
            break;
        case "08":
            res += "Agosto";
            break;
        case "09":
            res += "Settembre";
            break;
        case "10":
            res += "Ottobre";
            break;
        case "11":
            res += "Novembre";
            break;
        case "12":
            res += "Dicembre";
            break;
        default:
            res += "Errore";
    }
    res += " " + yearStr;
    return res;
}

async function clearFilter() {
    document.getElementById('search-input').value = '';
    filterAppointments();
}

async function filterAppointments() {
    try {
        const str = document.getElementById('search-input').value;
        const appointments = await window.pywebview.api.filter_appointments(str);
        console.log('Appuntamenti caricati:', appointments);

        // Ordina gli appuntamenti in base alla data (dal più prossimo al meno prossimo)
        appointments.sort((a, b) => {
            const dateA = new Date(a.data_appuntamento + ' ' + a.ora_appuntamento);
            const dateB = new Date(b.data_appuntamento + ' ' + b.ora_appuntamento);
            return dateA - dateB;
        });

        // Pulisce le colonne prima di aggiungere nuovi appuntamenti
        document.getElementById('in-definition-appointments').innerHTML = '';
        document.getElementById('in-progress-appointments').innerHTML = '';
        document.getElementById('waiting-appointments').innerHTML = '';
        document.getElementById('completed-appointments').innerHTML = '';

        // Aggiungi gli appuntamenti nelle rispettive colonne in base allo stato
        appointments.forEach((appointment) => {
            const item = document.createElement('div');
            item.classList.add('appointment-item');
            item.innerHTML = `
                <div class="appointment-header">
                    <strong>${appointment.nome} ${appointment.cognome}</strong>
                </div>
                <div class="appointment-details">
                    <p><strong>Data:</strong> ${getReadableDate(appointment.data_appuntamento)} - ${appointment.ora_appuntamento}</p>
                    <p><strong>Indirizzo:</strong> ${appointment.indirizzo} (${appointment.zona})</p>
                    <p><strong>Dispositivo:</strong> ${appointment.marca} ${appointment.modello} (${appointment.difetto})</p>
                    <p><strong>Note:</strong> ${appointment.note || 'Nessuna nota disponibile'}</p>
                </div>
                <div class="buttons-container">
                    <button class="view-button" onclick="editAppointment(${appointment.id})">
                        <img src="../static/images/eye.svg" alt="eye" class="icon">
                        <span class="btn-text">Visualizza</span>
                    </button>
                    <button class="delete-button" onclick="deleteAppointment(${appointment.id})">
                        <img src="../static/images/trash.svg" alt="trash" class="icon">
                        <span class="btn-text">Elimina</span>
                    </button>
                </div>
            `;

            // Aggiungi l'appuntamento alla colonna corrispondente in base allo stato
            if (appointment.stato_intervento === 'in attesa') {
                document.getElementById('waiting-appointments').appendChild(item);
            } else if (appointment.stato_intervento === 'in corso') {
                document.getElementById('in-progress-appointments').appendChild(item);
            } else if (appointment.stato_intervento === 'in definizione') {
                document.getElementById('in-definition-appointments').appendChild(item);
            } else if (appointment.stato_intervento === 'completato') {
                document.getElementById('completed-appointments').appendChild(item);
            }
        });

        // Se non ci sono appuntamenti in una colonna, mostra un messaggio
        if (appointments.length === 0) {
            console.log('Nessun appuntamento trovato.');
        }
    } catch (error) {
        console.error('Errore nel caricamento degli appuntamenti:', error);
    }
}

async function deleteAppointment(id) {
    // Finestra di conferma prima di eliminare
    const confirmDelete = confirm('Sei sicuro di voler eliminare questo appuntamento?');

    if (confirmDelete) {
        try {
            await window.pywebview.api.delete_appointment(id);
            console.log('Appuntamento eliminato:', id);
            filterAppointments(); // Ricarica gli appuntamenti dopo l'eliminazione
        } catch (error) {
            console.error('Errore nella cancellazione dell\'appuntamento:', error);
        }
    } else {
        console.log('Eliminazione annullata.');
    }
}

async function addAppointment() {
    window.pywebview.api.open_add_window();
}

function editAppointment(id) {
    window.pywebview.api.open_edit_window(id);
}

function openCalendar() {
    window.pywebview.api.open_calendar();
}

window.addEventListener('focus', function () {
    filterAppointments();
});